const mongoose = require('mongoose');
const { tenantCollection } = require('../middleware/tenant');
const newsletterService = require('../services/newsletter.service');
const emailBuilder = require('../services/newsletter-email-builder.service');
const { sanitizeViewFilters } = require('../services/record-filter-query');

function safeJson(value) {
    return JSON.stringify(value).replace(/</g, '\\u003c');
}

function isObjectId(value) {
    return mongoose.Types.ObjectId.isValid(String(value || ''));
}

async function loadEntityContext(req, entitySlug, viewSlug = '') {
    await tenantCollection(req, 'FieldTemplate');
    const EntityModel = await tenantCollection(req, 'Entity');
    const ViewModel = await tenantCollection(req, 'View');
    const RecordModel = await tenantCollection(req, 'Record');
    const CampaignModel = await tenantCollection(req, 'NewsletterCampaign');
    const DeliveryModel = await tenantCollection(req, 'NewsletterDelivery');

    const entity = await EntityModel.findOne({ slug: entitySlug })
        .populate('customFields')
        .populate('classifications')
        .populate('statusClassification');

    if (!entity) return null;

    const view = viewSlug
        ? await ViewModel.findOne({ entity: entity._id, slug: viewSlug }).lean()
        : null;

    return {
        entity,
        view,
        defaultFilters: view ? sanitizeViewFilters(view.filters || []) : [],
        fields: newsletterService.buildFields(entity),
        RecordModel,
        CampaignModel,
        DeliveryModel
    };
}

function campaignListQuery(entity, view) {
    if (!view) return { entityId: entity._id };
    return {
        entityId: entity._id,
        $or: [
            { 'sourceView.viewId': view._id },
            { 'sourceView.slug': view.slug }
        ]
    };
}

async function loadHubContext(req) {
    await tenantCollection(req, 'FieldTemplate');
    return {
        EntityModel: await tenantCollection(req, 'Entity'),
        ViewModel: await tenantCollection(req, 'View'),
        CampaignModel: await tenantCollection(req, 'NewsletterCampaign'),
        AudienceModel: await tenantCollection(req, 'NewsletterAudience'),
        TemplateModel: await tenantCollection(req, 'NewsletterTemplate'),
        SequenceModel: await tenantCollection(req, 'NewsletterSequence')
    };
}

async function campaignForRequest(CampaignModel, campaignId, entity) {
    if (!isObjectId(campaignId)) return null;
    return CampaignModel.findOne({ _id: campaignId, entityId: entity._id });
}

function cleanString(value) {
    return String(value || '').trim();
}

function serializeSourceView(view) {
    if (!view) return { viewId: undefined, slug: '', name: '' };
    return {
        viewId: view._id,
        slug: cleanString(view.slug),
        name: cleanString(view.name)
    };
}

async function resolveEntityAndView(EntityModel, ViewModel, body = {}) {
    const entity = body.entityId && isObjectId(body.entityId)
        ? await EntityModel.findById(body.entityId).populate('customFields')
        : await EntityModel.findOne({ slug: body.entitySlug }).populate('customFields');
    if (!entity) return {};

    let view = null;
    const viewId = body.sourceView?.viewId || body.viewId;
    const viewSlug = body.sourceView?.slug || body.viewSlug;
    if (viewId && isObjectId(viewId)) {
        view = await ViewModel.findOne({ _id: viewId, entity: entity._id }).lean();
    } else if (viewSlug) {
        view = await ViewModel.findOne({ entity: entity._id, slug: viewSlug }).lean();
    }

    return { entity, view };
}

function normalizeAudiencePayload(body, entity, view, fields) {
    const emailFieldId = cleanString(body.emailField?.field || body.emailField);
    const emailField = fields.find(field => field.id === emailFieldId)
        || fields.find(field => field.emailCandidate)
        || fields.find(field => field.source === 'custom')
        || fields[0]
        || {};

    return {
        name: cleanString(body.name || `${view?.name || entity.name || entity.slug} audience`),
        description: cleanString(body.description),
        entityId: entity._id,
        entitySlug: entity.slug,
        sourceView: serializeSourceView(view),
        emailField: {
            field: emailField.id || '',
            fieldName: emailField.label || '',
            source: emailField.source || 'custom'
        },
        filters: sanitizeViewFilters(body.filters || view?.filters || []),
        status: body.status === 'archived' ? 'archived' : 'active'
    };
}

