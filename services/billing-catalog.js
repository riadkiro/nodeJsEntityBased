const Plan = require('../models/plan.model');

const BILLING_PROVIDERS = ['manual', 'stripe', 'chargebee'];
const SUBSCRIPTION_STATUSES = ['active', 'trialing', 'past_due', 'canceled', 'paused', 'incomplete'];
const BILLING_CYCLES = ['monthly', 'annual'];

const DEFAULT_BILLING_PLANS = [
    {
        slug: 'free',
        name: 'Perso',
        description: 'Compte personnel gratuit pour organiser son espace.',
        audience: 'personal',
        billingModel: 'free',
        price: { monthly: 0, annual: 0 },
        seatPolicy: { included: 1, min: 1, max: 1 },
        limits: {
            users: 1,
            externalCollaborators: 1,
            guests: 2,
            entities: 3,
            records: 500,
            storageMB: 1024,
            aiCreditsPerMonth: 50,
            automationsPerMonth: 0,
            documentsPerMonth: -1,
            apiCallsPerMonth: 0,
        },
        features: {
            api: false,
            sso: false,
            auditLog: false,
            customRoles: false,
            advancedAutomations: false,
            prioritySupport: false,
            whiteLabel: false,
            customAiModels: false,
            dataExport: true,
            advancedAnalytics: false,
        },
        order: 10,
        badge: 'Gratuit',
        color: '#64748b',
        isActive: true,
        isPublic: true,
    },
    {
        slug: 'perso-pro',
        name: 'Perso Pro',
        description: 'Pour un usage personnel avancé avec plus de capacité.',
        audience: 'personal',
        billingModel: 'flat',
        price: { monthly: 8, annual: 96 },
        seatPolicy: { included: 1, min: 1, max: 1 },
        limits: {
            users: 1,
            externalCollaborators: 3,
            guests: 8,
            entities: 10,
            records: 5000,
            storageMB: 10240,
            aiCreditsPerMonth: 250,
            automationsPerMonth: 100,
            documentsPerMonth: -1,
            apiCallsPerMonth: 0,
        },
        features: {
            api: false,
            sso: false,
            auditLog: false,
            customRoles: false,
            advancedAutomations: true,
            prioritySupport: false,
            whiteLabel: false,
            customAiModels: false,
            dataExport: true,
            advancedAnalytics: true,
        },
        order: 20,
        badge: 'Perso',
        color: '#4361ee',
        isActive: true,
        isPublic: true,
    },
    {
        slug: 'decouverte',
        name: 'Découverte',
        description: 'Premier plan professionnel facturé par utilisateur.',
        audience: 'professional',
        billingModel: 'per_seat',
        price: { monthly: 25, annual: 300 },
        seatPolicy: { included: 1, min: 1, max: -1 },
        limits: {
            users: -1,
            externalCollaborators: 10,
            guests: 25,
            entities: 25,
            records: 25000,
            storageMB: 51200,
            aiCreditsPerMonth: 1000,
            automationsPerMonth: 500,
            documentsPerMonth: -1,
            apiCallsPerMonth: 10000,
        },
        features: {
            api: true,
            sso: false,
            auditLog: true,
            customRoles: true,
            advancedAutomations: true,
            prioritySupport: false,
            whiteLabel: false,
            customAiModels: false,
            dataExport: true,
            advancedAnalytics: true,
        },
        order: 30,
        badge: 'Découverte',
        color: '#0891b2',
        isActive: true,
        isPublic: true,
    },
    {
        slug: 'pro',
        name: 'Pro',
        description: 'Pour les équipes qui utilisent Dexapp au quotidien.',
        audience: 'professional',
        billingModel: 'per_seat',
        price: { monthly: 49, annual: 588 },
        seatPolicy: { included: 1, min: 1, max: -1 },
        limits: {
            users: -1,
            externalCollaborators: 25,
            guests: 75,
            entities: 75,
            records: 100000,
            storageMB: 204800,
            aiCreditsPerMonth: 4000,
            automationsPerMonth: 2500,
            documentsPerMonth: -1,
            apiCallsPerMonth: 50000,
        },
        features: {
            api: true,
            sso: false,
            auditLog: true,
            customRoles: true,
            advancedAutomations: true,
            prioritySupport: true,
            whiteLabel: false,
            customAiModels: false,
            dataExport: true,
            advancedAnalytics: true,
        },
        order: 40,
        badge: 'Pro',
        color: '#7c3aed',
        isActive: true,
        isPublic: true,
    },
    {
        slug: 'ultra',
        name: 'Ultra',
        description: 'Plan avancé pour les organisations exigeantes.',
        audience: 'professional',
        billingModel: 'per_seat',
        price: { monthly: 99, annual: 1188 },
        seatPolicy: { included: 1, min: 1, max: -1 },
        limits: {
            users: -1,
            externalCollaborators: -1,
            guests: -1,
            entities: -1,
            records: -1,
            storageMB: 1024000,
            aiCreditsPerMonth: 12000,
            automationsPerMonth: -1,
            documentsPerMonth: -1,
            apiCallsPerMonth: 250000,
        },
        features: {
            api: true,
            sso: true,
            auditLog: true,
            customRoles: true,
            advancedAutomations: true,
            prioritySupport: true,
            whiteLabel: true,
            customAiModels: true,
            dataExport: true,
            advancedAnalytics: true,
        },
        order: 50,
        badge: 'Ultra',
        color: '#0f172a',
        isActive: true,
        isPublic: true,
    },
];

