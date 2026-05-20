const mongoose = require('mongoose');
const { tenantCollection } = require('../middleware/tenant');
const fs = require('fs');
const path = require('path');

// Mock request and response to call router logic directly
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
            account_number: '5096',
            user: { _id: '6a0b4221f1c5ddd28f737c80', name: 'Test User', email: 'test@example.com' }
        };

        const SmartDocTemplate = await tenantCollection(req, 'SmartDocTemplate');
        const Document = await tenantCollection(req, 'Document');
        const Record = await tenantCollection(req, 'Record');
        const Entity = await tenantCollection(req, 'Entity');
        const DocumentLine = await tenantCollection(req, 'DocumentLine');
        const GridSnapshot = await tenantCollection(req, 'GridSnapshot');
        const LineSchema = await tenantCollection(req, 'LineSchema');

        // Let's load the template
        const templateId = '6a0cc7098582f628068fb6d7'; // Nouveau modèle (linked to Entreprise, but we generate for Opportunité)
        const recordId = '6a0b4221f1c5ddd28f737c9b'; // Déploiement ERP TechCorp (Opportunité)
        const additionalRecordIds = ['6a0b4221f1c5ddd28f737c99', '6a0b4221f1c5ddd28f737c95']; // TechCorp France, Sophie Martin

        // Load the SmartDoc template
        const smartDocTemplate = await SmartDocTemplate.findById(templateId);
        if (!smartDocTemplate) {
            console.error('SmartDoc template not found');
            return;
        }

        // Load the record
        const record = await Record.findById(recordId);
        if (!record) {
            console.error('Record not found');
            return;
        }

        // Load the entity dynamically (using the fix: record.entityId)
        const targetEntityId = record.entityId || smartDocTemplate.entityId;
        const entity = await loadEntityWithFields(req, targetEntityId);

        console.log('Using fixed entity loading:');
        console.log('  Loaded entity slug:', entity?.slug); // Should be "opportunites"!

        // Load related records
        const relatedRecordsMap = {};
        if (entity && entity.relations && record.relations) {
            for (const rel of entity.relations) {
                const targetEntity = rel.targetEntity;
                if (!targetEntity || typeof targetEntity !== 'object') continue;
                const recRelation = record.relations.find(r => r.relationKey === rel.key);
                if (!recRelation || !recRelation.value) continue;
                const relatedId = Array.isArray(recRelation.value) ? recRelation.value[0] : recRelation.value;
                if (!relatedId) continue;
                try {
                    const relatedRecord = await Record.findById(relatedId).lean();
                    if (relatedRecord) {
                        relatedRecordsMap[rel.key] = { record: relatedRecord, entity: targetEntity };
                    }
                } catch (e) {
                    console.warn('[SmartDoc] Could not load related record:', relatedId, e.message);
                }
            }
        }

        console.log('Related records found keys:', Object.keys(relatedRecordsMap));

        // Load the document template
        const docTemplate = await Document.findById(smartDocTemplate.documentId);
        if (!docTemplate) {
            console.error('Document template not found');
            return;
        }

        // Build token context
        const context = buildTokenContext(record, entity, {}, relatedRecordsMap, req.user);
        console.log('Token context keys:', Object.keys(context));
        console.log('Token context.opportunites:', context.opportunites ? 'FOUND' : 'NOT FOUND');
        console.log('Token context.entreprises:', context.entreprises ? 'FOUND' : 'NOT FOUND');
        console.log('Token context.contacts:', context.contacts ? 'FOUND' : 'NOT FOUND');

        // Verify resolution of variables
        const testTemplateStr = `{{opportunites.title}} | {{entreprises.title}} | {{contacts.title}}`;
        const resolved = resolveTokensInString(testTemplateStr, context);
        console.log('Resolved sample template:', resolved);

        await tenantConnection.close();
    } catch (e) {
        console.error(e);
    }
}

// -------------------------------------------------------------
// Copy helpers from router to run locally in this script
// -------------------------------------------------------------

