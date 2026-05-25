const express = require('express');
const router = express.Router();
const User = require('../../models/user.model');
const Account = require('../../models/account.model');
const crypto = require('crypto');
const { tenantCollection } = require('../../middleware/tenant');
const { requirePerm, getRoleLevel, canManageRole, getAssignableRoles, PERMISSIONS, PERMISSION_CATEGORIES, PERMISSION_LABELS, ROLE_HIERARCHY, ROLE_META } = require('../../middleware/permissions');
const mailer = require('../../services/mailer');

// ── GET /api/team/members ─────────────────────────────────
// Returns all members + pending invitations for the current account
// Read-only — accessible to all members
router.get('/members', async (req, res) => {
    try {
        const account = await Account.findOne({ account_number: req.account_number }).lean();
        if (!account) return res.status(404).json({ error: 'Account not found' });

        // Lookup full user data for each member (exclude removed)
        const members = [];
        for (const member of (account.users || []).filter(u => u.status !== 'removed')) {
            const user = member.userId
                ? await User.findById(member.userId).select('name email avatar status lastLogin created_on').lean()
                : await User.findOne({ email: member.email }).select('name email avatar status lastLogin created_on').lean();

            members.push({
                _id: user?._id || member.userId,
                name: user?.name || member.email?.split('@')[0] || 'Utilisateur',
                email: member.email || user?.email,
                avatar: user?.avatar || null,
                role: member.role || 'member',
                entityAccess: member.entityAccess || [],
                entityPermissions: member.entityPermissions || [],
                moduleAccess: member.moduleAccess || {},
                status: member.status || 'active',
                joinedAt: member.joinedAt,
                lastLogin: user?.lastLogin || null,
                userStatus: user?.status || 'inactive',
            });
        }

        // Pending invitations — only show to admin/owner
        let invitations = [];
        if (req.can && req.can('members.view')) {
            invitations = (account.invitations || [])
                .filter(inv => inv.status === 'pending')
                .map(inv => ({
                    email: inv.email,
                    role: inv.role,
                    invitedAt: inv.invitedAt,
                    expiresAt: inv.expiresAt,
                    status: inv.status,
                }));
        }

        // Build teamIds per member from account.teams
        const teams = (account.teams || []).map(t => ({
            _id: t._id,
            name: t.name,
            description: t.description,
            color: t.color,
            icon: t.icon,
            memberIds: t.memberIds || [],
            memberCount: (t.memberIds || []).length,
            createdAt: t.createdAt,
        }));

        // Enrich each member with their teamIds
        members.forEach(m => {
            const uid = String(m._id);
            m.teamIds = teams.filter(t => t.memberIds.includes(uid)).map(t => t._id);
            m.teams = teams.filter(t => t.memberIds.includes(uid)).map(t => ({ _id: t._id, name: t.name, color: t.color }));
        });

        res.json({
            success: true,
            members,
            invitations,
            teams,
            accountName: account.name,
            callerRole: req.workspaceRole || 'member',
        });
    } catch (error) {
        console.error('[Team API] members error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET /api/team/entities ────────────────────────────────
// Returns all entities for the current workspace (for permissions matrix)
router.get('/entities', async (req, res) => {
    try {
        const Entity = await tenantCollection(req, 'Entity');
        const entities = await Entity.find({})
            .select('name slug icon color')
            .sort({ name: 1 })
            .lean();

        res.json({ success: true, entities });
    } catch (error) {
        console.error('[Team API] entities error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET /api/team/lookup-user ──────────────────────────────
// Lookup if a user exists — requires invite permission
router.get('/lookup-user', requirePerm('members.invite'), async (req, res) => {
    try {
        const email = req.query.email?.toLowerCase()?.trim();
        if (!email) return res.json({ found: false });

        const user = await User.findOne({ email }).select('name email').lean();
        if (user) {
            // Check if already a member
            const account = await Account.findOne({ account_number: req.account_number }).lean();
            const alreadyMember = account?.users?.some(u => u.email === email);
            if (alreadyMember) {
                return res.json({ found: false, alreadyMember: true });
            }
            return res.json({ found: true, name: user.name || user.email, email: user.email });
        }
        res.json({ found: false });
    } catch (error) {
        console.error('[Team API] lookup-user error:', error);
        res.json({ found: false });
    }
});

// ── POST /api/team/invite ─────────────────────────────────
// Invite a user by email — requires invite permission
// Manager can only invite external/guest roles
router.post('/invite', async (req, res) => {
    try {
        const { email, role, message, entityAccess, entityPermissions } = req.body;
        if (!email?.trim()) return res.status(400).json({ error: 'Email requis' });

        const callerRole = req.workspaceRole;

        // ── Determine target role with hierarchy validation ──
        let targetRole = role || 'member';
        const validRoles = ['admin', 'manager', 'member', 'external', 'guest'];
        if (!validRoles.includes(targetRole)) {
            return res.status(400).json({ error: `Rôle invalide. Rôles autorisés: ${validRoles.join(', ')}` });
        }

        // Check caller can invite this role
        if (!canManageRole(callerRole, targetRole)) {
            return res.status(403).json({
                error: `Vous ne pouvez pas inviter avec le rôle "${targetRole}"`,
                assignableRoles: getAssignableRoles(callerRole),
            });
        }

        // Manager can only invite external/guest
        if (callerRole === 'manager' && !['external', 'guest'].includes(targetRole)) {
            return res.status(403).json({ error: 'Un manager ne peut inviter que des collaborateurs externes ou guests' });
        }

        // member/external/guest cannot invite
        if (!req.can('members.invite') && !req.can('members.inviteExternal')) {
            return res.status(403).json({ error: 'Permission refusée' });
        }

        const account = await Account.findOne({ account_number: req.account_number });
        if (!account) return res.status(404).json({ error: 'Account not found' });

        // Check if already a member (ignore removed users)
        const existingMember = account.users?.find(u => u.email === email.toLowerCase().trim());
        const alreadyMember = existingMember && existingMember.status !== 'removed';
        if (alreadyMember) return res.status(400).json({ error: 'Cet utilisateur est déjà membre' });

        // If previously removed, re-activate them
        if (existingMember && existingMember.status === 'removed') {
            existingMember.status = 'active';
            existingMember.role = targetRole;
            existingMember.joinedAt = new Date();
            existingMember.invitedBy = req.user._id;
            await account.save();

            // Re-add account to user's accounts if needed
            const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
            if (existingUser) {
                const alreadyLinked = existingUser.accounts?.some(
                    a => a.account_number === req.account_number
                );
                if (!alreadyLinked) {
                    existingUser.accounts.push({
                        account_number: req.account_number,
                        name: account.name,
                        icon: account.icon,
                        role: targetRole,
                        joinedAt: new Date(),
                    });
                    await existingUser.save();
                }
            }

            // Notify re-added user by email
            if (existingUser) {
                const loginUrl = `${req.protocol}://${req.get('host')}/auth/login`;
                try {
                    await mailer.send({
                        to: existingUser.email,
                        subject: `Vous avez été réajouté(e) à ${account.name || 'un espace'} — Dexapp`,
                        html: `
                        <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                          <div style="background:linear-gradient(135deg,#4361ee,#7c3aed);padding:32px 30px;text-align:center;">
                            <div style="font-size:28px;font-weight:800;color:#fff;">Dexapp</div>
                          </div>
                          <div style="padding:32px 30px;">
                            <h2 style="font-size:18px;font-weight:700;color:#0e1726;margin:0 0 12px;">Accès restauré 🎉</h2>
                            <p style="font-size:14px;line-height:1.6;color:#64748b;margin:0 0 20px;">
                              Votre accès à <strong style="color:#0e1726;">${account.name}</strong> a été restauré en tant que <strong style="color:#4361ee;">${targetRole}</strong>.
                            </p>
                            <div style="text-align:center;margin:28px 0;">
                              <a href="${loginUrl}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#4361ee,#7c3aed);color:#fff;font-size:14px;font-weight:700;text-decoration:none;border-radius:12px;">Accéder à l'espace</a>
                            </div>
                          </div>
                        </div>`,
                    });
                    console.log(`[Team API] Re-add notification sent to ${existingUser.email}`);
                } catch (mailErr) {
                    console.error('[Team API] Re-add notification email failed:', mailErr.message);
                }
            }

            return res.json({
                success: true,
                type: 'added',
                userId: existingMember.userId,
                userName: existingUser?.name || email.split('@')[0],
                message: `${existingUser?.name || email} a été réajouté comme ${targetRole}`,
            });
        }

        // Check if already invited
        const alreadyInvited = account.invitations?.some(
            i => i.email === email.toLowerCase().trim() && i.status === 'pending'
        );
        if (alreadyInvited) return res.status(400).json({ error: 'Une invitation est déjà en attente pour cet email' });

        // Check if user exists in the system
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

        if (existingUser) {
            // User exists — add directly to account
            account.users.push({
                userId: existingUser._id.toString(),
                email: existingUser.email,
                role: targetRole,
                entityAccess: entityAccess || [],
                entityPermissions: entityPermissions || [],
                status: 'active',
                joinedAt: new Date(),
                invitedBy: req.user._id,
            });
            await account.save();

            // Add account to user's accounts array
            const alreadyLinked = existingUser.accounts?.some(
                a => a.account_number === req.account_number
            );
            if (!alreadyLinked) {
                existingUser.accounts.push({
                    account_number: req.account_number,
                    name: account.name,
                    icon: account.icon,
                    role: targetRole,
                    joinedAt: new Date(),
                });
                await existingUser.save();
            }

            // Notify the user by email
            const loginUrl = `${req.protocol}://${req.get('host')}/auth/login`;
            try {
                await mailer.send({
                    to: existingUser.email,
                    subject: `Vous avez été ajouté(e) à ${account.name || 'un espace'} — Dexapp`,
                    html: `
                    <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                      <div style="background:linear-gradient(135deg,#4361ee,#7c3aed);padding:32px 30px;text-align:center;">
                        <div style="font-size:28px;font-weight:800;color:#fff;">Dexapp</div>
                        <div style="font-size:13px;color:rgba(255,255,255,.7);margin-top:4px;">Nouvel accès à un espace</div>
                      </div>
                      <div style="padding:32px 30px;">
                        <h2 style="font-size:18px;font-weight:700;color:#0e1726;margin:0 0 12px;">Bienvenue dans ${account.name || 'un nouvel espace'} 🎉</h2>
                        <p style="font-size:14px;line-height:1.6;color:#64748b;margin:0 0 20px;">
                          <strong style="color:#0e1726;">${req.user?.name || req.user?.email || 'Un administrateur'}</strong> vous a ajouté(e) à l'espace
                          <strong style="color:#0e1726;">${account.name}</strong> en tant que <strong style="color:#4361ee;">${targetRole}</strong>.
                        </p>
                        <div style="text-align:center;margin:28px 0;">
                          <a href="${loginUrl}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#4361ee,#7c3aed);color:#fff;font-size:14px;font-weight:700;text-decoration:none;border-radius:12px;box-shadow:0 4px 16px rgba(67,97,238,.35);">
                            Accéder à l'espace
                          </a>
                        </div>
                      </div>
                      <div style="padding:16px 30px;border-top:1px solid #f1f5f9;text-align:center;">
                        <p style="font-size:11px;color:#94a3b8;margin:0;">© ${new Date().getFullYear()} Dexapp</p>
                      </div>
                    </div>`,
                    text: `${req.user?.name || 'Un administrateur'} vous a ajouté(e) à ${account.name} en tant que ${targetRole}. Connectez-vous : ${loginUrl}`,
                });
                console.log(`[Team API] Notification sent to ${existingUser.email}`);
            } catch (mailErr) {
                console.error('[Team API] Notification email failed:', mailErr.message);
            }

            return res.json({
                success: true,
                type: 'added',
                userId: existingUser._id.toString(),
                userName: existingUser.name || existingUser.email.split('@')[0],
                message: `${existingUser.name || existingUser.email} a été ajouté comme ${targetRole}`,
            });
        } else {
            // User doesn't exist — create invitation
            const token = crypto.randomBytes(32).toString('hex');
            account.invitations.push({
                email: email.toLowerCase().trim(),
                role: targetRole,
                token,
                invitedBy: req.user._id,
                invitedAt: new Date(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                status: 'pending',
            });
            await account.save();

            // Send invitation email
            const inviteUrl = `${req.protocol}://${req.get('host')}/auth/invite/${token}`;
            try {
                await mailer.sendInvitation({
                    to: email.toLowerCase().trim(),
                    accountName: account.name || `Compte ${req.account_number}`,
                    inviterName: req.user?.name || req.user?.email || 'Un administrateur',
                    role: targetRole,
                    inviteUrl,
                });
            } catch (mailErr) {
                console.error('[Team API] Email send failed (invite saved):', mailErr.message);
            }

            return res.json({
                success: true,
                type: 'invited',
                message: `Invitation envoyée à ${email}`,
            });
        }
    } catch (error) {
        console.error('[Team API] invite error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/team/update-role ────────────────────────────
router.post('/update-role', requirePerm('members.changeRole'), async (req, res) => {
    try {
        const { userId, newRole } = req.body;
        if (!userId || !newRole) return res.status(400).json({ error: 'userId and newRole required' });

        const callerRole = req.workspaceRole;

        // Validate role
        const validRoles = ['admin', 'manager', 'member', 'external', 'guest'];
        if (!validRoles.includes(newRole)) {
            return res.status(400).json({ error: `Rôle invalide. Rôles autorisés: ${validRoles.join(', ')}` });
        }

        // Caller can only assign roles below their own level
        if (!canManageRole(callerRole, newRole)) {
            return res.status(403).json({
                error: `Vous ne pouvez pas assigner le rôle "${newRole}"`,
                assignableRoles: getAssignableRoles(callerRole),
            });
        }

        const account = await Account.findOne({ account_number: req.account_number });
        if (!account) return res.status(404).json({ error: 'Account not found' });

        const targetMember = account.users.find(u => String(u.userId) === String(userId));
        if (!targetMember) return res.status(404).json({ error: 'Membre introuvable' });

        // Cannot change owner's role
        if (targetMember.role === 'owner') {
            return res.status(403).json({ error: 'Impossible de modifier le rôle du propriétaire' });
        }

        // Can only change roles of people below you
        if (!canManageRole(callerRole, targetMember.role)) {
            return res.status(403).json({ error: `Vous ne pouvez pas modifier le rôle d'un ${targetMember.role}` });
        }

        // Cannot change your own role
        if (String(userId) === String(req.user._id)) {
            return res.status(400).json({ error: 'Vous ne pouvez pas modifier votre propre rôle' });
        }

        // Update in Account.users
        targetMember.role = newRole;
        await account.save();

        // Update in User.accounts
        await User.updateOne(
            { _id: userId, 'accounts.account_number': req.account_number },
            { $set: { 'accounts.$.role': newRole } }
        );

        res.json({ success: true, message: `Rôle mis à jour: ${newRole}` });
    } catch (error) {
        console.error('[Team API] update-role error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/team/remove-member ──────────────────────────
router.post('/remove-member', requirePerm('members.remove'), async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'userId required' });

        const callerRole = req.workspaceRole;

        // Cannot remove yourself
        if (userId === req.user._id.toString()) {
            return res.status(400).json({ error: 'Vous ne pouvez pas vous retirer vous-même' });
        }

        // Lookup target
        const account = await Account.findOne({ account_number: req.account_number });
        if (!account) return res.status(404).json({ error: 'Account not found' });

        const targetMember = account?.users?.find(u => u.userId === userId);
        if (!targetMember) return res.status(404).json({ error: 'Membre introuvable' });

        // Cannot remove the owner
        if (targetMember.role === 'owner') {
            return res.status(403).json({ error: 'Impossible de retirer le propriétaire du compte' });
        }

        // Can only remove people below you in hierarchy
        if (!canManageRole(callerRole, targetMember.role)) {
            return res.status(403).json({ error: `Vous ne pouvez pas retirer un ${targetMember.role}` });
        }

        // Remove from Account.users
        await Account.updateOne(
            { account_number: req.account_number },
            { $pull: { users: { userId } } }
        );

        // Remove from User.accounts
        await User.updateOne(
            { _id: userId },
            { $pull: { accounts: { account_number: req.account_number } } }
        );

        res.json({ success: true, message: 'Membre retiré' });
    } catch (error) {
        console.error('[Team API] remove-member error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/team/cancel-invite ──────────────────────────
router.post('/cancel-invite', requirePerm('invites.cancel'), async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'email required' });

        await Account.updateOne(
            { account_number: req.account_number },
            { $pull: { invitations: { email: email.toLowerCase().trim(), status: 'pending' } } }
        );

        res.json({ success: true, message: 'Invitation annulée' });
    } catch (error) {
        console.error('[Team API] cancel-invite error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/team/resend-invite ──────────────────────────
router.post('/resend-invite', requirePerm('members.invite'), async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'email required' });

        await Account.updateOne(
            { account_number: req.account_number, 'invitations.email': email.toLowerCase().trim() },
            {
                $set: {
                    'invitations.$.invitedAt': new Date(),
                    'invitations.$.expiresAt': new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                }
            }
        );

        // Re-send the invitation email
        const account = await Account.findOne({ account_number: req.account_number }).lean();
        const invitation = account?.invitations?.find(i => i.email === email.toLowerCase().trim() && i.status === 'pending');
        if (invitation?.token) {
            const inviteUrl = `${req.protocol}://${req.get('host')}/auth/invite/${invitation.token}`;
            try {
                await mailer.sendInvitation({
                    to: email.toLowerCase().trim(),
                    accountName: account.name || `Compte ${req.account_number}`,
                    inviterName: req.user?.name || req.user?.email || 'Un administrateur',
                    role: invitation.role || 'member',
                    inviteUrl,
                });
            } catch (mailErr) {
                console.error('[Team API] Email resend failed:', mailErr.message);
            }
        }

        res.json({ success: true, message: 'Invitation renvoyée' });
    } catch (error) {
        console.error('[Team API] resend-invite error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET /api/team/my-accounts ─────────────────────────────
// Returns all accounts the current user belongs to — no restriction
router.get('/my-accounts', async (req, res) => {
    try {
        const user = await User.findById(req.user._id).lean();
        if (!user) return res.status(404).json({ error: 'User not found' });

        const accounts = [];
        for (const ua of (user.accounts || [])) {
            const account = await Account.findOne({ account_number: ua.account_number })
                .select('name icon account_number status users')
                .lean();
            accounts.push({
                account_number: ua.account_number,
                name: account?.name || ua.name || 'Compte #' + ua.account_number,
                icon: account?.icon || ua.icon || 'solar:settings-bold-duotone',
                role: ua.role || 'member',
                membersCount: account?.users?.length || 0,
                status: account?.status || 'active',
                isActive: ua.account_number === req.account_number,
            });
        }

        res.json({ success: true, accounts });
    } catch (error) {
        console.error('[Team API] my-accounts error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════
// ENTITY PERMISSIONS — requires members.changeRole
// ═══════════════════════════════════════════════════

// ── GET /api/team/entities ──────────────────────────
// List all entities for the entity permission picker — read-only
router.get('/entities', async (req, res) => {
    try {
        const Entity = await tenantCollection(req, 'Entity');
        if (!Entity) return res.json({ success: true, entities: [] });

        const entities = await Entity.find({}).select('name slug icon color order isSystem').sort({ order: 1 }).lean();
        res.json({ success: true, entities });
    } catch (error) {
        console.error('[Team API] entities error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/team/update-permissions ────────────────
router.post('/update-permissions', requirePerm('members.changeRole'), async (req, res) => {
    try {
        const { userId, entityAccess, entityPermissions, moduleAccess } = req.body;
        if (!userId) return res.status(400).json({ error: 'userId required' });

        const callerRole = req.workspaceRole;

        const account = await Account.findOne({ account_number: req.account_number });
        if (!account) return res.status(404).json({ error: 'Account not found' });

        const member = account.users.find(u => u.userId === userId);
        if (!member) return res.status(404).json({ error: 'Member not found' });

        // Don't allow restricting owner
        if (member.role === 'owner') {
            return res.status(403).json({ error: 'Impossible de restreindre l\'accès du propriétaire' });
        }

        // Admin cannot change another admin's permissions
        if (callerRole === 'admin' && member.role === 'admin') {
            return res.status(403).json({ error: 'Un admin ne peut pas modifier les permissions d\'un autre admin' });
        }

        // Handle new CRUD format
        if (entityPermissions !== undefined) {
            member.entityPermissions = Array.isArray(entityPermissions) ? entityPermissions : [];
            // Also sync entityAccess for backward compat (entities with at least read=true)
            member.entityAccess = member.entityPermissions
                .filter(ep => ep.read !== false)
                .map(ep => ep.entityId);
        } else if (entityAccess !== undefined) {
            // Legacy format — convert to CRUD (all permissions true for selected entities)
            member.entityAccess = Array.isArray(entityAccess) ? entityAccess : [];
            member.entityPermissions = member.entityAccess.map(id => ({
                entityId: id, create: true, read: true, update: true, delete: true
            }));
        }

        // Handle module access overrides
        if (moduleAccess !== undefined && typeof moduleAccess === 'object') {
            if (!member.moduleAccess) member.moduleAccess = {};
            const validModules = ['chat', 'tasks', 'documents', 'agenda', 'drive', 'email', 'notes', 'automations'];
            for (const mod of validModules) {
                if (moduleAccess[mod] !== undefined) {
                    member.moduleAccess[mod] = moduleAccess[mod]; // true, false, or null (inherit)
                }
            }
        }

        await account.save();

        res.json({
            success: true,
            entityAccess: member.entityAccess,
            entityPermissions: member.entityPermissions,
            moduleAccess: member.moduleAccess,
        });
    } catch (error) {
        console.error('[Team API] update-permissions error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════
// TEAMS CRUD — requires admin permissions
// ═══════════════════════════════════════════════════

// ── GET /api/team/teams ─────────────────────────────
// Read-only — accessible to all members
router.get('/teams', async (req, res) => {
    try {
        const account = await Account.findOne({ account_number: req.account_number }).lean();
        if (!account) return res.status(404).json({ error: 'Account not found' });

        const teams = (account.teams || []).map(t => ({
            _id: t._id,
            name: t.name,
            description: t.description,
            color: t.color,
            icon: t.icon,
            memberIds: t.memberIds || [],
            memberCount: (t.memberIds || []).length,
            createdBy: t.createdBy,
            createdAt: t.createdAt,
        }));

        res.json({ success: true, teams });
    } catch (error) {
        console.error('[Team API] list teams error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/team/teams ────────────────────────────
router.post('/teams', requirePerm('members.invite'), async (req, res) => {
    try {
        const { name, description, color, icon, memberIds, dataAccess } = req.body;
        if (!name?.trim()) return res.status(400).json({ error: 'Nom de team requis' });

        const account = await Account.findOne({ account_number: req.account_number });
        if (!account) return res.status(404).json({ error: 'Account not found' });

        const team = {
            name: name.trim(),
            description: description || '',
            color: color || '#4361ee',
            icon: icon || 'solar:users-group-rounded-bold-duotone',
            memberIds: memberIds || [],
            dataAccess: dataAccess || { entities: [] },
            createdBy: String(req.user._id),
            createdAt: new Date(),
        };

        account.teams.push(team);
        await account.save();

        const created = account.teams[account.teams.length - 1];
        res.json({ success: true, team: created });
    } catch (error) {
        console.error('[Team API] create team error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── PUT /api/team/teams/:teamId ─────────────────────
router.put('/teams/:teamId', requirePerm('members.invite'), async (req, res) => {
    try {
        const { name, description, color, icon, memberIds, dataAccess } = req.body;
        const account = await Account.findOne({ account_number: req.account_number });
        if (!account) return res.status(404).json({ error: 'Account not found' });

        const team = account.teams.id(req.params.teamId);
        if (!team) return res.status(404).json({ error: 'Team not found' });

        if (name !== undefined) team.name = name.trim();
        if (description !== undefined) team.description = description;
        if (color !== undefined) team.color = color;
        if (icon !== undefined) team.icon = icon;
        if (memberIds !== undefined) team.memberIds = memberIds;
        if (dataAccess !== undefined) {
            team.dataAccess = dataAccess;
        }

        await account.save();
        res.json({ success: true, team });
    } catch (error) {
        console.error('[Team API] update team error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── DELETE /api/team/teams/:teamId ──────────────────
router.delete('/teams/:teamId', requirePerm('members.invite'), async (req, res) => {
    try {
        const account = await Account.findOne({ account_number: req.account_number });
        if (!account) return res.status(404).json({ error: 'Account not found' });

        account.teams.pull({ _id: req.params.teamId });
        await account.save();

        res.json({ success: true, message: 'Team supprimée' });
    } catch (error) {
        console.error('[Team API] delete team error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// ═══════════════════════════════════════════
// ROLES CONFIGURATION
// ═══════════════════════════════════════════

// ── GET /api/team/roles ──────────────────────────────
// Returns all roles with their effective permissions
router.get('/roles', requirePerm('settings.view'), async (req, res) => {
    try {
        const account = await Account.findOne(
            { account_number: req.account_number },
            { customRoles: 1, users: 1 }
        ).lean();
        if (!account) return res.status(404).json({ error: 'Account not found' });

        const customRoles = account.customRoles || [];
        const systemSlugs = ['owner', 'admin', 'manager', 'member', 'external', 'guest'];

        // Build system roles
        const roles = systemSlugs.map(slug => {
            const meta = ROLE_META[slug];
            const override = customRoles.find(r => r.slug === slug && !r.isCustom);
            const overridePerms = override?.permissions
                ? (override.permissions instanceof Map
                    ? Object.fromEntries(override.permissions)
                    : override.permissions)
                : {};

            const effectivePermissions = {};
            const overrides = {};
            for (const perm of Object.keys(PERMISSIONS)) {
                const defaultValue = slug === 'owner' ? true : PERMISSIONS[perm].includes(slug);
                const overrideValue = overridePerms[perm];
                effectivePermissions[perm] = overrideValue !== undefined ? overrideValue : defaultValue;
                if (overrideValue !== undefined) {
                    overrides[perm] = overrideValue;
                }
            }

            const memberCount = (account.users || []).filter(u => u.role === slug).length;

            return {
                slug,
                name: override?.name || meta.name,
                color: override?.color || meta.color,
                icon: override?.icon || meta.icon,
                level: ROLE_HIERARCHY[slug],
                editable: meta.editable,
                isCustom: false,
                memberCount,
                effectivePermissions,
                overrides,
            };
        });

        // Add custom roles
        const customRoleEntries = customRoles.filter(r => r.isCustom);
        for (const cr of customRoleEntries) {
            const crPerms = cr.permissions
                ? (cr.permissions instanceof Map
                    ? Object.fromEntries(cr.permissions)
                    : cr.permissions)
                : {};
            const baseSlug = cr.baseRole || 'member';

            const effectivePermissions = {};
            const overrides = {};
            for (const perm of Object.keys(PERMISSIONS)) {
                const baseDefault = PERMISSIONS[perm].includes(baseSlug);
                const overrideValue = crPerms[perm];
                effectivePermissions[perm] = overrideValue !== undefined ? overrideValue : baseDefault;
                if (overrideValue !== undefined && overrideValue !== baseDefault) {
                    overrides[perm] = overrideValue;
                }
            }

            const memberCount = (account.users || []).filter(u => u.role === cr.slug).length;

            roles.push({
                slug: cr.slug,
                name: cr.name || cr.slug,
                color: cr.color || '#4361ee',
                icon: cr.icon || 'solar:shield-bold-duotone',
                level: cr.level || ROLE_HIERARCHY[baseSlug] || 40,
                editable: true,
                isCustom: true,
                baseRole: baseSlug,
                description: cr.description || '',
                memberCount,
                effectivePermissions,
                overrides,
            });
        }

        // Sort by level descending
        roles.sort((a, b) => b.level - a.level);

        res.json({
            success: true,
            roles,
            categories: PERMISSION_CATEGORIES,
            labels: PERMISSION_LABELS,
            systemRoles: systemSlugs,
        });
    } catch (error) {
        console.error('[Team API] get roles error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── PUT /api/team/roles/:slug ────────────────────────
// Update permission overrides for a role
router.put('/roles/:slug', requirePerm('settings.update'), async (req, res) => {
    try {
        const { slug } = req.params;
        const { permissions } = req.body;

        // Validate role exists and is editable
        const meta = ROLE_META[slug];
        if (!meta) {
            // Check if it's a custom role
            const account = await Account.findOne({ account_number: req.account_number });
            if (!account) return res.status(404).json({ error: 'Account not found' });
            const customRole = (account.customRoles || []).find(r => r.slug === slug && r.isCustom);
            if (!customRole) return res.status(404).json({ error: 'Rôle non trouvé' });
            // Update custom role permissions directly (store all)
            customRole.permissions = permissions;
            customRole.updatedAt = new Date();
            account.markModified('customRoles');
            await account.save();
            return res.json({ success: true, overrideCount: Object.keys(permissions).length, message: `Permissions mises à jour pour ${customRole.name}` });
        }
        if (!meta.editable) return res.status(403).json({ error: 'Ce rôle ne peut pas être modifié' });
        if (!permissions || typeof permissions !== 'object') {
            return res.status(400).json({ error: 'permissions object required' });
        }

        const account = await Account.findOne({ account_number: req.account_number });
        if (!account) return res.status(404).json({ error: 'Account not found' });

        // Compute sparse overrides (only store diffs from defaults)
        const sparseOverrides = {};
        for (const [perm, value] of Object.entries(permissions)) {
            if (!PERMISSIONS[perm]) continue;
            const defaultValue = PERMISSIONS[perm].includes(slug);
            if (value !== defaultValue) {
                sparseOverrides[perm] = value;
            }
        }

        // Find or create the customRole entry
        if (!account.customRoles) account.customRoles = [];
        let roleEntry = account.customRoles.find(r => r.slug === slug);

        if (Object.keys(sparseOverrides).length === 0) {
            if (roleEntry) {
                account.customRoles = account.customRoles.filter(r => r.slug !== slug);
            }
        } else {
            if (!roleEntry) {
                account.customRoles.push({
                    slug,
                    name: meta.name,
                    permissions: sparseOverrides,
                    updatedAt: new Date(),
                });
            } else {
                roleEntry.permissions = sparseOverrides;
                roleEntry.updatedAt = new Date();
            }
        }

        account.markModified('customRoles');
        await account.save();

        res.json({
            success: true,
            overrideCount: Object.keys(sparseOverrides).length,
            message: Object.keys(sparseOverrides).length > 0
                ? `${Object.keys(sparseOverrides).length} permission(s) personnalisée(s) pour ${meta.name}`
                : `Permissions par défaut restaurées pour ${meta.name}`,
        });
    } catch (error) {
        console.error('[Team API] update role error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/team/roles ─────────────────────────────
// Create a new custom role
router.post('/roles', requirePerm('settings.update'), async (req, res) => {
    try {
        const { name, baseRole, color, icon, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Le nom du rôle est requis' });
        }

        // Generate slug from name
        const slug = name.trim().toLowerCase()
            .replace(/[àáâã]/g, 'a').replace(/[éèêë]/g, 'e')
            .replace(/[ïî]/g, 'i').replace(/[ôö]/g, 'o').replace(/[ùûü]/g, 'u')
            .replace(/[ç]/g, 'c').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        // Validate slug uniqueness
        const systemSlugs = ['owner', 'admin', 'manager', 'member', 'external', 'guest'];
        if (systemSlugs.includes(slug)) {
            return res.status(400).json({ error: 'Ce nom est réservé à un rôle système' });
        }

        const validBase = baseRole && ['manager', 'member', 'external', 'guest'].includes(baseRole)
            ? baseRole : 'member';

        const account = await Account.findOne({ account_number: req.account_number });
        if (!account) return res.status(404).json({ error: 'Account not found' });

        if (!account.customRoles) account.customRoles = [];

        // Check duplicate
        if (account.customRoles.some(r => r.slug === slug)) {
            return res.status(400).json({ error: 'Un rôle avec ce nom existe déjà' });
        }

        // Determine level: same as base role
        const level = ROLE_HIERARCHY[validBase] || 40;

        // Build initial permissions from base role defaults
        const permissions = {};
        for (const perm of Object.keys(PERMISSIONS)) {
            permissions[perm] = PERMISSIONS[perm].includes(validBase);
        }

        const roleColors = ['#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#ef4444'];
        const randomColor = color || roleColors[account.customRoles.length % roleColors.length];

        account.customRoles.push({
            slug,
            name: name.trim(),
            description: description || '',
            color: randomColor,
            icon: icon || 'solar:shield-bold-duotone',
            isCustom: true,
            baseRole: validBase,
            level,
            permissions,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        account.markModified('customRoles');
        await account.save();

        res.json({
            success: true,
            slug,
            message: `Rôle "${name.trim()}" créé avec succès`,
        });
    } catch (error) {
        console.error('[Team API] create role error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── DELETE /api/team/roles/:slug ──────────────────────
// Delete a custom role (reassign members to baseRole)
router.delete('/roles/:slug', requirePerm('settings.update'), async (req, res) => {
    try {
        const { slug } = req.params;

        // Prevent deleting system roles
        const systemSlugs = ['owner', 'admin', 'manager', 'member', 'external', 'guest'];
        if (systemSlugs.includes(slug)) {
            return res.status(403).json({ error: 'Impossible de supprimer un rôle système' });
        }

        const account = await Account.findOne({ account_number: req.account_number });
        if (!account) return res.status(404).json({ error: 'Account not found' });

        const roleEntry = (account.customRoles || []).find(r => r.slug === slug && r.isCustom);
        if (!roleEntry) {
            return res.status(404).json({ error: 'Rôle non trouvé' });
        }

        const fallbackRole = roleEntry.baseRole || 'member';

        // Reassign members with this role to the base role
        let reassigned = 0;
        for (const user of account.users) {
            if (user.role === slug) {
                user.role = fallbackRole;
                reassigned++;
            }
        }

        // Remove the custom role
        account.customRoles = account.customRoles.filter(r => r.slug !== slug);

        await account.save();

        res.json({
            success: true,
            reassigned,
            fallbackRole,
            message: `Rôle supprimé. ${reassigned} membre(s) réassigné(s) en "${fallbackRole}".`,
        });
    } catch (error) {
        console.error('[Team API] delete role error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
