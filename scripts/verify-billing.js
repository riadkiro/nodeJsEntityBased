/**
 * Quick verification of billing API endpoints
 * Run: node scripts/verify-billing.js
 */
const http = require('http');

const BASE = 'http://localhost:3000';

async function get(path) {
    return new Promise((resolve, reject) => {
        http.get(`${BASE}${path}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch { resolve(data); }
            });
        }).on('error', reject);
    });
}

async function main() {
    console.log('=== Testing Billing API ===\n');

    // 1. Plans (public endpoint — no auth needed)
    const plans = await get('/account/9194/api/billing/plans');
    if (plans.success && plans.plans) {
        console.log(`✅ GET /api/billing/plans — ${plans.plans.length} plans found:`);
        plans.plans.forEach(p => {
            console.log(`   ${p.slug}: ${p.price.monthly}€/mois | users=${p.limits.users} records=${p.limits.records} ai=${p.limits.aiCreditsPerMonth}`);
        });
    } else {
        console.log('❌ Plans endpoint failed:', plans);
    }

    // 2. Addons
    const addons = await get('/account/9194/api/billing/addons');
    if (addons.success && addons.addons) {
        console.log(`\n✅ GET /api/billing/addons — ${addons.addons.length} addons found:`);
        addons.addons.forEach(a => {
            console.log(`   ${a.slug}: ${a.price.monthly}€/mois (${a.type})`);
        });
    } else {
        console.log('❌ Addons endpoint failed:', addons);
    }

    console.log('\n✅ Billing API verification complete!');
}

main().catch(console.error);
