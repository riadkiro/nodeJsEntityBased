const express = require('express');
const router = express.Router();
const User = require('../../models/user.model');
const Account = require('../../models/account.model');
const crypto = require('crypto');
const { tenantCollection } = require('../../middleware/tenant');
const mailer = require('../../services/mailer');

// ── GET /api/team/members ─────────────────────────────────
// Returns all members + pending invitations for the current account
router.get('/members', async (req, res) => {
    try {
        const account = await Account.findOne({ account_number: req.account_number }).lean();
        if (!account) return res.status(404).json({ error: 'Account not found' });

        // Lookup full user data for each member
        const members = [];
        for (const member of (account.users || [])) {
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
                status: member.status || 'active',
                joinedAt: member.joinedAt,
                lastLogin: user?.lastLogin || null,
                userStatus: user?.status || 'inactive',
            });
        }

        // Pending invitations
        const invitations = (account.invitations || [])
            .filter(inv => inv.status === 'pending')
            .map(inv => ({
                email: inv.email,
                role: inv.role,
                invitedAt: inv.invitedAt,
                expiresAt: inv.expiresAt,
                status: inv.status,
            }));

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
        });
    } catch (error) {
        console.error('[Team API] members error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET /api/team/lookup-user ──────────────────────────────
// Lookup if a user exists in the SaaS platform by email
router.get('/lookup-user', async (req, res) => {
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
// Invite a user by email. If they already exist, add them directly.
router.post('/invite', async (req, res) => {
    try {
        const { email, role, message, entityAccess, entityPermissions } = req.body;
        if (!email?.trim()) return res.status(400).json({ error: 'Email requis' });

        const targetRole = ['admin', 'manager', 'member', 'viewer'].includes(role) ? role : 'member';
        const account = await Account.findOne({ account_number: req.account_number });
        if (!account) return res.status(404).json({ error: 'Account not found' });

        // Check if already a member
        const alreadyMember = account.users?.some(u => u.email === email.toLowerCase().trim());
        if (alreadyMember) return res.status(400).json({ error: 'Cet utilisateur est déjà membre' });

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

            return res.json({
                success: true,
                type: 'added',
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
router.post('/update-role', async (req, res) => {
    try {
        const { userId, newRole } = req.body;
        if (!userId || !newRole) return res.status(400).json({ error: 'userId and newRole required' });
        if (!['admin', 'manager', 'member', 'viewer'].includes(newRole)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Update in Account.users
        await Account.updateOne(
            { account_number: req.account_number, 'users.userId': userId },
            { $set: { 'users.$.role': newRole } }
        );

        // Update in User.accounts
        await User.updateOne(
            { _id: userId, 'accounts.account_number': req.account_number },
            { $set: { 'accounts.$.role': newRole } }
        );

        res.json({ success: true, message: 'Rôle mis à jour' });
    } catch (error) {
        console.error('[Team API] update-role error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/team/remove-member ──────────────────────────
router.post('/remove-member', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'userId required' });

        // Cannot remove yourself
        if (userId === req.user._id.toString()) {
            return res.status(400).json({ error: 'Vous ne pouvez pas vous retirer vous-même' });
        }

        // Cannot remove the owner
        const account = await Account.findOne({ account_number: req.account_number });
        const targetMember = account?.users?.find(u => u.userId === userId);
        if (targetMember?.role === 'owner') {
            return res.status(400).json({ error: 'Impossible de retirer le propriétaire du compte' });
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
router.post('/cancel-invite', async (req, res) => {
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
router.post('/resend-invite', async (req, res) => {
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
// Returns all accounts the current user belongs to
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
// ENTITY PERMISSIONS
// ═══════════════════════════════════════════════════

// ── GET /api/team/entities ──────────────────────────
// List all entities for the entity permission picker
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
// Update a member's entity permissions (CRUD per entity)
// Accepts either: { userId, entityPermissions: [{entityId, create, read, update, delete}] }
//            or legacy: { userId, entityAccess: [entityId] }
router.post('/update-permissions', async (req, res) => {
    try {
        const { userId, entityAccess, entityPermissions } = req.body;
        if (!userId) return res.status(400).json({ error: 'userId required' });

        const account = await Account.findOne({ account_number: req.account_number });
        if (!account) return res.status(404).json({ error: 'Account not found' });

        const member = account.users.find(u => u.userId === userId);
        if (!member) return res.status(404).json({ error: 'Member not found' });

        // Don't allow restricting owner
        if (member.role === 'owner') {
            return res.status(403).json({ error: 'Impossible de restreindre l\'accès du propriétaire' });
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

        await account.save();

        res.json({
            success: true,
            entityAccess: member.entityAccess,
            entityPermissions: member.entityPermissions,
        });
    } catch (error) {
        console.error('[Team API] update-permissions error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════
// TEAMS CRUD
// ═══════════════════════════════════════════════════

// ── GET /api/team/teams ─────────────────────────────
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
router.post('/teams', async (req, res) => {
    try {
        const { name, description, color, icon, memberIds } = req.body;
        if (!name?.trim()) return res.status(400).json({ error: 'Nom de team requis' });

        const account = await Account.findOne({ account_number: req.account_number });
        if (!account) return res.status(404).json({ error: 'Account not found' });

        const team = {
            name: name.trim(),
            description: description || '',
            color: color || '#4361ee',
            icon: icon || 'solar:users-group-rounded-bold-duotone',
            memberIds: memberIds || [],
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
router.put('/teams/:teamId', async (req, res) => {
    try {
        const { name, description, color, icon, memberIds } = req.body;
        const account = await Account.findOne({ account_number: req.account_number });
        if (!account) return res.status(404).json({ error: 'Account not found' });

        const team = account.teams.id(req.params.teamId);
        if (!team) return res.status(404).json({ error: 'Team not found' });

        if (name !== undefined) team.name = name.trim();
        if (description !== undefined) team.description = description;
        if (color !== undefined) team.color = color;
        if (icon !== undefined) team.icon = icon;
        if (memberIds !== undefined) team.memberIds = memberIds;

        await account.save();
        res.json({ success: true, team });
    } catch (error) {
        console.error('[Team API] update team error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── DELETE /api/team/teams/:teamId ──────────────────
router.delete('/teams/:teamId', async (req, res) => {
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

module.exports = router;
