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

        const Document = await tenantCollection(req, 'Document');
        const Entity = await tenantCollection(req, 'Entity');
        const Record = await tenantCollection(req, 'Record');

        const doc = await Document.findById('6a0cc32c8582f628068fa250').lean();
        if (!doc) {
            console.error('Document not found');
            return;
        }

        console.log('Document loaded successfully');

        // Analyze tokens in the template to find which ones need bindings
        const allContent = JSON.stringify(doc.pages || []);
        console.log('Pages JSON content:', allContent);
        const tokenRegex = /\{\{([^}]+)\}\}/g;
        const allTokens = new Set();
        let match;
        while ((match = tokenRegex.exec(allContent)) !== null) {
            allTokens.add(match[1].trim());
        }
        console.log('All tokens found:', [...allTokens]);

        const entityIds = [...(doc.entityIds || [])];
        if (doc.entityId && !entityIds.map(String).includes(doc.entityId.toString())) {
            entityIds.push(doc.entityId);
        }
        console.log('Linked entityIds:', entityIds);

        const entities = await Entity.find({ _id: { $in: entityIds } })
            .populate({
                path: 'relations.targetEntity',
                select: 'name icon slug color'
            })
            .lean();

        console.log(`Loaded ${entities.length} entities:`, entities.map(e => `${e.name} (${e.slug})`));

        const systemTokenKeys = ['today', 'currentYear', 'currentMonth', 'currentTime', 'user.name', 'user.email'];
        const bindingEntities = new Map();

        for (const token of allTokens) {
            const isSystem = systemTokenKeys.some(sk => token === sk || token.startsWith('user.'));
            if (!isSystem) {
                const parts = token.split('.');
                console.log(`Token: "${token}", parts:`, parts);
                if (parts.length >= 2) {
                    const primarySlug = parts[0];
                    const primaryEntity = entities.find(e => e.slug === primarySlug);
                    console.log(`  primarySlug: "${primarySlug}", found:`, !!primaryEntity);

                    if (primaryEntity) {
                        const relatedSlug = parts.length >= 3 ? parts[1] : null;

                        // Case 1: Self-referencing or direct
                        if (!relatedSlug || relatedSlug === primarySlug) {
                            const key = primaryEntity.slug;
                            if (!bindingEntities.has(key)) {
                                bindingEntities.set(key, {
                                    entityId: primaryEntity._id?.toString(),
                                    entityName: primaryEntity.name || primarySlug,
                                    entityIcon: primaryEntity.icon || 'solar:user-bold-duotone',
                                    entitySlug: primaryEntity.slug,
                                    entityColor: primaryEntity.color || '#4f46e5',
                                    relationKey: null,
                                    relationLabel: null,
                                    primaryEntityId: primaryEntity._id?.toString(),
                                    primaryEntitySlug: primaryEntity.slug,
                                    primaryEntityName: primaryEntity.name,
                                    tokens: []
                                });
                            }
                            bindingEntities.get(key).tokens.push(token);
                        }
                        // Case 2: Relational token
                        else {
                            const relation = (primaryEntity.relations || []).find(r => {
                                const target = r.targetEntity;
                                return target && (target.slug === relatedSlug || target.name?.toLowerCase() === relatedSlug);
                            });
                            console.log(`  relatedSlug: "${relatedSlug}", relation found:`, !!relation);
                            if (relation && relation.targetEntity) {
                                const target = relation.targetEntity;
                                const key = target.slug || target._id?.toString();
                                if (!bindingEntities.has(key)) {
                                    bindingEntities.set(key, {
                                        entityId: target._id?.toString() || target.toString(),
                                        entityName: target.name || relatedSlug,
                                        entityIcon: target.icon || 'solar:user-bold-duotone',
                                        entitySlug: target.slug || relatedSlug,
                                        entityColor: target.color || '#4f46e5',
                                        relationKey: relation.key,
                                        relationLabel: relation.label,
                                        primaryEntityId: primaryEntity._id?.toString(),
                                        primaryEntitySlug: primaryEntity.slug,
                                        primaryEntityName: primaryEntity.name,
                                        tokens: []
                                    });
                                }
                                bindingEntities.get(key).tokens.push(token);
                            }
                        }
                    }
                }
            }
        }

        console.log('\n=== RESULTING BINDING ENTITIES ===');
        console.log(JSON.stringify(Array.from(bindingEntities.values()), null, 2));

        await tenantConnection.close();
    } catch (e) {
        console.error(e);
    }
}

run();
