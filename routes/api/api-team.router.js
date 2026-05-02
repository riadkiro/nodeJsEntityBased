const express = require('express');
const router = express.Router();
const User = require('../../models/user.model');
const Account = require('../../models/account.model');
const crypto = require('crypto');

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

        res.json({
            success: true,
            members,
            invitations,
            accountName: account.name,
        });
    } catch (error) {
        console.error('[Team API] members error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/team/invite ─────────────────────────────────
// Invite a user by email. If they already exist, add them directly.
router.post('/invite', async (req, res) => {
    try {
        const { email, role, message } = req.body;
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

module.exports = router;
