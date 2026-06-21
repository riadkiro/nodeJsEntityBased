const crypto = require('crypto');
const mongoose = require('mongoose');
const mailer = require('./mailer');
const { buildRecordFilterQuery, normalizeOperator } = require('./record-filter-query');

const STANDARD_FIELDS = [
    { id: 'title', label: 'Titre', type: 'string', source: 'standard' },
    { id: 'computedTitle', label: 'Titre calcule', type: 'string', source: 'standard' },
    { id: 'description', label: 'Description', type: 'text', source: 'standard' },
    { id: 'content', label: 'Contenu', type: 'text', source: 'standard' },
    { id: 'link', label: 'Lien', type: 'string', source: 'standard' },
    { id: 'status', label: 'Statut', type: 'string', source: 'standard' },
    { id: 'date', label: 'Date', type: 'date', source: 'standard' },
    { id: 'createdAt', label: 'Cree le', type: 'date', source: 'standard' },
    { id: 'updatedAt', label: 'Modifie le', type: 'date', source: 'standard' }
];

function makeTemplateKey() {
    return `tpl_${crypto.randomBytes(6).toString('hex')}`;
}

function defaultTemplates() {
    return [
        {
            key: makeTemplateKey(),
            name: 'Email one',
            enabled: true,
            subject: 'Bonjour {{title}}',
            preheader: '',
            format: 'designed',
            bodyText: 'Bonjour,\n\nNous voulions vous contacter au sujet de {{title}}.\n\nCordialement,',
            bodyHtml: '<p>Bonjour,</p><p>Nous voulions vous contacter au sujet de <strong>{{title}}</strong>.</p><p>Cordialement,</p>',
            ctaLabel: '',
            ctaUrl: '',
            conditions: [],
            order: 0
        },
        {
            key: makeTemplateKey(),
            name: 'Email two',
            enabled: true,
            subject: 'Suite a notre message - {{title}}',
            preheader: '',
            format: 'html',
            bodyText: 'Bonjour,\n\nJe me permets de revenir vers vous.\n\nCordialement,',
            bodyHtml: '<p>Bonjour,</p><p>Je me permets de revenir vers vous.</p><p>Cordialement,</p>',
            ctaLabel: '',
            ctaUrl: '',
            conditions: [],
            order: 1
        }
    ];
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function normalizeToken(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

function isObjectId(value) {
    return mongoose.Types.ObjectId.isValid(String(value || ''));
}

function toPlain(doc) {
    return doc && typeof doc.toObject === 'function' ? doc.toObject() : doc;
}

function serializeField(field) {
    const plain = toPlain(field) || {};
    const label = plain.label || plain.name || 'Champ';
    const subtype = String(plain.subtype || '').toLowerCase();
    return {
        id: plain._id?.toString() || plain.id,
        label,
        name: plain.name || normalizeToken(label),
        type: plain.type || plain.render?.input || 'string',
        subtype,
        source: 'custom',
        emailCandidate: subtype === 'email' || /\b(e[- ]?mail|mail|courriel)\b/i.test(`${plain.label || ''} ${plain.name || ''}`)
    };
}

function buildFields(entity) {
    const customFields = (entity?.customFields || []).filter(Boolean).map(serializeField);
    return [
        ...STANDARD_FIELDS.map(field => ({
            ...field,
            name: normalizeToken(field.label),
            emailCandidate: /\b(e[- ]?mail|mail|courriel)\b/i.test(field.label)
        })),
        ...customFields
    ];
}

function findField(fields, fieldId) {
    return fields.find(field => field.id === fieldId) || null;
}

function valueToString(value) {
    if (value === undefined || value === null) return '';
    if (value instanceof Date) return value.toLocaleDateString('fr-FR');
    if (Array.isArray(value)) return value.map(valueToString).filter(Boolean).join(', ');
    if (typeof value === 'object') {
        if (value.label !== undefined) return valueToString(value.label);
        if (value.name !== undefined) return valueToString(value.name);
        if (value.title !== undefined) return valueToString(value.title);
        if (value.value !== undefined) return valueToString(value.value);
        if (value._id !== undefined) return String(value._id);
        return JSON.stringify(value);
    }
    return String(value);
}

function getRecordValue(record, fieldId) {
    const id = String(fieldId || '');
    if (!id) return '';

    if (id === 'title') return record.computedTitle || record.title || '';
    if (id === 'computedTitle') return record.computedTitle || record.title || '';
    if (STANDARD_FIELDS.some(field => field.id === id)) return record[id];

    const customField = (record.customFields || []).find(item => {
        const current = item.field_id?._id || item.field_id;
        return current?.toString() === id;
    });
    return customField?.value;
}

function getEmailFromRecord(record, emailField) {
    const raw = getRecordValue(record, emailField?.field || emailField);
    const values = Array.isArray(raw) ? raw : String(raw || '').split(/[;,|\s]+/);
    const email = values
        .map(value => String(value || '').trim().toLowerCase())
        .find(value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
    return email || '';
}

function buildTemplateContext(record, fields = []) {
    const context = {
        title: valueToString(record.computedTitle || record.title || ''),
        computedTitle: valueToString(record.computedTitle || record.title || ''),
        description: valueToString(record.description || ''),
        content: valueToString(record.content || ''),
        link: valueToString(record.link || ''),
        status: valueToString(record.status || ''),
        date: valueToString(record.date || ''),
        createdAt: valueToString(record.createdAt || ''),
        updatedAt: valueToString(record.updatedAt || ''),
        recordId: record._id?.toString() || '',
    };

    for (const field of fields) {
        const value = valueToString(getRecordValue(record, field.id));
        context[`field:${field.id}`] = value;
        if (field.name) context[field.name] = value;
        if (field.label) context[normalizeToken(field.label)] = value;
    }

    return context;
}

function renderString(template, context, { html = false } = {}) {
    return String(template || '').replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, rawKey) => {
        const key = String(rawKey || '').trim();
        const normalized = normalizeToken(key);
        const value = context[key] ?? context[normalized] ?? '';
        return html ? escapeHtml(value) : value;
    });
}

function designedHtml({ subject, preheader, bodyHtml, ctaLabel, ctaUrl }) {
    const safeSubject = escapeHtml(subject || 'Newsletter');
    const safePreheader = escapeHtml(preheader || '');
    const button = ctaLabel && ctaUrl
        ? `<div style="text-align:center;margin:28px 0;"><a href="${escapeHtml(ctaUrl)}" style="display:inline-block;padding:13px 26px;background:#4361ee;color:#fff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;">${escapeHtml(ctaLabel)}</a></div>`
        : '';

    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <div style="display:none;max-height:0;overflow:hidden;color:transparent;">${safePreheader}</div>
  <div style="max-width:620px;margin:32px auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
    <div style="padding:28px 30px;border-bottom:1px solid #eef2f7;">
      <div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#4361ee;">Dexapp</div>
      <h1 style="font-size:24px;line-height:1.25;margin:8px 0 0;color:#0f172a;">${safeSubject}</h1>
    </div>
    <div style="padding:30px;font-size:15px;line-height:1.65;color:#334155;">
      ${bodyHtml || ''}
      ${button}
    </div>
    <div style="padding:16px 30px;border-top:1px solid #eef2f7;font-size:11px;line-height:1.5;color:#94a3b8;">
      Vous recevez cet email car votre contact est present dans un espace Dexapp.
    </div>
  </div>
</body>
</html>`;
}

function renderTemplate(template, record, fields) {
    const context = buildTemplateContext(record, fields);
    const subject = renderString(template.subject || '', context, { html: false }).trim() || 'Newsletter';
    const preheader = renderString(template.preheader || '', context, { html: false });
    const bodyText = renderString(template.bodyText || '', context, { html: false });
    const rawHtml = renderString(template.bodyHtml || '', context, { html: true });
    const ctaLabel = renderString(template.ctaLabel || '', context, { html: false });
    const ctaUrl = renderString(template.ctaUrl || '', context, { html: false });
    const format = template.format || 'html';
    const html = format === 'text'
        ? ''
        : format === 'designed'
            ? designedHtml({ subject, preheader, bodyHtml: rawHtml, ctaLabel, ctaUrl })
            : rawHtml;
    const text = bodyText || rawHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return { subject, html, text };
}

function compareValues(actual, condition) {
    const operator = normalizeOperator(condition.operator || 'contains');
    const rawActual = valueToString(actual);
    const actualLower = rawActual.toLowerCase();
    const expected = valueToString(condition.value);
    const expectedLower = expected.toLowerCase();
    const expected2 = valueToString(condition.value2);

    switch (operator) {
        case 'is_empty':
            return !rawActual || rawActual.length === 0;
        case 'is_not_empty':
            return !!rawActual && rawActual.length > 0;
        case 'equals':
            return actualLower === expectedLower;
        case 'not_equals':
            return actualLower !== expectedLower;
        case 'contains':
            return actualLower.includes(expectedLower);
        case 'not_contains':
            return !actualLower.includes(expectedLower);
        case 'starts_with':
            return actualLower.startsWith(expectedLower);
        case 'ends_with':
            return actualLower.endsWith(expectedLower);
        case 'in':
            return String(condition.value || '')
                .split(',')
                .map(item => item.trim().toLowerCase())
                .filter(Boolean)
                .includes(actualLower);
        case 'gt':
        case 'gte':
        case 'lt':
        case 'lte':
        case 'between': {
            const actualNumber = Number(rawActual);
            const expectedNumber = Number(expected);
            const expectedNumber2 = Number(expected2);
            if ([actualNumber, expectedNumber].some(Number.isNaN)) return false;
            if (operator === 'gt') return actualNumber > expectedNumber;
            if (operator === 'gte') return actualNumber >= expectedNumber;
            if (operator === 'lt') return actualNumber < expectedNumber;
            if (operator === 'lte') return actualNumber <= expectedNumber;
            if (Number.isNaN(expectedNumber2)) return false;
            return actualNumber >= expectedNumber && actualNumber <= expectedNumber2;
        }
        default:
            return actualLower.includes(expectedLower);
    }
}

function matchesConditions(record, conditions = []) {
    const cleanConditions = (Array.isArray(conditions) ? conditions : []).filter(condition => condition?.field);
    if (!cleanConditions.length) return true;

    let result = true;
    cleanConditions.forEach((condition, index) => {
        const current = compareValues(getRecordValue(record, condition.field), condition);
        if (index === 0) {
            result = current;
            return;
        }
        result = String(condition.logic || 'AND').toUpperCase() === 'OR'
            ? result || current
            : result && current;
    });
    return result;
}

function normalizeCondition(condition, index = 0) {
    const field = String(condition?.field || condition?.fieldId || '').trim();
    return {
        field,
        fieldName: String(condition?.fieldName || condition?.name || '').trim(),
        fieldType: String(condition?.fieldType || condition?.type || 'text').trim(),
        operator: normalizeOperator(condition?.operator || 'contains'),
        value: condition?.value,
        value2: condition?.value2,
        logic: index === 0 ? 'AND' : (String(condition?.logic || 'AND').toUpperCase() === 'OR' ? 'OR' : 'AND')
    };
}

function normalizeConditions(conditions = []) {
    return (Array.isArray(conditions) ? conditions : [])
        .map(normalizeCondition)
        .filter(condition => condition.field);
}

function normalizeTemplates(templates = []) {
    const source = Array.isArray(templates) && templates.length ? templates : defaultTemplates();
    return source.map((template, index) => ({
        key: String(template.key || makeTemplateKey()),
        name: String(template.name || `Email ${index + 1}`).trim(),
        enabled: template.enabled !== false,
        subject: String(template.subject || '').trim(),
        preheader: String(template.preheader || ''),
        format: ['text', 'html', 'designed'].includes(template.format) ? template.format : 'html',
        bodyText: String(template.bodyText || ''),
        bodyHtml: String(template.bodyHtml || ''),
        ctaLabel: String(template.ctaLabel || ''),
        ctaUrl: String(template.ctaUrl || ''),
        conditions: normalizeConditions(template.conditions || []),
        order: Number.isFinite(Number(template.order)) ? Number(template.order) : index
    }));
}

function normalizeCampaignPayload(body, entity, fields) {
    const emailFieldId = String(body.emailField?.field || body.emailField || '').trim();
    const emailField = findField(fields, emailFieldId) || fields.find(field => field.emailCandidate) || fields.find(field => field.source === 'custom') || fields[0];

    return {
        name: String(body.name || `${entity.name || entity.slug} newsletter`).trim(),
        entityId: entity._id,
        entitySlug: entity.slug,
        sourceView: {
            viewId: isObjectId(body.sourceView?.viewId) ? body.sourceView.viewId : undefined,
            slug: String(body.sourceView?.slug || '').trim(),
            name: String(body.sourceView?.name || '').trim()
        },
        emailField: {
            field: emailField?.id || '',
            fieldName: emailField?.label || '',
            source: emailField?.source || 'custom'
        },
        sender: {
            name: String(body.sender?.name || '').trim(),
            email: String(body.sender?.email || '').trim(),
            replyTo: String(body.sender?.replyTo || '').trim()
        },
        filters: normalizeConditions(body.filters || []),
        templates: normalizeTemplates(body.templates || []),
        status: body.status === 'paused' ? 'paused' : 'ready'
    };
}

async function getCampaignRecipients({ CampaignModel, RecordModel, DeliveryModel, campaign, entity, fields, includeSent = false, limit = 5000 }) {
    const baseQuery = { entityId: entity._id };
    const filterQuery = buildRecordFilterQuery(campaign.filters || []);
    const query = Object.keys(filterQuery).length ? { $and: [baseQuery, filterQuery] } : baseQuery;
    const records = await RecordModel.find(query)
        .select('title computedTitle description content link status date customFields classificationValues relations _denorm createdAt updatedAt')
        .limit(Math.max(1, Math.min(Number(limit) || 5000, 10000)))
        .lean();

    const dedupe = new Set();
    const templates = (campaign.templates || [])
        .filter(template => template.enabled !== false)
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
    const recipients = [];
    const skipped = { noEmail: 0, duplicate: 0, noTemplate: 0, alreadySent: 0 };
    const sentKeys = new Set();

    if (!includeSent && DeliveryModel && campaign._id) {
        const deliveries = await DeliveryModel.find({
            campaignId: campaign._id,
            status: 'sent'
        }).select('templateKey recordId email').lean();
        deliveries.forEach(delivery => {
            sentKeys.add(`${delivery.templateKey}:${delivery.recordId?.toString()}:${String(delivery.email || '').toLowerCase()}`);
        });
    }

    for (const record of records) {
        const email = getEmailFromRecord(record, campaign.emailField);
        if (!email) {
            skipped.noEmail += 1;
            continue;
        }

        const matchingTemplates = templates.filter(template => matchesConditions(record, template.conditions || []));
        if (!matchingTemplates.length) {
            skipped.noTemplate += 1;
            continue;
        }

        for (const template of matchingTemplates) {
            const key = `${template.key}:${record._id?.toString()}:${email}`;
            if (dedupe.has(key)) {
                skipped.duplicate += 1;
                continue;
            }
            if (!includeSent && sentKeys.has(key)) {
                skipped.alreadySent += 1;
                continue;
            }
            dedupe.add(key);
            recipients.push({
                record,
                email,
                template,
                rendered: renderTemplate(template, record, fields)
            });
        }
    }

    return { recipients, skipped, scanned: records.length };
}

async function previewCampaign(args) {
    const result = await getCampaignRecipients({ ...args, includeSent: true });
    const byTemplate = {};
    result.recipients.forEach(item => {
        if (!byTemplate[item.template.key]) {
            byTemplate[item.template.key] = {
                key: item.template.key,
                name: item.template.name,
                count: 0
            };
        }
        byTemplate[item.template.key].count += 1;
    });
    return {
        total: result.recipients.length,
        scanned: result.scanned,
        skipped: result.skipped,
        byTemplate: Object.values(byTemplate),
        sample: result.recipients.slice(0, 10).map(item => ({
            recordId: item.record._id?.toString(),
            title: item.record.computedTitle || item.record.title || 'Sans titre',
            email: item.email,
            template: item.template.name,
            subject: item.rendered.subject
        }))
    };
}

async function sendCampaign({ CampaignModel, DeliveryModel, RecordModel, campaign, entity, fields, user, limit = 100, dryRun = false, includeSent = false }) {
    const max = Math.max(1, Math.min(Number(limit) || 100, 250));
    const { recipients, skipped, scanned } = await getCampaignRecipients({
        CampaignModel,
        DeliveryModel,
        RecordModel,
        campaign,
        entity,
        fields,
        includeSent,
        limit: 10000
    });

    const selected = recipients.slice(0, max);
    const stats = { sent: 0, failed: 0, dryRun: 0, skipped: Math.max(0, recipients.length - selected.length) + Object.values(skipped).reduce((a, b) => a + b, 0), scanned };

    await CampaignModel.updateOne({ _id: campaign._id }, { $set: { status: 'sending' } });

    for (const item of selected) {
        const deliveryBase = {
            campaignId: campaign._id,
            templateKey: item.template.key,
            recordId: item.record._id,
            email: item.email,
            subject: item.rendered.subject,
            dryRun,
            createdBy: user?._id
        };

        try {
            let providerInfo = {};
            if (!dryRun) {
                providerInfo = await mailer.send({
                    to: item.email,
                    subject: item.rendered.subject,
                    html: item.rendered.html,
                    text: item.rendered.text,
                    from: campaign.sender?.email
                        ? `"${campaign.sender?.name || campaign.sender.email}" <${campaign.sender.email}>`
                        : undefined,
                    replyTo: campaign.sender?.replyTo || undefined
                });
            }

            await DeliveryModel.updateOne(
                {
                    campaignId: campaign._id,
                    templateKey: item.template.key,
                    recordId: item.record._id,
                    email: item.email
                },
                {
                    $set: {
                        ...deliveryBase,
                        status: dryRun || providerInfo?.dryRun ? 'dry_run' : 'sent',
                        providerMessageId: providerInfo?.messageId || '',
                        error: '',
                        sentAt: new Date()
                    }
                },
                { upsert: true }
            );

            if (dryRun || providerInfo?.dryRun) stats.dryRun += 1;
            else stats.sent += 1;
        } catch (error) {
            stats.failed += 1;
            await DeliveryModel.updateOne(
                {
                    campaignId: campaign._id,
                    templateKey: item.template.key,
                    recordId: item.record._id,
                    email: item.email
                },
                {
                    $set: {
                        ...deliveryBase,
                        status: 'failed',
                        error: error.message || 'Erreur envoi'
                    }
                },
                { upsert: true }
            );
        }
    }

    const hasRemainingRecipients = recipients.length > selected.length;
    await CampaignModel.updateOne(
        { _id: campaign._id },
        {
            $set: {
                status: dryRun || stats.failed > 0 || hasRemainingRecipients ? 'ready' : 'sent',
                'stats.totalRecipients': recipients.length,
                'stats.sent': stats.sent,
                'stats.failed': stats.failed,
                'stats.skipped': stats.skipped,
                'stats.lastSentAt': new Date()
            }
        }
    );

    return { ...stats, totalCandidates: recipients.length, processed: selected.length };
}

module.exports = {
    buildFields,
    defaultTemplates,
    getCampaignRecipients,
    getEmailFromRecord,
    makeTemplateKey,
    normalizeCampaignPayload,
    previewCampaign,
    renderTemplate,
    sendCampaign
};
