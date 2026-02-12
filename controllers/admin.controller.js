/**
 * Tenant Admin Controller - Workspace-Level Administration
 * ─────────────────────────────────────────────────────────
 * LEVEL 2: Workspace/Account administration
 * Accessible to users who are 'owner' or 'admin' in the account
 * Route: /account/:account_id/admin/*
 * 
 * This panel manages ONLY the members and settings of one specific workspace.
 * It does NOT see other tenants or global users.
 */
const User = require("../models/user.model");
const Account = require("../models/account.model");

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
                    storageUsed: 0, // TODO: implement storage tracking
                    storageLimit: planLimits.storageLimit,
                },
                members,
                pendingInvites,
            });
        } catch (error) {
            console.error("[TenantAdmin] Dashboard error:", error);
            res.status(500).send("Server Error");
        }
    },

    // ── Members List ──────────────────────────────────────────
    membersList: async (req, res) => {
        try {
            const account = await Account.findOne({ account_number: req.account_number });
            if (!account) return res.status(404).send("Account not found");

            const search = req.query.search || '';
            const roleFilter = req.query.role || '';

            // Get all members
            let memberEntries = account.users.filter(u => u.status === 'active');

            // Get full user info for each member
            const userIds = memberEntries.map(u => u.userId);
            let users = await User.find({ _id: { $in: userIds } })
                .select('name email avatar status membership.plan lastLogin created_on');

            // Apply search filter
            if (search) {
                users = users.filter(u =>
                    (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
                    u.email.toLowerCase().includes(search.toLowerCase())
                );
            }

            // Enrich with workspace role
            const enrichedMembers = users.map(u => {
                const memberEntry = memberEntries.find(m => String(m.userId) === String(u._id));
                return {
                    ...u.toObject(),
                    workspaceRole: memberEntry?.role || 'member',
                    joinedAt: memberEntry?.joinedAt,
                };
            });

            // Apply role filter
            const filtered = roleFilter
                ? enrichedMembers.filter(m => m.workspaceRole === roleFilter)
                : enrichedMembers;

            // Pending invitations
            const pendingInvites = account.invitations.filter(i => i.status === 'pending');

            // Current user's role in this workspace
            const currentUserEntry = account.users.find(u => String(u.userId) === String(req.user._id));
            const currentUserRole = currentUserEntry?.role || 'member';

            const planLimits = User.getPlanLimits(req.user.membership?.plan || 'free');

            res.render("admin/admin-members", {
                layout: "layout-app",
                user: req.user,
                account_number: req.account_number,
                account,
                members: filtered,
                pendingInvites,
                currentUserRole,
                maxMembers: planLimits.maxUsersPerAccount,
                filters: { search, role: roleFilter },
            });
        } catch (error) {
            console.error("[TenantAdmin] Members list error:", error);
            res.status(500).send("Server Error");
        }
    },

    // ── Workspace Settings ────────────────────────────────────
    settings: async (req, res) => {
        try {
            const account = await Account.findOne({ account_number: req.account_number });
            if (!account) return res.status(404).send("Account not found");

            const owner = account.ownerId ? await User.findById(account.ownerId).select('name email avatar') : null;

            res.render("admin/admin-settings", {
                layout: "layout-app",
                user: req.user,
                account_number: req.account_number,
                account,
                owner,
            });
        } catch (error) {
            console.error("[TenantAdmin] Settings error:", error);
            res.status(500).send("Server Error");
        }
    },

    // ── API: Invite Member ────────────────────────────────────
    inviteMember: async (req, res) => {
        try {
            const { email, role } = req.body;
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
                role: ['admin', 'member', 'viewer'].includes(role) ? role : 'member',
                token,
                invitedBy: req.user._id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
            await account.save();

            res.json({ success: true, inviteLink: `/auth/invite/${token}` });
        } catch (error) {
            console.error("[TenantAdmin] Invite error:", error);
            res.status(500).json({ error: "Server Error" });
        }
    },

    // ── API: Change Member Role ───────────────────────────────
    changeMemberRole: async (req, res) => {
        try {
            const { userId, role } = req.body;
            if (!['admin', 'member', 'viewer'].includes(role)) {
                return res.status(400).json({ error: 'Invalid role' });
            }

            const account = await Account.findOne({ account_number: req.account_number });
            if (!account) return res.status(404).json({ error: 'Account not found' });

            const memberEntry = account.users.find(u => String(u.userId) === String(userId));
            if (!memberEntry) return res.status(404).json({ error: 'Member not found' });

            // Cannot change owner's role
            if (memberEntry.role === 'owner') {
                return res.status(400).json({ error: 'Impossible de modifier le rôle du propriétaire' });
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

    // ── API: Remove Member ────────────────────────────────────
    removeMember: async (req, res) => {
        try {
            const { userId } = req.body;
            const account = await Account.findOne({ account_number: req.account_number });
            if (!account) return res.status(404).json({ error: 'Account not found' });

            const memberEntry = account.users.find(u => String(u.userId) === String(userId));
            if (!memberEntry) return res.status(404).json({ error: 'Member not found' });

            // Cannot remove owner
            if (memberEntry.role === 'owner') {
                return res.status(400).json({ error: 'Impossible de retirer le propriétaire' });
            }

            // Cannot remove yourself
            if (String(userId) === String(req.user._id)) {
                return res.status(400).json({ error: 'Impossible de vous retirer vous-même' });
            }

            memberEntry.status = 'removed';
            await account.save();

            // Remove from user.accounts[]
            await User.updateOne(
                { _id: userId },
                { $pull: { accounts: { account_number: req.account_number } } }
            );

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
            if (!invite) return res.status(404).json({ error: 'Invitation not found' });

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
