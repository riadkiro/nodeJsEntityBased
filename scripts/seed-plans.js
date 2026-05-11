/**
 * Seed Plans & Addons
 * ───────────────────
 * Run: node scripts/seed-plans.js
 * 
 * Idempotent — upserts by slug, safe to run multiple times.
 */
const mongoose = require('mongoose');
const dbConfig = require('../config/db');

const dbUri = dbConfig.globalDbUri;

async function seed() {
    await mongoose.connect(dbUri);
    console.log('[Seed] Connected to', dbUri);

    const Plan = require('../models/plan.model');
    const Addon = require('../models/addon.model');

    // ═══════════════════════════════════════
    // PLANS
    // ═══════════════════════════════════════
    const plans = [
        {
            slug: 'free',
            name: 'Free',
            description: 'Pour démarrer gratuitement',
            price: { monthly: 0, annual: 0 },
            limits: {
                users: 1,
                externalCollaborators: 2,
                guests: 5,
                entities: 3,
                records: 500,
                storageMB: 1024,
                aiCreditsPerMonth: 50,
                automationsPerMonth: 0,
                documentsPerMonth: -1,
                apiCallsPerMonth: 0,
            },
            features: {
                api: false, sso: false, auditLog: false, customRoles: false,
                advancedAutomations: false, prioritySupport: false, whiteLabel: false,
                customAiModels: false, dataExport: false, advancedAnalytics: false,
            },
            order: 0,
            color: '#6b7280',
        },
        {
            slug: 'pro',
            name: 'Pro',
            description: 'Pour les équipes en croissance',
            price: { monthly: 12, annual: 10 },
            limits: {
                users: -1,
                externalCollaborators: 10,
                guests: -1,
                entities: 10,
                records: 10000,
                storageMB: 10240,
                aiCreditsPerMonth: 500,
                automationsPerMonth: 50,
                documentsPerMonth: -1,
                apiCallsPerMonth: 0,
            },
            features: {
                api: false, sso: false, auditLog: false, customRoles: false,
                advancedAutomations: false, prioritySupport: false, whiteLabel: false,
                customAiModels: false, dataExport: true, advancedAnalytics: false,
            },
            order: 1,
            badge: 'POPULAIRE',
            color: '#4361ee',
        },
        {
            slug: 'business',
            name: 'Business',
            description: 'Pour les entreprises exigeantes',
            price: { monthly: 25, annual: 20 },
            limits: {
                users: -1,
                externalCollaborators: -1,
                guests: -1,
                entities: -1,
                records: -1,
                storageMB: 102400,
                aiCreditsPerMonth: 5000,
                automationsPerMonth: 500,
                documentsPerMonth: -1,
                apiCallsPerMonth: 10000,
            },
            features: {
                api: true, sso: false, auditLog: true, customRoles: true,
                advancedAutomations: true, prioritySupport: true, whiteLabel: false,
                customAiModels: false, dataExport: true, advancedAnalytics: true,
            },
            order: 2,
            badge: 'MEILLEUR RAPPORT',
            color: '#00ab55',
        },
        {
            slug: 'enterprise',
            name: 'Enterprise',
            description: 'Solution sur mesure',
            price: { monthly: 0, annual: 0 }, // Custom pricing
            limits: {
                users: -1,
                externalCollaborators: -1,
                guests: -1,
                entities: -1,
                records: -1,
                storageMB: -1,
                aiCreditsPerMonth: -1,
                automationsPerMonth: -1,
                documentsPerMonth: -1,
                apiCallsPerMonth: -1,
            },
            features: {
                api: true, sso: true, auditLog: true, customRoles: true,
                advancedAutomations: true, prioritySupport: true, whiteLabel: true,
                customAiModels: true, dataExport: true, advancedAnalytics: true,
            },
            order: 3,
            color: '#805dca',
            isPublic: false, // Contact sales
        },
    ];

    for (const plan of plans) {
        await Plan.findOneAndUpdate(
            { slug: plan.slug },
            plan,
            { upsert: true, new: true }
        );
        console.log(`[Seed] Plan "${plan.slug}" → ${plan.price.monthly}€/user/mois`);
    }

    // ═══════════════════════════════════════
    // ADDONS
    // ═══════════════════════════════════════
    const addons = [
        {
            slug: 'ai-plus',
            name: 'IA+ Pack',
            description: '5x crédits IA, GPT-4 accès, custom prompts',
            icon: 'solar:magic-stick-3-bold-duotone',
            price: { monthly: 5, annual: 4 },
            type: 'per-user',
            provides: {
                aiCreditsMultiplier: 5,
                features: ['customAiModels'],
            },
            availablePlans: ['pro', 'business', 'enterprise'],
            order: 0,
        },
        {
            slug: 'automation-plus',
            name: 'Automation+ Pack',
            description: 'Automations illimitées, webhooks, scheduled jobs',
            icon: 'solar:bolt-circle-bold-duotone',
            price: { monthly: 3, annual: 2.5 },
            type: 'per-user',
            provides: {
                automationsPerMonth: -1,
                features: ['advancedAutomations'],
            },
            availablePlans: ['pro', 'business'],
            order: 1,
        },
        {
            slug: 'storage-plus',
            name: 'Stockage+ Pack',
            description: '10 GB de stockage supplémentaire',
            icon: 'solar:cloud-storage-bold-duotone',
            price: { monthly: 2, annual: 1.5 },
            type: 'flat',
            provides: {
                storageMB: 10240,
            },
            availablePlans: [],  // All plans
            order: 2,
        },
        {
            slug: 'vertical-medical',
            name: 'Pack Médical',
            description: 'Templates médecin, ordonnances, certificats, CNAM',
            icon: 'solar:heart-pulse-bold-duotone',
            price: { monthly: 8, annual: 6.5 },
            type: 'per-user',
            provides: {
                features: ['verticalMedical'],
            },
            availablePlans: ['pro', 'business', 'enterprise'],
            order: 3,
        },
        {
            slug: 'vertical-legal',
            name: 'Pack Juridique',
            description: 'Templates juridiques, contrats, mises en demeure',
            icon: 'solar:scale-bold-duotone',
            price: { monthly: 8, annual: 6.5 },
            type: 'per-user',
            provides: {
                features: ['verticalLegal'],
            },
            availablePlans: ['pro', 'business', 'enterprise'],
            order: 4,
        },
    ];

    for (const addon of addons) {
        await Addon.findOneAndUpdate(
            { slug: addon.slug },
            addon,
            { upsert: true, new: true }
        );
        console.log(`[Seed] Addon "${addon.slug}" → ${addon.price.monthly}€/mois (${addon.type})`);
    }

    console.log('\n✅ Seed complete! Plans:', plans.length, '| Addons:', addons.length);
    await mongoose.disconnect();
}

seed().catch(err => {
    console.error('[Seed] Error:', err);
    process.exit(1);
});
