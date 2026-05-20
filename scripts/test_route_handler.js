const mongoose = require('mongoose');
const { tenantCollection } = require('../middleware/tenant');

async function testHandler() {
    const dbName = 'saas_app_rb_5096';
    const connection = await mongoose.createConnection(`mongodb://127.0.0.1:27017/${dbName}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    await new Promise(r => connection.once('open', r));
    console.log(`Connected to database: ${dbName}`);

    // Mock Express req and res
    const req = {
        account_number: '5096',
        tenantDbReady: true,
        tenantDbConnection: connection,
        params: {
            documentId: '6a0cc32c8582f628068fa250'
        },
        query: {
            entityId: '6a0b4221f1c5ddd28f737c83',
            recordId: '6a0b4221f1c5ddd28f737c98'
        }
    };

    const res = {
        status(code) {
            console.log(`Response Status: ${code}`);
            return this;
        },
        json(data) {
            console.log('Response JSON:', JSON.stringify(data, null, 2));
            return this;
        }
    };

    try {
        const Document = await tenantCollection(req, 'Document');
        const Entity = await tenantCollection(req, 'Entity');
        const Record = await tenantCollection(req, 'Record');

        const { entityId: parentEntityId, recordId: parentRecordId } = req.query;
        if (!parentEntityId || !parentRecordId) {
            return res.status(400).json({ error: 'entityId and recordId are required' });
        }

        // 1. Get the template document
        const doc = await Document.findById(req.params.documentId).lean();
        if (!doc) {
            return res.status(404).json({ error: 'Template non trouvé' });
        }
        console.log('Found Template:', doc.name);

        // 2. Identify the target entities for this template
        const targetEntityIds = [];
        if (doc.entityIds && doc.entityIds.length > 0) {
            doc.entityIds.forEach(id => targetEntityIds.push(id.toString()));
        }
        if (doc.entityId && !targetEntityIds.includes(doc.entityId.toString())) {
            targetEntityIds.push(doc.entityId.toString());
        }
        console.log('Target Entity IDs:', targetEntityIds);

        // 3. Find primary entity metadata
        let primaryEntity = null;
        if (targetEntityIds.length > 0) {
            const entityDoc = await Entity.findById(targetEntityIds[0]).select('name icon slug').lean();
            if (entityDoc) {
                primaryEntity = {
                    _id: entityDoc._id,
                    name: entityDoc.name,
                    icon: entityDoc.icon,
                    slug: entityDoc.slug
                };
            }
        }
        console.log('Primary Entity:', primaryEntity);

        // 4. Query context records of the target entities that reference the parent record ID
        const parentRecordObjectId = mongoose.Types.ObjectId.isValid(parentRecordId) 
            ? new mongoose.Types.ObjectId(parentRecordId) 
            : null;

        const relationValues = [parentRecordId];
        if (parentRecordObjectId) {
            relationValues.push(parentRecordObjectId);
        }

        let contexts = [];
        if (targetEntityIds.length > 0) {
            const rawContexts = await Record.find({
                entityId: { $in: targetEntityIds },
                'relations.value': { $in: relationValues }
            })
            .select('_id title computedTitle createdAt')
            .sort({ createdAt: -1 })
            .lean();

            contexts = rawContexts.map(c => ({
                _id: c._id,
                title: c.computedTitle || c.title || 'Sans titre',
                createdAt: c.createdAt
            }));
        }

        res.json({
            success: true,
            primaryEntity,
            contexts
        });
    } catch (error) {
        console.error('Error in handler:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        await connection.close();
    }
}

testHandler();
