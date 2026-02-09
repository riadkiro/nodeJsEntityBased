/**
 * Migration: Add scope + contextBindings to existing workflows
 * 
 * For existing workflows with trigger.entityId:
 *   - Set trigger.scope = "entity"
 *   - Create a contextBinding: { key: "record", type: "entity", entityId, source: "currentRecord" }
 * 
 * For workflows without trigger.entityId:
 *   - Set trigger.scope = "global" (manual buttons) or "entity" (record.*)
 * 
 * Usage: node scripts/migrate-workflow-context.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Workflow = require('../src/integrations/models/Workflow.model');

async function migrate() {
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-db';
    await mongoose.connect(dbUri);
    console.log('[Migration] Connected to database');

    const workflows = await Workflow.find({}).lean();
    console.log(`[Migration] Found ${workflows.length} workflows to check`);

    let updated = 0;

    for (const wf of workflows) {
        const updates = {};
        let needsUpdate = false;

        // 1. Add scope if missing
        if (!wf.trigger?.scope) {
            if (wf.trigger?.type?.startsWith('record.')) {
                updates['trigger.scope'] = 'entity';
            } else if (wf.trigger?.type === 'manual.button') {
                updates['trigger.scope'] = wf.trigger.entityId ? 'entity' : 'global';
            } else {
                updates['trigger.scope'] = 'entity';
            }
            needsUpdate = true;
        }

        // 2. Create contextBinding from legacy entityId
        if (wf.trigger?.entityId && (!wf.contextBindings || wf.contextBindings.length === 0)) {
            updates.contextBindings = [{
                key: 'record',
                type: 'entity',
                entityId: wf.trigger.entityId,
                source: 'currentRecord'
            }];
            needsUpdate = true;
        }

        if (needsUpdate) {
            await Workflow.updateOne({ _id: wf._id }, { $set: updates });
            console.log(`  ✅ Updated workflow "${wf.name}" (${wf._id}) — scope=${updates['trigger.scope'] || wf.trigger?.scope}, bindings=${(updates.contextBindings || wf.contextBindings || []).length}`);
            updated++;
        }
    }

    console.log(`\n[Migration] Done. Updated ${updated}/${workflows.length} workflows.`);
    await mongoose.disconnect();
}

migrate().catch(err => {
    console.error('[Migration] Fatal error:', err);
    process.exit(1);
});
