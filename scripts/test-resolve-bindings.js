const mongoose = require('mongoose');
const { tenantCollection } = require('../middleware/tenant');

async function run() {
    try {
        const tenantConnection = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5096', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        await new Promise(r => tenantConnection.once('open', r));
        console.log("Connected to Tenant DB");

        const req = {
            tenantDbConnection: tenantConnection,
            tenantDbReady: true,
            account_number: '5096'
        };

        const Entity = await tenantCollection(req, 'Entity');
        const Record = await tenantCollection(req, 'Record');
        const FieldTemplate = await tenantCollection(req, 'FieldTemplate');

        // Let's get the opportunites record and entity
        const record = await Record.findOne({ entityId: new mongoose.Types.ObjectId('6a0b4221f1c5ddd28f737c84') }).lean();
        if (!record) {
            console.error('No opportunites record found');
            return;
        }

        console.log('Found record:', record._id, record.title);

        const entity = await Entity.findById(record.entityId)
            .populate('customFields')
            .lean();

        let fieldDefs = entity.customFields || [];
        const needsManualLoad = fieldDefs.length > 0 && typeof fieldDefs[0] !== 'object';
        if (needsManualLoad) {
            fieldDefs = await FieldTemplate.find({
                _id: { $in: entity.customFields }
            }).lean();
        }

        const fieldValues = {};
        fieldValues.titre = record.computedTitle || record.title || '';
        fieldValues.title = fieldValues.titre;
        fieldValues.description = record.description || '';
        fieldValues.date = record.date ? new Date(record.date).toLocaleDateString('fr-FR') : '';

        // Custom fields...
        if (record.customFields && Array.isArray(record.customFields)) {
            for (const cf of record.customFields) {
                if (!cf.field_id) continue;
                const fieldId = cf.field_id.toString();
                const fieldDef = fieldDefs.find(fd =>
                    fd._id && fd._id.toString() === fieldId
                );
                const value = cf.value !== undefined && cf.value !== null ? cf.value : '';
                let formattedValue = value;
                if (fieldDef && fieldDef.type === 'date' && value) {
                    formattedValue = new Date(value).toLocaleDateString('fr-FR');
                } else {
                    formattedValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
                }
                if (fieldDef) {
                    const fieldName = fieldDef.name || fieldDef.label;
                    if (fieldName) fieldValues[fieldName] = formattedValue;
                    if (fieldDef.label) {
                        fieldValues[fieldDef.label.toLowerCase()] = formattedValue;
                    }
                }
            }
        }

        const primaryEntitySlug = 'opportunites';
        const bindingEntitySlug = 'opportunites';

        const tokenPrefix = primaryEntitySlug
            ? `${primaryEntitySlug}.${bindingEntitySlug}.`
            : `${bindingEntitySlug}.`;

        const replacements = {};
        for (const [fieldKey, fieldValue] of Object.entries(fieldValues)) {
            replacements[`${tokenPrefix}${fieldKey}`] = fieldValue;
            replacements[`${bindingEntitySlug}.${fieldKey}`] = fieldValue;
        }

        console.log('\n=== REPLACEMENTS ===');
        console.log(JSON.stringify(replacements, null, 2));

        await tenantConnection.close();
    } catch (e) {
        console.error(e);
    }
}

run();