const DEFAULT_PLAN_BY_SLUG = DEFAULT_BILLING_PLANS.reduce((acc, plan) => {
    acc[plan.slug] = plan;
    return acc;
}, {});

function toPlainObject(value) {
    if (!value) return {};
    if (typeof value.toObject === 'function') return value.toObject();
    return { ...value };
}

function getPlanLimits(plan) {
    return toPlainObject(plan?.limits || DEFAULT_PLAN_BY_SLUG.free.limits);
}

function getDefaultPlanDefinition(slug = 'free') {
    return DEFAULT_PLAN_BY_SLUG[slug] || DEFAULT_PLAN_BY_SLUG.free;
}

function getActiveSeatCount(account) {
    const activeUsers = account?.users?.filter(member => member.status === 'active') || [];
    return Math.max(1, activeUsers.length || 1);
}

function getPlanSeatPolicy(plan) {
    const policy = toPlainObject(plan?.seatPolicy || {});
    return {
        included: Number.isFinite(Number(policy.included)) ? Number(policy.included) : 1,
        min: Number.isFinite(Number(policy.min)) ? Number(policy.min) : 1,
        max: Number.isFinite(Number(policy.max)) ? Number(policy.max) : -1,
    };
}

function getBillableSeats(plan, subscription, account, requestedSeats) {
    if ((plan?.billingModel || 'free') !== 'per_seat') return 1;

    const policy = getPlanSeatPolicy(plan);
    const used = Number(subscription?.seats?.used) || getActiveSeatCount(account);
    const stored = Number(subscription?.seats?.billable) || 0;
    const requested = Number(requestedSeats) || 0;
    let billable = Math.max(policy.min || 1, used, stored, requested);

    if (policy.max > 0) billable = Math.min(billable, policy.max);
    return billable;
}

function buildPriceSnapshot(plan, subscription, account, requestedSeats) {
    const cycle = subscription?.billing?.cycle || 'monthly';
    const monthlyUnitAmount = Number(plan?.price?.monthly || 0);
    const annualUnitAmount = Number(plan?.price?.annual || monthlyUnitAmount * 12);
    const billableSeats = getBillableSeats(plan, subscription, account, requestedSeats);
    const unitMonthlyEquivalent = cycle === 'annual' ? annualUnitAmount / 12 : monthlyUnitAmount;
    const multiplier = plan?.billingModel === 'per_seat' ? billableSeats : plan?.billingModel === 'flat' ? 1 : 0;

    return {
        currency: subscription?.billing?.currency || 'EUR',
        billingModel: plan?.billingModel || 'free',
        monthlyUnitAmount,
        annualUnitAmount,
        monthlyTotalAmount: Math.round(unitMonthlyEquivalent * multiplier * 100) / 100,
        billableSeats,
    };
}

async function ensureDefaultBillingPlans() {
    for (const plan of DEFAULT_BILLING_PLANS) {
        const { providerRefs, ...planUpdate } = plan;
        await Plan.updateOne(
            { slug: plan.slug },
            {
                $set: planUpdate,
                $setOnInsert: { providerRefs: providerRefs || {} },
            },
            { upsert: true }
        );
    }

    return Plan.find({ slug: { $in: DEFAULT_BILLING_PLANS.map(plan => plan.slug) } })
        .sort({ order: 1 })
        .lean();
}

module.exports = {
    BILLING_CYCLES,
    BILLING_PROVIDERS,
    DEFAULT_BILLING_PLANS,
    SUBSCRIPTION_STATUSES,
    buildPriceSnapshot,
    ensureDefaultBillingPlans,
    getActiveSeatCount,
    getBillableSeats,
    getDefaultPlanDefinition,
    getPlanLimits,
    getPlanSeatPolicy,
};
