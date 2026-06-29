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
const Plan = require("../models/plan.model");
const Subscription = require("../models/subscription.model");
const {
    convertPendingInvitesToGrants,
    invitationRedirectUrl,
} = require("../services/record-access-invitations");
const { invalidateCache } = require("../middleware/billing");
const {
    BILLING_CYCLES,
    BILLING_PROVIDERS,
    SUBSCRIPTION_STATUSES,
    buildPriceSnapshot,
    ensureDefaultBillingPlans,
    getActiveSeatCount,
    getBillableSeats,
    getDefaultPlanDefinition,
    getPlanLimits,
    getPlanSeatPolicy,
} = require("../services/billing-catalog");
const {
    createAccountUser,
    RegistrationError,
} = require("../services/account-registration.service");

function jsonForScript(value) {
    return JSON.stringify(value).replace(/</g, "\\u003c");
}

function optionalDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateInput(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
}

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

    // ── Billing / Subscriptions ──────────────────────────────
    billingPage: async (req, res) => {
        try {
            await ensureDefaultBillingPlans();

            const [plans, accounts] = await Promise.all([
                Plan.find({ isActive: true }).sort({ order: 1 }).lean(),
                Account.find().sort({ created_on: -1 }).lean(),
            ]);

            const accountNumbers = accounts.map(acc => acc.account_number).filter(Boolean);
            const ownerIds = accounts.map(acc => acc.ownerId).filter(Boolean);

            const [subscriptions, owners] = await Promise.all([
                Subscription.find({ accountNumber: { $in: accountNumbers } }).lean(),
                User.find({ _id: { $in: ownerIds } }).select('name email avatar').lean(),
            ]);

            const planMap = new Map(plans.map(plan => [plan.slug, plan]));
            const subscriptionMap = new Map(subscriptions.map(sub => [sub.accountNumber, sub]));
            const ownerMap = new Map(owners.map(owner => [String(owner._id), owner]));
            const defaultFreePlan = planMap.get('free') || getDefaultPlanDefinition('free');

            const rows = accounts.map(account => {
                const sub = subscriptionMap.get(account.account_number);
                const plan = planMap.get(sub?.planSlug) || defaultFreePlan;
                const activeSeats = getActiveSeatCount(account);
                const seatPolicy = getPlanSeatPolicy(plan);
                const workingSub = sub || {
                    planSlug: 'free',
                    status: 'active',
                    billing: { cycle: 'monthly', currency: 'EUR', provider: 'manual' },
                    seats: {
                        included: seatPolicy.included,
                        purchased: 0,
                        used: activeSeats,
                        billable: 1,
                    },
                    effectiveLimits: getPlanLimits(plan),
                };
                const priceSnapshot = buildPriceSnapshot(plan, workingSub, account);
                const billableSeats = getBillableSeats(plan, workingSub, account);
                const owner = account.ownerId ? ownerMap.get(String(account.ownerId)) : null;

                return {
                    accountNumber: account.account_number,
                    accountId: account._id,
                    accountName: account.name,
                    accountIcon: account.icon,
                    accountStatus: account.status,
                    ownerName: owner?.name || 'Sans propriétaire',
                    ownerEmail: owner?.email || '',
                    planSlug: plan.slug,
                    planName: plan.name,
                    planColor: plan.color || '#64748b',
                    billingModel: plan.billingModel || 'free',
                    status: workingSub.status || 'active',
                    provider: workingSub.billing?.provider || 'manual',
                    cycle: workingSub.billing?.cycle || 'monthly',
                    activeSeats,
                    billableSeats,
                    monthlyAmount: priceSnapshot.monthlyTotalAmount || 0,
                    nextBillingDate: workingSub.billing?.nextBillingDate || null,
                    nextBillingDateInput: formatDateInput(workingSub.billing?.nextBillingDate),
                    currentPeriodEndInput: formatDateInput(workingSub.currentPeriodEnd),
                    trialEndsAtInput: formatDateInput(workingSub.trialEndsAt),
                    providerCustomerId: workingSub.billing?.providerCustomerId || workingSub.billing?.stripeCustomerId || '',
                    providerSubscriptionId: workingSub.billing?.providerSubscriptionId || workingSub.billing?.stripeSubscriptionId || '',
                    providerPriceId: workingSub.billing?.providerPriceId || '',
                    adminNote: workingSub.billing?.adminNote || '',
                    createdOn: account.created_on,
                    hasSubscription: Boolean(sub),
                };
            });

            const stats = rows.reduce((acc, row) => {
                acc.mrr += row.monthlyAmount;
                if (row.monthlyAmount > 0 && ['active', 'trialing', 'past_due'].includes(row.status)) acc.paid += 1;
                if (row.status === 'trialing') acc.trialing += 1;
                if (row.planSlug === 'free') acc.free += 1;
                if (row.provider !== 'manual') acc.providerLinked += 1;
                return acc;
            }, { mrr: 0, paid: 0, trialing: 0, free: 0, providerLinked: 0 });

            res.render("superadmin/sa-billing", {
                layout: "layout-superadmin",
                user: req.user,
                rows,
                plans,
                stats: {
                    ...stats,
                    mrr: Math.round(stats.mrr * 100) / 100,
                    accounts: rows.length,
                },
                billingJson: jsonForScript({
                    rows,
                    plans,
                    stats,
                    providers: BILLING_PROVIDERS,
                    statuses: SUBSCRIPTION_STATUSES,
                    cycles: BILLING_CYCLES,
                }),
            });
        } catch (error) {
            console.error("[SuperAdmin] Billing page error:", error);
            res.status(500).send("Server Error");
        }
    },

    // ── API: Billing catalog seed ────────────────────────────
    syncBillingPlans: async (req, res) => {
        try {
            const plans = await ensureDefaultBillingPlans();
            res.json({ success: true, plans });
        } catch (error) {
            console.error("[SuperAdmin] Sync billing plans error:", error);
            res.status(500).json({ error: "Server Error" });
        }
    },

    // ── API: Update Workspace Subscription ───────────────────
    updateAccountSubscription: async (req, res) => {
        try {
            await ensureDefaultBillingPlans();

            const {
                accountNumber,
                planSlug,
                status,
                provider,
                cycle,
                billableSeats,
                nextBillingDate,
                currentPeriodEnd,
                trialEndsAt,
                providerCustomerId,
                providerSubscriptionId,
                providerPriceId,
                adminNote,
            } = req.body;

            if (!accountNumber || !planSlug) {
                return res.status(400).json({ error: 'accountNumber and planSlug are required' });
            }

            if (status && !SUBSCRIPTION_STATUSES.includes(status)) {
                return res.status(400).json({ error: 'Invalid subscription status' });
            }

            if (provider && !BILLING_PROVIDERS.includes(provider)) {
                return res.status(400).json({ error: 'Invalid billing provider' });
            }

            if (cycle && !BILLING_CYCLES.includes(cycle)) {
                return res.status(400).json({ error: 'Invalid billing cycle' });
            }

            const [account, plan] = await Promise.all([
                Account.findOne({ account_number: String(accountNumber) }),
                Plan.findOne({ slug: planSlug, isActive: true }),
            ]);

            if (!account) return res.status(404).json({ error: 'Account not found' });
            if (!plan) return res.status(404).json({ error: 'Plan not found' });

            const activeSeats = getActiveSeatCount(account);
            const seatPolicy = getPlanSeatPolicy(plan);
            const resolvedStatus = plan.billingModel === 'free' ? 'active' : (status || 'active');

            let sub = await Subscription.findOne({ accountNumber: account.account_number });
            if (!sub) {
                sub = new Subscription({
                    accountNumber: account.account_number,
                    accountId: account._id,
                });
            }

            sub.accountId = account._id;
            sub.planSlug = plan.slug;
            sub.planId = plan._id;
            sub.status = resolvedStatus;
            sub.trialEndsAt = optionalDate(trialEndsAt);
            sub.currentPeriodStart = sub.currentPeriodStart || new Date();
            sub.currentPeriodEnd = optionalDate(currentPeriodEnd);
            sub.canceledAt = resolvedStatus === 'canceled' ? (sub.canceledAt || new Date()) : null;

            sub.billing = {
                ...(sub.billing?.toObject ? sub.billing.toObject() : sub.billing || {}),
                cycle: cycle || sub.billing?.cycle || 'monthly',
                currency: 'EUR',
                provider: provider || sub.billing?.provider || 'manual',
                providerCustomerId: providerCustomerId || '',
                providerSubscriptionId: providerSubscriptionId || '',
                providerPriceId: providerPriceId || '',
                stripeCustomerId: provider === 'stripe' ? (providerCustomerId || sub.billing?.stripeCustomerId || '') : sub.billing?.stripeCustomerId,
                stripeSubscriptionId: provider === 'stripe' ? (providerSubscriptionId || sub.billing?.stripeSubscriptionId || '') : sub.billing?.stripeSubscriptionId,
                nextBillingDate: optionalDate(nextBillingDate),
                adminNote: adminNote || '',
            };

            const requestedSeats = Number(billableSeats);
            const resolvedBillableSeats = plan.billingModel === 'per_seat'
                ? getBillableSeats(plan, { ...sub.toObject(), seats: { ...sub.seats?.toObject?.(), used: activeSeats } }, account, requestedSeats)
                : 1;

            sub.seats = {
                included: seatPolicy.included,
                used: activeSeats,
                billable: resolvedBillableSeats,
                purchased: Math.max(0, resolvedBillableSeats - seatPolicy.included),
            };
            sub.effectiveLimits = getPlanLimits(plan);
            sub.priceSnapshot = buildPriceSnapshot(plan, sub, account, resolvedBillableSeats);

            await sub.save();
            invalidateCache(account.account_number);

            res.json({
                success: true,
                message: `Abonnement ${account.name} mis à jour`,
                subscription: sub,
            });
        } catch (error) {
            console.error("[SuperAdmin] Update account subscription error:", error);
            res.status(500).json({ error: "Server Error" });
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
            const registration = await createAccountUser({
                req,
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                confirmPassword: req.body.password,
                role: req.body.role || 'user',
                plan: req.body.plan || 'free',
                status: req.body.status || 'active',
                requireEmailVerification: false,
                requirePasswordConfirmation: false,
            });

            res.json({
                success: true,
                userId: registration.user._id,
                account_number: registration.account_number,
            });
        } catch (error) {
            if (error instanceof RegistrationError) {
                return res.status(error.status || 400).json({
                    error: error.message,
                    code: error.code,
                });
            }

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

            if (!invitation || (invitation.expiresAt && new Date() > invitation.expiresAt)) {
                if (invitation) invitation.status = 'expired';
                await account.save();
                return res.redirect("/auth/login?error=Invitation expirée");
            }

            if (!req.user) {
                // Check if the invited user already has an account (registered but not logged in)
                const User = require("../models/user.model");
                const existingUser = await User.findOne({ email: invitation.email.toLowerCase() });
                if (existingUser) {
                    // User exists but not logged in — redirect to login with invite context
                    return res.redirect(`/auth/login?error=Connectez-vous pour accepter l'invitation à ${account.name}&invite=${token}`);
                }
                // User doesn't exist — redirect to register with invite token + account info
                return res.redirect(`/auth/register?invite=${token}&account=${account.account_number}`);
            }

            // User is logged in — verify this invite is for them
            const inviteEmail = invitation.email.toLowerCase().trim();
            const userEmail = req.user.email.toLowerCase().trim();

            if (inviteEmail !== userEmail) {
                // Wrong user is logged in — don't consume the invite
                return res.redirect(`/auth/login?error=Cette invitation est destinée à ${invitation.email}. Connectez-vous avec ce compte.&invite=${token}`);
            }

            // Check if already a member
            const alreadyMember = account.users?.some(
                u => u.userId === req.user._id.toString() || u.email === userEmail
            );
            if (alreadyMember) {
                invitation.status = 'accepted';
                await account.save();
                // Sync user.accounts in case it's out of date
                const User = require("../models/user.model");
                const user = await User.findById(req.user._id);
                const alreadyLinked = user?.accounts?.some(
                    a => a.account_number === account.account_number
                );
                if (user && !alreadyLinked) {
                    user.accounts.push({
                        account_number: account.account_number,
                        name: account.name,
                        icon: account.icon,
                        role: invitation.role,
                        joinedAt: new Date(),
                    });
                    await user.save();
                }
                // Convert any pending record invites → grants
                await convertPendingInvitesToGrants(account.account_number, userEmail, req.user._id);
                return res.redirect(await invitationRedirectUrl(account, userEmail, req.user._id));
            }

            // Add user to account
            account.users.push({
                userId: req.user._id.toString(),
                email: req.user.email,
                role: invitation.role,
                status: 'active',
                invitedBy: invitation.invitedBy,
                joinedAt: new Date(),
            });

            invitation.status = 'accepted';
            await account.save();

            // Add account to user's accounts
            const User = require("../models/user.model");
            const user = await User.findById(req.user._id);
            const alreadyLinked = user?.accounts?.some(
                a => a.account_number === account.account_number
            );
            if (user && !alreadyLinked) {
                user.accounts.push({
                    account_number: account.account_number,
                    name: account.name,
                    icon: account.icon,
                    role: invitation.role,
                    joinedAt: new Date(),
                });
                await user.save();
            }

            console.log(`[Invitation] ${req.user.email} accepted invite via link to account ${account.account_number}`);

            // Convert any pending record invites → grants
            await convertPendingInvitesToGrants(account.account_number, userEmail, req.user._id);

            res.redirect(await invitationRedirectUrl(account, userEmail, req.user._id));
        } catch (error) {
            console.error("[SuperAdmin] Accept invite error:", error);
            res.redirect("/auth/login?error=Erreur lors de l'acceptation");
        }
    },
};
