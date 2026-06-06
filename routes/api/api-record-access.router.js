const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Account = require('../../models/account.model');
const User = require('../../models/user.model');
const { requirePerm } = require('../../middleware/permissions');
const { tenantCollection } = require('../../middleware/tenant');
const mailer = require('../../services/mailer');

const RECORD_MODULE_KEYS = ['overview', 'fiche', 'docs', 'drive', 'dataRoom', 'tasks', 'agenda', 'sheet', 'chat', 'emails', 'notes', 'ai', 'team'];

function defaultModules(permissions = {}) {
    return Object.fromEntries(RECORD_MODULE_KEYS.map(key => [
        key,
        {
            view: key === 'team' ? permissions.share === true : (key === 'ai' ? false : true),
            edit: permissions.update === true && (key !== 'team' || permissions.share === true),
        },
    ]));
}

function normalizeModulePermission(value, fallback, permissions = {}) {
    if (typeof value === 'boolean') {
        return {
            view: value,
            edit: value === true && permissions.update === true,
        };
    }

    if (value && typeof value === 'object') {
        const explicitView = Object.prototype.hasOwnProperty.call(value, 'view');
        const edit = value.edit === true;
        return {
            view: explicitView ? value.view !== false : (fallback.view || edit),
            edit,
        };
    }

    return { ...fallback };
}

function sanitizePermissions(permissions = {}) {
    const read = permissions.read !== false;
    const update = permissions.update === true;
    const share = permissions.share === true;
    const modules = defaultModules({ update, share });
    if (permissions.modules && typeof permissions.modules === 'object') {
        RECORD_MODULE_KEYS.forEach(key => {
            if (Object.prototype.hasOwnProperty.call(permissions.modules, key)) {
                modules[key] = normalizeModulePermission(permissions.modules[key], modules[key], { update, share });
            }
        });
    }

    RECORD_MODULE_KEYS.forEach(key => {
        if (!read) {
            modules[key] = { view: false, edit: false };
            return;
        }
        if (key === 'team' && !share) {
            modules[key] = { view: false, edit: false };
            return;
        }
        if (modules[key].edit) modules[key].view = true;
        if (!modules[key].view) modules[key].edit = false;
    });

    const hasModuleEdit = RECORD_MODULE_KEYS.some(key => modules[key].edit === true);

    return {
        read,
        update: update || hasModuleEdit,
        delete: permissions.delete === true,
        share,
        modules,
    };
}

function permissionsAllowNonDataRoomModule(permissions = {}) {
    if (permissions.read === false) return false;
    return RECORD_MODULE_KEYS.some(key => (
        key !== 'dataRoom' &&
        (permissions.modules?.[key]?.view === true || permissions.modules?.[key]?.edit === true)
    ));
}

