const mongoose = require('mongoose');

/**
 * Plan — SaaS subscription plan definition
 * ──────────────────────────────────────────
 * Defines the available plans and pricing metadata.
 * Provider identifiers are kept separate so Stripe or Chargebee can be wired
 * without changing the subscription model later.
 */
const PlanSchema = new mongoose.Schema({
    slug: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    description: { type: String },
    audience: { type: String, enum: ['personal', 'professional'], default: 'personal' },
    billingModel: { type: String, enum: ['free', 'flat', 'per_seat'], default: 'flat' },
    
    // Pricing
    price: {
        monthly: { type: Number, default: 0 },
        annual: { type: Number, default: 0 },
    },

    seatPolicy: {
        included: { type: Number, default: 1 },
        min: { type: Number, default: 1 },
        max: { type: Number, default: -1 },
    },

    // Limits (-1 = unlimited)
    limits: {
        users:                   { type: Number, default: 1 },
        externalCollaborators:   { type: Number, default: 2 },
        guests:                  { type: Number, default: 5 },
        entities:                { type: Number, default: 3 },
        records:                 { type: Number, default: 500 },
        storageMB:               { type: Number, default: 1024 },      // 1 GB
        aiCreditsPerMonth:       { type: Number, default: 50 },
        automationsPerMonth:     { type: Number, default: 0 },
        documentsPerMonth:       { type: Number, default: -1 },
        apiCallsPerMonth:        { type: Number, default: 0 },
    },

    // Feature flags
    features: {
        api:                  { type: Boolean, default: false },
        sso:                  { type: Boolean, default: false },
        auditLog:             { type: Boolean, default: false },
        customRoles:          { type: Boolean, default: false },
        advancedAutomations:  { type: Boolean, default: false },
        prioritySupport:      { type: Boolean, default: false },
        whiteLabel:           { type: Boolean, default: false },
        customAiModels:       { type: Boolean, default: false },
        dataExport:           { type: Boolean, default: false },
        advancedAnalytics:    { type: Boolean, default: false },
    },

    // Display
    order: { type: Number, default: 0 },
    badge: { type: String },           // "POPULAR", "BEST VALUE", etc.
    color: { type: String },
    isActive: { type: Boolean, default: true },
    isPublic: { type: Boolean, default: true }, // Show on pricing page

    providerRefs: {
        stripe: {
            productId: { type: String },
            monthlyPriceId: { type: String },
            annualPriceId: { type: String },
        },
        chargebee: {
            itemId: { type: String },
            monthlyItemPriceId: { type: String },
            annualItemPriceId: { type: String },
        },
    },

}, { timestamps: true });

const Plan = mongoose.model('Plan', PlanSchema);
module.exports = Plan;