function normalizeTemplatePayload(body = {}) {
    const format = ['builder', 'html', 'text', 'designed'].includes(body.format) ? body.format : 'builder';
    return {
        name: cleanString(body.name || 'Nouveau template'),
        description: cleanString(body.description),
        category: cleanString(body.category || 'general'),
        tags: Array.isArray(body.tags) ? body.tags.map(cleanString).filter(Boolean).slice(0, 20) : [],
        subject: cleanString(body.subject || 'Bonjour {{title}}'),
        preheader: cleanString(body.preheader),
        format,
        layout: format === 'builder' ? emailBuilder.normalizeLayout(body.layout || emailBuilder.defaultLayout()) : null,
        bodyHtml: String(body.bodyHtml || ''),
        bodyText: String(body.bodyText || ''),
        status: ['draft', 'ready', 'archived'].includes(body.status) ? body.status : 'draft'
    };
}

function snapshotTemplate(template) {
    if (!template) return null;
    const plain = typeof template.toObject === 'function' ? template.toObject() : template;
    return {
        templateId: plain._id,
        name: plain.name,
        subject: plain.subject,
        preheader: plain.preheader,
        format: plain.format,
        layout: plain.layout,
        bodyHtml: plain.bodyHtml,
        bodyText: plain.bodyText
    };
}

async function normalizeSequencePayload(body = {}, TemplateModel) {
    const templateIds = (body.steps || [])
        .map(step => step.templateId)
        .filter(id => id && isObjectId(id));
    const templates = templateIds.length
        ? await TemplateModel.find({ _id: { $in: templateIds } }).lean()
        : [];
    const templateById = new Map(templates.map(template => [template._id.toString(), template]));

    return {
        name: cleanString(body.name || 'Nouvelle sequence'),
        description: cleanString(body.description),
        audienceId: isObjectId(body.audienceId) ? body.audienceId : undefined,
        status: ['draft', 'active', 'paused', 'archived'].includes(body.status) ? body.status : 'draft',
        sender: {
            name: cleanString(body.sender?.name),
            email: cleanString(body.sender?.email),
            replyTo: cleanString(body.sender?.replyTo)
        },
        steps: (Array.isArray(body.steps) ? body.steps : []).map((step, index) => {
            const template = templateById.get(String(step.templateId || ''));
            const snap = snapshotTemplate(template || step.templateSnapshot);
            return {
                name: cleanString(step.name || snap?.name || `Email ${index + 1}`),
                delayDays: Math.max(0, Math.min(365, Number(step.delayDays) || 0)),
                templateId: snap?.templateId,
                templateSnapshot: snap,
                subject: cleanString(step.subject || snap?.subject || 'Bonjour {{title}}'),
                preheader: cleanString(step.preheader || snap?.preheader),
                layout: step.layout || snap?.layout || emailBuilder.defaultLayout(),
                bodyHtml: String(step.bodyHtml || snap?.bodyHtml || ''),
                bodyText: String(step.bodyText || snap?.bodyText || ''),
                conditions: sanitizeViewFilters(step.conditions || []),
                order: index
            };
        })
    };
}