async function loadEntityWithFields(req, entityId) {
    const Entity = await tenantCollection(req, 'Entity');
    const FieldTemplate = await tenantCollection(req, 'FieldTemplate');
    const Classification = await tenantCollection(req, 'Classification');

    if (!Entity || !entityId) return null;
    const entity = await Entity.findById(entityId).lean();
    if (!entity) return null;

    if (entity.customFields && entity.customFields.length > 0) {
        const ids = entity.customFields.map(f => (typeof f === 'object' ? f._id || f : f)).filter(Boolean);
        if (FieldTemplate && ids.length > 0) {
            entity.customFields = await FieldTemplate.find({ _id: { $in: ids } }).lean();
        }
    }

    if (Classification) {
        if (entity.classifications && entity.classifications.length > 0) {
            const ids = entity.classifications.map(c => (typeof c === 'object' ? c._id || c : c)).filter(Boolean);
            if (ids.length > 0) {
                entity.classifications = await Classification.find({ _id: { $in: ids } }).lean();
            }
        }
        if (entity.statusClassification) {
            const scId = typeof entity.statusClassification === 'object'
                ? entity.statusClassification._id || entity.statusClassification
                : entity.statusClassification;
            const sc = await Classification.findById(scId).lean();
            entity.statusClassification = sc || null;
        }
    }

    if (entity.relations && entity.relations.length > 0) {
        for (const rel of entity.relations) {
            if (!rel.targetEntity) continue;
            const teId = typeof rel.targetEntity === 'object'
                ? rel.targetEntity._id || rel.targetEntity
                : rel.targetEntity;
            if (!teId) continue;

            const te = await Entity.findById(teId).select('name icon slug customFields classifications statusClassification').lean();
            if (!te) { rel.targetEntity = null; continue; }

            if (te.customFields && te.customFields.length > 0 && FieldTemplate) {
                const ids = te.customFields.map(f => (typeof f === 'object' ? f._id || f : f)).filter(Boolean);
                te.customFields = ids.length > 0 ? await FieldTemplate.find({ _id: { $in: ids } }).lean() : [];
            }

            if (te.classifications && te.classifications.length > 0 && Classification) {
                const ids = te.classifications.map(c => (typeof c === 'object' ? c._id || c : c)).filter(Boolean);
                te.classifications = ids.length > 0 ? await Classification.find({ _id: { $in: ids } }).lean() : [];
            }
            if (te.statusClassification && Classification) {
                const scId = typeof te.statusClassification === 'object'
                    ? te.statusClassification._id || te.statusClassification
                    : te.statusClassification;
                const sc = await Classification.findById(scId).lean();
                te.statusClassification = sc || null;
            }

            rel.targetEntity = te;
        }
    }

    return entity;
}

function buildTokenContext(record, entity, inputs, relatedRecordsMap, user) {
    const context = {
        title: record.title || '',
        computedTitle: record.computedTitle || record.title || '',
        description: record.description || '',
        slug: record.slug || '',
        date: record.date ? formatDate(record.date) : '',
        createdAt: record.createdAt ? formatDate(record.createdAt) : '',
        updatedAt: record.updatedAt ? formatDate(record.updatedAt) : '',
        ...inputs,
        today: formatDate(new Date()),
        currentYear: new Date().getFullYear().toString(),
        user: {
            name: user ? (user.name || user.fullName || user.email || '') : '',
            email: user ? (user.email || '') : ''
        }
    };

    if (entity && entity.slug) {
        const entityContext = {
            title: record.title || '',
            computedTitle: record.computedTitle || record.title || '',
            description: record.description || '',
            slug: record.slug || '',
            date: record.date ? formatDate(record.date) : '',
            createdAt: record.createdAt ? formatDate(record.createdAt) : '',
            updatedAt: record.updatedAt ? formatDate(record.updatedAt) : '',
        };

        if (entity.relations && relatedRecordsMap) {
            for (const rel of entity.relations) {
                const targetEntity = rel.targetEntity;
                if (!targetEntity || typeof targetEntity !== 'object') continue;
                const relData = relatedRecordsMap[rel.key];
                if (relData && relData.record) {
                    const relRecord = relData.record;
                    const relEntityDef = relData.entity;
                    const relContext = {
                        title: relRecord.title || '',
                        computedTitle: relRecord.computedTitle || relRecord.title || '',
                        description: relRecord.description || '',
                        createdAt: relRecord.createdAt ? formatDate(relRecord.createdAt) : '',
                        updatedAt: relRecord.updatedAt ? formatDate(relRecord.updatedAt) : '',
                    };
                    entityContext[targetEntity.slug] = relContext;
                }
            }
        }

        context[entity.slug] = entityContext;
    }

    for (const [entitySlug, entityContext] of Object.entries(context)) {
        if (entityContext && typeof entityContext === 'object' && !Array.isArray(entityContext)) {
            for (const [key, value] of Object.entries(entityContext)) {
                if (value && typeof value === 'object' && !Array.isArray(value) && key !== 'classification' && key !== 'user') {
                    if (!context[key]) {
                        context[key] = value;
                    }
                }
            }
        }
    }

    return context;
}

function resolveTokensInString(str, context) {
    if (!str) return '';
    let result = str.replace(/\{\{([^}]+)\}\}/g, (match, token) => {
        const key = token.trim();
        return resolveNestedValue(context, key) ?? '';
    });
    return result;
}

function resolveNestedValue(context, path) {
    if (!path || !context) return null;
    const key = path.trim();

    if (key.includes('.')) {
        const parts = key.split('.');
        let val = context;
        for (const part of parts) {
            if (val && typeof val === 'object') val = val[part];
            else { val = undefined; break; }
        }
        return val !== undefined ? String(val) : null;
    }
    return context[key] !== undefined ? String(context[key]) : null;
}

function formatDate(d) {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('fr-FR');
}

run();
