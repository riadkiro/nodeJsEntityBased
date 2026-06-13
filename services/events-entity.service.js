const mongoose = require('mongoose')
const { tenantCollection } = require('../middleware/tenant')

const EVENT_FIELD_DEFS = [
    {
        name: 'heure_debut',
        label: 'Heure de d\u00e9but',
        type: 'date',
        subtype: 'datetime',
        category: 'dates',
        isSystem: true,
        ui: { icon: 'solar:clock-circle-bold-duotone', rows: 1, width: 'half' },
        render: { input: 'date' },
    },
    {
        name: 'heure_fin',
        label: 'Heure de fin',
        type: 'date',
        subtype: 'datetime',
        category: 'dates',
        isSystem: true,
        ui: { icon: 'solar:clock-square-bold-duotone', rows: 1, width: 'half' },
        render: { input: 'date' },
    },
    {
        name: 'duree_evenement',
        label: 'Dur\u00e9e (min)',
        type: 'number',
        category: 'dates',
        isSystem: true,
        ui: { icon: 'solar:stopwatch-bold-duotone', rows: 1, width: 'half' },
        type_config: { min: 0, max: 1440, step: 5 },
        render: { input: 'number' },
    },
    {
        name: 'lieu_evenement',
        label: 'Lieu',
        type: 'string',
        category: 'popular',
        isSystem: true,
        ui: { icon: 'solar:map-point-bold-duotone', rows: 1, width: 'full' },
        render: { input: 'text' },
    },
    {
        name: 'type_evenement',
        label: "Type d'\u00e9v\u00e9nement",
        type: 'select',
        category: 'workflow',
        isSystem: true,
        ui: { icon: 'solar:tag-bold-duotone', rows: 1, width: 'half' },
        type_config: {
            options: [
                { label: 'Consultation', value: 'consultation' },
                { label: 'R\u00e9union', value: 'reunion' },
                { label: 'Rappel', value: 'rappel' },
                { label: 'T\u00e2che', value: 'tache' },
                { label: 'Personnel', value: 'personnel' },
                { label: 'Autre', value: 'autre' },
            ],
        },
        render: { input: 'select' },
    },
    {
        name: 'tags_evenement',
        label: '\u00c9tiquettes',
        type: 'select',
        subtype: 'multi',
        category: 'workflow',
        isSystem: true,
        ui: { icon: 'solar:tag-bold-duotone', rows: 1, width: 'full' },
        type_config: {
            multiple: true,
            options: [
                { label: 'Important', value: 'Important', color: '#ef4444' },
                { label: 'Date limite', value: 'Date limite', color: '#f59e0b' },
                { label: 'Risque amende', value: 'Risque amende', color: '#dc2626' },
            ],
        },
        render: { input: 'multiselect' },
    },
    {
        name: 'widget_prochains_evenements',
        label: 'Prochains \u00e9v\u00e9nements',
        type: 'boolean',
        category: 'workflow',
        isSystem: true,
        ui: { icon: 'solar:calendar-bold-duotone', rows: 1, width: 'half' },
        type_config: { default: true },
        render: { input: 'switch' },
    },
    {
        name: 'widget_date_importante',
        label: 'Date importante',
        type: 'boolean',
        category: 'workflow',
        isSystem: true,
        ui: { icon: 'solar:calendar-mark-bold-duotone', rows: 1, width: 'half' },
        type_config: { default: false },
        render: { input: 'switch' },
    },
    {
        name: 'notes_evenement',
        label: 'Notes',
        type: 'text',
        category: 'content',
        isSystem: true,
        ui: { icon: 'solar:notes-bold-duotone', rows: 3, width: 'full' },
        render: { input: 'textarea' },
    },
]

const STATUS_OPTIONS = [
    { label: 'Planifi\u00e9', color: '#3b82f6', icon: 'solar:calendar-mark-bold', type: 'start', order: 0 },
    { label: 'Confirm\u00e9', color: '#10b981', icon: 'solar:check-circle-bold', type: 'active', order: 1 },
    { label: 'En cours', color: '#f59e0b', icon: 'solar:clock-circle-bold', type: 'active', order: 2 },
    { label: 'Termin\u00e9', color: '#6b7280', icon: 'solar:check-read-bold', type: 'completed', order: 3 },
    { label: 'Annul\u00e9', color: '#ef4444', icon: 'solar:close-circle-bold', type: 'completed', order: 4 },
]

const TYPE_OPTIONS = [
    { label: 'Consultation', color: '#4361ee', order: 0 },
    { label: 'R\u00e9union', color: '#8b5cf6', order: 1 },
    { label: 'Rappel', color: '#f59e0b', order: 2 },
    { label: 'T\u00e2che', color: '#10b981', order: 3 },
    { label: 'Personnel', color: '#ec4899', order: 4 },
    { label: 'Autre', color: '#6b7280', order: 5 },
]

function mergeIds(existing = [], additions = []) {
    const seen = new Set()
    return [...existing, ...additions].filter(id => {
        if (!id) return false
        const key = id.toString()
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })
}

function mergeFieldTypeConfig(current = {}, defConfig = {}) {
    const next = { ...(current || {}) }

    Object.entries(defConfig || {}).forEach(([key, value]) => {
        if (key === 'options' && Array.isArray(value)) {
            const existingOptions = Array.isArray(next.options) ? [...next.options] : []
            const seen = new Set(existingOptions.map(opt => {
                const raw = typeof opt === 'object' ? (opt.value || opt.label) : opt
                return String(raw || '').trim().toLowerCase()
            }))

            value.forEach(opt => {
                const raw = typeof opt === 'object' ? (opt.value || opt.label) : opt
                const token = String(raw || '').trim().toLowerCase()
                if (!token || seen.has(token)) return
                existingOptions.push(opt)
                seen.add(token)
            })

            next.options = existingOptions
            return
        }

        if (next[key] === undefined || next[key] === null || next[key] === '') {
            next[key] = value
        }
    })

    return next
}

