const mongoose = require('mongoose');

/**
 * Subscription — Workspace billing subscription
 * ────────────────────────────────────────────────
 * Links a workspace (Account) to a Plan + Addons.
 * One subscription per workspace.
 * Stored in the GLOBAL database (not tenant).
 */
const SubscriptionSchema = new mongoose.Schema({
    // Link to workspace
    accountNumber: { type: String, required: true, unique: true, index: true },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },

    // Plan
    planSlug: { type: String, required: true, default: 'free' },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },

    // Billing cycle
    billing: {
        cycle: { type: String, enum: ['monthly', 'annual'], default: 'monthly' },
        currency: { type: String, default: 'EUR' },
        regionMultiplier: { type: Number, default: 1.0 }, // For localized pricing
        
        // Payment provider
        provider: { type: String, enum: ['manual', 'stripe', 'chargebee'], default: 'manual' },
        providerCustomerId: { type: String },
        providerSubscriptionId: { type: String },
        providerPriceId: { type: String },
        stripeCustomerId: { type: String },
        stripeSubscriptionId: { type: String },
        paymentMethod: { type: String }, // 'card', 'sepa', etc.
        adminNote: { type: String },
        
        // Billing dates
        nextBillingDate: { type: Date },
        cancelAtPeriodEnd: { type: Boolean, default: false },
    },

    // Active addons
    addons: [{
        addonSlug: { type: String },
        addonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Addon' },
        quantity: { type: Number, default: 1 },
        activatedAt: { type: Date, default: Date.now },
    }],

    // Seats
    seats: {
        included: { type: Number, default: 1 },     // From plan
        purchased: { type: Number, default: 0 },     // Extra seats purchased
        used: { type: Number, default: 1 },           // Currently active members
        billable: { type: Number, default: 1 },       // Seats billed by provider/manual invoice
    },

    priceSnapshot: {
        currency: { type: String, default: 'EUR' },
        billingModel: { type: String, enum: ['free', 'flat', 'per_seat'], default: 'free' },
        monthlyUnitAmount: { type: Number, default: 0 },
        annualUnitAmount: { type: Number, default: 0 },
        monthlyTotalAmount: { type: Number, default: 0 },
        billableSeats: { type: Number, default: 1 },
    },

    // Status
    status: { 
        type: String, 
        enum: ['active', 'trialing', 'past_due', 'canceled', 'paused', 'incomplete'], 
        default: 'trialing' 
    },
    trialEndsAt: { type: Date },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    canceledAt: { type: Date },

    // Resolved limits (computed from plan + addons at subscription time)
    // This is a cache — recalculated when plan/addons change
    effectiveLimits: {
        users:                 { type: Number, default: 1 },
        externalCollaborators: { type: Number, default: 2 },
        guests:                { type: Number, default: 5 },
        entities:              { type: Number, default: 3 },
        records:               { type: Number, default: 500 },
        storageMB:             { type: Number, default: 1024 },
        aiCreditsPerMonth:     { type: Number, default: 50 },
        automationsPerMonth:   { type: Number, default: 0 },
        documentsPerMonth:     { type: Number, default: -1 },
        apiCallsPerMonth:      { type: Number, default: 0 },
    },

}, { timestamps: true });

// Check if subscription is active
SubscriptionSchema.methods.isActive = function () {
    return ['active', 'trialing'].includes(this.status);
};

// Check if in trial
SubscriptionSchema.methods.isTrialing = function () {
    if (this.status !== 'trialing') return false;
    if (!this.trialEndsAt) return false;
    return new Date() < new Date(this.trialEndsAt);
};

// Check a specific limit (-1 = unlimited)
SubscriptionSchema.methods.checkLimit = function (limitKey, currentValue) {
    const limit = this.effectiveLimits[limitKey];
    if (limit === undefined) return true;
    if (limit === -1) return true; // Unlimited
    return currentValue < limit;
};

const Subscription = mongoose.model('Subscription', SubscriptionSchema);
module.exports = Subscription;
