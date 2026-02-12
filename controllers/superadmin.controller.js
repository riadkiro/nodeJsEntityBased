/**
 * SuperAdmin Controller - SaaS Platform Owner Administration
 * ──────────────────────────────────────────────────────────
 * LEVEL 1: Platform-wide administration (the SaaS owner)
 * Accessible only to users with role: 'superadmin'
 * Route: /superadmin/*
 * 
 * This panel manages ALL users and ALL accounts across the entire platform.
 * Unlike tenant admin (which only sees members of one workspace),
 * this sees everything.
 */
const User = require("../models/user.model");
const Account = require("../models/account.model");

module.exports = {

    // ── Dashboard ─────────────────────────────────────────────
    dashboard: async (req, res) => {
        try {
            const totalUsers = await User.countDocuments();
            const activeUsers = await User.countDocuments({ status: 'active' });
            const suspendedUsers = await User.countDocuments({ status: 'suspended' });
            const totalAccounts = await Account.countDocuments();
            const activeAccounts = await Account.countDocuments({ status: 'active' });

            // Membership breakdown
            const planCounts = await User.aggregate([
                { $group: { _id: '$membership.plan', count: { $sum: 1 } } }
            ]);

            // Role breakdown
            const roleCounts = await User.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ]);

            // Recent users (last 10)
            const recentUsers = await User.find()
                .sort({ created_on: -1 })
                .limit(10)
                .select('name email avatar status membership.plan role created_on lastLogin authProvider');

            // Recent accounts (last 5)
            const recentAccounts = await Account.find()
                .sort({ created_on: -1 })
                .limit(5);

            // Monthly growth (users created this month)
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const newUsersThisMonth = await User.countDocuments({ created_on: { $gte: startOfMonth } });
            const newAccountsThisMonth = await Account.countDocuments({ created_on: { $gte: startOfMonth } });

            res.render("superadmin/sa-dashboard", {
                layout: "layout-superadmin",
                user: req.user,
                stats: {
                    totalUsers,
                    activeUsers,
                    suspendedUsers,
                    totalAccounts,
                    activeAccounts,
                    newUsersThisMonth,
                    newAccountsThisMonth,
                    planCounts: planCounts.reduce((acc, p) => { acc[p._id || 'free'] = p.count; return acc; }, {}),
                    roleCounts: roleCounts.reduce((acc, r) => { acc[r._id || 'user'] = r.count; return acc; }, {}),
                },
                recentUsers,
                recentAccounts,
            });
        } catch (error) {
            console.error("[SuperAdmin] Dashboard error:", error);
            res.status(500).send("Server Error");
        }
    },

    // ── Users List ────────────────────────────────────────────
    usersList: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const search = req.query.search || '';
            const status = req.query.status || '';
            const plan = req.query.plan || '';
            const role = req.query.role || '';

            const filter = {};
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ];
            }
            if (status) filter.status = status;
            if (plan) filter['membership.plan'] = plan;
            if (role) filter.role = role;

            const total = await User.countDocuments(filter);
            const users = await User.find(filter)
                .sort({ created_on: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .select('name email avatar role status membership accounts authProvider created_on lastLogin loginCount');

            res.render("superadmin/sa-users", {
                layout: "layout-superadmin",
                user: req.user,
                users,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
                filters: { search, status, plan, role },
            });
        } catch (error) {
            console.error("[SuperAdmin] Users list error:", error);
            res.status(500).send("Server Error");
        }
    },

    // ── User Detail ───────────────────────────────────────────
    userDetail: async (req, res) => {
        try {
            const targetUser = await User.findById(req.params.userId);
            if (!targetUser) return res.status(404).send("User not found");

            const accountNumbers = targetUser.accounts.map(a => a.account_number);
            const accounts = await Account.find({ account_number: { $in: accountNumbers } });

            res.render("superadmin/sa-user-detail", {
                layout: "layout-superadmin",
                user: req.user,
                targetUser,
                userAccounts: accounts,
            });
        } catch (error) {
            console.error("[SuperAdmin] User detail error:", error);
            res.status(500).send("Server Error");
        }
    },

    // ── Accounts List ─────────────────────────────────────────
    accountsList: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const search = req.query.search || '';
            const status = req.query.status || '';

            const filter = {};
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { account_number: { $regex: search, $options: 'i' } },
                ];
            }
            if (status) filter.status = status;

            const total = await Account.countDocuments(filter);
            const accounts = await Account.find(filter)
                .sort({ created_on: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            // Enrich with owner info
            for (let acc of accounts) {
                if (acc.ownerId) {
                    acc._owner = await User.findById(acc.ownerId).select('name email avatar').lean();
                }
            }

            res.render("superadmin/sa-accounts", {
                layout: "layout-superadmin",
                user: req.user,
                accounts,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
                filters: { search, status },
            });
        } catch (error) {
            console.error("[SuperAdmin] Accounts list error:", error);
            res.status(500).send("Server Error");
        }
    },

    // ── API: Update User Status ───────────────────────────────
    updateUserStatus: async (req, res) => {
        try {
            const { userId, status } = req.body;
            if (!['active', 'inactive', 'suspended', 'pending'].includes(status)) {
                return res.status(400).json({ error: 'Invalid status' });
            }
            await User.findByIdAndUpdate(userId, { status });
            res.json({ success: true });
        } catch (error) {
            console.error("[SuperAdmin] Update status error:", error);
            res.status(500).json({ error: "Server Error" });
        }
    },

    // ── API: Update User Role ─────────────────────────────────
    updateUserRole: async (req, res) => {
        try {
            const { userId, role } = req.body;
            if (!['user', 'admin', 'superadmin'].includes(role)) {
                return res.status(400).json({ error: 'Invalid role' });
            }
            // Prevent removing last superadmin
            if (role !== 'superadmin') {
                const superadminCount = await User.countDocuments({ role: 'superadmin' });
                const targetUser = await User.findById(userId);
                if (targetUser?.role === 'superadmin' && superadminCount <= 1) {
                    return res.status(400).json({ error: 'Impossible de retirer le dernier superadmin' });
                }
            }
            await User.findByIdAndUpdate(userId, { role });
            res.json({ success: true });
        } catch (error) {
            console.error("[SuperAdmin] Update role error:", error);
            res.status(500).json({ error: "Server Error" });
        }
    },

    // ── API: Update Membership ────────────────────────────────
    updateMembership: async (req, res) => {
        try {
            const { userId, plan, expiresAt, autoRenew } = req.body;
            if (!['free', 'basic', 'premium', 'enterprise'].includes(plan)) {
                return res.status(400).json({ error: 'Invalid plan' });
            }

            const limits = User.getPlanLimits(plan);
            const update = {
                'membership.plan': plan,
                'membership.maxAccounts': limits.maxAccounts,
                'membership.maxUsersPerAccount': limits.maxUsersPerAccount,
                'membership.storageLimit': limits.storageLimit,
                'membership.features': limits.features,
            };

            if (expiresAt) update['membership.expiresAt'] = new Date(expiresAt);
            if (typeof autoRenew === 'boolean') update['membership.autoRenew'] = autoRenew;
            if (plan !== 'free' && !expiresAt) {
                update['membership.expiresAt'] = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
            }
            if (!update['membership.startDate']) update['membership.startDate'] = new Date();

            await User.findByIdAndUpdate(userId, { $set: update });
            res.json({ success: true });
        } catch (error) {
            console.error("[SuperAdmin] Update membership error:", error);
            res.status(500).json({ error: "Server Error" });
        }
    },

    // ── API: Create User ──────────────────────────────────────
    createUser: async (req, res) => {
        try {
            const { name, email, password, role, plan, status } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ error: 'Name, email, and password are required' });
            }

            const existing = await User.findOne({ email: email.toLowerCase().trim() });
            if (existing) {
                return res.status(400).json({ error: 'Email already exists' });
            }

            const limits = User.getPlanLimits(plan || 'free');

            const newUser = new User({
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password,
                role: role || 'user',
                status: status || 'active',
                authProvider: 'local',
                membership: {
                    plan: plan || 'free',
                    startDate: new Date(),
                    expiresAt: plan && plan !== 'free'
                        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                        : null,
                    ...limits,
                },
            });

            await newUser.save();

            // Auto-create first workspace
            let account_number;
            let attempts = 0;
            do {
                account_number = (5000 + Math.floor(Math.random() * 5000)).toString();
                const exists = await Account.findOne({ account_number });
                if (!exists) break;
                attempts++;
            } while (attempts < 100);

            const newAccount = new Account({
                name: `${name.trim()}'s Workspace`,
                icon: 'solar:home-2-bold-duotone',
                ownerId: newUser._id,
                users: [{ userId: newUser._id.toString(), email: newUser.email, role: 'owner', status: 'active' }],
                account_number,
                status: 'active',
            });
            await newAccount.save();

            newUser.accounts.push({ account_number, name: newAccount.name, icon: 'solar:home-2-bold-duotone', role: 'owner' });
            await newUser.save();

            res.json({ success: true, userId: newUser._id, account_number });
        } catch (error) {
            console.error("[SuperAdmin] Create user error:", error);
            res.status(500).json({ error: "Server Error" });
        }
    },

    // ── API: Delete User ──────────────────────────────────────
    deleteUser: async (req, res) => {
        try {
            const { userId } = req.body;
            const targetUser = await User.findById(userId);
            if (!targetUser) return res.status(404).json({ error: 'User not found' });

            if (String(targetUser._id) === String(req.user._id)) {
                return res.status(400).json({ error: 'Cannot delete your own account' });
            }

            if (targetUser.role === 'superadmin') {
                const count = await User.countDocuments({ role: 'superadmin' });
                if (count <= 1) return res.status(400).json({ error: 'Cannot delete the last superadmin' });
            }

            await User.findByIdAndDelete(userId);
            res.json({ success: true });
        } catch (error) {
            console.error("[SuperAdmin] Delete user error:", error);
            res.status(500).json({ error: "Server Error" });
        }
    },

    // ── API: Update Account Status ────────────────────────────
    updateAccountStatus: async (req, res) => {
        try {
            const { accountId, status } = req.body;
            if (!['active', 'inactive', 'suspended', 'trial'].includes(status)) {
                return res.status(400).json({ error: 'Invalid status' });
            }
            await Account.findByIdAndUpdate(accountId, { status });
            res.json({ success: true });
        } catch (error) {
            console.error("[SuperAdmin] Update account status error:", error);
            res.status(500).json({ error: "Server Error" });
        }
    },

    // ── API: Invite to Account ────────────────────────────────
    inviteToAccount: async (req, res) => {
        try {
            const { accountNumber, email, role } = req.body;
            const account = await Account.findOne({ account_number: accountNumber });
            if (!account) return res.status(404).json({ error: 'Account not found' });

            const existingInvite = account.invitations.find(inv => inv.email === email.toLowerCase() && inv.status === 'pending');
            if (existingInvite) return res.status(400).json({ error: 'User already invited' });

            const existingMember = account.users.find(u => u.email === email.toLowerCase() && u.status === 'active');
            if (existingMember) return res.status(400).json({ error: 'User already a member' });

            const crypto = require('crypto');
            const token = crypto.randomBytes(32).toString('hex');

            account.invitations.push({
                email: email.toLowerCase(),
                role: role || 'member',
                token,
                invitedBy: req.user._id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
            await account.save();

            res.json({ success: true, inviteLink: `/auth/invite/${token}` });
        } catch (error) {
            console.error("[SuperAdmin] Invite error:", error);
            res.status(500).json({ error: "Server Error" });
        }
    },

    // ── API: JSON endpoints ───────────────────────────────────
    usersApi: async (req, res) => {
        try {
            const users = await User.find().sort({ created_on: -1 })
                .select('name email avatar role status membership accounts authProvider created_on lastLogin loginCount');
            res.json({ users });
        } catch (error) {
            res.status(500).json({ error: "Server Error" });
        }
    },

    accountsApi: async (req, res) => {
        try {
            const accounts = await Account.find().sort({ created_on: -1 });
            res.json({ accounts });
        } catch (error) {
            res.status(500).json({ error: "Server Error" });
        }
    },

    statsApi: async (req, res) => {
        try {
            const totalUsers = await User.countDocuments();
            const activeUsers = await User.countDocuments({ status: 'active' });
            const totalAccounts = await Account.countDocuments();
            const planCounts = await User.aggregate([{ $group: { _id: '$membership.plan', count: { $sum: 1 } } }]);
            res.json({
                totalUsers, activeUsers, totalAccounts,
                planCounts: planCounts.reduce((acc, p) => { acc[p._id || 'free'] = p.count; return acc; }, {}),
            });
        } catch (error) {
            res.status(500).json({ error: "Server Error" });
        }
    },

    // ── Accept Invitation (public, used from auth routes) ─────
    acceptInvitation: async (req, res) => {
        try {
            const { token } = req.params;

            const account = await Account.findOne({
                'invitations.token': token,
                'invitations.status': 'pending',
            });

            if (!account) {
                return res.redirect("/auth/login?error=Invitation invalide ou expirée");
            }

            const invitation = account.invitations.find(
                inv => inv.token === token && inv.status === 'pending'
            );

            if (!invitation || new Date() > invitation.expiresAt) {
                if (invitation) invitation.status = 'expired';
                await account.save();
                return res.redirect("/auth/login?error=Invitation expirée");
            }

            if (!req.user) {
                return res.redirect(`/auth/register?invite=${token}`);
            }

            // Add user to account
            account.users.push({
                userId: req.user._id.toString(),
                email: req.user.email,
                role: invitation.role,
                status: 'active',
                invitedBy: invitation.invitedBy,
            });

            invitation.status = 'accepted';
            await account.save();

            // Add account to user's accounts
            await User.findByIdAndUpdate(req.user._id, {
                $push: {
                    accounts: {
                        account_number: account.account_number,
                        name: account.name,
                        icon: account.icon,
                        role: invitation.role,
                    }
                }
            });

            res.redirect("/user/accounts");
        } catch (error) {
            console.error("[SuperAdmin] Accept invite error:", error);
            res.redirect("/auth/login?error=Erreur lors de l'acceptation");
        }
    },
};