async function ensureFieldTemplates(FieldTemplate) {
    const fieldIds = []

    for (const def of EVENT_FIELD_DEFS) {
        let field = await FieldTemplate.findOne({ name: def.name })

        if (!field) {
            field = await FieldTemplate.create(def)
        } else {
            const patch = {
                label: field.label || def.label,
                type: field.type || def.type,
                subtype: field.subtype || def.subtype,
                category: field.category || def.category,
                isSystem: true,
                ui: { ...(def.ui || {}), ...(field.ui?.toObject?.() || field.ui || {}) },
                render: { ...(def.render || {}), ...(field.render?.toObject?.() || field.render || {}) },
            }
            if (def.type_config) {
                patch.type_config = mergeFieldTypeConfig(field.type_config?.toObject?.() || field.type_config || {}, def.type_config)
            }
            await FieldTemplate.updateOne({ _id: field._id }, { $set: patch })
        }

        fieldIds.push(field._id)
    }

    return fieldIds
}

async function ensureClassification(Classification, { key, name, options }) {
    let classification = await Classification.findOne({ key })

    if (!classification) {
        const preparedOptions = options.map(option => ({
            _id: new mongoose.Types.ObjectId(),
            badgeStyle: 'dot',
            type: 'normal',
            ...option,
        }))

        classification = await Classification.create({
            name,
            key,
            allowMultiple: false,
            options: preparedOptions,
            defaultOptionId: preparedOptions[0]?._id,
            isShared: true,
        })
        return classification
    }

    let changed = false
    for (const option of options) {
        const exists = (classification.options || []).some(existing => existing.label === option.label)
        if (!exists) {
            classification.options.push({
                _id: new mongoose.Types.ObjectId(),
                badgeStyle: 'dot',
                type: 'normal',
                ...option,
            })
            changed = true
        }
    }

    if (!classification.defaultOptionId && classification.options?.[0]?._id) {
        classification.defaultOptionId = classification.options[0]._id
        changed = true
    }

    if (changed) await classification.save()
    return classification
}

async function ensureEventsEntity(req) {
    const Entity = await tenantCollection(req, 'Entity')
    const FieldTemplate = await tenantCollection(req, 'FieldTemplate')
    const Classification = await tenantCollection(req, 'Classification')

    if (!Entity || !FieldTemplate || !Classification) {
        throw new Error('Tenant models are not ready')
    }

    const fieldIds = await ensureFieldTemplates(FieldTemplate)
    const statusClassification = await ensureClassification(Classification, {
        key: 'event_status',
        name: 'Statut \u00e9v\u00e9nement',
        options: STATUS_OPTIONS,
    })
    const typeClassification = await ensureClassification(Classification, {
        key: 'event_type',
        name: "Type d'\u00e9v\u00e9nement",
        options: TYPE_OPTIONS,
    })

    let eventsEntity = await Entity.findOne({ slug: 'events' })

    if (!eventsEntity) {
        eventsEntity = await Entity.create({
            name: '\u00c9v\u00e9nement',
            nameSingular: '\u00c9v\u00e9nement',
            namePlural: '\u00c9v\u00e9nements',
            slug: 'events',
            description: '\u00c9v\u00e9nements et rendez-vous li\u00e9s aux enregistrements',
            icon: 'solar:calendar-mark-bold-duotone',
            color: '#14b8a6',
            isSystem: true,
            order: 100,
            enabledStandardFields: ['title', 'date', 'description'],
            customFields: fieldIds,
            statusClassification: statusClassification._id,
            classifications: [typeClassification._id],
            relations: [],
            referenceTitleTokens: [{ t: 'field', id: 'title' }],
            createdBy: req.user?._id,
        })
    } else {
        eventsEntity.name = eventsEntity.name || '\u00c9v\u00e9nement'
        eventsEntity.nameSingular = eventsEntity.nameSingular || '\u00c9v\u00e9nement'
        eventsEntity.namePlural = eventsEntity.namePlural || '\u00c9v\u00e9nements'
        eventsEntity.description = eventsEntity.description || '\u00c9v\u00e9nements et rendez-vous li\u00e9s aux enregistrements'
        eventsEntity.icon = eventsEntity.icon || 'solar:calendar-mark-bold-duotone'
        eventsEntity.color = eventsEntity.color || '#14b8a6'
        eventsEntity.isSystem = true
        eventsEntity.order = eventsEntity.order || 100
        eventsEntity.enabledStandardFields = mergeIds(eventsEntity.enabledStandardFields, ['title', 'date', 'description'])
        eventsEntity.customFields = mergeIds(eventsEntity.customFields, fieldIds)
        eventsEntity.statusClassification = eventsEntity.statusClassification || statusClassification._id
        eventsEntity.classifications = mergeIds(eventsEntity.classifications, [typeClassification._id])
        if (!eventsEntity.referenceTitleTokens?.length) {
            eventsEntity.referenceTitleTokens = [{ t: 'field', id: 'title' }]
        }
        await eventsEntity.save()
    }

    await FieldTemplate.updateMany(
        { _id: { $in: fieldIds } },
        { $addToSet: { entities: eventsEntity._id } }
    )

    return Entity.findById(eventsEntity._id)
        .populate('customFields')
        .populate('classifications')
        .populate('statusClassification')
        .lean()
}

module.exports = {
    ensureEventsEntity,
}