// ── GET /api/record-access/:recordId ──────────────────
// Get access grants for a specific record
router.get('/:recordId', async (req, res) => {
    try {
        const RecordAccess = await tenantCollection(req, 'RecordAccess');
        if (!RecordAccess) return res.json({ success: true, access: null });

        let access = await RecordAccess.findOne({ recordId: req.params.recordId }).lean();
        if (access) {
            // Clean expired grants
            const now = new Date();
            access.grants = (access.grants || []).filter(g => !g.expiresAt || g.expiresAt > now);
        }
        res.json({ success: true, access });
    } catch (error) {
        console.error('[RecordAccess API] get error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/record-access/:recordId/grant ───────────
// Grant access to a user or team for a record
router.post('/:recordId/grant', requirePerm('records.share'), async (req, res) => {
    try {
        const { granteeType, granteeId, permissions, expiresAt, note } = req.body;
        if (!granteeType || !granteeId) {
            return res.status(400).json({ error: 'granteeType and granteeId required' });
        }
        if (!['user', 'team', 'role'].includes(granteeType)) {
            return res.status(400).json({ error: 'Invalid granteeType' });
        }

        const RecordAccess = await tenantCollection(req, 'RecordAccess');
        if (!RecordAccess) return res.status(500).json({ error: 'DB not ready' });

        const entityId = req.body.entityId || req.query.entityId || '';

        let access = await RecordAccess.findOne({ recordId: req.params.recordId });
        if (!access) {
            access = new RecordAccess({
                recordId: req.params.recordId,
                entityId,
            });
        }

        // Check if grant already exists for this grantee
        const existingIdx = access.grants.findIndex(
            g => g.granteeType === granteeType && g.granteeId === granteeId
        );

        const existingGrant = existingIdx >= 0 ? access.grants[existingIdx] : null;
        const sanitizedPermissions = sanitizePermissions(permissions);
        const grant = {
            granteeType,
            granteeId,
            permissions: sanitizedPermissions,
            grantedBy: req.user._id,
            grantedAt: new Date(),
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            note: note !== undefined
                ? note
                : (permissionsAllowNonDataRoomModule(sanitizedPermissions) ? '' : (existingGrant?.note || '')),
        };

        if (existingIdx >= 0) {
            access.grants[existingIdx] = grant; // Update existing
        } else {
            access.grants.push(grant); // Add new
        }

        // Remove from pendingInvites if converting (user accepted invite)
        if (granteeType === 'user') {
            const user = await User.findById(granteeId).select('email').lean();
            if (user?.email) {
                access.pendingInvites = (access.pendingInvites || []).filter(
                    p => p.email.toLowerCase() !== user.email.toLowerCase()
                );
            }
        }

        await access.save();
        res.json({ success: true, access });
    } catch (error) {
        console.error('[RecordAccess API] grant error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/record-access/:recordId/revoke ──────────
// Revoke access for a user or team
router.post('/:recordId/revoke', requirePerm('records.share'), async (req, res) => {
    try {
        const { granteeType, granteeId } = req.body;
        if (!granteeType || !granteeId) {
            return res.status(400).json({ error: 'granteeType and granteeId required' });
        }

        const RecordAccess = await tenantCollection(req, 'RecordAccess');
        if (!RecordAccess) return res.status(500).json({ error: 'DB not ready' });

        const result = await RecordAccess.updateOne(
            { recordId: req.params.recordId },
            { $pull: { grants: { granteeType, granteeId } } }
        );

        res.json({ success: true, modified: result.modifiedCount });
    } catch (error) {
        console.error('[RecordAccess API] revoke error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/record-access/:recordId/pending-invite ──
// Create a pending email invite for a record + send workspace invitation
router.post('/:recordId/pending-invite', requirePerm('records.share'), async (req, res) => {
    try {
        const { email, permissions, recordTitle } = req.body;
        if (!email?.trim() || !email.includes('@')) {
            return res.status(400).json({ error: 'Email invalide' });
        }
        const cleanEmail = email.toLowerCase().trim();

        const RecordAccess = await tenantCollection(req, 'RecordAccess');
        if (!RecordAccess) return res.status(500).json({ error: 'DB not ready' });

        const entityId = req.body.entityId || '';

        let access = await RecordAccess.findOne({ recordId: req.params.recordId });
        if (!access) {
            access = new RecordAccess({ recordId: req.params.recordId, entityId });
        }

        // Check if already pending
        const alreadyPending = (access.pendingInvites || []).some(p => p.email === cleanEmail);
        if (alreadyPending) {
            return res.status(400).json({ error: 'Une invitation est déjà en attente pour cet email' });
        }

        // Check if already has a grant (via user ID lookup)
        const existingUser = await User.findOne({ email: cleanEmail }).select('_id').lean();
        if (existingUser) {
            const alreadyGranted = access.grants.some(
                g => g.granteeType === 'user' && g.granteeId === existingUser._id.toString()
            );
            if (alreadyGranted) {
                return res.status(400).json({ error: 'Cet utilisateur a déjà accès à cette fiche' });
            }
        }

        // Add pending invite to RecordAccess
        access.pendingInvites = access.pendingInvites || [];
        access.pendingInvites.push({
            email: cleanEmail,
            permissions: sanitizePermissions(permissions),
            invitedBy: req.user._id,
            invitedAt: new Date(),
        });
        await access.save();

        // Handle workspace-level access
        const account = await Account.findOne({ account_number: req.account_number });
        let emailSent = false;
        let workspaceAction = 'none';

        if (account) {
            const accountName = account.name || `Compte ${req.account_number}`;
            const inviterName = req.user?.name || req.user?.email || 'Un administrateur';
            const isMember = account.users?.some(u => u.email === cleanEmail && u.status !== 'removed');

            if (isMember) {
                // ── Already a workspace member → just notify about record share ──
                workspaceAction = 'already_member';
                const loginUrl = `${req.protocol}://${req.get('host')}/auth/login`;
                try {
                    await mailer.send({
                        to: cleanEmail,
                        subject: `Nouvel accès à une fiche — ${accountName}`,
                        html: `
                        <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                          <div style="background:linear-gradient(135deg,#4361ee,#7c3aed);padding:32px 30px;text-align:center;">
                            <div style="font-size:28px;font-weight:800;color:#fff;">Dexapp</div>
                            <div style="font-size:13px;color:rgba(255,255,255,.7);margin-top:4px;">Partage de fiche</div>
                          </div>
                          <div style="padding:32px 30px;">
                            <h2 style="font-size:18px;font-weight:700;color:#0e1726;margin:0 0 12px;">Une fiche a été partagée avec vous 📋</h2>
                            <p style="font-size:14px;line-height:1.6;color:#64748b;margin:0 0 20px;">
                              <strong style="color:#0e1726;">${inviterName}</strong> vous a donné accès à une fiche
                              dans l'espace <strong style="color:#0e1726;">${accountName}</strong>.
                            </p>
                            <div style="text-align:center;margin:28px 0;">
                              <a href="${loginUrl}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#4361ee,#7c3aed);color:#fff;font-size:14px;font-weight:700;text-decoration:none;border-radius:12px;box-shadow:0 4px 16px rgba(67,97,238,.35);">
                                Voir la fiche
                              </a>
                            </div>
                          </div>
                          <div style="padding:16px 30px;border-top:1px solid #f1f5f9;text-align:center;">
                            <p style="font-size:11px;color:#94a3b8;margin:0;">© ${new Date().getFullYear()} Dexapp</p>
                          </div>
                        </div>`,
                        text: `${inviterName} vous a donné accès à une fiche dans ${accountName}. Connectez-vous : ${loginUrl}`,
                    });
                    emailSent = true;
                    console.log(`[RecordAccess] Record share notification sent to ${cleanEmail}`);
                } catch (mailErr) {
                    console.error('[RecordAccess] Notification email failed:', mailErr.message);
                }
            } else {
                // ── NOT a member → create workspace invitation (role: guest, requires acceptance) ──
                const alreadyInvited = account.invitations?.some(
                    i => i.email === cleanEmail && i.status === 'pending'
                );

                let inviteToken = null;
                if (alreadyInvited) {
                    // Reuse existing pending invitation token
                    const existing = account.invitations.find(
                        i => i.email === cleanEmail && i.status === 'pending'
                    );
                    inviteToken = existing?.token;
                } else {
                    // Create new invitation as "guest" (not "member")
                    inviteToken = crypto.randomBytes(32).toString('hex');
                    account.invitations.push({
                        email: cleanEmail,
                        role: 'guest',  // Guest by default — admin can upgrade later
                        token: inviteToken,
                        invitedBy: req.user._id,
                        invitedAt: new Date(),
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        status: 'pending',
                    });
                    await account.save();
                }
                workspaceAction = 'invited';

                // Send invitation email with acceptance link
                if (inviteToken) {
                    const inviteUrl = `${req.protocol}://${req.get('host')}/auth/invite/${inviteToken}`;
                    try {
                        await mailer.sendInvitation({
                            to: cleanEmail,
                            accountName,
                            inviterName,
                            role: 'guest',
                            inviteUrl,
                        });
                        emailSent = true;
                        console.log(`[RecordAccess] Invitation email sent to ${cleanEmail} (role: guest)`);
                    } catch (mailErr) {
                        console.error('[RecordAccess] Invitation email failed:', mailErr.message);
                    }
                }
            }
        }

        const pendingEntry = access.pendingInvites[access.pendingInvites.length - 1];

        res.json({
            success: true,
            pendingInvite: {
                _id: pendingEntry._id.toString(),
                email: cleanEmail,
                permissions: pendingEntry.permissions,
                invitedAt: pendingEntry.invitedAt,
            },
            emailSent,
            workspaceAction,
            message: emailSent
                ? (workspaceAction === 'invited'
                    ? `Invitation envoyée à ${cleanEmail} (doit accepter pour rejoindre)`
                    : `Notification envoyée à ${cleanEmail}`)
                : `Invitation en attente pour ${cleanEmail}`,
        });
    } catch (error) {
        console.error('[RecordAccess API] pending-invite error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/record-access/:recordId/cancel-pending ──
// Cancel a pending email invite
router.post('/:recordId/cancel-pending', requirePerm('records.share'), async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'email required' });

        const RecordAccess = await tenantCollection(req, 'RecordAccess');
        if (!RecordAccess) return res.status(500).json({ error: 'DB not ready' });

        await RecordAccess.updateOne(
            { recordId: req.params.recordId },
            { $pull: { pendingInvites: { email: email.toLowerCase().trim() } } }
        );

        res.json({ success: true, message: 'Invitation annulée' });
    } catch (error) {
        console.error('[RecordAccess API] cancel-pending error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/record-access/:recordId/public-link ─────
// Generate or toggle public sharing link
router.post('/:recordId/public-link', requirePerm('records.share'), async (req, res) => {
    try {
        const { enabled, permissions, expiresAt } = req.body;

        const RecordAccess = await tenantCollection(req, 'RecordAccess');
        if (!RecordAccess) return res.status(500).json({ error: 'DB not ready' });

        let access = await RecordAccess.findOne({ recordId: req.params.recordId });
        if (!access) {
            access = new RecordAccess({
                recordId: req.params.recordId,
                entityId: req.body.entityId || '',
            });
        }

        if (enabled) {
            if (!access.publicLink) {
                access.publicLink = crypto.randomBytes(24).toString('hex');
            }
            access.isPublic = true;
            access.publicPermissions = {
                read: permissions?.read !== false,
                update: permissions?.update || false,
            };
            access.publicExpiresAt = expiresAt ? new Date(expiresAt) : null;
        } else {
            access.isPublic = false;
            access.publicLink = null;
            access.publicExpiresAt = null;
        }

        await access.save();
        res.json({
            success: true,
            isPublic: access.isPublic,
            publicLink: access.isPublic ? access.publicLink : null,
        });
    } catch (error) {
        console.error('[RecordAccess API] public-link error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
