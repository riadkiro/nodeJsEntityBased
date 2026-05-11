const mongoose = require('mongoose');

/**
 * Addon — Purchasable add-on packs
 * ─────────────────────────────────
 * Stackable addons on top of any plan.
 * Types: per-user (multiplied by seats), flat (fixed price), usage-based
 */
const AddonSchema = new mongoose.Schema({
    slug: { type: String, unique: true, required: true }, // 'ai-plus', 'automation-plus', etc.
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String },

    // Pricing
    price: {
        monthly: { type: Number, default: 0 },
        annual: { type: Number, default: 0 },
    },
    type: { type: String, enum: ['per-user', 'flat', 'usage-based'], default: 'per-user' },

    // What this addon provides (overrides/additions to plan limits)
    provides: {
        aiCreditsMultiplier:    { type: Number },  // e.g. 5 = 5x credits
        automationsPerMonth:    { type: Number },  // Additional automations
        storageMB:              { type: Number },  // Additional storage
        apiCallsPerMonth:       { type: Number },  // Additional API calls
        features:               [{ type: String }], // Feature flags to enable
    },

    // Availability
    availablePlans: [{ type: String }], // ['pro', 'business', 'enterprise'] — empty = all plans
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },

}, { timestamps: true });

const Addon = mongoose.model('Addon', AddonSchema);
module.exports = Addon;