module.exports = {
    hubData: async (req, res) => {
        try {
            const {
                EntityModel,
                ViewModel,
                CampaignModel,
                AudienceModel,
                TemplateModel,
                SequenceModel
            } = await loadHubContext(req);

            const [entitiesRaw, viewsRaw, audiences, templates, sequences, campaigns] = await Promise.all([
                EntityModel.find().populate('customFields').sort({ order: 1, name: 1 }).lean(),
                ViewModel.find({ entity: { $ne: null } }).sort({ order: 1, name: 1 }).lean(),
                AudienceModel.find({ status: { $ne: 'archived' } }).sort({ updatedAt: -1 }).lean(),
                TemplateModel.find({ status: { $ne: 'archived' } }).sort({ updatedAt: -1 }).lean(),
                SequenceModel.find({ status: { $ne: 'archived' } }).sort({ updatedAt: -1 }).lean(),
                CampaignModel.find().sort({ updatedAt: -1 }).limit(50).lean()
            ]);

            const viewsByEntity = {};
            viewsRaw.forEach(view => {
                const key = view.entity?.toString();
                if (!key) return;
                if (!viewsByEntity[key]) viewsByEntity[key] = [];
                viewsByEntity[key].push({
                    id: view._id.toString(),
                    slug: view.slug,
                    name: view.name,
                    filters: sanitizeViewFilters(view.filters || [])
                });
            });

            const entities = entitiesRaw.map(entity => ({
                id: entity._id.toString(),
                slug: entity.slug,
                name: entity.name,
                namePlural: entity.namePlural || entity.name,
                fields: newsletterService.buildFields(entity),
                views: viewsByEntity[entity._id.toString()] || []
            }));

            res.json({
                success: true,
                entities,
                audiences,
                templates,
                sequences,
                campaigns,
                defaultLayout: emailBuilder.defaultLayout()
            });
        } catch (error) {
            console.error('[Newsletter] hub data error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    },

    saveAudience: async (req, res) => {
        try {
            const { EntityModel, ViewModel, AudienceModel } = await loadHubContext(req);
            const { entity, view } = await resolveEntityAndView(EntityModel, ViewModel, req.body || {});
            if (!entity) return res.status(404).json({ error: 'Entity not found' });

            const payload = normalizeAudiencePayload(req.body || {}, entity, view, newsletterService.buildFields(entity));
            payload.updatedBy = req.user?._id;

            let audience;
            if (isObjectId(req.params.audienceId)) {
                audience = await AudienceModel.findByIdAndUpdate(req.params.audienceId, { $set: payload }, { new: true });
            } else {
                payload.createdBy = req.user?._id;
                audience = await AudienceModel.create(payload);
            }

            res.json({ success: true, audience });
        } catch (error) {
            console.error('[Newsletter] save audience error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    },

    deleteAudience: async (req, res) => {
        try {
            const { AudienceModel } = await loadHubContext(req);
            if (!isObjectId(req.params.audienceId)) return res.status(400).json({ error: 'Invalid audience id' });
            await AudienceModel.findByIdAndUpdate(req.params.audienceId, { $set: { status: 'archived', updatedBy: req.user?._id } });
            res.json({ success: true });
        } catch (error) {
            console.error('[Newsletter] delete audience error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    },

    saveTemplate: async (req, res) => {
        try {
            const { TemplateModel } = await loadHubContext(req);
            const payload = normalizeTemplatePayload(req.body || {});
            payload.updatedBy = req.user?._id;

            let template;
            if (isObjectId(req.params.templateId)) {
                template = await TemplateModel.findByIdAndUpdate(req.params.templateId, { $set: payload }, { new: true });
            } else {
                payload.createdBy = req.user?._id;
                template = await TemplateModel.create(payload);
            }

            res.json({ success: true, template });
        } catch (error) {
            console.error('[Newsletter] save template error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    },

    deleteTemplate: async (req, res) => {
        try {
            const { TemplateModel } = await loadHubContext(req);
            if (!isObjectId(req.params.templateId)) return res.status(400).json({ error: 'Invalid template id' });
            await TemplateModel.findByIdAndUpdate(req.params.templateId, { $set: { status: 'archived', updatedBy: req.user?._id } });
            res.json({ success: true });
        } catch (error) {
            console.error('[Newsletter] delete template error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    },

    saveSequence: async (req, res) => {
        try {
            const { SequenceModel, TemplateModel } = await loadHubContext(req);
            const payload = await normalizeSequencePayload(req.body || {}, TemplateModel);
            payload.updatedBy = req.user?._id;

            let sequence;
            if (isObjectId(req.params.sequenceId)) {
                sequence = await SequenceModel.findByIdAndUpdate(req.params.sequenceId, { $set: payload }, { new: true });
            } else {
                payload.createdBy = req.user?._id;
                sequence = await SequenceModel.create(payload);
            }

            res.json({ success: true, sequence });
        } catch (error) {
            console.error('[Newsletter] save sequence error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    },

    deleteSequence: async (req, res) => {
        try {
            const { SequenceModel } = await loadHubContext(req);
            if (!isObjectId(req.params.sequenceId)) return res.status(400).json({ error: 'Invalid sequence id' });
            await SequenceModel.findByIdAndUpdate(req.params.sequenceId, { $set: { status: 'archived', updatedBy: req.user?._id } });
            res.json({ success: true });
        } catch (error) {
            console.error('[Newsletter] delete sequence error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    },

    entityPage: async (req, res) => {
        try {
            const context = await loadEntityContext(req, req.params.entityName, req.params.viewSlug);
            if (!context) {
                return res.status(404).render('errors/404', {
                    message: 'Entity not found',
                    account_number: req.account_number,
                    layout: 'layout-app'
                });
            }

            const campaigns = await context.CampaignModel.find(campaignListQuery(context.entity, context.view))
                .sort({ updatedAt: -1 })
                .lean();

            res.render('newsletter/entity-newsletter', {
                layout: 'layout-app',
                user: req.user,
                account_number: req.account_number,
                entity: context.entity,
                sourceView: context.view ? {
                    viewId: context.view._id.toString(),
                    slug: context.view.slug,
                    name: context.view.name
                } : null,
                initialData: safeJson({
                    accountNumber: req.account_number,
                    entity: {
                        id: context.entity._id.toString(),
                        slug: context.entity.slug,
                        name: context.entity.name,
                        namePlural: context.entity.namePlural || context.entity.name
                    },
                    sourceView: context.view ? {
                        viewId: context.view._id.toString(),
                        slug: context.view.slug,
                        name: context.view.name
                    } : null,
                    defaultFilters: context.defaultFilters,
                    fields: context.fields,
                    campaigns,
                    defaultTemplates: newsletterService.defaultTemplates()
                })
            });
        } catch (error) {
            console.error('[Newsletter] page error:', error);
            res.status(500).send('Server Error');
        }
    },

    entityData: async (req, res) => {
        try {
            const context = await loadEntityContext(req, req.params.entitySlug, req.query.viewSlug);
            if (!context) return res.status(404).json({ error: 'Entity not found' });

            const campaigns = await context.CampaignModel.find(campaignListQuery(context.entity, context.view))
                .sort({ updatedAt: -1 })
                .lean();

            res.json({
                success: true,
                entity: {
                    id: context.entity._id.toString(),
                    slug: context.entity.slug,
                    name: context.entity.name,
                    namePlural: context.entity.namePlural || context.entity.name
                },
                sourceView: context.view ? {
                    viewId: context.view._id.toString(),
                    slug: context.view.slug,
                    name: context.view.name
                } : null,
                defaultFilters: context.defaultFilters,
                fields: context.fields,
                campaigns,
                defaultTemplates: newsletterService.defaultTemplates()
            });
        } catch (error) {
            console.error('[Newsletter] entity data error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    },

    saveCampaign: async (req, res) => {
        try {
            const context = await loadEntityContext(req, req.params.entitySlug);
            if (!context) return res.status(404).json({ error: 'Entity not found' });

            const payload = newsletterService.normalizeCampaignPayload(req.body || {}, context.entity, context.fields);
            payload.updatedBy = req.user?._id;

            let campaign;
            if (isObjectId(req.params.campaignId)) {
                campaign = await context.CampaignModel.findOneAndUpdate(
                    { _id: req.params.campaignId, entityId: context.entity._id },
                    { $set: payload },
                    { new: true }
                );
            } else {
                payload.createdBy = req.user?._id;
                campaign = await context.CampaignModel.create(payload);
            }

            if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
            res.json({ success: true, campaign });
        } catch (error) {
            console.error('[Newsletter] save campaign error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    },

    previewCampaign: async (req, res) => {
        try {
            const context = await loadEntityContext(req, req.params.entitySlug);
            if (!context) return res.status(404).json({ error: 'Entity not found' });

            const campaign = await campaignForRequest(context.CampaignModel, req.params.campaignId, context.entity);
            if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

            const preview = await newsletterService.previewCampaign({
                CampaignModel: context.CampaignModel,
                DeliveryModel: context.DeliveryModel,
                RecordModel: context.RecordModel,
                campaign: campaign.toObject(),
                entity: context.entity,
                fields: context.fields
            });

            await context.CampaignModel.updateOne(
                { _id: campaign._id },
                {
                    $set: {
                        'stats.totalRecipients': preview.total,
                        'stats.lastPreviewAt': new Date()
                    }
                }
            );

            res.json({ success: true, preview });
        } catch (error) {
            console.error('[Newsletter] preview error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    },

    sendTest: async (req, res) => {
        try {
            const context = await loadEntityContext(req, req.params.entitySlug);
            if (!context) return res.status(404).json({ error: 'Entity not found' });

            const campaign = await campaignForRequest(context.CampaignModel, req.params.campaignId, context.entity);
            if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

            const to = String(req.body?.to || req.user?.email || '').trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
                return res.status(400).json({ error: 'Adresse email de test invalide' });
            }

            const { recipients } = await newsletterService.getCampaignRecipients({
                CampaignModel: context.CampaignModel,
                DeliveryModel: context.DeliveryModel,
                RecordModel: context.RecordModel,
                campaign: campaign.toObject(),
                entity: context.entity,
                fields: context.fields,
                includeSent: true,
                limit: 50
            });

            if (!recipients.length) {
                return res.status(400).json({ error: 'Aucun record eligible pour generer un email de test' });
            }

            const sample = recipients[0];
            const mailer = require('../services/mailer');
            const info = await mailer.send({
                to,
                subject: `[TEST] ${sample.rendered.subject}`,
                html: sample.rendered.html,
                text: sample.rendered.text,
                from: campaign.sender?.email
                    ? `"${campaign.sender?.name || campaign.sender.email}" <${campaign.sender.email}>`
                    : undefined,
                replyTo: campaign.sender?.replyTo || undefined
            });

            res.json({
                success: true,
                dryRun: !!info?.dryRun,
                message: info?.dryRun ? 'SMTP non configure: test simule' : `Email de test envoye a ${to}`
            });
        } catch (error) {
            console.error('[Newsletter] send test error:', error);
            res.status(500).json({ error: error.message || 'Server Error' });
        }
    },

    sendCampaign: async (req, res) => {
        try {
            const context = await loadEntityContext(req, req.params.entitySlug);
            if (!context) return res.status(404).json({ error: 'Entity not found' });

            const campaign = await campaignForRequest(context.CampaignModel, req.params.campaignId, context.entity);
            if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

            if (req.body?.confirmSend !== true && req.body?.dryRun !== true) {
                return res.status(400).json({ error: 'confirmSend required' });
            }

            const result = await newsletterService.sendCampaign({
                CampaignModel: context.CampaignModel,
                DeliveryModel: context.DeliveryModel,
                RecordModel: context.RecordModel,
                campaign: campaign.toObject(),
                entity: context.entity,
                fields: context.fields,
                user: req.user,
                limit: req.body?.limit || 100,
                dryRun: !!req.body?.dryRun,
                includeSent: !!req.body?.includeSent
            });

            res.json({ success: true, result });
        } catch (error) {
            console.error('[Newsletter] send campaign error:', error);
            res.status(500).json({ error: error.message || 'Server Error' });
        }
    }
};
