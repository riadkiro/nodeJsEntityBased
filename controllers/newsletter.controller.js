const mongoose = require('mongoose');
const { tenantCollection } = require('../middleware/tenant');
const newsletterService = require('../services/newsletter.service');
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

async function campaignForRequest(CampaignModel, campaignId, entity) {
    if (!isObjectId(campaignId)) return null;
    return CampaignModel.findOne({ _id: campaignId, entityId: entity._id });
}

module.exports = {
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
