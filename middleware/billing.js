/**
 * Billing Middleware — Limit Enforcement
 * ───────────────────────────────────────
 * Middleware to check workspace subscription limits before allowing actions.
 * 
 * Usage:
 *   const { checkLimit } = require('../middleware/billing');
 *   router.post('/create', checkLimit('records'), controller.create);
 */

const Subscription = require('../models/subscription.model');
const Usage = require('../models/usage.model');

// Cache subscriptions for 60s to avoid DB hits on every request
const subscriptionCache = new Map();
const CACHE_TTL = 60 * 1000;

async function getSubscription(accountNumber) {
    const cached = subscriptionCache.get(accountNumber);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return cached.sub;
    }

    let sub = await Subscription.findOne({ accountNumber }).lean();
    
    // If no subscription exists, return free plan defaults
    if (!sub) {
        sub = {
            planSlug: 'free',
            status: 'active',
            effectiveLimits: {
                users: 1,
                externalCollaborators: 2,
                guests: 5,
                entities: 3,
                records: 500,
                storageMB: 1024,
                aiCreditsPerMonth: 50,
                automationsPerMonth: 0,
                apiCallsPerMonth: 0,
            },
        };
    }

    subscriptionCache.set(accountNumber, { sub, ts: Date.now() });
    return sub;
}

// Clear cache for a specific account (after plan change)
function invalidateCache(accountNumber) {
    subscriptionCache.delete(accountNumber);
}

/**
 * Middleware: Check a specific limit
 * @param {string} limitKey - Key from effectiveLimits (e.g. 'records', 'entities', 'aiCreditsPerMonth')
 * @param {Function} [countFn] - Optional async function(req) that returns current count.
 *                                If not provided, reads from Usage counters.
 */
function checkLimit(limitKey, countFn) {
    // Map limit keys to usage counter keys
    const limitToUsageMap = {
        records: 'records',
        entities: 'entities',
        users: 'activeUsers',
        externalCollaborators: 'externalCollabs',
        guests: 'guests',
        storageMB: 'storageMB',
        aiCreditsPerMonth: 'aiCreditsUsed',
        automationsPerMonth: 'automationsRun',
        apiCallsPerMonth: 'apiCalls',
    };

    return async (req, res, next) => {
        try {
            const accountNumber = req.account_number;
            if (!accountNumber) return next();

            const subscription = await getSubscription(accountNumber);
            const limit = subscription.effectiveLimits?.[limitKey];

            // No limit defined or unlimited (-1)
            if (limit === undefined || limit === null || limit === -1) return next();

            // Get current usage
            let currentCount;
            if (countFn) {
                currentCount = await countFn(req);
            } else {
                const usageKey = limitToUsageMap[limitKey] || limitKey;
                const usage = await Usage.getCurrent(accountNumber);
                currentCount = usage?.counters?.[usageKey] || 0;
            }

            if (currentCount >= limit) {
                return res.status(403).json({
                    error: 'Limite du plan atteinte',
                    limitKey,
                    limit,
                    current: currentCount,
                    plan: subscription.planSlug,
                    upgrade: true,
                    message: `Vous avez atteint la limite de ${limit} ${limitKey} pour le plan ${subscription.planSlug}. Passez au plan supérieur.`,
                });
            }

            // Attach subscription info to request for downstream use
            req.subscription = subscription;
            next();
        } catch (err) {
            console.error('[Billing] checkLimit error:', err.message);
            // Don't block on billing errors — fail open
            next();
        }
    };
}

/**
 * Middleware: Hydrate subscription on request
 * Attaches req.subscription and req.usage for use in templates/handlers
 */
async function hydrateSubscription(req, res, next) {
    try {
        if (req.account_number) {
            req.subscription = await getSubscription(req.account_number);
        }
        next();
    } catch (err) {
        console.error('[Billing] hydrate error:', err.message);
        next();
    }
}

module.exports = {
    checkLimit,
    hydrateSubscription,
    getSubscription,
    invalidateCache,
};
