const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/saas_global';
    await mongoose.connect(dbUri);
    
    const Plan = require('../models/plan.model');
    const plans = await Plan.find({}).lean();
    console.log('Plans found:', plans.length);
    plans.forEach(p => console.log(`  - ${p.slug}: ${p.name} (limits.users=${p.limits?.users})`));
    
    const Subscription = require('../models/subscription.model');
    const subs = await Subscription.find({}).lean();
    console.log('\nSubscriptions found:', subs.length);
    subs.forEach(s => console.log(`  - account=${s.accountNumber}, plan=${s.planSlug}, limits=`, s.effectiveLimits));
    
    await mongoose.disconnect();
}
check().catch(e => { console.error(e); process.exit(1); });
