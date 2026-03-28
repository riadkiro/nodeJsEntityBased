const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    
    const Record = mongoose.connection.db.collection('records');
    
    // Create a Consultation record
    const consultEntityId = new mongoose.Types.ObjectId('69c232cd0fa7abd357abd651');
    
    // Check if there's already one
    const existing = await Record.findOne({ entityId: consultEntityId });
    if (existing) {
        console.log(`Consultation already exists: ${existing._id} - "${existing.title}"`);
        fs.writeFileSync(path.join(__dirname, 'debug-output.txt'), `Existing consultation: ${existing._id}`);
        process.exit(0);
        return;
    }

    const result = await Record.insertOne({
        title: 'Consultation Test - Ahmed Khelifi',
        entityId: consultEntityId,
        entitySlug: 'consultations',
        status: 'active',
        customFields: [],
        relations: [
            {
                relationKey: '07906321-24ab-4bec-a70a-82274c880ede',
                value: new mongoose.Types.ObjectId('69c232cd0fa7abd357abd679') // Ahmed Khelifi patient
            }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
    });

    console.log('Created consultation record:', result.insertedId);
    fs.writeFileSync(path.join(__dirname, 'debug-output.txt'), `Created: ${result.insertedId}`);
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
