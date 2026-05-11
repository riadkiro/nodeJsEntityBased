const mongoose = require('mongoose');

/**
 * Plan — SaaS subscription plan definition
 * ──────────────────────────────────────────
 * Defines the available plans: Free, Pro, Business, Enterprise
 * with their limits and feature flags.
 */
const PlanSchema = new mongoose.Schema({
    slug: { type: String, unique: true, required: true }, // 'free', 'pro', 'business', 'enterprise'
    name: { type: String, required: true },
    description: { type: String },
    
    // Pricing
    price: {
        monthly: { type: Number, default: 0 },  // Base price in EUR/user/month
        annual: { type: Number, default: 0 },    // Annual price per user/month (with discount)
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

}, { timestamps: true });

const Plan = mongoose.model('Plan', PlanSchema);
module.exports = Plan;
