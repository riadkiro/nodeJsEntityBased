const mongoose = require('mongoose');
const fs = require('fs');

async function check() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_7846');
    await new Promise(r => conn.once('open', r));
    
    const doc = await conn.db.collection('documents').findOne({ _id: new mongoose.Types.ObjectId('69ce60dd52c96f71dd936af3') });
    
    const result = {
        name: doc.name,
        entityId: doc.entityId?.toString(),
        entityIds: (doc.entityIds || []).map(String)
    };
    
    const allContent = JSON.stringify(doc.pages || []);
    const tokenRegex = /\{\{([^}]+)\}\}/g;
    const tokens = [];
    let match;
    while ((match = tokenRegex.exec(allContent)) !== null) {
        tokens.push(match[1]);
    }
    result.tokens = tokens;
    
    if (doc.entityId) {
        const entity = await conn.db.collection('entities').findOne({ _id: doc.entityId });
        if (entity) {
            result.entityName = entity.name;
            result.entitySlug = entity.slug;
            result.entityIcon = entity.icon;
            result.entityColor = entity.color;
            result.relations = (entity.relations || []).map(r => ({
                key: r.key,
                label: r.label,
                targetEntity: r.targetEntity?.toString()
            }));
        }
    }
    
    fs.writeFileSync('scripts/docs-output.json', JSON.stringify(result, null, 2), 'utf8');
    console.log('Done, check scripts/docs-output.json');
    await conn.close();
}
check().catch(console.error);
