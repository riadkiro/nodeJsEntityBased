// Debug: Check what the API would return
const mongoose = require('mongoose');

async function debug() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));

    const entities = conn.db.collection('entities');
    const records = conn.db.collection('records');

    // 1. Check all entity slugs
    const allEntities = await entities.find({}).project({ slug: 1, name: 1 }).toArray();
    console.log('=== All entities ===');
    allEntities.forEach(e => console.log(`  ${e.slug} (${e.name}) - ${e._id}`));

    // 2. Find events entity
    const eventsEntity = await entities.findOne({ slug: 'events' });
    console.log('\n=== Events entity ===');
    console.log(eventsEntity ? `Found: ${eventsEntity._id}` : 'NOT FOUND');

    if (eventsEntity) {
        // 3. Count event records
        const count = await records.countDocuments({ entityId: eventsEntity._id });
        console.log(`Event records count: ${count}`);

        // 4. Check a few events
        const events = await records.find({ entityId: eventsEntity._id }).limit(3).toArray();
        events.forEach(ev => {
            console.log(`\n  Title: ${ev.title}`);
            console.log(`  Relations: ${JSON.stringify(ev.relations)}`);
            const parentId = ev.relations?.[0]?.value;
            if (parentId) {
                console.log(`  Parent record ID: ${parentId} (type: ${typeof parentId})`);
            }
        });

        // 5. Check if parent record exists
        if (events[0]?.relations?.[0]?.value) {
            const parentId = events[0].relations[0].value;
            console.log('\n=== Looking up parent record ===');
            // Try as string
            let parent = await records.findOne({ _id: parentId });
            console.log(`  Direct string lookup: ${parent ? 'FOUND' : 'NOT FOUND'}`);
            // Try as ObjectId
            try {
                parent = await records.findOne({ _id: new mongoose.Types.ObjectId(parentId) });
                console.log(`  ObjectId lookup: ${parent ? 'FOUND - ' + parent.title : 'NOT FOUND'}`);
                if (parent) {
                    console.log(`  Parent entityId: ${parent.entityId}`);
                    const parentEntity = await entities.findOne({ _id: parent.entityId });
                    console.log(`  Parent entity: ${parentEntity?.name} (${parentEntity?.slug})`);
                }
            } catch(e) {
                console.log(`  ObjectId error: ${e.message}`);
            }
        }
    }

    await conn.close();
}

debug().catch(console.error);
