/**
 * Tenant Admin Controller - Workspace-Level Administration
 * ─────────────────────────────────────────────────────────
 * LEVEL 2: Workspace/Account administration
 * Route: /account/:account_id/admin/*
 * 
 * Permission enforcement:
 * - Owner: full access
 * - Admin: can manage members (but not promote to admin, not remove admins/owner)
 * - Member: no access to admin APIs
 */
const User = require("../models/user.model");
const Account = require("../models/account.model");
const { getRoleLevel } = require('../middleware/permissions');

module.exports = {

    // ── Dashboard ─────────────────────────────────────────────
    dashboard: async (req, res) => {
        try {
            const account = await Account.findOne({ account_number: req.account_number });
            if (!account) return res.status(404).send("Account not found");

            // Only count members of THIS workspace
            const activeMembers = account.users.filter(u => u.status === 'active');
            const pendingInvites = account.invitations.filter(i => i.status === 'pending');

            // Get full user details for members
            const memberUserIds = activeMembers.map(u => u.userId);
            const members = await User.find({ _id: { $in: memberUserIds } })
                .select('name email avatar status membership.plan lastLogin created_on');

            // Calculate limits
            const planLimits = User.getPlanLimits(req.user.membership?.plan || 'free');

            res.render("admin/admin-dashboard", {
                layout: "layout-app",
                user: req.user,
                account_number: req.account_number,
                account,
                stats: {
                    totalMembers: activeMembers.length,
                    pendingInvites: pendingInvites.length,
                    maxMembers: planLimits.maxUsersPerAccount,
                    storageUsed: 0,
                    storageLimit: planLimits.storageLimit,
                },
                members,
                pendingInvites,
            });
        } catch (error) {
            console.error("[TenantAdmin] Dashboard error:", error);
            res.status(500).send("Error");
        }
    },

    // ── Members List ──────────────────────────────────────────
    membersList: async (req, res) => {
        try {
            const account = await Account.findOne({ account_number: req.account_number });
            if (!account) return res.status(404).send("Account not found");

            const activeMembers = account.users.filter(u => u.status === 'active');
            const memberUserIds = activeMembers.map(u => u.userId);
            const users = await User.find({ _id: { $in: memberUserIds } })
                .select('name email avatar status membership.plan lastLogin');

            const members = users.map(u => {
                const entry = activeMembers.find(m => String(m.userId) === String(u._id));
                return {
                    ...u.toObject(),
                    workspaceRole: entry?.role || 'member',
                    joinedAt: entry?.joinedAt,
                };
            });

            const pendingInvites = account.invitations.filter(i => i.status === 'pending');

            res.render("admin/admin-members", {
                layout: "layout-app",
                user: req.user,
                account_number: req.account_number,
                account,
                members,
                pendingInvites,
            });
        } catch (error) {
            console.error("[TenantAdmin] Members error:", error);
            res.status(500).send("Error");
        }
    },

    // ── Settings ──────────────────────────────────────────────
    settings: async (req, res) => {
        try {
            const account = await Account.findOne({ account_number: req.account_number });
            if (!account) return res.status(404).send("Account not found");

            res.render("account/account-settings", {
                layout: "layout-app",
                user: req.user,
                account_number: req.account_number,
                account,
            });
        } catch (error) {
            console.error("[TenantAdmin] Settings error:", error);
            res.status(500).send("Error");
        }
    },

    // ── Resend Invite ──────────────────────────────────────────
    resendInvite: async (req, res) => {
        try {
            const { inviteId } = req.body;
            const account = await Account.findOne({ account_number: req.account_number });
            if (!account) return res.status(404).json({ error: 'Account not found' });

            const invite = account.invitations.id(inviteId);
            if (!invite || invite.status !== 'pending') {
                return res.status(404).json({ error: 'Invitation non trouvée ou déjà traitée' });
            }

            // Send email
            const appUrl = process.env.APP_URL || 'http://localhost:3000';
            try {
                const mailer = require('../services/mailer');
                await mailer.sendInvitation({
                    to: invite.email,
                    accountName: account.name || `Compte #${req.account_number}`,
                    inviterName: req.user.name || req.user.email,
                    role: invite.role || 'member',
                    inviteUrl: `${appUrl}/auth/invite/${invite.token}`,
                });
            } catch (mailErr) {
                console.error('[TenantAdmin] Resend email failed:', mailErr.message);
                return res.status(500).json({ error: 'Erreur d\'envoi d\'email' });
            }

            res.json({ success: true });
        } catch (error) {
            console.error("[TenantAdmin] Resend invite error:", error);
            res.status(500).json({ error: "Server Error" });
        }
    },

    // ═══════════════════════════════════════════════════════════
    // API: Invite Member
    // ═══════════════════════════════════════════════════════════
    inviteMember: async (req, res) => {
        try {
            const { email, role } = req.body;
            const callerRole = req.workspaceRole;

            // ── Permission check: admin cannot invite as admin ──
            if (role === 'admin' && callerRole !== 'owner') {
                return res.status(403).json({
                    error: 'Seul le propriétaire peut inviter en tant qu\'admin'
                });
            }

            // Normalize: only 'admin' or 'member' allowed
            const inviteRole = (role === 'admin') ? 'admin' : 'member';

            const account = await Account.findOne({ account_number: req.account_number });
            if (!account) return res.status(404).json({ error: 'Account not found' });

            // Check plan limits
            const planLimits = User.getPlanLimits(req.user.membership?.plan || 'free');
            const activeMembers = account.users.filter(u => u.status === 'active');
            if (planLimits.maxUsersPerAccount !== -1 && activeMembers.length >= planLimits.maxUsersPerAccount) {
                return res.status(400).json({ error: `Limite atteinte (${planLimits.maxUsersPerAccount} membres max)` });
            }

            // Check duplicates
            const existingInvite = account.invitations.find(inv => inv.email === email.toLowerCase() && inv.status === 'pending');
            if (existingInvite) return res.status(400).json({ error: 'Utilisateur déjà invité' });

            const existingMember = account.users.find(u => u.email === email.toLowerCase() && u.status === 'active');
            if (existingMember) return res.status(400).json({ error: 'Utilisateur déjà membre' });

            const crypto = require('crypto');
            const token = crypto.randomBytes(32).toString('hex');

            account.invitations.push({
                email: email.toLowerCase(),
                role: inviteRole,
                token,
                invitedBy: req.user._id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
            await account.save();

            // Send invitation email via SMTP
            const inviteLink = `/auth/invite/${token}`;
            const appUrl = process.env.APP_URL || 'http://localhost:3000';
            try {
                const mailer = require('../services/mailer');
                await mailer.sendInvitation({
                    to: email.toLowerCase(),
                    accountName: account.name || `Compte #${req.account_number}`,
                    inviterName: req.user.name || req.user.email,
                    role: inviteRole,
                    inviteUrl: `${appUrl}${inviteLink}`,
                });
            } catch (mailErr) {
                console.error('[TenantAdmin] Email send failed (invite saved):', mailErr.message);
            }

            res.json({ success: true, inviteLink });
        } catch (error) {
            console.error("[TenantAdmin] Invite error:", error);
            res.status(500).json({ error: "Server Error" });
        }
    },

    // ═══════════════════════════════════════════════════════════
    // API: Change Member Role
    // ═══════════════════════════════════════════════════════════
    changeMemberRole: async (req, res) => {
        try {
            const { userId, role } = req.body;
            const callerRole = req.workspaceRole;

            // Validate role value
            if (!['admin', 'member'].includes(role)) {
                return res.status(400).json({ error: 'Rôle invalide' });
            }

            // ── Permission: only owner can promote to admin ──
            if (role === 'admin' && callerRole !== 'owner') {
                return res.status(403).json({
                    error: 'Seul le propriétaire peut promouvoir en admin'
                });
            }

            const account = await Account.findOne({ account_number: req.account_number });
            if (!account) return res.status(404).json({ error: 'Account not found' });

            const memberEntry = account.users.find(u => String(u.userId) === String(userId));
            if (!memberEntry) return res.status(404).json({ error: 'Membre introuvable' });

            // Cannot change owner's role
            if (memberEntry.role === 'owner') {
                return res.status(400).json({ error: 'Impossible de modifier le rôle du propriétaire' });
            }

            // ── Admin cannot change another admin's role ──
            if (callerRole === 'admin' && memberEntry.role === 'admin') {
                return res.status(403).json({
                    error: 'Un admin ne peut pas modifier le rôle d\'un autre admin'
                });
            }

            // ── Admin can only set role to 'member' (cannot promote to admin) ──
            if (callerRole === 'admin' && role === 'admin') {
                return res.status(403).json({
                    error: 'Seul le propriétaire peut promouvoir en admin'
                });
            }

            memberEntry.role = role;
            await account.save();

            // Also update in user.accounts[]
            await User.updateOne(
                { _id: userId, 'accounts.account_number': req.account_number },
                { $set: { 'accounts.$.role': role } }
            );

            res.json({ success: true });
        } catch (error) {
            console.error("[TenantAdmin] Change role error:", error);
            res.status(500).json({ error: "Server Error" });
        }
    },

    // ═══════════════════════════════════════════════════════════
    // API: Remove Member
    // ═══════════════════════════════════════════════════════════
    removeMember: async (req, res) => {
        try {
            const { userId } = req.body;
            const callerRole = req.workspaceRole;

            const account = await Account.findOne({ account_number: req.account_number });
            if (!account) return res.status(404).json({ error: 'Account not found' });

            const memberEntry = account.users.find(u => String(u.userId) === String(userId));
            if (!memberEntry) return res.status(404).json({ error: 'Membre introuvable' });

            // Cannot remove owner
            if (memberEntry.role === 'owner') {
                return res.status(400).json({ error: 'Impossible de retirer le propriétaire' });
            }

            // Cannot remove yourself
            if (String(userId) === String(req.user._id)) {
                return res.status(400).json({ error: 'Impossible de vous retirer vous-même' });
            }

            // ── Admin cannot remove another admin ──
            if (callerRole === 'admin' && memberEntry.role === 'admin') {
                return res.status(403).json({
                    error: 'Un admin ne peut pas retirer un autre admin'
                });
            }

            memberEntry.status = 'removed';
            await account.save();

            // Remove from user.accounts[]
            await User.updateOne(
                { _id: userId },
                { $pull: { accounts: { account_number: req.account_number } } }
            );

            // ═══ Clean up RecordAccess grants for this user ═══
            try {
                const { tenantCollection } = require('../middleware/tenant');
                const RecordAccess = await tenantCollection(req, 'RecordAccess');
                if (RecordAccess) {
                    const userIdStr = String(userId);

                    // Remove all grants for this user
                    await RecordAccess.updateMany(
                        { 'grants.granteeId': userIdStr, 'grants.granteeType': 'user' },
                        { $pull: { grants: { granteeId: userIdStr, granteeType: 'user' } } }
                    );

                    // Also remove any pending invites by email
                    const removedUser = await User.findById(userId).select('email').lean();
                    if (removedUser?.email) {
                        await RecordAccess.updateMany(
                            { 'pendingInvites.email': removedUser.email.toLowerCase() },
                            { $pull: { pendingInvites: { email: removedUser.email.toLowerCase() } } }
                        );
                    }

                    console.log(`[TenantAdmin] Cleaned RecordAccess grants for user ${userIdStr}`);
                }
            } catch (raErr) {
                console.error('[TenantAdmin] Error cleaning RecordAccess:', raErr.message);
                // Non-blocking — member removal still succeeds
            }

            res.json({ success: true });
        } catch (error) {
            console.error("[TenantAdmin] Remove member error:", error);
            res.status(500).json({ error: "Server Error" });
        }
    },

    // ── API: Cancel Invitation ────────────────────────────────
    cancelInvite: async (req, res) => {
        try {
            const { inviteId } = req.body;
            const account = await Account.findOne({ account_number: req.account_number });
            if (!account) return res.status(404).json({ error: 'Account not found' });

            const invite = account.invitations.id(inviteId);
            if (!invite) return res.status(404).json({ error: 'Invitation non trouvée' });

            invite.status = 'expired';
            await account.save();

            res.json({ success: true });
        } catch (error) {
            console.error("[TenantAdmin] Cancel invite error:", error);
            res.status(500).json({ error: "Server Error" });
        }
    },

    // ── API: Update Workspace Settings ────────────────────────
    updateSettings: async (req, res) => {
        try {
            const { name, icon, description } = req.body;
            const update = {};
            if (name) update.name = name.trim();
            if (icon) update.icon = icon;
            if (description !== undefined) update.description = description;

            await Account.findOneAndUpdate({ account_number: req.account_number }, update);

            // Update name in all users' accounts array
            if (name) {
                await User.updateMany(
                    { 'accounts.account_number': req.account_number },
                    { $set: { 'accounts.$.name': name.trim() } }
                );
            }

            res.json({ success: true });
        } catch (error) {
            console.error("[TenantAdmin] Update settings error:", error);
            res.status(500).json({ error: "Server Error" });
        }
    },
};
