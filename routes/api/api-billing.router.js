const express = require('express');
const router = express.Router();
const Plan = require('../../models/plan.model');
const Addon = require('../../models/addon.model');
const Subscription = require('../../models/subscription.model');
const Usage = require('../../models/usage.model');
const Account = require('../../models/account.model');
const { requirePerm } = require('../../middleware/permissions');
const { invalidateCache } = require('../../middleware/billing');
const {
    buildPriceSnapshot,
    ensureDefaultBillingPlans,
    getActiveSeatCount,
    getPlanLimits,
    getPlanSeatPolicy,
} = require('../../services/billing-catalog');

// ═══════════════════════════════════════════
// PUBLIC — Plans & Addons (no auth required for pricing page)
// ═══════════════════════════════════════════

// ── GET /api/billing/plans ────────────────────────────
router.get('/plans', async (req, res) => {
    try {
        await ensureDefaultBillingPlans();
        const plans = await Plan.find({ isActive: true, isPublic: true })
            .sort({ order: 1 })
            .lean();
        res.json({ success: true, plans });
    } catch (error) {
        console.error('[Billing API] plans error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET /api/billing/addons ───────────────────────────
router.get('/addons', async (req, res) => {
    try {
        const addons = await Addon.find({ isActive: true })
            .sort({ order: 1 })
            .lean();
        res.json({ success: true, addons });
    } catch (error) {
        console.error('[Billing API] addons error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ═══════════════════════════════════════════
// WORKSPACE — Subscription & Usage (auth required)
// ═══════════════════════════════════════════

// ── GET /api/billing/subscription ─────────────────────
// Get current workspace subscription
router.get('/subscription', async (req, res) => {
    try {
        await ensureDefaultBillingPlans();
        let sub = await Subscription.findOne({ accountNumber: req.account_number }).lean();
        
        if (!sub) {
            // No subscription yet — return free defaults
            const freePlan = await Plan.findOne({ slug: 'free' }).lean();
            const account = await Account.findOne({ account_number: req.account_number }).lean();
            sub = {
                planSlug: 'free',
                plan: freePlan,
                status: 'active',
                effectiveLimits: getPlanLimits(freePlan),
                seats: { included: 1, purchased: 0, used: getActiveSeatCount(account), billable: 1 },
                addons: [],
                billing: { cycle: 'monthly', currency: 'EUR', provider: 'manual' },
                priceSnapshot: buildPriceSnapshot(freePlan, null, account),
            };
        } else {
            // Enrich with plan details
            sub.plan = await Plan.findOne({ slug: sub.planSlug }).lean();
        }

        // Get current usage
        const usage = await Usage.getCurrent(req.account_number);

        res.json({
            success: true,
            subscription: sub,
            usage: usage?.counters || {},
        });
    } catch (error) {
        console.error('[Billing API] subscription error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET /api/billing/usage ────────────────────────────
// Get current period usage counters
router.get('/usage', async (req, res) => {
    try {
        const usage = await Usage.getCurrent(req.account_number);
        const sub = await Subscription.findOne({ accountNumber: req.account_number }).lean();

        // Calculate usage percentages
        const limits = sub?.effectiveLimits || {};
        const counters = usage?.counters || {};
        const percentages = {};
        
        for (const [key, limit] of Object.entries(limits)) {
            if (limit === -1) {
                percentages[key] = 0; // Unlimited
            } else if (limit > 0) {
                const counterKey = {
                    users: 'activeUsers',
                    externalCollaborators: 'externalCollabs',
                    aiCreditsPerMonth: 'aiCreditsUsed',
                    automationsPerMonth: 'automationsRun',
                }[key] || key;
                percentages[key] = Math.round(((counters[counterKey] || 0) / limit) * 100);
            }
        }

        res.json({
            success: true,
            usage: counters,
            limits,
            percentages,
            period: Usage.currentPeriod(),
        });
    } catch (error) {
        console.error('[Billing API] usage error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/billing/change-plan ─────────────────────
// Change subscription plan (admin/owner only)
router.post('/change-plan', requirePerm('settings.update'), async (req, res) => {
    try {
        await ensureDefaultBillingPlans();
        const { planSlug, cycle } = req.body;
        if (!planSlug) return res.status(400).json({ error: 'planSlug required' });

        const plan = await Plan.findOne({ slug: planSlug, isActive: true });
        if (!plan) return res.status(404).json({ error: 'Plan not found' });

        const account = await Account.findOne({ account_number: req.account_number });
        const activeSeats = getActiveSeatCount(account);
        const seatPolicy = getPlanSeatPolicy(plan);
        let sub = await Subscription.findOne({ accountNumber: req.account_number });
        
        if (!sub) {
            // Create new subscription
            sub = new Subscription({
                accountNumber: req.account_number,
                accountId: account?._id,
                planSlug: plan.slug,
                planId: plan._id,
                billing: {
                    cycle: cycle || 'monthly',
                },
                status: plan.slug === 'free' ? 'active' : 'trialing',
                trialEndsAt: plan.slug !== 'free' ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null,
                seats: {
                    included: seatPolicy.included,
                    purchased: 0,
                    used: activeSeats,
                    billable: plan.billingModel === 'per_seat' ? Math.max(seatPolicy.min, activeSeats) : 1,
                },
                effectiveLimits: getPlanLimits(plan),
            });
        } else {
            sub.planSlug = plan.slug;
            sub.planId = plan._id;
            if (cycle) sub.billing.cycle = cycle;
            sub.seats.included = seatPolicy.included;
            sub.seats.used = activeSeats;
            sub.seats.billable = plan.billingModel === 'per_seat'
                ? Math.max(seatPolicy.min, activeSeats, Number(sub.seats.billable || 0))
                : 1;
            sub.seats.purchased = Math.max(0, sub.seats.billable - seatPolicy.included);
            sub.effectiveLimits = getPlanLimits(plan);
            
            // Recalculate with addons
            for (const activeAddon of sub.addons) {
                const addon = await Addon.findOne({ slug: activeAddon.addonSlug });
                if (addon?.provides) {
                    if (addon.provides.storageMB) {
                        sub.effectiveLimits.storageMB += addon.provides.storageMB * (activeAddon.quantity || 1);
                    }
                    if (addon.provides.automationsPerMonth === -1) {
                        sub.effectiveLimits.automationsPerMonth = -1;
                    } else if (addon.provides.automationsPerMonth) {
                        sub.effectiveLimits.automationsPerMonth += addon.provides.automationsPerMonth;
                    }
                    if (addon.provides.aiCreditsMultiplier) {
                        sub.effectiveLimits.aiCreditsPerMonth *= addon.provides.aiCreditsMultiplier;
                    }
                }
            }
        }

        sub.priceSnapshot = buildPriceSnapshot(plan, sub, account);

        await sub.save();
        invalidateCache(req.account_number);

        res.json({
            success: true,
            subscription: sub,
            message: `Plan changé vers ${plan.name}`,
        });
    } catch (error) {
        console.error('[Billing API] change-plan error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/billing/add-addon ───────────────────────
// Add an addon to the subscription
router.post('/add-addon', requirePerm('settings.update'), async (req, res) => {
    try {
        const { addonSlug, quantity } = req.body;
        if (!addonSlug) return res.status(400).json({ error: 'addonSlug required' });

        const addon = await Addon.findOne({ slug: addonSlug, isActive: true });
        if (!addon) return res.status(404).json({ error: 'Addon not found' });

        let sub = await Subscription.findOne({ accountNumber: req.account_number });
        if (!sub) return res.status(400).json({ error: 'No subscription found. Please select a plan first.' });

        // Check plan compatibility
        if (addon.availablePlans.length > 0 && !addon.availablePlans.includes(sub.planSlug)) {
            return res.status(400).json({
                error: `Cet addon n'est pas disponible pour le plan ${sub.planSlug}`,
                availablePlans: addon.availablePlans,
            });
        }

        // Check if addon already active
        const existingIdx = sub.addons.findIndex(a => a.addonSlug === addonSlug);
        if (existingIdx >= 0) {
            sub.addons[existingIdx].quantity = quantity || 1;
        } else {
            sub.addons.push({
                addonSlug,
                addonId: addon._id,
                quantity: quantity || 1,
                activatedAt: new Date(),
            });
        }

        // Recalculate effective limits
        const plan = await Plan.findOne({ slug: sub.planSlug });
        sub.effectiveLimits = getPlanLimits(plan);
        for (const activeAddon of sub.addons) {
            const a = await Addon.findOne({ slug: activeAddon.addonSlug });
            if (a?.provides) {
                if (a.provides.storageMB) {
                    sub.effectiveLimits.storageMB += a.provides.storageMB * (activeAddon.quantity || 1);
                }
                if (a.provides.automationsPerMonth === -1) {
                    sub.effectiveLimits.automationsPerMonth = -1;
                } else if (a.provides.automationsPerMonth) {
                    sub.effectiveLimits.automationsPerMonth += a.provides.automationsPerMonth;
                }
                if (a.provides.aiCreditsMultiplier) {
                    sub.effectiveLimits.aiCreditsPerMonth *= a.provides.aiCreditsMultiplier;
                }
                if (a.provides.apiCallsPerMonth) {
                    sub.effectiveLimits.apiCallsPerMonth += a.provides.apiCallsPerMonth;
                }
            }
        }

        await sub.save();
        invalidateCache(req.account_number);

        res.json({ success: true, subscription: sub, message: `Addon ${addon.name} activé` });
    } catch (error) {
        console.error('[Billing API] add-addon error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/billing/remove-addon ────────────────────
router.post('/remove-addon', requirePerm('settings.update'), async (req, res) => {
    try {
        const { addonSlug } = req.body;
        if (!addonSlug) return res.status(400).json({ error: 'addonSlug required' });

        const sub = await Subscription.findOne({ accountNumber: req.account_number });
        if (!sub) return res.status(404).json({ error: 'No subscription' });

        sub.addons = sub.addons.filter(a => a.addonSlug !== addonSlug);

        // Recalculate effective limits
        const plan = await Plan.findOne({ slug: sub.planSlug });
        sub.effectiveLimits = getPlanLimits(plan);
        for (const activeAddon of sub.addons) {
            const a = await Addon.findOne({ slug: activeAddon.addonSlug });
            if (a?.provides) {
                if (a.provides.storageMB) sub.effectiveLimits.storageMB += a.provides.storageMB * (activeAddon.quantity || 1);
                if (a.provides.automationsPerMonth === -1) sub.effectiveLimits.automationsPerMonth = -1;
                else if (a.provides.automationsPerMonth) sub.effectiveLimits.automationsPerMonth += a.provides.automationsPerMonth;
                if (a.provides.aiCreditsMultiplier) sub.effectiveLimits.aiCreditsPerMonth *= a.provides.aiCreditsMultiplier;
            }
        }

        await sub.save();
        invalidateCache(req.account_number);

        res.json({ success: true, message: 'Addon retiré' });
    } catch (error) {
        console.error('[Billing API] remove-addon error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
