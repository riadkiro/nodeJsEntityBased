/**
 * API Routes for React Islands
 * JSON endpoints for client-side data fetching
 * 
 * Routes:
 * - GET /account/:account_number/api/entity/:entityId/views/:viewId/records
 * - POST /account/:account_number/api/user/view-preferences
 */
const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const { tenantCollection } = require('../middleware/tenant')
const { buildRecordFilterQuery, applyUniqueViewFilters, getUniqueViewFilters } = require('../services/record-filter-query')
const { ensureEventsEntity } = require('../services/events-entity.service')
const { taskTenantModels } = require('../services/task-tenant-models.service')
const TaskListsService = require('../services/task-lists.service')
const TaskAgentService = require('../services/record-ai-task-bridge.service')
const {
    defaultTaskPriorities,
    getAccountTaskPriorities,
    normalizeTaskPriorityOptions,
    priorityOptionFor,
    priorityColorFor,
    priorityLabelFor,
    saveAccountTaskPriorities,
} = require('../services/task-priorities.service')
const { sanitizeUploadedFilename } = require('../utils/filename-encoding')

/**
 * GET /account/:account_number/api/entity/:entityId/views/:viewId/records
 * Fetch records with pagination, sorting, and search for React Island
 */
router.get('/api/entity/:entityId/views/:viewId/records', async (req, res) => {
    try {
        const Record = await tenantCollection(req, "Record")
        const Entity = await tenantCollection(req, "Entity")
        const UserPreferences = await tenantCollection(req, "UserPreferences")
        const View = await tenantCollection(req, "View")

        const { entityId, viewId } = req.params
        const {
            page = 1,
            limit = 25,
            sort = 'createdAt:desc',
            q = '',
            meta = '1',
            total: includeTotalQuery = '1'
        } = req.query

        const pageNum = parseInt(page)
        const limitNum = parseInt(limit)
        const includeMeta = meta !== '0'
        const includeTotal = includeTotalQuery !== '0'

        // Register FieldTemplate and Classification BEFORE Entity to allow populate
        await tenantCollection(req, 'FieldTemplate')
        await tenantCollection(req, 'Classification')

        // Get entity with customFields, statusClassification, classifications populated
        const entity = await Entity.findById(entityId)
            .populate('customFields')
            .populate('statusClassification')
            .populate('classifications')
            .populate({ path: 'relations.targetEntity', select: 'slug' })
            .lean()

        if (!entity) {
            return res.status(404).json({ error: 'Entity not found' })
        }

        // Build query - use entityId field name as in Record model
        let query = { entityId: entityId }

        let viewDoc = await View.findById(viewId).lean()
        let effectiveViewId = viewDoc?._id || viewId
        if (!viewDoc && String(viewId) === String(entityId)) {
            viewDoc = await View.findOne({
                entity: entity._id,
                viewType: { $in: ['list', 'table'] }
            }).sort({ order: 1, createdAt: 1 }).lean()
            if (viewDoc) effectiveViewId = viewDoc._id
        }
        const viewFilters = viewDoc?.filters || []
        const viewFilterQuery = buildRecordFilterQuery(viewFilters)
        const uniqueViewFilters = getUniqueViewFilters(viewFilters)

        // Guest/External: restrict to shared records only
        const { getSharedRecordFilter } = require('../middleware/shared-records-helper')
        const sharedFilter = await getSharedRecordFilter(req, entityId)
        if (sharedFilter) {
            query._id = sharedFilter._id
        }

        if (q && q.trim()) {
            query = {
                $and: [
                    { entityId: entityId },
                    ...(sharedFilter ? [{ _id: sharedFilter._id }] : []),
                    {
                        $or: [
                            { title: { $regex: q, $options: 'i' } },
                            { computedTitle: { $regex: q, $options: 'i' } },
                            { 'customFields.value': { $regex: q, $options: 'i' } }
                        ]
                    }
                ]
            }
        }
        if (Object.keys(viewFilterQuery).length > 0) {
            query = { $and: [query, viewFilterQuery] }
        }
        if (includeMeta || (q && q.trim())) {
            console.log('[API] Search query:', JSON.stringify({ q, query }, null, 2))
        }

        // Parse sort
        const [sortField, sortDirection] = sort.split(':')
        const sortObj = { [sortField]: sortDirection === 'asc' ? 1 : -1 }

        // Fetch records with pagination - minimal populate for performance
        const recordProjection = 'title computedTitle image customFields status classificationValues relations _denorm createdAt updatedAt'
        let total = null
        let records = []
        if (uniqueViewFilters.length > 0) {
            const matchingRecords = await Record.find(query)
                .select(recordProjection)
                .populate({
                    path: 'customFields.field_id',
                    select: 'label name type fieldType render ui type_config'
                })
                .sort(sortObj)
                .lean()
            const uniqueRecords = applyUniqueViewFilters(matchingRecords, viewFilters)
            total = includeTotal ? uniqueRecords.length : null
            records = uniqueRecords.slice((pageNum - 1) * limitNum, pageNum * limitNum)
        } else {
            // Get total count only when requested. Lazy background calls already know it.
            total = includeTotal ? await Record.countDocuments(query) : null
            records = await Record.find(query)
                .select(recordProjection)
                .populate({
                    path: 'customFields.field_id',
                    select: 'label name type fieldType render ui type_config'
                })
                .sort(sortObj)
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean()
        }

        // Build classification list (deduplicated) — used for enrichment + filter groups
        const seenClassIds = new Set()
        const allClassifications = [
            ...(entity.statusClassification ? [entity.statusClassification] : []),
            ...(entity.classifications || [])
        ].filter(c => {
            if (!c || !c._id) return false
            const id = c._id.toString()
            if (seenClassIds.has(id)) return false
            seenClassIds.add(id)
            return true
        })

        // Build classification option lookup for enrichment
        const classifOptionMap = {}
        allClassifications.forEach(cls => {
            (cls.options || []).forEach(opt => {
                classifOptionMap[opt._id.toString()] = {
                    label: opt.label,
                    color: opt.color || '#9ca3af'
                }
            })
        })

        // Enrich records — first pass: collect relation target IDs
        const relatedIdSet = new Set()
        records.forEach(record => {
            record.referenceTitle = record.computedTitle || record.title || 'Sans titre'

            // Enrich classificationValues with label/color from classification options
            if (record.classificationValues) {
                record.classificationValues = record.classificationValues.map(cv => {
                    const optId = cv.optionId?.toString()
                    const optInfo = optId ? classifOptionMap[optId] : null
                    return {
                        ...cv,
                        label: cv.label || optInfo?.label || '',
                        color: cv.color || optInfo?.color || '#9ca3af',
                        optionLabel: cv.label || optInfo?.label || '',
                        optionColor: cv.color || optInfo?.color || '#9ca3af'
                    }
                })
            }

            // Collect all relation target IDs for batch resolution
            ; (record.relations || []).forEach(rel => {
                const val = rel.value
                if (!val) return
                if (Array.isArray(val)) {
                    val.forEach(v => { if (v) relatedIdSet.add(v.toString()) })
                } else {
                    relatedIdSet.add(val.toString())
                }
            })
        })

        // Batch-load related record titles (single query for all relations)
        const relatedIdArr = [...relatedIdSet]
        let relatedTitleMap = {}
        if (relatedIdArr.length > 0) {
            const mongoose = require('mongoose')
            const validIds = relatedIdArr.filter(id => mongoose.Types.ObjectId.isValid(id))
            if (validIds.length > 0) {
                const relatedRecords = await Record.find(
                    { _id: { $in: validIds } },
                    { title: 1, computedTitle: 1, entityId: 1 }
                ).lean()
                relatedRecords.forEach(r => {
                    relatedTitleMap[r._id.toString()] = r.computedTitle || r.title || 'Sans titre'
                })
            }
        }

        // Second pass: build _denorm.relations for each record
        records.forEach(record => {
            if (!record._denorm) record._denorm = {}
            record._denorm.relations = (record.relations || []).map(rel => {
                const val = rel.value
                let resolvedRecords = []
                if (Array.isArray(val)) {
                    resolvedRecords = val
                        .filter(Boolean)
                        .map(v => ({ _id: v.toString(), title: relatedTitleMap[v.toString()] || '' }))
                        .filter(r => r.title)
                } else if (val) {
                    const title = relatedTitleMap[val.toString()]
                    if (title) resolvedRecords = [{ _id: val.toString(), title }]
                }
                return {
                    relationKey: rel.relationKey || rel.key,
                    records: resolvedRecords
                }
            })
        })

        let preferences = null
        let viewSettings = {}
        if (includeMeta) {
            if (req.user?._id) {
                const prefs = await UserPreferences.findOne({
                    userId: req.user._id,
                    viewId: effectiveViewId
                }).lean()
                preferences = prefs?.preferences || null

            }
            viewSettings = viewDoc?.settings && typeof viewDoc.settings === 'object'
                ? { ...viewDoc.settings }
                : {}

            if (viewSettings.viewMode) {
                preferences = {
                    ...(preferences || {}),
                    viewMode: preferences?.viewMode || viewSettings.viewMode
                }
            }
        }

        // ═══ Compute computed field values for each record ═══
        const computedFieldDefs = (entity.customFields || []).filter(f => f.category === 'computed' && f.formula)
        if (computedFieldDefs.length > 0) {
            const { computeAllFields } = require('../services/computed-field-engine')
            records.forEach(record => {
                // Build custom values map (fieldId → value)
                const customMap = {}
                    ; (record.customFields || []).forEach(cf => {
                        const fid = cf.field_id?._id?.toString() || cf.field_id?.toString() || ''
                        if (fid) customMap[fid] = cf.value
                    })
                const recordForCompute = { ...record, custom: customMap }
                record._computedFields = computeAllFields(computedFieldDefs, recordForCompute, entity.customFields)
            })
        }

        // Build columns from entity fields
        const customFieldColumns = includeMeta ? (entity.customFields || []).map(f => ({
            id: f._id.toString(),
            name: f.label || f.name || 'Champ',
            type: f.fieldType || f.type || f.render?.input || 'text',
            options: (f.type_config?.options || f.typeConfig?.options || f.options || []).map((option, index) => {
                if (typeof option === 'string') {
                    return { id: option, value: option, label: option, order: index }
                }
                const value = String(option?.value ?? option?.id ?? option?._id ?? option?.label ?? option?.name ?? '')
                return {
                    id: String(option?.id ?? option?._id ?? value),
                    value,
                    label: option?.label || option?.name || value,
                    color: option?.color || option?.couleur || '#64748b',
                    order: Number.isFinite(Number(option?.order)) ? Number(option.order) : index
                }
            }).sort((a, b) => a.order - b.order),
            sortable: f.category !== 'computed',
            computed: f.category === 'computed' || undefined,
            computedDisplay: f.category === 'computed' ? (f.render?.display?.table || 'text') : undefined,
            computedColor: f.category === 'computed' ? (f.color || '#4361ee') : undefined,
        })) : []

        // Relation columns
        const relationColumns = includeMeta ? (entity.relations || []).map(rel => ({
            id: `rel:${rel.key}`,
            name: rel.label || rel.key,
            type: 'relation',
            sortable: false,
            targetEntitySlug: rel.targetEntity?.slug || ''
        })) : []

        // Classification columns (use allClassifications for deduplication)
        const classificationColumns = includeMeta ? allClassifications.filter(c => c && c.name).map(c => ({
            id: `classif:${c._id.toString()}`,
            name: c.name,
            type: 'classification',
            sortable: false
        })) : []

        const columns = includeMeta ? [
            { id: 'title', name: 'Titre', sortable: true },
            ...relationColumns,
            ...customFieldColumns,
            ...classificationColumns,
            { id: 'createdAt', name: 'Créé le', sortable: true },
            { id: 'actions', name: 'Actions', sortable: false }
        ] : []

        // Build filter groups from entity classifications (for sidebar filtering)
        // allClassifications already defined above (deduplicated)

        // Get ALL records for counting (restricted for guest/external)
        let filterGroups = []
        if (includeMeta) {
            let countQuery = { entityId }
            if (sharedFilter) countQuery._id = sharedFilter._id
            if (Object.keys(viewFilterQuery).length > 0) {
                countQuery = { $and: [countQuery, viewFilterQuery] }
            }
            let allRecordsForCounts = await Record.find(countQuery)
                .select(uniqueViewFilters.length > 0
                    ? 'classificationValues customFields relations _denorm title computedTitle createdAt updatedAt'
                    : 'classificationValues')
                .lean()
            if (uniqueViewFilters.length > 0) {
                allRecordsForCounts = applyUniqueViewFilters(allRecordsForCounts, viewFilters)
            }

            filterGroups = allClassifications.map(cls => {
                // Count records per option
                const optionCounts = {}
                allRecordsForCounts.forEach(r => {
                    const cvs = r.classificationValues || []
                    cvs.forEach(cv => {
                        if (cv.classificationId?.toString() === cls._id.toString()) {
                            const key = cv.optionId?.toString()
                            if (key) optionCounts[key] = (optionCounts[key] || 0) + 1
                        }
                    })
                })

                // All classification filters use tag badge/chip style
                const isTagType = true

                return {
                    id: cls._id.toString(),
                    name: cls.name || cls.key || 'Classification',
                    classificationId: cls._id.toString(),
                    type: isTagType ? 'tags' : 'list',
                    options: (cls.options || []).map(opt => ({
                        id: opt._id.toString(),
                        label: opt.label,
                        color: opt.color || '#9ca3af',
                        count: optionCounts[opt._id.toString()] || 0
                    }))
                }
            })
        }

        // Load view settings for titleDisplay fallback
        let viewTitleDisplay = null
        if (includeMeta) {
            try {
                if (viewDoc?.settings?.titleDisplay) {
                    viewTitleDisplay = viewDoc.settings.titleDisplay
                }
            } catch (e) { /* view not found, no fallback */ }
        }

        res.json({
            records,
            columns,
            preferences,
            entity: includeMeta ? entity : undefined, // Include entity for Kanban (statusClassification, classifications)
            view: includeMeta && viewDoc ? {
                _id: viewDoc._id,
                name: viewDoc.name,
                slug: viewDoc.slug,
                viewType: viewDoc.viewType,
                filters: viewDoc.filters || []
            } : null,
            viewFilters: includeMeta ? (viewDoc?.filters || []) : [],
            viewSettings: includeMeta ? {
                ...viewSettings,
                kanbanField: viewSettings.kanbanField || 'status',
                kanbanTagFields: Array.isArray(viewSettings.kanbanTagFields) ? viewSettings.kanbanTagFields : []
            } : {},
            filters: filterGroups,
            viewTitleDisplay, // View-level default for titleDisplay (icon vs avatar)
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: total === null ? null : Math.ceil(total / limitNum)
            }
        })

    } catch (error) {
        console.error('[API] Records fetch error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * GET /account/:account_number/api/record/:recordId/relation-records/:relationKey
 * Lazy-load related records for a specific relation tab
 * Supports both direct relations (value stored on record) and inverse relations (inv_ prefix)
 */
router.get('/api/record/:recordId/relation-records/:relationKey', async (req, res) => {
    try {
        const mongoose = require('mongoose')
        const Entity = await tenantCollection(req, "Entity")
        const Record = await tenantCollection(req, "Record")
        const { recordId, relationKey } = req.params

        if (!mongoose.Types.ObjectId.isValid(recordId)) {
            return res.status(400).json({ error: 'Invalid record ID' })
        }

        const record = await Record.findById(recordId).lean()
        if (!record) return res.status(404).json({ error: 'Record not found' })

        const entity = await Entity.findById(record.entityId)
            .populate({ path: 'relations.targetEntity', select: 'name slug icon color' })
            .lean()
        if (!entity) return res.status(404).json({ error: 'Entity not found' })

        let records = []

        if (relationKey.startsWith('inv_')) {
            // ═══ Inverse relation ═══
            const sourceRelKey = relationKey.replace('inv_', '')
            // Find the source entity that owns this relation
            const sourceEntities = await Entity.find({
                'relations.key': sourceRelKey,
                'relations.targetEntity': entity._id
            }).select('_id name slug icon color').lean()

            if (sourceEntities.length > 0) {
                for (const srcEnt of sourceEntities) {
                    // Find records in the source entity that reference this record
                    const sourceRecords = await Record.find({
                        entityId: srcEnt._id,
                        $or: [
                            { 'relations': { $elemMatch: { relationKey: sourceRelKey, value: record._id } } },
                            { 'relations': { $elemMatch: { relationKey: sourceRelKey, value: record._id.toString() } } },
                            { 'relations': { $elemMatch: { relationKey: sourceRelKey, value: { $in: [record._id, record._id.toString()] } } } }
                        ]
                    })
                        .select('_id title referenceTitle icon image createdAt updatedAt entityId')
                        .limit(100)
                        .lean()

                    records.push(...sourceRecords.map(r => ({
                        _id: r._id,
                        title: r.title || r.referenceTitle || 'Sans titre',
                        icon: srcEnt.icon || 'solar:widget-bold-duotone',
                        color: srcEnt.color || '#4361ee',
                        entitySlug: srcEnt.slug,
                        createdAt: r.createdAt,
                        updatedAt: r.updatedAt,
                    })))
                }
            }
        } else {
            // ═══ Direct relation ═══
            const rel = (entity.relations || []).find(r => r.key === relationKey)
            if (!rel) return res.status(404).json({ error: 'Relation not found' })

            const rv = (record.relations || []).find(r => r.relationKey === relationKey)
            if (rv && rv.value) {
                const targetIds = Array.isArray(rv.value) ? rv.value : [rv.value]
                const validIds = targetIds.filter(id => mongoose.Types.ObjectId.isValid(id))
                if (validIds.length > 0) {
                    const targetEntity = rel.targetEntity || {}
                    const relRecords = await Record.find({ _id: { $in: validIds } })
                        .select('_id title referenceTitle icon image createdAt updatedAt entityId')
                        .limit(100)
                        .lean()

                    records = relRecords.map(r => ({
                        _id: r._id,
                        title: r.title || r.referenceTitle || 'Sans titre',
                        icon: targetEntity.icon || 'solar:widget-bold-duotone',
                        color: targetEntity.color || '#4361ee',
                        entitySlug: targetEntity.slug || '',
                        createdAt: r.createdAt,
                        updatedAt: r.updatedAt,
                    }))
                }
            }
        }

        res.json({ records, total: records.length })
    } catch (error) {
        console.error('[API] Relation records fetch error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * GET /account/:account_number/api/datagrid/entities
 * Fetch entities for DataGrid island
 */
router.get('/api/datagrid/entities', async (req, res) => {
    try {
        const Entity = await tenantCollection(req, "Entity")
        const UserPreferences = await tenantCollection(req, "UserPreferences")

        const entities = await Entity.find({}).lean()

        // Transform entities into DataGrid rows
        const rows = entities.map(e => ({
            _id: e._id.toString(),
            _icon: e.icon || 'solar:box-bold-duotone',
            _color: e.color || '#4361ee',
            name: e.name || '',
            slug: e.slug || '',
            description: e.description || '',
            color: e.color || '#ffffff',
            icon: e.icon || '',
            active: e.active !== false,
            fieldsCount: (e.customFields || []).length + (e.enabledStandardFields || []).length,
            recordsCount: e._recordsCount || 0,
            createdAt: e.createdAt
        }))

        // Count records per entity
        const Record = await tenantCollection(req, "Record")
        for (const row of rows) {
            const count = await Record.countDocuments({ entityId: row._id })
            row.recordsCount = count
        }

        // Column definitions
        const columns = [
            { id: 'name', name: 'Nom', sortable: true, link: `/account/${req.account_number}/entity/settings/{id}` },
            { id: 'slug', name: 'Slug', sortable: true },
            { id: 'description', name: 'Description', sortable: false },
            { id: 'color', name: 'Couleur', sortable: false, type: 'color' },
            { id: 'icon', name: 'Icône', sortable: false, type: 'icon' },
            { id: 'active', name: 'Active', sortable: true, type: 'boolean' },
            { id: 'fieldsCount', name: 'Champs', sortable: true },
            { id: 'recordsCount', name: 'Enregistrements', sortable: true },
            { id: 'createdAt', name: 'Date de création', sortable: true, type: 'date' },
            { id: 'actions', name: '', sortable: false }
        ]

        // Load user preferences
        let preferences = null
        if (req.user?._id) {
            const prefs = await UserPreferences.findOne({
                userId: req.user._id,
                viewId: 'entity-list'
            }).lean()
            if (prefs) preferences = prefs.preferences
        }

        res.json({
            rows,
            columns,
            defaultSort: { field: 'name', direction: 'asc' },
            preferences
        })

    } catch (error) {
        console.error('[API] Entity list fetch error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * GET /account/:account_number/api/datagrid/tasks
 * Fetch tasks for DataGrid island
 */
router.get('/api/datagrid/tasks', async (req, res) => {
    try {
        const Record = await tenantCollection(req, "Record")
        const Entity = await tenantCollection(req, "Entity")
        const Classification = await tenantCollection(req, "Classification")
        const UserPreferences = await tenantCollection(req, "UserPreferences")

        // Find the Tâches entity
        const entity = await Entity.findOne({
            $or: [
                { slug: 'taches' },
                { slug: 'tache' },
                { name: { $regex: /tâche/i } }
            ]
        }).lean()

        if (!entity) {
            return res.status(404).json({ error: 'Tâches entity not found. Run: node scripts/seed-taches-entity.js ' + req.account_number })
        }

        // Get records
        const records = await Record.find({ entityId: entity._id }).lean()

        // Get classifications for label resolution
        const classificationIds = [
            entity.statusClassification,
            ...(entity.classifications || [])
        ].filter(Boolean)
        const classifications = await Classification.find({ _id: { $in: classificationIds } }).lean()
        const classMap = {}
        classifications.forEach(c => {
            classMap[c._id.toString()] = c
        })

        // Transform records into rows
        const rows = records.map(r => {
            // Resolve classification values
            const cvs = r.classificationValues || []
            let statusLabel = '', statusColor = '', priorityLabel = '', priorityColor = '', tags = [], listLabel = '', listColor = ''

            cvs.forEach(cv => {
                const cls = classMap[cv.classificationId]
                if (!cls) {
                    // Fallback: use cv.label if the classification is not in the entity's list
                    // This handles cases where records reference a different classification ID
                    if (cv.label && !statusLabel) statusLabel = cv.label
                    return
                }
                const opt = (cls.options || []).find(o => o._id.toString() === (cv.optionId?.toString() || cv.optionId))
                if (!opt) return
                // Match both old (tache_progression) and new (task_status) classification keys
                if (cls.key === 'tache_progression' || cls.key === 'task_status') {
                    statusLabel = opt.label
                    statusColor = opt.color
                } else if (cls.key === 'tache_priority' || cls.key === 'task_priority') {
                    priorityLabel = opt.label
                    priorityColor = opt.color
                } else if (cls.key === 'tache_tags' || cls.key === 'task_tags') {
                    tags.push({ label: opt.label, color: opt.color })
                } else if (cls.key === 'task_list') {
                    listLabel = opt.label
                    listColor = opt.color
                }
            })

            // Resolve custom fields
            const cfs = r.customFields || []
            const progressField = cfs.find(f => f.field_id?.toString() === '697e0020000000000000020b')
            const assigneeField = cfs.find(f => f.field_id?.toString() === '697e0020000000000000020c')

            return {
                _id: r._id.toString(),
                _icon: entity.icon || 'solar:checklist-minimalistic-bold-duotone',
                _color: statusColor || entity.color || '#4361ee',
                title: r.title || r.referenceTitle || '',
                status: statusLabel,
                statusColor,
                priority: priorityLabel,
                priorityColor,
                tags: tags.map(t => t.label).join(', '),
                progress: progressField?.value || 0,
                assignedTo: assigneeField?.value || '',
                dueDate: r.dueDate,
                description: r.description || '',
                list: listLabel,
                listColor,
                createdAt: r.createdAt
            }
        })

        const columns = [
            { id: 'title', name: 'Titre', sortable: true },
            { id: 'status', name: 'Statut', sortable: true, type: 'badge' },
            { id: 'priority', name: 'Priorité', sortable: true, type: 'badge' },
            { id: 'tags', name: 'Tags', sortable: false },
            { id: 'progress', name: 'Progression', sortable: true },
            { id: 'assignedTo', name: 'Assigné à', sortable: true },
            { id: 'dueDate', name: 'Échéance', sortable: true, type: 'date' },
            { id: 'createdAt', name: 'Créé le', sortable: true, type: 'date' },
            { id: 'actions', name: '', sortable: false }
        ]

        // Load user preferences
        let preferences = null
        if (req.user?._id) {
            const prefs = await UserPreferences.findOne({
                userId: req.user._id,
                viewId: 'tasks-list'
            }).lean()
            if (prefs) preferences = prefs.preferences
        }

        // Build filter groups from classifications
        const filterGroups = classifications.map(cls => {
            // Count records per option
            const optionCounts = {}
            records.forEach(r => {
                const cvs = r.classificationValues || []
                cvs.forEach(cv => {
                    if (cv.classificationId === cls._id.toString() || cv.classificationId?.toString() === cls._id.toString()) {
                        const key = cv.optionId?.toString()
                        if (key) optionCounts[key] = (optionCounts[key] || 0) + 1
                    }
                })
            })

            // Determine the row field this classification maps to
            let field = ''
            let type = 'list'
            // Support both old (tache_xxx) and new (task_xxx) classification key names
            if (cls.key === 'tache_progression' || cls.key === 'task_status') { field = 'status' }
            else if (cls.key === 'tache_priority' || cls.key === 'task_priority') { field = 'priority' }
            else if (cls.key === 'tache_tags' || cls.key === 'task_tags') { field = 'tags'; type = 'tags' }
            else if (cls.key === 'task_list') { field = 'list' }

            return {
                id: cls._id.toString(),
                name: cls.name || cls.key,
                field,
                type,
                options: (cls.options || []).map(opt => ({
                    id: opt._id.toString(),
                    label: opt.label,
                    color: opt.color || '#9ca3af',
                    count: optionCounts[opt._id.toString()] || 0
                }))
            }
        }).filter(f => f.field) // Only include filters that map to a row field

        // Deduplicate filter groups that map to the same field
        // Keep the one with more total option counts (more data)
        const deduped = []
        const seenFields = {}
        filterGroups.forEach(fg => {
            const totalCount = fg.options.reduce((sum, o) => sum + o.count, 0)
            if (!seenFields[fg.field]) {
                seenFields[fg.field] = { index: deduped.length, count: totalCount }
                deduped.push(fg)
            } else {
                // Replace if this one has more data
                if (totalCount > seenFields[fg.field].count) {
                    deduped[seenFields[fg.field].index] = fg
                    seenFields[fg.field].count = totalCount
                }
            }
        })
        const dedupedFilters = deduped

        res.json({
            rows,
            columns,
            defaultSort: { field: 'createdAt', direction: 'desc' },
            preferences,
            filters: dedupedFilters,
            entityId: entity._id.toString(),
            entitySlug: entity.slug
        })

    } catch (error) {
        console.error('[API] Tasks fetch error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * POST /account/:account_number/api/tasks/:taskId/toggle
 * Toggle a task's completion status (for the checklist view)
 * Switches between "Terminée" and "À faire" using the statusClassification
 */
router.post('/api/tasks/:taskId/toggle', async (req, res) => {
    try {
        const Record = await tenantCollection(req, "Record")
        const Entity = await tenantCollection(req, "Entity")
        const Classification = await tenantCollection(req, "Classification")

        const { taskId } = req.params
        const { status: newStatusLabel } = req.body

        // Find the Tâches entity to get the statusClassification
        const entity = await Entity.findOne({
            $or: [
                { slug: 'taches' },
                { slug: 'tache' },
                { name: { $regex: /tâche/i } }
            ]
        }).lean()

        if (!entity) return res.status(404).json({ error: 'Tâches entity not found' })

        // Find the status classification
        const statusCls = await Classification.findById(entity.statusClassification).lean()
        if (!statusCls) return res.status(404).json({ error: 'Status classification not found' })

        // Find the option matching the new status label
        const targetOption = statusCls.options.find(o => o.label === newStatusLabel)
        if (!targetOption) return res.status(400).json({ error: `Status option "${newStatusLabel}" not found` })

        // Update the record's classificationValues
        const record = await Record.findById(taskId)
        if (!record) return res.status(404).json({ error: 'Record not found' })

        // Remove old value for this classification, add new one
        const cvs = (record.classificationValues || []).filter(
            cv => cv.classificationId?.toString() !== statusCls._id.toString()
        )
        cvs.push({
            classificationId: statusCls._id.toString(),
            optionId: targetOption._id.toString()
        })
        record.classificationValues = cvs
        await record.save()

        res.json({ success: true, status: newStatusLabel })
    } catch (error) {
        console.error('[API] Task toggle error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * POST /account/:account_number/api/tasks/quick-create
 * Quick-create a task with minimal fields (title + list)
 */
router.post('/api/tasks/quick-create', async (req, res) => {
    try {
        const Record = await tenantCollection(req, "Record")
        const Entity = await tenantCollection(req, "Entity")
        const Classification = await tenantCollection(req, "Classification")

        const { title, listOptionId } = req.body
        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Title is required' })
        }

        // Find the Tâches entity
        const entity = await Entity.findOne({
            $or: [
                { slug: 'taches' },
                { slug: 'tache' },
                { name: { $regex: /tâche/i } }
            ]
        }).lean()
        if (!entity) return res.status(404).json({ error: 'Tâches entity not found' })

        // Get the status classification to set default "À faire"
        const statusCls = await Classification.findById(entity.statusClassification).lean()
        const defaultStatus = statusCls?.options?.find(o => o.label === 'À faire')

        // Build classification values
        const classificationValues = []
        if (defaultStatus) {
            classificationValues.push({
                classificationId: statusCls._id.toString(),
                optionId: defaultStatus._id.toString()
            })
        }

        // Add list assignment if provided
        if (listOptionId) {
            const listCls = await Classification.findOne({ key: 'task_list' }).lean()
            if (listCls) {
                classificationValues.push({
                    classificationId: listCls._id.toString(),
                    optionId: listOptionId
                })
            }
        }

        const record = new Record({
            entityId: entity._id,
            title: title.trim(),
            referenceTitle: title.trim(),
            classificationValues,
            customFields: [],
            createdBy: req.user?._id,
        })
        await record.save()

        // Return the created task as a row
        const statusLabel = defaultStatus?.label || 'À faire'
        const statusColor = defaultStatus?.color || '#9ca3af'

        // Resolve list label
        let listLabel = '', listColor = ''
        if (listOptionId) {
            const listCls = await Classification.findOne({ key: 'task_list' }).lean()
            if (listCls) {
                const listOpt = listCls.options?.find(o => o._id.toString() === listOptionId)
                if (listOpt) {
                    listLabel = listOpt.label
                    listColor = listOpt.color
                }
            }
        }

        res.json({
            success: true,
            task: {
                _id: record._id.toString(),
                _icon: entity.icon || 'solar:checklist-minimalistic-bold-duotone',
                _color: statusColor || entity.color || '#4361ee',
                title: record.title,
                status: statusLabel,
                statusColor,
                priority: '',
                priorityColor: '',
                tags: '',
                progress: 0,
                assignedTo: '',
                dueDate: null,
                description: '',
                list: listLabel,
                listColor,
                createdAt: record.createdAt
            }
        })
    } catch (error) {
        console.error('[API] Task quick-create error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * POST /account/:account_number/api/tasks/:taskId/toggle
 * Toggle a task between "À faire" and "Terminé" status
 */
router.post('/api/tasks/:taskId/toggle', async (req, res) => {
    try {
        const Record = await tenantCollection(req, "Record")
        const Entity = await tenantCollection(req, "Entity")
        const Classification = await tenantCollection(req, "Classification")

        const record = await Record.findById(req.params.taskId)
        if (!record) return res.status(404).json({ error: 'Task not found' })

        // Find the Tâches entity to get status classification
        const entity = await Entity.findOne({ _id: record.entityId }).lean()
        if (!entity) return res.status(404).json({ error: 'Entity not found' })

        const statusCls = await Classification.findById(entity.statusClassification).lean()
        if (!statusCls) return res.status(404).json({ error: 'Status classification not found' })

        // Determine current status
        const currentStatusVal = record.classificationValues?.find(
            cv => cv.classificationId?.toString() === statusCls._id.toString()
        )
        const currentOption = currentStatusVal
            ? statusCls.options?.find(o => o._id.toString() === currentStatusVal.optionId?.toString())
            : null
        const isCurrentlyDone = currentOption?.label === 'Terminé'

        // Find the target status option
        const targetLabel = isCurrentlyDone ? 'À faire' : 'Terminé'
        const targetOption = statusCls.options?.find(o => o.label === targetLabel)
        if (!targetOption) return res.status(400).json({ error: `Status "${targetLabel}" not found` })

        // Update classification values
        const newClassVals = (record.classificationValues || []).filter(
            cv => cv.classificationId?.toString() !== statusCls._id.toString()
        )
        newClassVals.push({
            classificationId: statusCls._id.toString(),
            optionId: targetOption._id.toString()
        })
        record.classificationValues = newClassVals
        await record.save()

        res.json({
            success: true,
            status: targetLabel,
            statusColor: targetOption.color || '#9ca3af'
        })
    } catch (error) {
        console.error('[API] Task toggle error:', error)
        res.status(500).json({ error: error.message })
    }
})

// ═══════════════════════════════════════════════════════════════
// RECORD TASKS — Per-record task lists & tasks (scoped to each record)
// ═══════════════════════════════════════════════════════════════
const ReminderService = require('../services/reminders/reminder.service')

const cleanTaskText = (value, fallback = '') => {
    if (typeof value !== 'string') return fallback
    const text = value.trim()
    if (!text) return fallback
    if (['false', 'null', 'undefined'].includes(text.toLowerCase())) return fallback
    return text
}

const sanitizeTaskDescriptionHtml = (value = '') => {
    if (typeof value !== 'string') return ''
    let html = value.trim()
    if (!html) return ''
    if (html.length > 30000) html = html.slice(0, 30000)
    return html
        .replace(/<\s*(script|style|iframe|object|embed|meta|link|form|button|textarea|select)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
        .replace(/<\s*(script|style|iframe|object|embed|meta|link|form|button|textarea|select)[^>]*\/?>/gi, '')
        .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .replace(/\s+style\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .replace(/\s+(href|src)\s*=\s*(['"]?)\s*(javascript:|vbscript:|data:text\/html)[^'"\s>]*\2/gi, '')
        .replace(/\s+src\s*=\s*(['"]?)\s*data:image\/svg\+xml[^'"\s>]*\1/gi, '')
}

const cleanTaskListLabel = (value) => {
    const label = cleanTaskText(value, 'À faire')
    const lower = label.toLowerCase()
    if (lower === 'général' || lower === 'tâches du jour' || lower === 'taches du jour') return 'À faire'
    return label
}

const defaultTaskStatuses = [
    { label: 'À faire',  color: '#9ca3af', order: 0 },
    { label: 'En cours', color: '#3b82f6', order: 1 },
    { label: 'En revue', color: '#f59e0b', order: 2 },
    { label: 'Terminé',  color: '#22c55e', order: 3 },
    { label: 'Bloqué',   color: '#ef4444', order: 4 },
]

const taskAttachmentUrl = (req, attachment = {}, { download = false } = {}) => {
    if (!attachment.filename) return ''
    const dl = download && attachment.originalName ? `?dl=${encodeURIComponent(attachment.originalName)}` : ''
    return `/account/${req.account_number}/uploads/attachments/${attachment.filename}${dl}`
}

const taskAttachmentPayload = (req, attachment = {}) => ({
    _id: attachment._id?.toString?.() || String(attachment._id || ''),
    filename: attachment.filename || '',
    originalName: attachment.originalName || attachment.filename || 'Fichier',
    mimeType: attachment.mimeType || '',
    size: Number(attachment.size || 0),
    uploadedAt: attachment.uploadedAt || null,
    uploadedBy: attachment.uploadedBy || null,
    url: taskAttachmentUrl(req, attachment),
    downloadUrl: taskAttachmentUrl(req, attachment, { download: true })
})

const serializeTaskComment = (req, comment = {}) => {
    const currentUserId = req.user?._id?.toString?.() || ''
    const userId = comment.userId?.toString?.() || String(comment.userId || '')
    const authorType = comment.authorType
        || (userId === 'dexio-ai' ? 'ai' : (comment.type === 'activity' ? 'system' : 'user'))
    const agent = comment.agent?.toObject ? comment.agent.toObject() : (comment.agent || {})
    return {
        _id: comment._id?.toString?.() || String(comment._id || ''),
        taskId: comment.taskId?.toString?.() || String(comment.taskId || ''),
        type: comment.type,
        text: comment.text,
        userId,
        userName: comment.userName,
        userAvatar: comment.userAvatar,
        authorType,
        audience: comment.audience || 'team',
        isAi: authorType === 'ai',
        metadata: comment.metadata || {},
        agent: {
            status: agent.status || '',
            action: agent.action || '',
            createdSubtasks: (agent.createdSubtasks || []).map(item => ({
                title: item.title || '',
                subtaskId: item.subtaskId || ''
            })),
            model: agent.model || '',
            errorCode: agent.errorCode || '',
            recordAgentConversationId: agent.recordAgentConversationId?.toString?.()
                || String(agent.recordAgentConversationId || ''),
            recordAgentRunId: agent.recordAgentRunId?.toString?.()
                || String(agent.recordAgentRunId || '')
        },
        attachments: (comment.attachments || []).map(att => taskAttachmentPayload(req, att)),
        publishedToChat: comment.publishedToChat || false,
        isMine: authorType === 'user' && !!currentUserId && userId === currentUserId,
        createdAt: comment.createdAt
    }
}

const normalizeTaskOptions = (options, fallback) => {
    const source = Array.isArray(options) && options.length > 0 ? options : fallback
    return source
        .map((item, index) => ({
            label: cleanTaskText(item?.label, ''),
            color: typeof item?.color === 'string' ? item.color : '',
            order: Number.isFinite(Number(item?.order)) ? Number(item.order) : index
        }))
        .filter(item => item.label)
        .sort((a, b) => a.order - b.order)
}

const getListStatuses = (list) => normalizeTaskOptions(list?.statuses, defaultTaskStatuses)
const optionColor = (options, label, fallback = '#9ca3af') => {
    const cleanLabel = cleanTaskText(label, '')
    const found = (options || []).find(item => item.label === cleanLabel)
    return found?.color || fallback
}

const taskReminderError = (res, error) => {
    if (!error?.status) return false
    res.status(error.status).json({
        error: error.message,
        code: error.code || 'REMINDER_ERROR'
    })
    return true
}

const taskResolveTimeZone = (value) => {
    const fallback = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    const zone = cleanTaskText(value, '')
    if (!zone) return fallback
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: zone }).format(new Date())
        return zone
    } catch (_) {
        return fallback
    }
}

const taskFormatReminderTime = (date, timeZone) => {
    try {
        return new Intl.DateTimeFormat('fr-FR', {
            timeZone: taskResolveTimeZone(timeZone),
            hour: '2-digit',
            minute: '2-digit'
        }).format(date instanceof Date ? date : new Date(date))
    } catch (_) {
        return ''
    }
}

const taskReminderMessage = (task, scheduledAt, timeZone) => {
    const time = taskFormatReminderTime(scheduledAt, timeZone)
    return time ? `Rappel a ${time}` : `Rappel pour ${cleanTaskText(task?.title, 'cette tache')}`
}

async function cancelRecordTaskReminder(req, task, slotKey = 'default') {
    return ReminderService.cancelReminderForTarget({
        accountNumber: req.account_number,
        userId: req.user._id,
        targetType: 'task',
        targetId: task._id,
        slotKey,
    })
}

async function upsertRecordTaskReminder(req, task, reminderInput) {
    if (!reminderInput) return null
    if (reminderInput.enabled === false) {
        await cancelRecordTaskReminder(req, task, reminderInput.slotKey || 'default')
        return null
    }

    return ReminderService.upsertReminder({
        accountNumber: req.account_number,
        userId: req.user._id,
        targetType: 'task',
        targetModel: 'RecordTask',
        targetId: task._id,
        slotKey: reminderInput.slotKey || 'default',
        title: reminderInput.title || task.title,
        message: reminderInput.message || taskReminderMessage(task, reminderInput.scheduledAt, reminderInput.timeZone),
        scheduledAt: reminderInput.scheduledAt,
        timeZone: reminderInput.timeZone,
        channel: reminderInput.channel || 'local',
        metadata: {
            ...(reminderInput.metadata || {}),
            taskTitle: task.title,
            source: 'node',
        },
    })
}

async function findRecordTaskReminder(req, task) {
    return ReminderService.findReminderForTarget({
        accountNumber: req.account_number,
        userId: req.user._id,
        targetType: 'task',
        targetId: task._id,
    })
}

const cleanTaskOptionPayload = (options, fallback, fallbackColor) => {
    const cleaned = (Array.isArray(options) ? options : [])
        .map((item, index) => ({
            label: cleanTaskText(item?.label, ''),
            color: typeof item?.color === 'string' && item.color ? item.color : fallbackColor,
            order: Number.isFinite(Number(item?.order)) ? Number(item.order) : index
        }))
        .filter(item => item.label)

    return cleaned.length ? cleaned : fallback
}

const syncTaskOptions = async ({ req, listId, kind, previousOptions, nextOptions, renames = [] }) => {
    const { RecordTask } = await taskTenantModels(req)
    const field = kind === 'priority' ? 'priority' : 'status'
    const colorField = kind === 'priority' ? 'priorityColor' : 'statusColor'
    const fallback = nextOptions[0] || (kind === 'priority' ? defaultTaskPriorities[0] : defaultTaskStatuses[0])
    const nextLabels = new Set(nextOptions.map(item => item.label))
    const renamePairs = (Array.isArray(renames) ? renames : [])
        .map(item => ({
            from: cleanTaskText(item?.from, ''),
            to: cleanTaskText(item?.to, '')
        }))
        .filter(item => item.from && item.to && item.from !== item.to)

    for (const option of nextOptions) {
        await RecordTask.updateMany(
            { taskListId: listId, [field]: option.label },
            { $set: { [colorField]: option.color || '' } }
        )
    }

    for (const pair of renamePairs) {
        const next = nextOptions.find(item => item.label === pair.to)
        if (!next) continue
        await RecordTask.updateMany(
            { taskListId: listId, [field]: pair.from },
            { $set: { [field]: next.label, [colorField]: next.color || '' } }
        )
    }

    const renamedFrom = new Set(renamePairs.map(item => item.from))
    const removedLabels = (previousOptions || [])
        .map(item => item?.label)
        .filter(label => label && !nextLabels.has(label) && !renamedFrom.has(label))

    if (removedLabels.length) {
        await RecordTask.updateMany(
            { taskListId: listId, [field]: { $in: removedLabels } },
            { $set: { [field]: fallback.label, [colorField]: fallback.color || '' } }
        )
    }
}

const serializeRecordTask = (req, task, list = null, extra = {}) => {
    const taskList = list || {}
    const statuses = getListStatuses(taskList)
    const priorities = normalizeTaskPriorityOptions(extra.priorities || taskList.priorities, defaultTaskPriorities)
    const tagOptions = TaskListsService.normalizeTaskTagOptions(extra.accountTags || taskList.tags)
    const status = cleanTaskText(task.status, 'À faire')
    const priority = priorityLabelFor(task.priority, priorities)
    return {
        _id: task._id?.toString?.() || String(task._id || ''),
        title: cleanTaskText(task.title, 'Sans titre'),
        description: task.description || '',
        status,
        statusColor: task.statusColor || optionColor(statuses, status, '#9ca3af'),
        priority,
        priorityColor: priorityColorFor(priority, priorities, task.priorityColor || ''),
        tags: TaskListsService.normalizeTaskTags(task.tags, tagOptions),
        tagOptions,
        subtasks: TaskListsService.normalizeTaskSubtasks(task.subtasks),
        isDayPriority: !!task.isDayPriority,
        taskListId: task.taskListId?.toString?.() || String(task.taskListId || taskList._id || ''),
        startDate: task.startDate || null,
        dueDate: task.dueDate || null,
        assignedTo: task.assignedTo || '',
        order: Number.isFinite(Number(task.order)) ? Number(task.order) : 0,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completedAt: task.completedAt || null,
        attachments: (task.attachments || []).map(att => taskAttachmentPayload(req, att)),
        listLabel: taskList.label ? cleanTaskListLabel(taskList.label) : extra.listLabel,
        listColor: taskList.color || extra.listColor,
        listIcon: taskList.icon || extra.listIcon,
        statuses,
        priorities,
        ...extra
    }
}

const taskAttachmentForbiddenExts = new Set([
    '.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.msi', '.msp', '.mst',
    '.js', '.jse', '.vbs', '.vbe', '.wsf', '.wsh', '.ps1', '.psm1', '.psd1',
    '.php', '.php3', '.php4', '.php5', '.phtml', '.py', '.rb', '.pl', '.cgi',
    '.asp', '.aspx', '.jsp', '.jar', '.war', '.class', '.sh', '.bash',
    '.zsh', '.ksh', '.dll', '.so', '.dylib', '.hta', '.inf', '.reg',
    '.url', '.lnk', '.app', '.command'
])

const taskAttachmentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.round(Math.random() * 1E9)}`
        const taskIdSegment = /^[a-f\d]{24}$/i.test(String(req.params.taskId || ''))
            ? String(req.params.taskId)
            : 'unknown-task'
        const dir = path.join(
            __dirname,
            '../private_uploads/attachments',
            String(req.account_number),
            'tasks',
            taskIdSegment,
            uploadId
        )
        fs.mkdirSync(dir, { recursive: true })
        cb(null, dir)
    },
    filename: (req, file, cb) => {
        file.originalname = sanitizeUploadedFilename(file.originalname, 'fichier')
        cb(null, file.originalname)
    }
})

const taskAttachmentUpload = multer({
    storage: taskAttachmentStorage,
    limits: { fileSize: 50 * 1024 * 1024, files: 10 },
    fileFilter: (req, file, cb) => {
        file.originalname = sanitizeUploadedFilename(file.originalname, 'fichier')
        const ext = path.extname(file.originalname).toLowerCase()
        if (taskAttachmentForbiddenExts.has(ext)) {
            return cb(new Error(`Extension de fichier interdite: ${ext}`), false)
        }
        const parts = file.originalname.split('.')
        if (parts.length > 2 && parts.slice(1).some(part => taskAttachmentForbiddenExts.has('.' + part.toLowerCase()))) {
            return cb(new Error(`Extension cachée détectée: ${file.originalname}`), false)
        }
        cb(null, true)
    }
})

const taskAttachmentRelativePath = (req, filePath) => {
    const base = path.resolve(__dirname, '../private_uploads/attachments', String(req.account_number))
    const absolute = path.resolve(filePath)
    if (!absolute.startsWith(base + path.sep)) return ''
    return path.relative(base, absolute).split(path.sep).join('/')
}

const removeTaskAttachmentFile = (req, filename) => {
    if (!filename || String(filename).includes('..')) return
    const base = path.resolve(__dirname, '../private_uploads/attachments', String(req.account_number))
    const target = path.resolve(base, filename)
    if (!target.startsWith(base + path.sep)) return
    if (fs.existsSync(target)) {
        fs.rmSync(target, { force: true })
        const parent = path.dirname(target)
        try {
            if (parent.startsWith(base + path.sep) && fs.existsSync(parent) && fs.readdirSync(parent).length === 0) {
                fs.rmdirSync(parent)
            }
        } catch (error) {
            console.warn('[API] Task attachment cleanup skipped:', error.message)
        }
    }
}

/**
 * GET /account/:account_number/api/record/:recordId/task-lists
 * Get all task lists for a specific record with task counts
 */
router.get('/api/record/:recordId/task-lists', async (req, res) => {
    try {
        const { TaskList, RecordTask } = await taskTenantModels(req)
        const accountPriorities = await getAccountTaskPriorities(req)
        const accountTags = await TaskListsService.getAccountTaskTags(req)
        const lists = await TaskList.find({ recordId: req.params.recordId }).sort({ order: 1, createdAt: 1 }).lean()
        const tasks = await RecordTask.find({ recordId: req.params.recordId })
            .sort({ order: 1, createdAt: -1 })
            .lean()
        const taskPreviewLimit = 10
        const dayKey = value => {
            if (!value) return ''
            const date = new Date(value)
            if (Number.isNaN(date.getTime())) return ''
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        }
        const today = new Date()
        today.setHours(12, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const focusDayKeys = new Set([dayKey(today), dayKey(tomorrow)])
        const isFocusDayTask = task => {
            if (!task) return false
            if (task.isDayPriority) return true
            if (focusDayKeys.has(dayKey(task.dueDate)) || focusDayKeys.has(dayKey(task.startDate))) return true
            if (task.status === 'Terminé' && focusDayKeys.has(dayKey(task.completedAt || task.updatedAt))) return true
            return false
        }

        const result = lists.map(l => {
            const listTasks = tasks.filter(t => t.taskListId.toString() === l._id.toString())
            // Sort: active first (by createdAt desc), then done
            const sorted = listTasks.sort((a, b) => {
                // Sort by explicit order if set, otherwise by status then date
                if (a.order != null && b.order != null) return a.order - b.order
                const aD = a.status === 'Terminé' ? 1 : 0
                const bD = b.status === 'Terminé' ? 1 : 0
                if (aD !== bD) return aD - bD
                return new Date(b.createdAt) - new Date(a.createdAt)
            })
            const previewTasks = sorted.slice(0, taskPreviewLimit)
            const focusDayTasks = sorted.filter(isFocusDayTask)
            const listStatuses = getListStatuses(l)
            const listPriorities = accountPriorities
            const listTags = TaskListsService.normalizeTaskTagOptions(l.tags)
            return {
                _id: l._id.toString(),
                label: cleanTaskListLabel(l.label),
                rawLabel: l.label || '',
                color: l.color || '#6366f1',
                icon: l.icon || 'solar:checklist-bold-duotone',
                order: Number(l.order) || 0,
                contextType: l.contextType || 'record',
                isDefault: !!l.isDefault,
                showInMyLists: !!l.showInMyLists,
                myListOrder: Number(l.myListOrder) || 0,
                viewMode: l.viewMode || 'kanban',
                statuses: listStatuses,
                priorities: listPriorities,
                tags: listTags,
                displayOptions: TaskListsService.normalizeTaskListDisplayOptions(l.displayOptions),
                count: listTasks.length,
                doneCount: listTasks.filter(t => t.status === 'Terminé').length,
                tasksLimit: taskPreviewLimit,
                tasksLoadedCount: previewTasks.length,
                hasMoreTasks: sorted.length > previewTasks.length,
                remainingTasks: Math.max(0, sorted.length - previewTasks.length),
                tasks: previewTasks.map(t => serializeRecordTask(req, t, l, { priorities: accountPriorities, accountTags })),
                dayTasks: focusDayTasks.map(t => serializeRecordTask(req, t, l, { priorities: accountPriorities, accountTags }))
            }
        })

        res.json({ success: true, lists: result, priorities: accountPriorities })
    } catch (error) {
        console.error('[API] Task lists error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * PUT /account/:account_number/api/task-lists/:listId/view-mode
 * Update the view mode (list/kanban) for a task list
 */
router.put('/api/task-lists/:listId/view-mode', async (req, res) => {
    try {
        const { TaskList, RecordTask } = await taskTenantModels(req)
        const { viewMode } = req.body
        if (!['list', 'kanban'].includes(viewMode)) {
            return res.status(400).json({ error: 'Invalid viewMode, must be list or kanban' })
        }
        await TaskList.findByIdAndUpdate(req.params.listId, { viewMode })
        res.json({ success: true })
    } catch (error) {
        console.error('[API] Update view mode error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * PUT /account/:account_number/api/task-lists/:listId/statuses
 * Update the custom statuses for a task list (add, reorder, rename, recolor)
 */
router.put('/api/task-lists/:listId/statuses', async (req, res) => {
    try {
        const { TaskList } = await taskTenantModels(req)
        const { statuses, renames } = req.body
        if (!Array.isArray(statuses) || statuses.length === 0) {
            return res.status(400).json({ error: 'At least one status is required' })
        }
        const list = await TaskList.findById(req.params.listId).lean()
        if (!list) return res.status(404).json({ error: 'List not found' })
        const previous = getListStatuses(list)
        const cleaned = cleanTaskOptionPayload(statuses, defaultTaskStatuses, '#9ca3af')
        if (cleaned.length === 0) {
            return res.status(400).json({ error: 'At least one valid status is required' })
        }
        await TaskList.findByIdAndUpdate(req.params.listId, { statuses: cleaned })
        await syncTaskOptions({
            req,
            listId: req.params.listId,
            kind: 'status',
            previousOptions: previous,
            nextOptions: cleaned,
            renames
        })
        res.json({ success: true, statuses: cleaned })
    } catch (error) {
        console.error('[API] Update statuses error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * PUT /account/:account_number/api/task-lists/:listId/priorities
 * Update the custom priorities for a task list.
 */
router.put('/api/task-lists/:listId/priorities', async (req, res) => {
    try {
        const { priorities, renames } = req.body
        if (!Array.isArray(priorities) || priorities.length === 0) {
            return res.status(400).json({ error: 'At least one priority is required' })
        }
        const cleaned = await saveAccountTaskPriorities(req, priorities, { renames })
        res.json({ success: true, priorities: cleaned })
    } catch (error) {
        console.error('[API] Update priorities error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * PUT /account/:account_number/api/task-lists/:listId/tags
 * Update the list-specific task tags.
 */
router.put('/api/task-lists/:listId/tags', async (req, res) => {
    try {
        const { tags, renames } = req.body
        if (!Array.isArray(tags)) {
            return res.status(400).json({ error: 'Tags array required' })
        }
        const cleaned = await TaskListsService.updateTaskListTags(req, req.params.listId, { tags, renames })
        if (!cleaned) return res.status(404).json({ error: 'List not found' })
        res.json({ success: true, tags: cleaned })
    } catch (error) {
        console.error('[API] Update tags error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * GET /account/:account_number/api/task-tags
 * Fetch account-wide task tags.
 */
router.get('/api/task-tags', async (req, res) => {
    try {
        const tags = await TaskListsService.getAccountTaskTags(req)
        res.json({ success: true, tags })
    } catch (error) {
        console.error('[API] Task tags error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * PUT /account/:account_number/api/task-tags
 * Replace account-wide task tags and sync existing tasks.
 */
router.put('/api/task-tags', async (req, res) => {
    try {
        const { tags, renames } = req.body
        if (!Array.isArray(tags)) {
            return res.status(400).json({ error: 'Tags array required' })
        }
        const cleaned = await TaskListsService.replaceAccountTaskTags(req, { tags, renames })
        res.json({ success: true, tags: cleaned })
    } catch (error) {
        console.error('[API] Update task tags error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * GET /account/:account_number/api/task-priorities
 * Fetch the account-wide task priorities shared by web and mobile.
 */
router.get('/api/task-priorities', async (req, res) => {
    try {
        const priorities = await getAccountTaskPriorities(req)
        res.json({ success: true, priorities })
    } catch (error) {
        console.error('[API] Task priorities error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * PUT /account/:account_number/api/task-priorities
 * Update account-wide task priorities.
 */
router.put('/api/task-priorities', async (req, res) => {
    try {
        const { priorities, renames } = req.body
        if (!Array.isArray(priorities) || priorities.length === 0) {
            return res.status(400).json({ error: 'At least one priority is required' })
        }
        const cleaned = await saveAccountTaskPriorities(req, priorities, { renames })
        res.json({ success: true, priorities: cleaned })
    } catch (error) {
        console.error('[API] Update task priorities error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * GET /account/:account_number/api/task-lists/:listId/options
 * Fetch the reusable status and priority options for a task list.
 */
router.get('/api/task-lists/:listId/options', async (req, res) => {
    try {
        const { TaskList } = await taskTenantModels(req)
        const list = await TaskList.findById(req.params.listId).lean()
        if (!list) return res.status(404).json({ error: 'List not found' })
        const priorities = await getAccountTaskPriorities(req)
        res.json({
            success: true,
            statuses: getListStatuses(list),
            priorities,
            tags: TaskListsService.normalizeTaskTagOptions(list.tags)
        })
    } catch (error) {
        console.error('[API] Task list options error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * GET /account/:account_number/api/task-lists/my-lists
 * Fetch task lists shown in the account-level "Mes listes" surface.
 */
router.get('/api/task-lists/my-lists', async (req, res) => {
    try {
        const lists = await TaskListsService.listMyTaskLists(req)
        res.json({ success: true, lists })
    } catch (error) {
        console.error('[API] My task lists error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * POST /account/:account_number/api/task-lists
 * Create an account-level list visible in "Mes listes".
 */
router.post('/api/task-lists', async (req, res) => {
    try {
        const list = await TaskListsService.createAccountTaskList(req, req.body || {})
        res.status(201).json({ success: true, list })
    } catch (error) {
        console.error('[API] Create account task list error:', error)
        res.status(error.status || 500).json({ error: error.message })
    }
})

/**
 * PUT /account/:account_number/api/task-lists/:listId/my-lists
 * Add/remove any account or record task list from "Mes listes".
 */
router.put('/api/task-lists/:listId/my-lists', async (req, res) => {
    try {
        const enabled = req.body?.enabled !== false && req.body?.showInMyLists !== false
        const list = await TaskListsService.setMyListVisibility(req, req.params.listId, enabled)
        if (!list) return res.status(404).json({ error: 'List not found' })
        res.json({ success: true, list })
    } catch (error) {
        console.error('[API] Toggle my list error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * POST /account/:account_number/api/record/:recordId/task-lists
 * Create a new task list for a specific record
 */
router.post('/api/record/:recordId/task-lists', async (req, res) => {
    try {
        const { TaskList } = await taskTenantModels(req)
        const { label, color, icon } = req.body
        const cleanLabel = cleanTaskText(label)
        if (!cleanLabel) return res.status(400).json({ error: 'Label required' })
        const accountPriorities = await getAccountTaskPriorities(req)

        const maxOrder = await TaskList.findOne({ recordId: req.params.recordId }).sort({ order: -1 }).lean()
        const isFirstList = !maxOrder
        const existingLists = await TaskList.find({ recordId: req.params.recordId }).sort({ order: 1, createdAt: 1 })
        const duplicate = existingLists.find(l => cleanTaskListLabel(l.label).toLowerCase() === cleanLabel.toLowerCase())
        if (duplicate) {
            if (req.body?.isDefault === true && !duplicate.isDefault) {
                await TaskList.updateMany({ recordId: req.params.recordId, _id: { $ne: duplicate._id } }, { $set: { isDefault: false } })
                duplicate.isDefault = true
                await duplicate.save()
            }
            const duplicateTasks = await RecordTask.find({ taskListId: duplicate._id }).select('status').lean()
            return res.json({
                success: true,
                list: {
                    _id: duplicate._id.toString(),
                    label: duplicate.label,
                    color: duplicate.color || '#6366f1',
                    icon: duplicate.icon || 'solar:checklist-bold-duotone',
                    order: Number(duplicate.order) || 0,
                    contextType: duplicate.contextType || 'record',
                    isDefault: !!duplicate.isDefault,
                    showInMyLists: !!duplicate.showInMyLists,
                    myListOrder: Number(duplicate.myListOrder) || 0,
                    statuses: getListStatuses(duplicate),
                    priorities: Array.isArray(duplicate.priorities) && duplicate.priorities.length ? duplicate.priorities : accountPriorities,
                    tags: TaskListsService.normalizeTaskTagOptions(duplicate.tags),
                    displayOptions: TaskListsService.normalizeTaskListDisplayOptions(duplicate.displayOptions),
                    count: duplicateTasks.length,
                    doneCount: duplicateTasks.filter(t => t.status === 'Terminé').length
                }
            })
        }
        const list = await TaskList.create({
            recordId: req.params.recordId,
            label: cleanLabel,
            color: color || '#6366f1',
            icon: icon || 'solar:checklist-bold-duotone',
            order: (maxOrder?.order || 0) + 1,
            contextType: 'record',
            isDefault: req.body?.isDefault === true || isFirstList,
            showInMyLists: req.body?.showInMyLists === true,
            myListOrder: req.body?.showInMyLists === true ? ((maxOrder?.order || 0) + 1) : 0,
            priorities: accountPriorities
        })
        if (list.isDefault) {
            await TaskList.updateMany({ recordId: req.params.recordId, _id: { $ne: list._id } }, { $set: { isDefault: false } })
        }

        res.json({
            success: true,
            list: {
                _id: list._id.toString(),
                label: list.label,
                color: list.color,
                icon: list.icon || 'solar:checklist-bold-duotone',
                order: Number(list.order) || 0,
                contextType: list.contextType || 'record',
                isDefault: !!list.isDefault,
                showInMyLists: !!list.showInMyLists,
                myListOrder: Number(list.myListOrder) || 0,
                statuses: getListStatuses(list),
                priorities: accountPriorities,
                tags: [],
                displayOptions: TaskListsService.normalizeTaskListDisplayOptions(list.displayOptions),
                count: 0,
                doneCount: 0
            }
        })
    } catch (error) {
        console.error('[API] Create task list error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * POST /account/:account_number/api/record/:recordId/task-lists/reorder
 * Reorder task lists for a specific record
 */
router.post('/api/record/:recordId/task-lists/reorder', async (req, res) => {
    try {
        const { TaskList } = await taskTenantModels(req)
        const { listIds } = req.body
        if (!Array.isArray(listIds)) return res.status(400).json({ error: 'listIds array required' })

        const bulkOps = listIds
            .filter(Boolean)
            .map((id, index) => ({
                updateOne: {
                    filter: { _id: id, recordId: req.params.recordId },
                    update: { $set: { order: index } }
                }
            }))
        if (bulkOps.length > 0) await TaskList.bulkWrite(bulkOps)

        res.json({ success: true })
    } catch (error) {
        console.error('[API] Reorder task lists error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * PUT /account/:account_number/api/task-lists/:listId
 * Update task list configuration.
 */
router.put('/api/task-lists/:listId', async (req, res) => {
    try {
        const list = await TaskListsService.updateTaskListConfig(req, req.params.listId, req.body || {})
        if (!list) return res.status(404).json({ error: 'List not found' })

        res.json({ success: true, list, label: list.label })
    } catch (error) {
        console.error('[API] Update task list error:', error)
        res.status(error.status || 500).json({ error: error.message })
    }
})

/**
 * PUT /account/:account_number/api/task-lists/:listId/color
 * Change a task list color
 */
router.put('/api/task-lists/:listId/color', async (req, res) => {
    try {
        const { TaskList } = await taskTenantModels(req)
        const { color } = req.body
        if (!color) return res.status(400).json({ error: 'Color required' })

        const list = await TaskList.findByIdAndUpdate(req.params.listId, { color }, { new: true })
        if (!list) return res.status(404).json({ error: 'List not found' })

        res.json({ success: true, color: list.color })
    } catch (error) {
        console.error('[API] Change list color error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * DELETE /account/:account_number/api/task-lists/:listId
 * Delete a task list and all its tasks
 */
router.delete('/api/task-lists/:listId', async (req, res) => {
    try {
        const { TaskList, RecordTask, TaskComment } = await taskTenantModels(req)
        const list = await TaskList.findByIdAndDelete(req.params.listId)
        if (!list) return res.status(404).json({ error: 'List not found' })

        // Also delete all tasks in this list and their uploaded files
        const tasks = await RecordTask.find({ taskListId: req.params.listId }).select('attachments').lean()
        const taskIds = tasks.map(task => task._id)
        const comments = taskIds.length
            ? await TaskComment.find({ taskId: { $in: taskIds } }).select('attachments').lean()
            : []
        tasks.forEach(task => {
            ;(task.attachments || []).forEach(att => removeTaskAttachmentFile(req, att.filename))
        })
        comments.forEach(comment => {
            ;(comment.attachments || []).forEach(att => removeTaskAttachmentFile(req, att.filename))
        })
        await Promise.all(tasks.map(task => cancelRecordTaskReminder(req, task)))
        await RecordTask.deleteMany({ taskListId: req.params.listId })
        if (taskIds.length) await TaskComment.deleteMany({ taskId: { $in: taskIds } })

        res.json({ success: true })
    } catch (error) {
        console.error('[API] Delete task list error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * GET /account/:account_number/api/task-lists/:listId/tasks
 * Get all tasks for a specific list
 */
router.get('/api/task-lists/:listId/tasks', async (req, res) => {
    try {
        const { TaskList, RecordTask } = await taskTenantModels(req)
        const accountPriorities = await getAccountTaskPriorities(req)
        const accountTags = await TaskListsService.getAccountTaskTags(req)
        const list = await TaskList.findById(req.params.listId).lean()
        let tasks = await RecordTask.find({ taskListId: req.params.listId }).sort({ order: 1, createdAt: -1 }).lean()
        if (String(req.query.scope || '') === 'day') {
            const dayKey = value => {
                if (!value) return ''
                const date = new Date(value)
                if (Number.isNaN(date.getTime())) return ''
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
            }
            const today = new Date()
            today.setHours(12, 0, 0, 0)
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)
            const focusDayKeys = new Set([dayKey(today), dayKey(tomorrow)])
            tasks = tasks.filter(task => {
                if (!task) return false
                if (task.isDayPriority) return true
                if (focusDayKeys.has(dayKey(task.dueDate)) || focusDayKeys.has(dayKey(task.startDate))) return true
                if (task.status === 'Terminé' && focusDayKeys.has(dayKey(task.completedAt || task.updatedAt))) return true
                return false
            })
        }
        const reminderMap = await ReminderService.scheduledReminderMap({
            accountNumber: req.account_number,
            userId: req.user._id,
            targetType: 'task',
            targetIds: tasks.map(task => task._id),
        })
        res.json({
            success: true,
            tasks: tasks.map(t => serializeRecordTask(req, t, list, {
                priorities: accountPriorities,
                accountTags,
                reminder: ReminderService.serializeReminder(reminderMap.get(t._id?.toString?.() || ''))
            }))
        })
    } catch (error) {
        console.error('[API] Get tasks error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * POST /account/:account_number/api/task-lists/:listId/tasks
 * Create a new task in a specific list
 */
router.post('/api/task-lists/:listId/tasks', async (req, res) => {
    try {
        const { TaskList, RecordTask } = await taskTenantModels(req)
        const { title, description, priority, startDate, dueDate, assignedTo, status, isDayPriority } = req.body
        const cleanTitle = cleanTaskText(title)
        if (!cleanTitle) return res.status(400).json({ error: 'Title required' })
        const reminderInput = ReminderService.reminderPayloadFromBody(req.body)

        const list = await TaskList.findById(req.params.listId).lean()
        if (!list) return res.status(404).json({ error: 'List not found' })

        const listStatuses = getListStatuses(list)
        const accountPriorities = await getAccountTaskPriorities(req)
        const accountTags = await TaskListsService.upsertAccountTaskTags(req, req.body?.tags)
        const taskStatus = cleanTaskText(status, 'À faire')
        const taskPriorityOption = priorityOptionFor(priority, accountPriorities)
        const order = await TaskListsService.nextTaskOrder(RecordTask, req.params.listId)

        const task = await RecordTask.create({
            taskListId: req.params.listId,
            recordId: list.recordId,
            title: cleanTitle,
            description: sanitizeTaskDescriptionHtml(description || ''),
            status: taskStatus,
            statusColor: optionColor(listStatuses, taskStatus, '#9ca3af'),
            priority: taskPriorityOption.label,
            priorityColor: taskPriorityOption.color || '',
            tags: TaskListsService.normalizeTaskTags(req.body?.tags, accountTags),
            subtasks: TaskListsService.normalizeTaskSubtasks(req.body?.subtasks),
            isDayPriority: !!isDayPriority,
            startDate: startDate || null,
            dueDate: dueDate || null,
            assignedTo: assignedTo || '',
            order
        })
        const reminder = reminderInput
            ? await upsertRecordTaskReminder(req, task, reminderInput)
            : null

        res.json({
            success: true,
            task: serializeRecordTask(req, task, list, {
                priorities: accountPriorities,
                accountTags,
                reminder: ReminderService.serializeReminder(reminder)
            })
        })
    } catch (error) {
        if (taskReminderError(res, error)) return
        console.error('[API] Create task error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * PUT /account/:account_number/api/record-tasks/:taskId/rename
 * Rename a task
 */
router.put('/api/record-tasks/:taskId/rename', async (req, res) => {
    try {
        const { RecordTask } = await taskTenantModels(req)
        const { title } = req.body
        const cleanTitle = cleanTaskText(title)
        if (!cleanTitle) return res.status(400).json({ error: 'Title required' })

        const task = await RecordTask.findByIdAndUpdate(req.params.taskId, { title: cleanTitle }, { new: true })
        if (!task) return res.status(404).json({ error: 'Task not found' })

        res.json({ success: true, title: cleanTaskText(task.title, 'Sans titre') })
    } catch (error) {
        console.error('[API] Rename task error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * POST /account/:account_number/api/record-tasks/:taskId/status
 * Update task status
 */
router.post('/api/record-tasks/:taskId/status', async (req, res) => {
    try {
        const { TaskList, RecordTask } = await taskTenantModels(req)
        const { status } = req.body
        const oldTask = await RecordTask.findById(req.params.taskId).lean()
        if (!oldTask) return res.status(404).json({ error: 'Task not found' })
        const list = await TaskList.findById(oldTask.taskListId).lean()
        const accountPriorities = await getAccountTaskPriorities(req)
        const statusColor = optionColor(getListStatuses(list), status, '#9ca3af')
        const completedAt = cleanTaskText(status, '').toLowerCase().includes('termin') ? new Date() : null
        const task = await RecordTask.findByIdAndUpdate(req.params.taskId, { status, statusColor, completedAt }, { new: true })
        const reminder = completedAt
            ? null
            : await findRecordTaskReminder(req, task)
        if (completedAt) await cancelRecordTaskReminder(req, task)

        res.json({
            success: true,
            status: task.status,
            statusColor: task.statusColor,
            completedAt: task.completedAt || null,
            task: serializeRecordTask(req, task, list, {
                priorities: accountPriorities,
                reminder: ReminderService.serializeReminder(reminder)
            })
        })
    } catch (error) {
        if (taskReminderError(res, error)) return
        console.error('[API] Task status error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * POST /account/:account_number/api/record-tasks/:taskId/attachments
 * Add one or more files to a task.
 */
router.post('/api/record-tasks/:taskId/attachments', (req, res, next) => {
    taskAttachmentUpload.array('files', 10)(req, res, (err) => {
        if (err) return res.status(400).json({ success: false, error: err.message })
        next()
    })
}, async (req, res) => {
    try {
        const { TaskList, RecordTask } = await taskTenantModels(req)
        const task = await RecordTask.findById(req.params.taskId)
        if (!task) {
            ;(req.files || []).forEach(file => removeTaskAttachmentFile(req, taskAttachmentRelativePath(req, file.path)))
            return res.status(404).json({ success: false, error: 'Task not found' })
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: 'Aucun fichier fourni' })
        }

        const newAttachments = req.files
            .map(file => ({
                filename: taskAttachmentRelativePath(req, file.path),
                originalName: file.originalname || file.filename,
                mimeType: file.mimetype || '',
                size: file.size || 0,
                uploadedAt: new Date(),
                uploadedBy: req.user?._id
            }))
            .filter(file => file.filename)

        if (!newAttachments.length) return res.status(400).json({ success: false, error: 'Fichier invalide' })

        task.attachments = task.attachments || []
        task.attachments.push(...newAttachments)
        await task.save()

        const list = task.taskListId ? await TaskList.findById(task.taskListId).lean() : null
        const accountPriorities = await getAccountTaskPriorities(req)
        const reminder = await findRecordTaskReminder(req, task)
        res.json({
            success: true,
            task: serializeRecordTask(req, task, list, {
                priorities: accountPriorities,
                reminder: ReminderService.serializeReminder(reminder)
            }),
            attachments: (task.attachments || []).map(att => taskAttachmentPayload(req, att))
        })
    } catch (error) {
        console.error('[API] Task attachment upload error:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

/**
 * DELETE /account/:account_number/api/record-tasks/:taskId/attachments/:attachmentId
 * Remove a file from a task.
 */
router.delete('/api/record-tasks/:taskId/attachments/:attachmentId', async (req, res) => {
    try {
        const { TaskList, RecordTask } = await taskTenantModels(req)
        const task = await RecordTask.findById(req.params.taskId)
        if (!task) return res.status(404).json({ success: false, error: 'Task not found' })

        const attachment = typeof task.attachments?.id === 'function'
            ? task.attachments.id(req.params.attachmentId)
            : (task.attachments || []).find(att => String(att._id) === String(req.params.attachmentId))
        if (!attachment) return res.status(404).json({ success: false, error: 'Pièce jointe introuvable' })

        const filename = attachment.filename
        if (typeof attachment.deleteOne === 'function') attachment.deleteOne()
        else task.attachments = (task.attachments || []).filter(att => String(att._id) !== String(req.params.attachmentId))
        await task.save()
        removeTaskAttachmentFile(req, filename)

        const list = task.taskListId ? await TaskList.findById(task.taskListId).lean() : null
        const accountPriorities = await getAccountTaskPriorities(req)
        const reminder = await findRecordTaskReminder(req, task)
        res.json({
            success: true,
            task: serializeRecordTask(req, task, list, {
                priorities: accountPriorities,
                reminder: ReminderService.serializeReminder(reminder)
            }),
            attachments: (task.attachments || []).map(att => taskAttachmentPayload(req, att))
        })
    } catch (error) {
        console.error('[API] Task attachment delete error:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

/**
 * DELETE /account/:account_number/api/record-tasks/:taskId
 * Delete a task
 */
router.delete('/api/record-tasks/:taskId', async (req, res) => {
    try {
        const { RecordTask, TaskComment } = await taskTenantModels(req)
        const comments = await TaskComment.find({ taskId: req.params.taskId }).select('attachments').lean()
        const task = await RecordTask.findByIdAndDelete(req.params.taskId)
        if (!task) return res.status(404).json({ error: 'Task not found' })
        await cancelRecordTaskReminder(req, task)
        ;(task.attachments || []).forEach(att => removeTaskAttachmentFile(req, att.filename))
        comments.forEach(comment => {
            ;(comment.attachments || []).forEach(att => removeTaskAttachmentFile(req, att.filename))
        })
        await TaskComment.deleteMany({ taskId: req.params.taskId })
        res.json({ success: true })
    } catch (error) {
        console.error('[API] Delete task error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * POST /account/:account_number/api/record-tasks/:taskId/reminder
 * Configure a reminder for a task.
 */
router.post('/api/record-tasks/:taskId/reminder', async (req, res) => {
    try {
        const { TaskList, RecordTask } = await taskTenantModels(req)
        const task = await RecordTask.findById(req.params.taskId)
        if (!task) return res.status(404).json({ error: 'Task not found' })
        const list = task.taskListId ? await TaskList.findById(task.taskListId).lean() : null
        const reminderInput = ReminderService.reminderPayloadFromBody(req.body)
        if (!reminderInput) {
            return res.status(400).json({ error: 'Date de rappel requise', code: 'VALIDATION_ERROR' })
        }
        const reminder = await upsertRecordTaskReminder(req, task, reminderInput)
        const accountPriorities = await getAccountTaskPriorities(req)
        res.json({
            success: true,
            reminder: ReminderService.serializeReminder(reminder),
            task: serializeRecordTask(req, task, list, {
                priorities: accountPriorities,
                reminder: ReminderService.serializeReminder(reminder)
            })
        })
    } catch (error) {
        if (taskReminderError(res, error)) return
        console.error('[API] Upsert task reminder error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * DELETE /account/:account_number/api/record-tasks/:taskId/reminder
 * Cancel a task reminder.
 */
router.delete('/api/record-tasks/:taskId/reminder', async (req, res) => {
    try {
        const { TaskList, RecordTask } = await taskTenantModels(req)
        const task = await RecordTask.findById(req.params.taskId)
        if (!task) return res.status(404).json({ error: 'Task not found' })
        const list = task.taskListId ? await TaskList.findById(task.taskListId).lean() : null
        await cancelRecordTaskReminder(req, task)
        const accountPriorities = await getAccountTaskPriorities(req)
        res.json({
            success: true,
            reminder: null,
            task: serializeRecordTask(req, task, list, { priorities: accountPriorities, reminder: null })
        })
    } catch (error) {
        if (taskReminderError(res, error)) return
        console.error('[API] Delete task reminder error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * GET /account/:account_number/api/record-tasks/:taskId
 * Fetch a single task by ID
 */
router.get('/api/record-tasks/:taskId', async (req, res) => {
    try {
        const { TaskList, RecordTask } = await taskTenantModels(req)
        const task = await RecordTask.findById(req.params.taskId).lean()
        if (!task) return res.status(404).json({ success: false, error: 'Task not found' })
        const list = task.taskListId ? await TaskList.findById(task.taskListId).lean() : null
        const reminder = await findRecordTaskReminder(req, task)
        const accountPriorities = await getAccountTaskPriorities(req)
        const accountTags = await TaskListsService.getAccountTaskTags(req)
        res.json({
            success: true,
            task: serializeRecordTask(req, task, list, {
                priorities: accountPriorities,
                accountTags,
                reminder: ReminderService.serializeReminder(reminder)
            })
        })
    } catch (err) {
        if (taskReminderError(res, err)) return
        console.error('[API] Get task error:', err)
        res.status(500).json({ success: false, error: err.message })
    }
})

/**
 * PUT /account/:account_number/api/record-tasks/:taskId
 * Generic update endpoint — accepts any editable field
 */
router.put('/api/record-tasks/:taskId', async (req, res) => {
    try {
        const { TaskList, RecordTask, TaskComment } = await taskTenantModels(req)
        const allowedFields = ['title', 'description', 'status', 'priority', 'tags', 'subtasks', 'startDate', 'dueDate', 'assignedTo', 'isDayPriority', 'taskListId', 'completedAt']
        const updates = {}
        const oldTask = await RecordTask.findById(req.params.taskId).lean()
        if (!oldTask) return res.status(404).json({ error: 'Task not found' })
        let targetList = oldTask.taskListId ? await TaskList.findById(oldTask.taskListId).lean() : null
        const reminderInput = ReminderService.reminderPayloadFromBody(req.body)
        const accountPriorities = await getAccountTaskPriorities(req)
        let accountTags = null

        allowedFields.forEach(f => {
            if (req.body[f] !== undefined) {
                updates[f] = req.body[f]
            }
        })

        if (updates.title !== undefined) {
            const cleanTitle = cleanTaskText(updates.title)
            if (!cleanTitle) return res.status(400).json({ error: 'Title required' })
            updates.title = cleanTitle
        }

        if (updates.description !== undefined) {
            updates.description = sanitizeTaskDescriptionHtml(updates.description)
        }

        if (updates.taskListId !== undefined) {
            targetList = await TaskList.findOne({ _id: updates.taskListId }).lean()
            if (!targetList) return res.status(404).json({ error: 'Target list not found' })
            if (targetList.recordId.toString() !== oldTask.recordId.toString()) {
                return res.status(400).json({ error: 'Target list belongs to another record' })
            }
        }

        // Handle null dates
        if (updates.startDate === '' || updates.startDate === null) updates.startDate = null
        if (updates.dueDate === '' || updates.dueDate === null) updates.dueDate = null
        if (updates.completedAt === '' || updates.completedAt === null) {
            updates.completedAt = null
        } else if (updates.completedAt !== undefined) {
            const completedAt = new Date(updates.completedAt)
            if (Number.isNaN(completedAt.getTime())) return res.status(400).json({ error: 'Date de fin invalide' })
            updates.completedAt = completedAt
        }

        // Auto-set color fields and completedAt
        if (updates.status) {
            updates.statusColor = optionColor(getListStatuses(targetList), updates.status, '#9ca3af')
            const isDone = cleanTaskText(updates.status, '').toLowerCase().includes('termin')
            if (req.body.completedAt === undefined) updates.completedAt = isDone ? new Date() : null
            else if (!isDone) updates.completedAt = null
        }
        if (updates.priority) {
            const priorityOption = priorityOptionFor(updates.priority, accountPriorities)
            updates.priority = priorityOption.label
            updates.priorityColor = priorityOption.color || ''
        }
        if (updates.tags !== undefined) {
            accountTags = await TaskListsService.upsertAccountTaskTags(req, updates.tags)
            updates.tags = TaskListsService.normalizeTaskTags(updates.tags, accountTags)
        }
        if (updates.subtasks !== undefined) {
            updates.subtasks = TaskListsService.normalizeTaskSubtasks(updates.subtasks)
        }
        if (updates.completedAt !== undefined) {
            const nextStatus = updates.status || oldTask.status
            if (!cleanTaskText(nextStatus, '').toLowerCase().includes('termin')) updates.completedAt = null
        }

        if (Object.keys(updates).length === 0 && !reminderInput) {
            return res.status(400).json({ error: 'No valid fields to update' })
        }

        const task = Object.keys(updates).length
            ? await RecordTask.findByIdAndUpdate(req.params.taskId, updates, { new: true })
            : await RecordTask.findById(req.params.taskId)

        // Auto-log activity for status and priority changes
        const activityFields = ['status', 'priority']
        for (const field of activityFields) {
            if (updates[field] && oldTask[field] !== updates[field]) {
                try {
                    await TaskComment.create({
                        taskId: task._id,
                        recordId: task.recordId,
                        type: 'activity',
                        text: '',
                        userId: req.user?._id?.toString() || '',
                        userName: req.user?.name || 'Système',
                        userAvatar: req.user?.avatar || '',
                        metadata: {
                            field,
                            oldValue: oldTask[field] || '',
                            newValue: updates[field]
                        }
                    })
                } catch (logErr) {
                    console.error('[API] Activity log error:', logErr)
                }
            }
        }
        let reminder = null
        if (reminderInput) {
            reminder = await upsertRecordTaskReminder(req, task, reminderInput)
        } else if (cleanTaskText(updates.status, '').toLowerCase().includes('termin')) {
            await cancelRecordTaskReminder(req, task)
        } else {
            reminder = await findRecordTaskReminder(req, task)
        }

        res.json({
            success: true,
            task: serializeRecordTask(req, task, targetList, {
                priorities: accountPriorities,
                accountTags: accountTags || await TaskListsService.getAccountTaskTags(req),
                reminder: ReminderService.serializeReminder(reminder)
            })
        })
    } catch (error) {
        if (taskReminderError(res, error)) return
        console.error('[API] Update task error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * POST /account/:account_number/api/task-lists/:listId/reorder
 * Reorder tasks in a list
 */
router.post('/api/task-lists/:listId/reorder', async (req, res) => {
    try {
        const { TaskList, RecordTask } = await taskTenantModels(req)
        const { taskIds } = req.body
        if (!Array.isArray(taskIds)) return res.status(400).json({ error: 'taskIds array required' })

        const list = await TaskList.findById(req.params.listId).select('_id').lean()
        if (!list) return res.status(404).json({ error: 'List not found' })

        const normalizedTaskIds = [...new Set(taskIds
            .map(id => String(id || ''))
            .filter(id => /^[a-f\d]{24}$/i.test(id)))]
        const existingTasks = await RecordTask.find({ taskListId: req.params.listId, _id: { $in: normalizedTaskIds } }).select('_id').lean()
        const allowedIds = new Set(existingTasks.map(task => task._id.toString()))
        const orderedAllowedTaskIds = normalizedTaskIds.filter(id => allowedIds.has(id))
        if (!orderedAllowedTaskIds.length) return res.json({ success: true })

        const allTasks = await RecordTask.find({ taskListId: req.params.listId })
            .select('_id order')
            .sort({ order: 1, createdAt: -1 })
            .lean()
        const orderedSet = new Set(orderedAllowedTaskIds)
        const remainingTasks = allTasks.filter(task => !orderedSet.has(task._id.toString()))

        const reorderedTaskIds = [
            ...orderedAllowedTaskIds.map((id, index) => ({ id, order: index })),
            ...remainingTasks.map((task, index) => ({
                id: task._id.toString(),
                order: orderedAllowedTaskIds.length + index,
            })),
        ]
        const currentOrderById = new Map(
            allTasks.map(task => [task._id.toString(), Number(task.order) || 0]),
        )
        const bulkOps = reorderedTaskIds
            .filter(({ id, order }) => currentOrderById.get(id) !== order)
            .map(({ id, order }) => ({
                updateOne: { filter: { _id: id, taskListId: req.params.listId }, update: { $set: { order } } }
            }))
        if (bulkOps.length > 0) await RecordTask.bulkWrite(bulkOps)

        res.json({ success: true })
    } catch (error) {
        console.error('[API] Reorder tasks error:', error)
        res.status(500).json({ error: error.message })
    }
})

// ═══════════════════════════════════════════════════════════════
// TASK COMMENTS & ACTIVITY — Per-task comment thread
// ═══════════════════════════════════════════════════════════════

/**
 * GET /account/:account_number/api/record-tasks/:taskId/comments
 * Get all comments and activity entries for a task
 */
router.get('/api/record-tasks/:taskId/comments', async (req, res) => {
    try {
        const { TaskComment } = await taskTenantModels(req)
        const comments = await TaskComment.find({ taskId: req.params.taskId })
            .sort({ createdAt: 1 })
            .lean()

        res.json({
            success: true,
            comments: comments.map(c => serializeTaskComment(req, c))
        })
    } catch (error) {
        console.error('[API] Get task comments error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * POST /account/:account_number/api/record-tasks/:taskId/comments
 * Post a comment on a task, optionally with attachments.
 */
router.post('/api/record-tasks/:taskId/comments', (req, res, next) => {
    const contentType = String(req.headers['content-type'] || '').toLowerCase()
    if (!contentType.includes('multipart/form-data')) return next()
    taskAttachmentUpload.array('files', 10)(req, res, (err) => {
        if (err) {
            ;(req.files || []).forEach(file => removeTaskAttachmentFile(req, taskAttachmentRelativePath(req, file.path)))
            return res.status(400).json({ success: false, error: err.message })
        }
        next()
    })
}, async (req, res) => {
    try {
        const { RecordTask, TaskComment } = await taskTenantModels(req)
        const { text, publishToChat } = req.body
        const cleanText = cleanTaskText(text, '')
        const files = Array.isArray(req.files) ? req.files : []
        if (!cleanText && files.length === 0) return res.status(400).json({ error: 'Comment text or attachment required' })
        const askAi = req.body?.askAi === true
            || ['1', 'true', 'yes'].includes(String(req.body?.askAi || '').toLowerCase())

        const task = await RecordTask.findById(req.params.taskId)
        if (!task) {
            files.forEach(file => removeTaskAttachmentFile(req, taskAttachmentRelativePath(req, file.path)))
            return res.status(404).json({ error: 'Task not found' })
        }

        const userId = req.user?._id?.toString() || ''
        const userName = req.user?.name || 'Anonyme'
        const userAvatar = req.user?.avatar || ''
        const attachments = files
            .map(file => ({
                filename: taskAttachmentRelativePath(req, file.path),
                originalName: file.originalname || file.filename,
                mimeType: file.mimetype || '',
                size: file.size || 0,
                uploadedAt: new Date(),
                uploadedBy: req.user?._id
            }))
            .filter(file => file.filename)
        if (files.length && attachments.length === 0) {
            files.forEach(file => removeTaskAttachmentFile(req, taskAttachmentRelativePath(req, file.path)))
            return res.status(400).json({ success: false, error: 'Fichier invalide' })
        }

        const comment = await TaskComment.create({
            taskId: task._id,
            recordId: task.recordId,
            type: 'comment',
            text: cleanText,
            attachments,
            userId,
            userName,
            userAvatar,
            authorType: 'user',
            audience: askAi ? 'ai' : 'team',
            publishedToChat: !!publishToChat
        })

        let agentComment = null
        let responseTask = task
        let agentError = null
        if (askAi && cleanText) {
            const recentComments = await TaskComment.find({ taskId: task._id })
                .sort({ createdAt: -1 })
                .limit(20)
                .lean()
            try {
                const agentResult = await TaskAgentService.runTaskAgent({
                    req,
                    task,
                    TaskComment,
                    userMessage: cleanText,
                    recentComments: recentComments.reverse()
                })
                agentComment = agentResult.assistantComment
                responseTask = agentResult.task || task
            } catch (error) {
                console.error('[API] Task agent error:', error)
                agentError = {
                    code: error.code || 'TASK_AGENT_ERROR',
                    message: error.message || "L'IA n'a pas pu traiter cette demande."
                }
                agentComment = await TaskAgentService.createTaskAgentErrorComment({
                    task,
                    TaskComment,
                    error
                })
            }
        }

        // If publishToChat is true, also send to the record's chat conversation
        if (publishToChat && cleanText) {
            try {
                const Conversation = await tenantCollection(req, 'Conversation')
                const Message = await tenantCollection(req, 'Message')

                // Find or create a "Tâches" conversation for this record
                let conv = await Conversation.findOne({
                    recordId: task.recordId,
                    name: 'Tâches',
                    archived: { $ne: true }
                })

                if (!conv) {
                    // Resolve entity info for the record so task links work from team chat
                    const RecordModel = await tenantCollection(req, 'Record')
                    const EntityModel = await tenantCollection(req, 'Entity')
                    const record = await RecordModel.findById(task.recordId).select('title entityId').lean()
                    let entityId = record?.entityId || null
                    let entityName = ''
                    let recordTitle = record?.title || ''
                    if (entityId) {
                        const entity = await EntityModel.findById(entityId).select('name').lean()
                        entityName = entity?.name || ''
                    }

                    conv = await Conversation.create({
                        type: 'group',
                        name: 'Tâches',
                        recordId: task.recordId,
                        entityId,
                        entityName,
                        recordTitle,
                        participants: [{
                            userId,
                            name: userName,
                            avatar: userAvatar,
                            role: 'admin',
                            joinedAt: new Date(),
                            lastReadAt: new Date(),
                            unreadCount: 0
                        }]
                    })
                }

                const chatText = `__TASK__${task._id}|${task.title}__END__\n${cleanText}`
                await Message.create({
                    conversationId: conv._id,
                    senderId: userId,
                    senderName: userName,
                    senderAvatar: userAvatar,
                    type: 'text',
                    text: chatText,
                    readBy: [{ userId, readAt: new Date() }]
                })

                // Update conversation lastMessage
                await Conversation.findByIdAndUpdate(conv._id, {
                    $set: {
                        lastMessage: {
                            text: chatText,
                            senderId: userId,
                            senderName: userName,
                            sentAt: new Date(),
                            type: 'text'
                        },
                        updatedAt: new Date()
                    }
                })
            } catch (chatErr) {
                console.error('[API] Publish to chat error:', chatErr)
                // Don't fail the comment creation if chat publish fails
            }
        }

        res.json({
            success: true,
            comment: serializeTaskComment(req, comment),
            agentComment: agentComment ? serializeTaskComment(req, agentComment) : null,
            task: {
                _id: responseTask._id?.toString?.() || String(responseTask._id || ''),
                subtasks: TaskListsService.normalizeTaskSubtasks(responseTask.subtasks)
            },
            ...(agentError ? { agentError } : {})
        })
    } catch (error) {
        ;(req.files || []).forEach(file => removeTaskAttachmentFile(req, taskAttachmentRelativePath(req, file.path)))
        console.error('[API] Post task comment error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * POST /account/:account_number/api/user/view-preferences
 * Save user preferences for a specific view
 */
router.post('/api/user/view-preferences', async (req, res) => {
    try {
        const UserPreferences = await tenantCollection(req, "UserPreferences")
        const { viewId, preferences } = req.body


        if (!viewId) {
            return res.status(400).json({ error: 'viewId is required' })
        }

        if (!req.user?._id) {
            return res.status(401).json({ error: 'User not authenticated' })
        }

        // Build $set object — only update fields that were actually sent
        // This prevents one save call from overwriting fields set by another
        const setFields = {
            userId: req.user._id,
            viewId,
            updatedAt: new Date()
        }

        // Map all possible preference keys to their $set paths
        const prefKeys = [
            'columns', 'sort', 'density', 'pageSize', 'titleDisplay',
            'showSidebar', 'viewMode', 'enabledViews',
            // Record-edit panel layout
            'columnWidths', 'extraColumns', 'panelLayout', 'sidebarWidth',
            // Kanban
            'kanban',
            // Relation tabs (record edit)
            'relationTabs',
            // Sidebar panel visibility
            'sidebar_panels',
            // Dynamic table column widths
            'gridColumnWidths',
            // Overview layout builder
            'rows',
            'customWidgets',
            'widgetSettings',
            'homeData',
            'homeLayoutVersion',
            'overviewLayoutVersion',
            'hiddenRecordModules',
            'noteWidget',
            // Record Agenda
            'agendaPrefs',
            // Fiche field layout (order + hidden fields)
            'ficheLayout',
            // Document editor preferences
            'editorAutoSave'
        ]

        prefKeys.forEach(key => {
            if (preferences[key] !== undefined) {
                setFields[`preferences.${key}`] = preferences[key]
            }
        })

        await UserPreferences.findOneAndUpdate(
            { userId: req.user._id, viewId },
            { $set: setFields },
            { upsert: true, new: true }
        )

        res.json({ success: true })

    } catch (error) {
        console.error('[API] Preferences save error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * GET /account/:account_number/api/user/view-preferences/:viewId
 * Get user preferences for a specific view
 */
router.get('/api/user/view-preferences/:viewId', async (req, res) => {
    try {
        const UserPreferences = await tenantCollection(req, "UserPreferences")
        const { viewId } = req.params

        if (!req.user?._id) {
            return res.status(401).json({ error: 'User not authenticated' })
        }

        const prefs = await UserPreferences.findOne({
            userId: req.user._id,
            viewId
        }).lean()

        res.json({
            success: true,
            preferences: prefs?.preferences || null
        })

    } catch (error) {
        console.error('[API] Preferences fetch error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * POST /account/:account_number/api/account/view-preferences
 * Save account-level preferences for a specific view (shared across all users in the account)
 */
router.post('/api/account/view-preferences', async (req, res) => {
    try {
        const AccountPreferences = await tenantCollection(req, "AccountPreferences")
        const { viewId, preferences } = req.body

        if (!viewId) {
            return res.status(400).json({ error: 'viewId is required' })
        }

        const accountId = req.account_number

        // Build $set object — only update fields that were actually sent
        const setFields = {
            accountId,
            viewId,
            updatedAt: new Date()
        }

        // Set each preference key individually to avoid overwriting other keys
        if (preferences && typeof preferences === 'object') {
            Object.keys(preferences).forEach(key => {
                if (preferences[key] !== undefined) {
                    setFields[`preferences.${key}`] = preferences[key]
                }
            })
        }

        await AccountPreferences.findOneAndUpdate(
            { accountId, viewId },
            { $set: setFields },
            { upsert: true, new: true }
        )

        res.json({ success: true })

    } catch (error) {
        console.error('[API] Account preferences save error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * GET /account/:account_number/api/account/view-preferences/:viewId
 * Get account-level preferences for a specific view
 */
router.get('/api/account/view-preferences/:viewId', async (req, res) => {
    try {
        const AccountPreferences = await tenantCollection(req, "AccountPreferences")
        const { viewId } = req.params
        const accountId = req.account_number

        const prefs = await AccountPreferences.findOne({
            accountId,
            viewId
        }).lean()

        res.json({
            preferences: prefs?.preferences || null
        })

    } catch (error) {
        console.error('[API] Account preferences fetch error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * GET /account/:account_number/api/analytics/today
 * Dashboard analytics — consultation progression based on classification status
 * Returns: { today, urgencies, topMedications, byStatus, waitingRoom, schedule, tasks }
 */
router.get('/api/analytics/today', async (req, res) => {
    try {
        const Record = await tenantCollection(req, "Record")
        const Entity = await tenantCollection(req, "Entity")
        const FieldTemplate = await tenantCollection(req, "FieldTemplate")
        const Classification = await tenantCollection(req, "Classification")

        // 1. Resolve IDs
        const consultEntity = await Entity.findOne({ slug: 'consultation' })
        if (!consultEntity) return res.json({ error: 'Entity consultation not found' })

        const rdvAtField = await FieldTemplate.findOne({ name: 'rdv_at' })
        const medicationsField = await FieldTemplate.findOne({ name: 'medications' })
        const statusClassif = await Classification.findOne({ key: 'progression-consultation' })
        const urgencyClassif = await Classification.findOne({ key: 'urgency_level' })

        if (!statusClassif || !urgencyClassif) {
            return res.json({ error: 'Required classifications not found. Run seed first.' })
        }

        // Status option map
        const statusMap = {}
        statusClassif.options.forEach(o => { statusMap[o._id.toString()] = o.label })

        const urgentOptionId = urgencyClassif.options.find(o => o.label === 'Urgent')?._id
        const termineeOptionId = statusClassif.options.find(o => o.label === 'Terminé')?._id
        const annuleeOptionId = statusClassif.options.find(o => o.label === 'Absent')?._id

        // 2. Get ALL consultation records (no date filter)
        const allRecords = await Record.find({ entityId: consultEntity._id }).lean()

        // 3. Aggregate stats
        const results = await Record.aggregate([
            { $match: { entityId: consultEntity._id } },
            {
                $facet: {
                    total: [{ $count: 'count' }],

                    byStatus: [
                        { $unwind: '$classificationValues' },
                        { $match: { 'classificationValues.classificationId': statusClassif._id } },
                        { $group: { _id: '$classificationValues.optionId', count: { $sum: 1 } } }
                    ],

                    urgencies: [
                        ...(urgentOptionId ? [{
                            $match: {
                                classificationValues: {
                                    $elemMatch: {
                                        classificationId: urgencyClassif._id,
                                        optionId: urgentOptionId
                                    }
                                }
                            }
                        }] : []),
                        { $project: { title: 1, customFields: 1, _id: 1 } }
                    ],

                    topMedications: [
                        ...(medicationsField ? [
                            { $unwind: '$customFields' },
                            { $match: { 'customFields.field_id': medicationsField._id } },
                            { $unwind: { path: '$customFields.value', preserveNullAndEmptyArrays: false } },
                            { $group: { _id: '$customFields.value.nom', count: { $sum: { $ifNull: ['$customFields.value.quantite', 1] } } } },
                            { $sort: { count: -1 } },
                            { $limit: 5 }
                        ] : [])
                    ]
                }
            }
        ])

        // 4. Helpers
        const enSalleOption = statusClassif.options.find(o => o.label === "Salle d'attente")
        const enCoursOption = statusClassif.options.find(o => o.label === "En cours")
        const programmeeOption = statusClassif.options.find(o => o.label === 'Programmée')
        const motifField = await FieldTemplate.findOne({ name: 'motif' })
        const salleField = await FieldTemplate.findOne({ name: 'salle' })

        const getField = (rec, fieldId) => {
            if (!fieldId) return null
            const cf = rec.customFields?.find(f => f.field_id?.toString() === fieldId.toString())
            return cf?.value || null
        }

        const hasClassifOption = (rec, classifId, optionId) => {
            if (!optionId) return false
            return rec.classificationValues?.some(cv =>
                cv.classificationId?.toString() === classifId.toString() &&
                cv.optionId?.toString() === optionId.toString()
            )
        }

        const getStatusLabel = (rec) => {
            return statusClassif.options.find(o =>
                hasClassifOption(rec, statusClassif._id, o._id)
            )?.label || 'Inconnu'
        }

        const mapRecord = (r, statusOverride) => ({
            id: r._id,
            title: r.title,
            motif: getField(r, motifField?._id),
            salle: getField(r, salleField?._id),
            rdv_at: rdvAtField ? getField(r, rdvAtField._id) : null,
            urgent: hasClassifOption(r, urgencyClassif._id, urgentOptionId),
            status: statusOverride || getStatusLabel(r),
            initials: (r.title || '').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
        })

        // 5. Waiting room: en_salle_attente + en_cours
        const waitingRoom = allRecords
            .filter(r =>
                hasClassifOption(r, statusClassif._id, enSalleOption?._id) ||
                hasClassifOption(r, statusClassif._id, enCoursOption?._id)
            )
            .sort((a, b) => {
                const aTime = rdvAtField ? getField(a, rdvAtField._id) : null
                const bTime = rdvAtField ? getField(b, rdvAtField._id) : null
                if (!aTime && !bTime) return 0
                if (!aTime) return 1
                if (!bTime) return -1
                return new Date(aTime) - new Date(bTime)
            })
            .map(r => mapRecord(r,
                hasClassifOption(r, statusClassif._id, enCoursOption?._id) ? 'en_cours' : 'en_salle_attente'
            ))

        // 6. Schedule: all non-terminated, non-cancelled
        const schedule = allRecords
            .filter(r =>
                !hasClassifOption(r, statusClassif._id, termineeOptionId) &&
                !hasClassifOption(r, statusClassif._id, annuleeOptionId)
            )
            .sort((a, b) => {
                const aTime = rdvAtField ? getField(a, rdvAtField._id) : null
                const bTime = rdvAtField ? getField(b, rdvAtField._id) : null
                if (!aTime && !bTime) return 0
                if (!aTime) return 1
                if (!bTime) return -1
                return new Date(aTime) - new Date(bTime)
            })
            .map(r => mapRecord(r))

        // 7. Tasks
        const tacheEntity = await Entity.findOne({ slug: 'tache' })
        let tasks = []
        if (tacheEntity) {
            const taskStatusClassif = await Classification.findOne({ key: 'task_status' })
            const taskPriorityClassif = await Classification.findOne({ key: 'task_priority' })
            const titreTacheField = await FieldTemplate.findOne({ name: 'titre_tache' })
            const dueAtField = await FieldTemplate.findOne({ name: 'due_at' })

            const taskRecords = await Record.find({ entityId: tacheEntity._id }).lean()
            tasks = taskRecords.map(r => {
                const statusOpt = taskStatusClassif?.options.find(o =>
                    hasClassifOption(r, taskStatusClassif._id, o._id)
                )
                const priorityOpt = taskPriorityClassif?.options.find(o =>
                    hasClassifOption(r, taskPriorityClassif._id, o._id)
                )
                return {
                    id: r._id,
                    title: getField(r, titreTacheField?._id) || r.title,
                    status: statusOpt?.label || 'Inconnu',
                    priority: priorityOpt?.label || 'Normal',
                    dueAt: getField(r, dueAtField?._id)
                }
            })
        }

        // 8. Format response
        const facet = results[0]
        const total = facet.total[0]?.count || 0
        const seen = facet.byStatus.find(s => s._id?.toString() === termineeOptionId?.toString())?.count || 0

        res.json({
            today: {
                total,
                seen,
                remaining: total - seen,
                urgent: facet.urgencies.length
            },
            urgencies: facet.urgencies.map(u => ({
                id: u._id,
                title: u.title,
                rdv_at: rdvAtField ? u.customFields?.find(f => f.field_id?.toString() === rdvAtField._id.toString())?.value : null
            })),
            topMedications: facet.topMedications.map((m, i) => ({
                label: m._id,
                count: m.count,
                percent: total > 0 ? Math.round((m.count / total) * 100) : 0,
                color: ['primary', 'danger', 'warning', 'success', 'info'][i]
            })),
            byStatus: facet.byStatus.map(s => ({
                label: statusMap[s._id?.toString()] || 'Inconnu',
                count: s.count
            })),
            waitingRoom,
            schedule,
            tasks
        })

    } catch (error) {
        console.error('[API] Analytics error:', error)
        res.status(500).json({ error: error.message })
    }
})

// ═══════════════════════════════════════════════════════════════════
// SAVED VIEWS CRUD
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /account/:account_number/api/entity/:entityId/saved-views
 * List saved views for the current user + entity
 */
router.get('/api/entity/:entityId/saved-views', async (req, res) => {
    try {
        const SavedView = await tenantCollection(req, "SavedView")
        const { entityId } = req.params

        if (!req.user?._id) {
            return res.status(401).json({ error: 'User not authenticated' })
        }

        const views = await SavedView.find({
            userId: req.user._id,
            entityId
        }).sort({ order: 1, createdAt: 1 }).lean()

        res.json({ views })
    } catch (error) {
        console.error('[API] Saved views list error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * POST /account/:account_number/api/entity/:entityId/saved-views
 * Create a new saved view
 */
router.post('/api/entity/:entityId/saved-views', async (req, res) => {
    try {
        const SavedView = await tenantCollection(req, "SavedView")
        const { entityId } = req.params
        const { name, color, icon, filters, fieldFilters, sort } = req.body

        if (!req.user?._id) {
            return res.status(401).json({ error: 'User not authenticated' })
        }

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Name is required' })
        }

        // Get max order
        const lastView = await SavedView.findOne({
            userId: req.user._id,
            entityId
        }).sort({ order: -1 }).lean()

        const view = await SavedView.create({
            userId: req.user._id,
            entityId,
            name: name.trim(),
            color: color || '#4361ee',
            icon: icon || null,
            filters: filters || {},
            fieldFilters: fieldFilters || [],
            sort: sort || null,
            order: (lastView?.order || 0) + 1
        })

        res.json({ view })
    } catch (error) {
        console.error('[API] Saved view create error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * PUT /account/:account_number/api/entity/:entityId/saved-views/:viewId
 * Update a saved view (name, filters, color, order)
 */
router.put('/api/entity/:entityId/saved-views/:viewId', async (req, res) => {
    try {
        const SavedView = await tenantCollection(req, "SavedView")
        const { entityId, viewId } = req.params
        const updates = req.body

        if (!req.user?._id) {
            return res.status(401).json({ error: 'User not authenticated' })
        }

        const view = await SavedView.findOneAndUpdate(
            { _id: viewId, userId: req.user._id, entityId },
            { $set: updates },
            { new: true }
        ).lean()

        if (!view) {
            return res.status(404).json({ error: 'View not found' })
        }

        res.json({ view })
    } catch (error) {
        console.error('[API] Saved view update error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * DELETE /account/:account_number/api/entity/:entityId/saved-views/:viewId
 * Delete a saved view
 */
router.delete('/api/entity/:entityId/saved-views/:viewId', async (req, res) => {
    try {
        const SavedView = await tenantCollection(req, "SavedView")
        const { entityId, viewId } = req.params

        if (!req.user?._id) {
            return res.status(401).json({ error: 'User not authenticated' })
        }

        const result = await SavedView.findOneAndDelete({
            _id: viewId,
            userId: req.user._id,
            entityId
        })

        if (!result) {
            return res.status(404).json({ error: 'View not found' })
        }

        res.json({ success: true })
    } catch (error) {
        console.error('[API] Saved view delete error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * GET /account/:account_number/api/entities
 * Lightweight list of all entities (for dropdowns, selectors)
 */
router.get('/api/entities', async (req, res) => {
    try {
        const Entity = await tenantCollection(req, "Entity")
        const entities = await Entity.find({})
            .select('name slug icon color')
            .sort({ name: 1 })
            .lean()
        res.json({ entities })
    } catch (error) {
        console.error('[API] Entities list error:', error)
        res.status(500).json({ error: error.message })
    }
})


// ═══════════════════════════════════════════════════════════════════
// CALENDAR API ENDPOINTS
// ═══════════════════════════════════════════════════════════════════

/**
 * PATCH /account/:account_number/api/records/:recordId/date
 * Update a specific date custom field on a record (for calendar drag & drop)
 */
router.patch('/api/records/:recordId/date', async (req, res) => {
    try {
        const Record = await tenantCollection(req, "Record")
        const { recordId } = req.params
        const { dateFieldId, newStart, newEnd, duration } = req.body

        const record = await Record.findById(recordId)
        if (!record) return res.status(404).json({ error: 'Record not found' })

        // Update the date custom field
        if (dateFieldId) {
            const cfIdx = (record.customFields || []).findIndex(cf =>
                (cf.field_id?._id || cf.field_id)?.toString() === dateFieldId
            )
            if (cfIdx >= 0) {
                record.customFields[cfIdx].value = newStart
            } else {
                record.customFields.push({ field_id: dateFieldId, value: newStart })
            }
        }

        // Update duration field if provided
        if (duration !== undefined) {
            // Find duration field (number type, name contains 'duree' or 'duration')
            const FieldTemplate = await tenantCollection(req, "FieldTemplate")
            const durationField = await FieldTemplate.findOne({
                _id: { $in: record.customFields.map(cf => cf.field_id?._id || cf.field_id) },
                type: 'number',
                $or: [
                    { name: { $regex: /dur/i } },
                    { label: { $regex: /dur/i } }
                ]
            }).lean()
            if (durationField) {
                const dIdx = record.customFields.findIndex(cf =>
                    (cf.field_id?._id || cf.field_id)?.toString() === durationField._id.toString()
                )
                if (dIdx >= 0) {
                    record.customFields[dIdx].value = duration
                }
            }
        }

        record.markModified('customFields')
        await record.save()
        res.json({ success: true })
    } catch (error) {
        console.error('[API] Record date update error:', error)
        res.status(500).json({ error: error.message })
    }
})

// ═══════════════════════════════════════════════════════════════════════
// 📅 RECORD AGENDA / EVENTS API
// ═══════════════════════════════════════════════════════════════════════

function normalizeEventTagsInput(value) {
    if (Array.isArray(value)) {
        return value
            .map(item => String(item || '').trim())
            .filter(Boolean)
            .filter((item, idx, arr) => arr.findIndex(other => other.toLowerCase() === item.toLowerCase()) === idx);
    }

    if (typeof value === 'string') {
        return value
            .split(',')
            .map(item => item.trim())
            .filter(Boolean)
            .filter((item, idx, arr) => arr.findIndex(other => other.toLowerCase() === item.toLowerCase()) === idx);
    }

    return [];
}

function firstDefinedValue(...values) {
    return values.find(value => value !== undefined);
}

function normalizeEventBoolean(value, fallback = false) {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;

    const token = String(value).trim().toLowerCase();
    if (['true', '1', 'yes', 'oui', 'on'].includes(token)) return true;
    if (['false', '0', 'no', 'non', 'off'].includes(token)) return false;

    return fallback;
}

/**
 * GET /account/:account_number/api/records/:recordId/events
 * Fetch all events linked to a specific record via relations
 */
router.get('/api/records/:recordId/events', async (req, res) => {
    try {
        const Record = await tenantCollection(req, "Record");

        const eventsEntity = await ensureEventsEntity(req);
        const relationValues = [req.params.recordId];
        try {
            const mongoose = require('mongoose');
            if (mongoose.Types.ObjectId.isValid(req.params.recordId)) {
                relationValues.push(new mongoose.Types.ObjectId(req.params.recordId));
            }
        } catch (_) { }

        // Find events linked to this record via relations
        const events = await Record.find({
            entityId: eventsEntity._id,
            'relations.value': { $in: relationValues }
        })
            .populate({ path: 'customFields.field_id', select: 'label type name render ui type_config' })
            .sort({ date: -1 })
            .lean();

        res.json({
            success: true,
            events,
            entityData: eventsEntity,
        });
    } catch (error) {
        console.error('[API] Fetch record events error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /account/:account_number/api/records/:recordId/events
 * Create a new event linked to a specific record
 */
router.post('/api/records/:recordId/events', async (req, res) => {
    try {
        const Entity = await tenantCollection(req, "Entity");
        const Record = await tenantCollection(req, "Record");

        const {
            title,
            date,
            endDate,
            duration,
            type,
            lieu,
            notes,
            tags,
            statusOptionId,
            showInUpcomingWidget,
            widgetProchainsEvenements,
            upcomingWidget,
            isImportantDate,
            widgetDateImportante,
            importantDate,
            allDay,
            isAllDay,
        } = req.body;
        const parentRecordId = req.params.recordId;

        const eventsEntity = await ensureEventsEntity(req);

        // Find the parent record to get its entityId
        const parentRecord = await Record.findById(parentRecordId).select('entityId').lean();
        if (!parentRecord) {
            return res.status(404).json({ error: 'Parent record not found' });
        }

        // Find the relation key for this entity type
        const parentEntity = await Entity.findById(parentRecord.entityId).select('slug').lean();
        const relationKey = parentEntity ? `event_${parentEntity.slug}` : null;

        // Build custom fields
        const customFields = [];
        const fieldMap = {};
        (eventsEntity.customFields || []).forEach(f => {
            fieldMap[f.name] = f._id.toString();
        });

        if (fieldMap.duree_evenement && duration) {
            customFields.push({ field_id: fieldMap.duree_evenement, value: parseInt(duration) || 30 });
        }
        if (fieldMap.lieu_evenement && lieu) {
            customFields.push({ field_id: fieldMap.lieu_evenement, value: lieu });
        }
        if (fieldMap.type_evenement && type) {
            customFields.push({ field_id: fieldMap.type_evenement, value: type });
        }
        const normalizedTags = normalizeEventTagsInput(tags);
        if (fieldMap.tags_evenement && normalizedTags.length > 0) {
            customFields.push({ field_id: fieldMap.tags_evenement, value: normalizedTags });
        }
        if (fieldMap.notes_evenement && notes) {
            customFields.push({ field_id: fieldMap.notes_evenement, value: notes });
        }
        if (fieldMap.heure_fin && endDate) {
            customFields.push({ field_id: fieldMap.heure_fin, value: endDate });
        }
        if (fieldMap.toute_la_journee) {
            const raw = firstDefinedValue(allDay, isAllDay);
            customFields.push({ field_id: fieldMap.toute_la_journee, value: normalizeEventBoolean(raw, false) });
        }
        if (fieldMap.widget_prochains_evenements) {
            const raw = firstDefinedValue(showInUpcomingWidget, widgetProchainsEvenements, upcomingWidget);
            customFields.push({ field_id: fieldMap.widget_prochains_evenements, value: normalizeEventBoolean(raw, true) });
        }
        if (fieldMap.widget_date_importante) {
            const raw = firstDefinedValue(isImportantDate, widgetDateImportante, importantDate);
            customFields.push({ field_id: fieldMap.widget_date_importante, value: normalizeEventBoolean(raw, false) });
        }

        // Build classification values
        const classificationValues = [];
        if (statusOptionId && eventsEntity.statusClassification) {
            const opt = eventsEntity.statusClassification.options?.find(
                o => o._id.toString() === statusOptionId
            );
            classificationValues.push({
                classificationId: eventsEntity.statusClassification._id,
                optionId: statusOptionId,
                label: opt?.label || 'Planifié',
                color: opt?.color || '#3b82f6',
            });
        } else if (eventsEntity.statusClassification?.options?.length) {
            // Default to first option (Planifié)
            const defaultOpt = eventsEntity.statusClassification.options[0];
            classificationValues.push({
                classificationId: eventsEntity.statusClassification._id,
                optionId: defaultOpt._id,
                label: defaultOpt.label,
                color: defaultOpt.color,
            });
        }

        // Build relations
        const relations = [];
        if (relationKey) {
            relations.push({ relationKey, value: parentRecordId });
        }

        const recordData = {
            entityId: eventsEntity._id,
            title: title || 'Nouvel événement',
            date: date ? new Date(date) : new Date(),
            end_date: endDate ? new Date(endDate) : null,
            published: true,
            customFields,
            classificationValues,
            relations,
            createdBy: req.user?._id,
        };

        // Compute denormalized fields
        try {
            const denormService = require('../services/record-denorm.service');
            const denorm = await denormService.computeDenorm(recordData, eventsEntity, Record, Entity);
            Object.assign(recordData, denorm);
        } catch (e) {
            // denorm is optional, don't block creation
        }

        const newRecord = new Record(recordData);
        await newRecord.save();

        // Return enriched record
        const saved = await Record.findById(newRecord._id)
            .populate({ path: 'customFields.field_id', select: 'label type name render ui type_config' })
            .lean();

        res.json({ success: true, record: saved });
    } catch (error) {
        console.error('[API] Create record event error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PATCH /account/:account_number/api/records/:recordId/events/:eventId
 * Update an existing event (title, dates, status, etc.)
 */
router.patch('/api/records/:recordId/events/:eventId', async (req, res) => {
    try {
        const Record = await tenantCollection(req, "Record");

        const { eventId } = req.params;
        const {
            title,
            date,
            endDate,
            duration,
            type,
            lieu,
            notes,
            tags,
            statusOptionId,
            showInUpcomingWidget,
            widgetProchainsEvenements,
            upcomingWidget,
            isImportantDate,
            widgetDateImportante,
            importantDate,
            allDay,
            isAllDay,
        } = req.body;

        const event = await Record.findById(eventId);
        if (!event) return res.status(404).json({ error: 'Event not found' });

        const eventsEntity = await ensureEventsEntity(req);

        const fieldMap = {};
        (eventsEntity.customFields || []).forEach(f => {
            fieldMap[f.name] = f._id.toString();
        });

        // Update standard fields
        if (title !== undefined) event.title = title;
        if (date !== undefined) event.date = date ? new Date(date) : null;
        if (endDate !== undefined) event.end_date = endDate ? new Date(endDate) : null;

        // Update custom fields
        const updateCustomField = (fieldName, value) => {
            const fid = fieldMap[fieldName];
            if (!fid || value === undefined) return;
            const cfIdx = (event.customFields || []).findIndex(cf =>
                (cf.field_id?._id || cf.field_id)?.toString() === fid
            );
            if (cfIdx >= 0) {
                event.customFields[cfIdx].value = value;
            } else {
                event.customFields.push({ field_id: fid, value });
            }
        };

        updateCustomField('duree_evenement', duration ? parseInt(duration) : undefined);
        updateCustomField('type_evenement', type);
        updateCustomField('lieu_evenement', lieu);
        if (tags !== undefined) updateCustomField('tags_evenement', normalizeEventTagsInput(tags));
        updateCustomField('notes_evenement', notes);

        const upcomingWidgetValue = firstDefinedValue(showInUpcomingWidget, widgetProchainsEvenements, upcomingWidget);
        if (upcomingWidgetValue !== undefined) {
            updateCustomField('widget_prochains_evenements', normalizeEventBoolean(upcomingWidgetValue, true));
        }
        const importantDateValue = firstDefinedValue(isImportantDate, widgetDateImportante, importantDate);
        if (importantDateValue !== undefined) {
            updateCustomField('widget_date_importante', normalizeEventBoolean(importantDateValue, false));
        }
        const allDayValue = firstDefinedValue(allDay, isAllDay);
        if (allDayValue !== undefined) {
            updateCustomField('toute_la_journee', normalizeEventBoolean(allDayValue, false));
        }

        if (endDate !== undefined) updateCustomField('heure_fin', endDate);

        // Update status classification
        if (statusOptionId && eventsEntity.statusClassification) {
            event.classificationValues = (event.classificationValues || []).filter(
                cv => cv.classificationId?.toString() !== eventsEntity.statusClassification._id.toString()
            );
            event.classificationValues.push({
                classificationId: eventsEntity.statusClassification._id,
                optionId: statusOptionId
            });
            event.markModified('classificationValues');
        }

        event.markModified('customFields');
        await event.save();

        // Return enriched record
        const saved = await Record.findById(event._id)
            .populate({ path: 'customFields.field_id', select: 'label type name render ui type_config' })
            .lean();

        res.json({ success: true, record: saved });
    } catch (error) {
        console.error('[API] Update record event error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /account/:account_number/api/records/:recordId/events/:eventId
 * Delete an event
 */
router.delete('/api/records/:recordId/events/:eventId', async (req, res) => {
    try {
        const Record = await tenantCollection(req, "Record");
        const { eventId } = req.params;

        const result = await Record.findByIdAndDelete(eventId);
        if (!result) return res.status(404).json({ error: 'Event not found' });

        res.json({ success: true });
    } catch (error) {
        console.error('[API] Delete record event error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PATCH /account/:account_number/api/records/:recordId/events/:eventId/drag
 * Quick date update for calendar drag & drop
 */
router.patch('/api/records/:recordId/events/:eventId/drag', async (req, res) => {
    try {
        const Record = await tenantCollection(req, "Record");

        const { eventId } = req.params;
        const { newStart, newEnd } = req.body;

        const event = await Record.findById(eventId);
        if (!event) return res.status(404).json({ error: 'Event not found' });

        // Update date fields
        if (newStart) event.date = new Date(newStart);
        if (newEnd) event.end_date = new Date(newEnd);

        // Also update heure_fin custom field
        const eventsEntity = await ensureEventsEntity(req);
        if (eventsEntity) {
            const heureFinField = (eventsEntity.customFields || []).find(f => f.name === 'heure_fin');
            if (heureFinField && newEnd) {
                const cfIdx = (event.customFields || []).findIndex(cf =>
                    (cf.field_id?._id || cf.field_id)?.toString() === heureFinField._id.toString()
                );
                if (cfIdx >= 0) {
                    event.customFields[cfIdx].value = newEnd;
                } else {
                    event.customFields.push({ field_id: heureFinField._id, value: newEnd });
                }
                event.markModified('customFields');
            }
        }

        await event.save();
        res.json({ success: true });
    } catch (error) {
        console.error('[API] Drag event error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /account/:account_number/api/entity/:entityId/records/quick-add
 * Quick-create a record from the calendar with minimal data
 */
router.post('/api/entity/:entityId/records/quick-add', async (req, res) => {
    try {
        const Entity = await tenantCollection(req, "Entity")
        const Record = await tenantCollection(req, "Record")
        const { entityId } = req.params
        const { title, dateFieldId, dateValue, duration, durationFieldId, statusOptionId, statusClassificationId } = req.body

        const entity = await Entity.findById(entityId)
            .populate('classifications')
            .populate('statusClassification')
            .lean()
        if (!entity) return res.status(404).json({ error: 'Entity not found' })

        // Build custom fields
        const customFields = []
        if (dateFieldId && dateValue) {
            customFields.push({ field_id: dateFieldId, value: dateValue })
        }
        if (durationFieldId && duration) {
            customFields.push({ field_id: durationFieldId, value: parseInt(duration) || 30 })
        }

        // Build classification values
        const classificationValues = []
        if (statusOptionId && statusClassificationId) {
            classificationValues.push({
                classificationId: statusClassificationId,
                optionId: statusOptionId,
            })
        }

        const recordData = {
            entityId: entity._id,
            title: title || 'Nouveau RDV',
            published: true,
            customFields,
            classificationValues,
            createdBy: req.user?._id,
        }

        // Compute denormalized fields
        const denormService = require('../services/record-denorm.service')
        const denorm = await denormService.computeDenorm(recordData, entity, Record, Entity)
        Object.assign(recordData, denorm)

        const newRecord = new Record(recordData)
        await newRecord.save()

        // Return the new record with enriched data
        const saved = await Record.findById(newRecord._id)
            .populate({ path: 'customFields.field_id', select: 'label type name' })
            .lean()

        res.json({ success: true, record: saved })
    } catch (error) {
        console.error('[API] Calendar quick-add error:', error)
        res.status(500).json({ error: error.message })
    }
})

// ═══════════════════════════════════════════════════════════════════════
// 🎴 CARD TEMPLATES API
// ═══════════════════════════════════════════════════════════════════════

/** GET /api/entity/:entityId/cards — List all card templates for an entity */
router.get('/api/entity/:entityId/cards', async (req, res) => {
    try {
        const CardTemplate = await tenantCollection(req, "CardTemplate")
        const { entityId } = req.params
        const filter = { entityId }
        if (req.query.context) filter.context = req.query.context
        let cards = await CardTemplate.find(filter).sort({ isDefault: -1, updatedAt: -1 }).lean()

        // Auto-seed default cards if none exist for this entity
        if (cards.length === 0 && !req.query.context) {
            const presets = getCardPresets()
            const defaultPresets = presets.filter(p => ['kanban-minimal', 'calendar-rdv'].includes(p.id))
            const seedCards = []
            for (const preset of defaultPresets) {
                const card = await CardTemplate.create({
                    name: preset.name,
                    entityId,
                    context: preset.context,
                    isDefault: true,
                    presetSlug: preset.id,
                    layout: preset.layout,
                    createdBy: req.user?._id,
                })
                seedCards.push(card.toObject())
            }
            cards = seedCards
        }

        res.json({ success: true, cards })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

/** GET /api/entity/:entityId/cards/default/:context — Default card for context */
router.get('/api/entity/:entityId/cards/default/:context', async (req, res) => {
    try {
        const CardTemplate = await tenantCollection(req, "CardTemplate")
        const { entityId, context } = req.params
        let card = await CardTemplate.findOne({ entityId, context, isDefault: true }).lean()
        if (!card) card = await CardTemplate.findOne({ entityId, context }).lean()
        if (!card) card = await CardTemplate.findOne({ entityId, context: 'universal', isDefault: true }).lean()
        res.json({ success: true, card: card || null })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

/** GET /api/entity/:entityId/cards/:cardId — Get one */
router.get('/api/entity/:entityId/cards/:cardId', async (req, res) => {
    try {
        const CardTemplate = await tenantCollection(req, "CardTemplate")
        const card = await CardTemplate.findById(req.params.cardId).lean()
        if (!card) return res.status(404).json({ error: 'Not found' })
        res.json({ success: true, card })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

/** POST /api/entity/:entityId/cards — Create */
router.post('/api/entity/:entityId/cards', async (req, res) => {
    try {
        const CardTemplate = await tenantCollection(req, "CardTemplate")
        const { entityId } = req.params
        const { name, context, isDefault, layout } = req.body
        if (isDefault) await CardTemplate.updateMany({ entityId, context }, { isDefault: false })
        const card = await CardTemplate.create({
            name, entityId, context: context || 'universal',
            isDefault: isDefault || false,
            layout: layout || { accentPosition: 'none', accentSource: 'none', zones: [] },
            createdBy: req.user?._id,
        })
        res.json({ success: true, card })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

/** PUT /api/entity/:entityId/cards/:cardId — Update */
router.put('/api/entity/:entityId/cards/:cardId', async (req, res) => {
    try {
        const CardTemplate = await tenantCollection(req, "CardTemplate")
        const { entityId, cardId } = req.params
        const { name, context, isDefault, layout } = req.body
        if (isDefault) {
            const c = context || (await CardTemplate.findById(cardId))?.context || 'universal'
            await CardTemplate.updateMany({ entityId, context: c, _id: { $ne: cardId } }, { isDefault: false })
        }
        const update = {}
        if (name !== undefined) update.name = name
        if (context !== undefined) update.context = context
        if (isDefault !== undefined) update.isDefault = isDefault
        if (layout !== undefined) update.layout = layout
        const card = await CardTemplate.findByIdAndUpdate(cardId, update, { new: true }).lean()
        if (!card) return res.status(404).json({ error: 'Not found' })
        res.json({ success: true, card })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

/** DELETE /api/entity/:entityId/cards/:cardId — Delete */
router.delete('/api/entity/:entityId/cards/:cardId', async (req, res) => {
    try {
        const CardTemplate = await tenantCollection(req, "CardTemplate")
        const result = await CardTemplate.findByIdAndDelete(req.params.cardId)
        if (!result) return res.status(404).json({ error: 'Not found' })
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

/** POST /api/entity/:entityId/cards/:cardId/set-default — Set as default */
router.post('/api/entity/:entityId/cards/:cardId/set-default', async (req, res) => {
    try {
        const CardTemplate = await tenantCollection(req, "CardTemplate")
        const card = await CardTemplate.findById(req.params.cardId)
        if (!card) return res.status(404).json({ error: 'Not found' })
        await CardTemplate.updateMany({ entityId: card.entityId, context: card.context, _id: { $ne: card._id } }, { isDefault: false })
        card.isDefault = true
        await card.save()
        res.json({ success: true, card })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

/** GET /api/card-presets — Built-in card templates library */
router.get('/api/card-presets', async (req, res) => {
    res.json({ success: true, presets: getCardPresets() })
})

function getCardPresets() {
    return [
        {
            id: 'kanban-minimal', name: 'Kanban Minimal', context: 'kanban',
            description: 'Carte simple: titre, statut, date',
            icon: 'solar:widget-5-bold-duotone',
            layout: {
                accentPosition: 'none', accentSource: 'none', borderRadius: 8, shadow: 'sm',
                zones: [
                    {
                        id: 'body', direction: 'column', gap: 6, padding: '12px', elements: [
                            { type: 'title', fontSize: 'sm', fontWeight: 'semibold', maxLines: 2, visible: true },
                            { type: 'status', format: 'badge', fontSize: 'xs', visible: true },
                        ]
                    },
                    {
                        id: 'footer', direction: 'row', gap: 4, padding: '8px 12px', align: 'between', borderTop: true, elements: [
                            { type: 'date', fieldId: '__createdAt__', icon: 'solar:calendar-linear', format: 'date', fontSize: 'xs', visible: true },
                            { type: 'actions', items: ['edit', 'view'], visible: true },
                        ]
                    }
                ]
            }
        },
        {
            id: 'kanban-detailed', name: 'Kanban Détaillé', context: 'kanban',
            description: 'Carte avec description, badges, et méta-données',
            icon: 'solar:card-bold-duotone',
            layout: {
                accentPosition: 'top', accentSource: 'status', borderRadius: 8, shadow: 'sm',
                zones: [
                    {
                        id: 'body', direction: 'column', gap: 6, padding: '12px', elements: [
                            { type: 'title', fontSize: 'sm', fontWeight: 'semibold', maxLines: 2, visible: true },
                            { type: 'field', fieldId: '__description__', fontSize: 'xs', maxLines: 2, color: '#6b7280', visible: true },
                            { type: 'status', format: 'badge', fontSize: 'xs', visible: true },
                        ]
                    },
                    {
                        id: 'footer', direction: 'row', gap: 4, padding: '8px 12px', align: 'between', borderTop: true, elements: [
                            { type: 'date', fieldId: '__createdAt__', icon: 'solar:calendar-linear', format: 'date', fontSize: 'xs', visible: true },
                            { type: 'actions', items: ['edit', 'view'], visible: true },
                        ]
                    }
                ]
            }
        },
        {
            id: 'calendar-rdv', name: 'Calendar RDV', context: 'calendar',
            description: 'Carte RDV avec heure, date et statut',
            icon: 'solar:calendar-bold-duotone',
            layout: {
                accentPosition: 'top', accentSource: 'status', borderRadius: 12, shadow: 'lg',
                zones: [
                    {
                        id: 'header', direction: 'column', gap: 4, padding: '16px 20px 8px', elements: [
                            { type: 'title', fontSize: 'base', fontWeight: 'bold', maxLines: 1, visible: true },
                        ]
                    },
                    {
                        id: 'body', direction: 'column', gap: 6, padding: '0 20px 12px', elements: [
                            { type: 'icon-value', fieldId: '__time__', icon: 'solar:clock-circle-linear', format: 'time-range', fontSize: 'xs', visible: true },
                            { type: 'icon-value', fieldId: '__date__', icon: 'solar:calendar-linear', format: 'date-long', fontSize: 'xs', visible: true },
                            { type: 'status', format: 'pill', fontSize: 'xs', visible: true },
                        ]
                    },
                    {
                        id: 'footer', direction: 'row', gap: 0, padding: '0', align: 'stretch', borderTop: true, elements: [
                            { type: 'actions', items: ['open', 'close'], visible: true },
                        ]
                    }
                ]
            }
        },
    ]
}

// ═══════════════════════════════════════════════════════════════
// 🧩 Sidebar Widgets CRUD
// ═══════════════════════════════════════════════════════════════

/**
 * POST /account/:account_number/api/entity/:entityId/sidebar-widgets
 * Create a new sidebar widget
 */
router.post('/api/entity/:entityId/sidebar-widgets', async (req, res) => {
    try {
        const Entity = await tenantCollection(req, "Entity")
        const { entityId } = req.params
        const { type, label, icon, color, config } = req.body

        if (!type || !label) {
            return res.status(400).json({ error: 'type and label are required' })
        }

        const entity = await Entity.findById(entityId)
        if (!entity) return res.status(404).json({ error: 'Entity not found' })

        const maxOrder = (entity.sidebarWidgets || []).reduce((max, w) => Math.max(max, w.order || 0), -1)

        const widget = {
            type,
            label,
            icon: icon || 'solar:widget-bold-duotone',
            color: color || '#4361ee',
            order: maxOrder + 1,
            visible: true,
            config: config || {}
        }

        entity.sidebarWidgets = entity.sidebarWidgets || []
        entity.sidebarWidgets.push(widget)
        await entity.save()

        const created = entity.sidebarWidgets[entity.sidebarWidgets.length - 1]
        res.json({ success: true, widget: created })

    } catch (error) {
        console.error('[API] Sidebar widget create error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * PUT /account/:account_number/api/entity/:entityId/sidebar-widgets/:widgetId
 * Update a sidebar widget
 */
router.put('/api/entity/:entityId/sidebar-widgets/:widgetId', async (req, res) => {
    try {
        const Entity = await tenantCollection(req, "Entity")
        const { entityId, widgetId } = req.params
        const { type, label, icon, color, config, visible } = req.body

        const entity = await Entity.findById(entityId)
        if (!entity) return res.status(404).json({ error: 'Entity not found' })

        const widget = (entity.sidebarWidgets || []).id(widgetId)
        if (!widget) return res.status(404).json({ error: 'Widget not found' })

        if (type !== undefined) widget.type = type
        if (label !== undefined) widget.label = label
        if (icon !== undefined) widget.icon = icon
        if (color !== undefined) widget.color = color
        if (config !== undefined) widget.config = config
        if (visible !== undefined) widget.visible = visible

        await entity.save()
        res.json({ success: true, widget })

    } catch (error) {
        console.error('[API] Sidebar widget update error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * DELETE /account/:account_number/api/entity/:entityId/sidebar-widgets/:widgetId
 * Delete a sidebar widget
 */
router.delete('/api/entity/:entityId/sidebar-widgets/:widgetId', async (req, res) => {
    try {
        const Entity = await tenantCollection(req, "Entity")
        const { entityId, widgetId } = req.params
        console.log('[API] DELETE sidebar widget - entityId:', entityId, 'widgetId:', widgetId)

        const entity = await Entity.findById(entityId)
        if (!entity) return res.status(404).json({ error: 'Entity not found' })

        const before = (entity.sidebarWidgets || []).length
        entity.sidebarWidgets = (entity.sidebarWidgets || []).filter(w => w._id.toString() !== widgetId)
        const after = entity.sidebarWidgets.length
        console.log('[API] Sidebar widgets: before=' + before + ', after=' + after + ', removed=' + (before - after))
        
        await entity.save()
        console.log('[API] Entity saved successfully')
        res.json({ success: true })

    } catch (error) {
        console.error('[API] Sidebar widget delete error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * GET /account/:account_number/api/widget/entities
 * Fetch all entities with their relations, classifications, and custom fields
 * Used by widget config modals to build dynamic filter options
 */
router.get('/api/widget/entities', async (req, res) => {
    try {
        await tenantCollection(req, "Classification")
        await tenantCollection(req, "FieldTemplate")
        const Entity = await tenantCollection(req, "Entity")
        const entities = await Entity.find({})
            .populate('classifications')
            .populate({ path: 'relations.targetEntity', select: 'name slug icon color' })
            .populate({ path: 'customFields', select: 'name label type inputType options type_config ui' })
            .select('name slug icon color relations classifications customFields statusClassification')
            .lean()

        const result = entities.map(e => ({
            _id: e._id.toString(),
            name: e.name,
            slug: e.slug,
            icon: e.icon || 'solar:widget-bold-duotone',
            color: e.color || '#4361ee',
            relations: (e.relations || []).map(r => ({
                key: r.key,
                label: r.label || '',
                cardinality: r.cardinality || 'one-to-many',
                targetEntity: r.targetEntity ? {
                    _id: (r.targetEntity._id || r.targetEntity).toString(),
                    name: r.targetEntity.name || '',
                    slug: r.targetEntity.slug || '',
                    icon: r.targetEntity.icon || '',
                    color: r.targetEntity.color || ''
                } : null
            })),
            classifications: (e.classifications || []).filter(c => c && typeof c === 'object').map(c => ({
                _id: c._id.toString(),
                name: c.name || '',
                options: (c.options || []).map(o => ({
                    _id: (o._id || '').toString(),
                    label: o.label || o.name || '',
                    color: o.color || ''
                }))
            })),
            customFields: (e.customFields || []).filter(cf => cf && typeof cf === 'object').map(cf => ({
                _id: cf._id.toString(),
                name: cf.name || cf.label || '',
                label: cf.label || cf.name || '',
                type: cf.type || 'text',
                inputType: cf.inputType || cf.type || 'text'
            })),
            dateFields: (e.customFields || []).filter(cf => {
                return cf && typeof cf === 'object' && (cf.type === 'date' || cf.inputType === 'date' || cf.inputType === 'datetime-local')
            }).map(cf => ({
                _id: cf._id.toString(),
                label: cf.label || cf.name || ''
            })),
            numericFields: (e.customFields || []).filter(cf => {
                return cf && typeof cf === 'object' && ['number', 'currency', 'decimal'].includes(cf.type)
            }).map(cf => ({
                _id: cf._id.toString(),
                label: cf.label || cf.name || ''
            }))
        }))

        res.json({ entities: result })
    } catch (error) {
        console.error('[API] Widget entities error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * GET /account/:account_number/api/widget/chart-data
 * Fetch aggregated record counts grouped by time period for Chart widget
 * Query params: 
 *   entityId, period (year|month|week|day), months (default 6),
 *   dateField (createdAt|updatedAt|custom field id),
 *   relationFilter (JSON: {key, value}), 
 *   classificationFilter (JSON: {classificationId, optionId}),
 *   yField (count|fieldId), yAgg (count|sum|avg)
 */
router.get('/api/widget/chart-data', async (req, res) => {
    try {
        const Record = await tenantCollection(req, "Record")
        const Entity = await tenantCollection(req, "Entity")
        const { entityId, period = 'month', months = 6, dateField = 'createdAt',
            relationFilter, classificationFilter, yField = 'count', yAgg = 'count',
            advancedFilters: afRaw, advancedFiltersLogic = 'and' } = req.query

        if (!entityId) return res.status(400).json({ error: 'entityId is required' })


        // Parse advanced filters
        let advancedFilters = []
        if (afRaw) { try { advancedFilters = JSON.parse(afRaw) } catch (e) { } }

        const entity = await Entity.findById(entityId).select('name slug icon color customFields').lean()
        if (!entity) return res.status(404).json({ error: 'Entity not found' })

        // Build query filter
        const now = new Date()
        const startDate = new Date(now)
        startDate.setMonth(startDate.getMonth() - parseInt(months))
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)

        const query = { entityId: entityId }

        // Date filter based on dateField
        const isCustomDateField = dateField && dateField !== 'createdAt' && dateField !== 'updatedAt'
        if (!isCustomDateField) {
            query[dateField || 'createdAt'] = { $gte: startDate }
        }

        // Relation filter: filter records that have a specific relation value
        if (relationFilter) {
            try {
                const rf = typeof relationFilter === 'string' ? JSON.parse(relationFilter) : relationFilter
                if (rf.key && rf.value) {
                    query['relations'] = {
                        $elemMatch: {
                            relationKey: rf.key,
                            value: { $in: [rf.value, ...(Array.isArray(rf.value) ? rf.value : [])] }
                        }
                    }
                }
            } catch (e) { /* ignore parse error */ }
        }

        // Classification filter: filter records with specific classification option
        if (classificationFilter) {
            try {
                const cf = typeof classificationFilter === 'string' ? JSON.parse(classificationFilter) : classificationFilter
                if (cf.classificationId && cf.optionId) {
                    query['classificationValues'] = {
                        $elemMatch: {
                            classificationId: cf.classificationId,
                            optionId: cf.optionId
                        }
                    }
                }
            } catch (e) { /* ignore parse error */ }
        }

        // Select fields needed
        let selectFields = 'createdAt updatedAt'
        if (isCustomDateField) selectFields += ' customFields'
        if (yField && yField !== 'count') selectFields += ' customFields'

        // Apply advanced filters
        applyAdvancedFilters(query, advancedFilters, advancedFiltersLogic, entity)

        const records = await Record.find(query).select(selectFields).lean()

        // Extract date from each record
        const getRecordDate = (r) => {
            if (isCustomDateField) {
                const cf = (r.customFields || []).find(c => {
                    const fid = (c.field_id?._id || c.field_id || '').toString()
                    return fid === dateField
                })
                return cf && cf.value ? new Date(cf.value) : null
            }
            return r[dateField || 'createdAt'] ? new Date(r[dateField || 'createdAt']) : null
        }

        // Filter by date range for custom fields (can't do it in MongoDB query)
        let filteredRecords = records
        if (isCustomDateField) {
            filteredRecords = records.filter(r => {
                const d = getRecordDate(r)
                return d && d >= startDate && d <= now
            })
        }

        // Group by period
        const grouped = {}
        const labels = []
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

        if (period === 'year') {
            const startYear = startDate.getFullYear()
            const endYear = now.getFullYear()
            for (let y = startYear; y <= endYear; y++) {
                const key = `${y}`
                labels.push({ key, label: `${y}` })
                grouped[key] = []
            }
            filteredRecords.forEach(r => {
                const d = getRecordDate(r)
                if (d) {
                    const key = `${d.getFullYear()}`
                    if (grouped[key]) grouped[key].push(r)
                }
            })
        } else if (period === 'month') {
            const cursor = new Date(startDate)
            while (cursor <= now) {
                const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
                const label = `${monthNames[cursor.getMonth()]} ${cursor.getFullYear()}`
                labels.push({ key, label })
                grouped[key] = []
                cursor.setMonth(cursor.getMonth() + 1)
            }
            filteredRecords.forEach(r => {
                const d = getRecordDate(r)
                if (d) {
                    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                    if (grouped[key]) grouped[key].push(r)
                }
            })
        } else if (period === 'week') {
            const getWeekKey = (d) => {
                const date = new Date(d)
                const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 1)) / 86400000)
                const weekNum = Math.ceil((dayOfYear + 1) / 7)
                return `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
            }
            const cursor = new Date(startDate)
            while (cursor <= now) {
                const key = getWeekKey(cursor)
                if (!grouped[key]) {
                    labels.push({ key, label: `S${key.split('-W')[1]}` })
                    grouped[key] = []
                }
                cursor.setDate(cursor.getDate() + 7)
            }
            filteredRecords.forEach(r => {
                const d = getRecordDate(r)
                if (d) {
                    const key = getWeekKey(d)
                    if (grouped[key]) grouped[key].push(r)
                }
            })
        } else if (period === 'day') {
            // Use months parameter to determine how many days to show (cap at 180 to avoid browser crash)
            const daysCount = Math.min(180, Math.max(7, parseInt(months) * 30))
            const cursor = new Date(now)
            cursor.setDate(cursor.getDate() - daysCount)
            cursor.setHours(0, 0, 0, 0)
            while (cursor <= now) {
                const key = cursor.toISOString().split('T')[0]
                const label = `${cursor.getDate()} ${monthNames[cursor.getMonth()]}`
                labels.push({ key, label })
                grouped[key] = []
                cursor.setDate(cursor.getDate() + 1)
            }
            filteredRecords.forEach(r => {
                const d = getRecordDate(r)
                if (d) {
                    const key = d.toISOString().split('T')[0]
                    if (grouped[key]) grouped[key].push(r)
                }
            })
        }

        // Compute Y values (count or aggregate on a field)
        let data
        if (yField && yField !== 'count' && yAgg !== 'count') {
            // Aggregate a specific numeric field
            data = labels.map(l => {
                const recs = grouped[l.key] || []
                if (recs.length === 0) return 0
                const values = recs.map(r => {
                    const cf = (r.customFields || []).find(c => {
                        const fid = (c.field_id?._id || c.field_id || '').toString()
                        return fid === yField
                    })
                    return cf ? parseFloat(cf.value) || 0 : 0
                }).filter(v => !isNaN(v))
                if (values.length === 0) return 0
                if (yAgg === 'sum') return values.reduce((a, b) => a + b, 0)
                if (yAgg === 'avg') return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100
                if (yAgg === 'min') return Math.min(...values)
                if (yAgg === 'max') return Math.max(...values)
                return values.length
            })
        } else {
            data = labels.map(l => (grouped[l.key] || []).length)
        }

        const labelTexts = labels.map(l => l.label)

        res.json({
            labels: labelTexts,
            data,
            total: filteredRecords.length,
            entityName: entity.name,
            entityColor: entity.color || '#4361ee'
        })
    } catch (error) {
        console.error('[API] Chart data error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * GET /account/:account_number/api/widget/timeline-data
 * Fetch recent records for Timeline widget
 * Query params: 
 *   entityId (source entity), recordId (current record), relationKey (optional), limit (default 10),
 *   dateField (createdAt|updatedAt|custom field id),
 *   relationFilter (JSON: {key, value}),
 *   classificationFilter (JSON: {classificationId, optionId})
 */
router.get('/api/widget/timeline-data', async (req, res) => {
    try {
        const mongoose = require('mongoose')
        const Record = await tenantCollection(req, "Record")
        const Entity = await tenantCollection(req, "Entity")
        const { entityId, recordId, relationKey, limit = 10, dateField = 'createdAt',
            sort = 'desc', relationFilter, classificationFilter,
            advancedFilters: afRaw, advancedFiltersLogic = 'and' } = req.query

        // Parse advanced filters
        let advancedFilters = []
        if (afRaw) { try { advancedFilters = JSON.parse(afRaw) } catch (e) { } }

        if (!entityId) return res.status(400).json({ error: 'entityId required' })

        const entity = await Entity.findById(entityId)
            .populate({ path: 'relations.targetEntity', select: 'name slug icon color' })
            .lean()
        if (!entity) return res.status(404).json({ error: 'Entity not found' })

        let timelineRecords = []
        const isCustomDateField = dateField && dateField !== 'createdAt' && dateField !== 'updatedAt'

        // Build base query with filters
        const buildFilterQuery = (baseQuery) => {
            // Relation filter
            if (relationFilter) {
                try {
                    const rf = typeof relationFilter === 'string' ? JSON.parse(relationFilter) : relationFilter
                    if (rf.key && rf.value) {
                        baseQuery['relations'] = {
                            $elemMatch: {
                                relationKey: rf.key,
                                value: { $in: [rf.value, ...(Array.isArray(rf.value) ? rf.value : [])] }
                            }
                        }
                    }
                } catch (e) { /* ignore */ }
            }

            // Classification filter
            if (classificationFilter) {
                try {
                    const cf = typeof classificationFilter === 'string' ? JSON.parse(classificationFilter) : classificationFilter
                    if (cf.classificationId && cf.optionId) {
                        baseQuery['classificationValues'] = {
                            $elemMatch: {
                                classificationId: cf.classificationId,
                                optionId: cf.optionId
                            }
                        }
                    }
                } catch (e) { /* ignore */ }
            }
            return baseQuery
        }

        // Also apply advanced filters (applied to all queries below)
        const applyAllFilters = (baseQuery) => {
            const q = buildFilterQuery(baseQuery)
            return applyAdvancedFilters(q, advancedFilters, advancedFiltersLogic, entity)
        }

        // Determine sort field for MongoDB
        const sortDirection = sort === 'asc' ? 1 : -1
        const sortField = isCustomDateField ? 'createdAt' : (dateField || 'createdAt')

        if (relationKey && recordId) {
            // Fetch records from a related entity
            const record = await Record.findById(recordId).lean()
            if (!record) return res.status(404).json({ error: 'Record not found' })

            if (relationKey.startsWith('inv_')) {
                const sourceRelKey = relationKey.replace('inv_', '')
                const sourceEntities = await Entity.find({
                    'relations.key': sourceRelKey,
                    'relations.targetEntity': entity._id
                }).select('_id name slug icon color').lean()

                for (const srcEnt of sourceEntities) {
                    const q = applyAllFilters({
                        entityId: srcEnt._id,
                        $or: [
                            { 'relations': { $elemMatch: { relationKey: sourceRelKey, value: record._id } } },
                            { 'relations': { $elemMatch: { relationKey: sourceRelKey, value: record._id.toString() } } },
                            { 'relations': { $elemMatch: { relationKey: sourceRelKey, value: { $in: [record._id, record._id.toString()] } } } }
                        ]
                    })
                    const relRecords = await Record.find(q)
                        .select('_id title computedTitle createdAt updatedAt entityId customFields')
                        .sort({ [sortField]: sortDirection })
                        .limit(parseInt(limit))
                        .lean()

                    timelineRecords.push(...relRecords.map(r => ({
                        _id: r._id,
                        title: r.computedTitle || r.title || 'Sans titre',
                        date: getDateFromRecord(r, dateField, isCustomDateField),
                        entityName: srcEnt.name || '',
                        entitySlug: srcEnt.slug || '',
                        entityIcon: srcEnt.icon || 'solar:widget-bold-duotone',
                        entityColor: srcEnt.color || '#4361ee',
                    })))
                }
            } else {
                const rel = (entity.relations || []).find(r => r.key === relationKey)
                if (rel) {
                    const rv = (record.relations || []).find(r => r.relationKey === relationKey)
                    if (rv && rv.value) {
                        const targetIds = Array.isArray(rv.value) ? rv.value : [rv.value]
                        const validIds = targetIds.filter(id => mongoose.Types.ObjectId.isValid(id))
                        if (validIds.length > 0) {
                            const targetEntity = rel.targetEntity || {}
                            const q = applyAllFilters({ _id: { $in: validIds } })
                            const relRecords = await Record.find(q)
                                .select('_id title computedTitle createdAt updatedAt entityId customFields')
                                .sort({ [sortField]: sortDirection })
                                .limit(parseInt(limit))
                                .lean()

                            timelineRecords = relRecords.map(r => ({
                                _id: r._id,
                                title: r.computedTitle || r.title || 'Sans titre',
                                date: getDateFromRecord(r, dateField, isCustomDateField),
                                entityName: targetEntity.name || '',
                                entitySlug: targetEntity.slug || '',
                                entityIcon: targetEntity.icon || 'solar:widget-bold-duotone',
                                entityColor: targetEntity.color || '#4361ee',
                            }))
                        }
                    }
                }
            }
        } else {
            // Fetch records directly from the entity
            const q = applyAllFilters({ entityId })
            const allRecords = await Record.find(q)
                .select('_id title computedTitle createdAt updatedAt customFields')
                .sort({ [sortField]: sortDirection })
                .limit(parseInt(limit))
                .lean()

            timelineRecords = allRecords.map(r => ({
                _id: r._id,
                title: r.computedTitle || r.title || 'Sans titre',
                date: getDateFromRecord(r, dateField, isCustomDateField),
                entityName: entity.name || '',
                entitySlug: entity.slug || '',
                entityIcon: entity.icon || 'solar:widget-bold-duotone',
                entityColor: entity.color || '#4361ee',
            }))
        }

        // Sort by date using requested direction
        timelineRecords.sort((a, b) => sort === 'asc'
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date))

        res.json({
            records: timelineRecords.slice(0, parseInt(limit)),
            total: timelineRecords.length,
            entityName: entity.name
        })
    } catch (error) {
        console.error('[API] Timeline data error:', error)
        res.status(500).json({ error: error.message })
    }
})

// Helper: extract date from record based on dateField config
function getDateFromRecord(r, dateField, isCustomDateField) {
    if (isCustomDateField) {
        const cf = (r.customFields || []).find(c => {
            const fid = (c.field_id?._id || c.field_id || '').toString()
            return fid === dateField
        })
        return cf && cf.value ? cf.value : r.createdAt
    }
    return r[dateField || 'createdAt']
}

/**
 * Apply advanced filters to a MongoDB query object
 * @param {Object} query - existing MongoDB query
 * @param {Array} filters - [{field, operator, value, value2}]
 * @param {String} logic - "and" | "or"
 * @param {Object} entity - entity with customFields populated
 */
function applyAdvancedFilters(query, filters, logic = 'and', entity = null) {
    if (!filters || !Array.isArray(filters) || filters.length === 0) return query

    const conditions = []
    for (const f of filters) {
        if (!f.field || !f.operator) continue

        let cond = null
        const isSystemField = ['createdAt', 'updatedAt', 'title', 'computedTitle', 'status'].includes(f.field)
        const isClassification = f.field.startsWith('classif:')

        if (isClassification) {
            const classifId = f.field.replace('classif:', '')
            if (f.operator === 'equals' && f.value) {
                cond = { 'classificationValues': { $elemMatch: { classificationId: classifId, optionId: f.value } } }
            } else if (f.operator === 'not_equals' && f.value) {
                cond = { 'classificationValues': { $not: { $elemMatch: { classificationId: classifId, optionId: f.value } } } }
            } else if (f.operator === 'is_empty') {
                cond = {
                    $or: [
                        { 'classificationValues': { $not: { $elemMatch: { classificationId: classifId } } } },
                        { 'classificationValues': { $elemMatch: { classificationId: classifId, optionId: { $in: [null, ''] } } } }
                    ]
                }
            } else if (f.operator === 'is_not_empty') {
                cond = { 'classificationValues': { $elemMatch: { classificationId: classifId, optionId: { $nin: [null, ''] } } } }
            }
        } else if (isSystemField) {
            const path = f.field
            cond = buildFieldCondition(path, f.operator, f.value, f.value2)
        } else {
            // Custom field - query on customFields array
            const baseCond = { 'customFields.field_id': f.field }
            const valueCond = buildCustomFieldCondition(f.operator, f.value, f.value2)
            if (valueCond) {
                cond = { customFields: { $elemMatch: { field_id: f.field, ...valueCond } } }
            }
        }

        if (cond) conditions.push(cond)
    }

    if (conditions.length === 0) return query

    if (logic === 'or') {
        if (query.$or) {
            query.$and = query.$and || []
            query.$and.push({ $or: conditions })
        } else {
            query.$or = conditions
        }
    } else {
        query.$and = query.$and || []
        query.$and.push(...conditions)
    }

    return query
}

function buildFieldCondition(path, operator, value, value2) {
    switch (operator) {
        case 'equals': return { [path]: value }
        case 'not_equals': return { [path]: { $ne: value } }
        case 'contains': return { [path]: { $regex: value, $options: 'i' } }
        case 'not_contains': return { [path]: { $not: { $regex: value, $options: 'i' } } }
        case 'starts_with': return { [path]: { $regex: '^' + value, $options: 'i' } }
        case 'ends_with': return { [path]: { $regex: value + '$', $options: 'i' } }
        case 'gt': return { [path]: { $gt: isNaN(value) ? value : parseFloat(value) } }
        case 'gte': return { [path]: { $gte: isNaN(value) ? value : parseFloat(value) } }
        case 'lt': return { [path]: { $lt: isNaN(value) ? value : parseFloat(value) } }
        case 'lte': return { [path]: { $lte: isNaN(value) ? value : parseFloat(value) } }
        case 'between': return { [path]: { $gte: isNaN(value) ? value : parseFloat(value), $lte: isNaN(value2) ? value2 : parseFloat(value2) } }
        case 'is_empty': return { $or: [{ [path]: { $exists: false } }, { [path]: null }, { [path]: '' }] }
        case 'is_not_empty': return { [path]: { $exists: true, $nin: [null, ''] } }
        default: return null
    }
}

function buildCustomFieldCondition(operator, value, value2) {
    switch (operator) {
        case 'equals': return { value: value }
        case 'not_equals': return { value: { $ne: value } }
        case 'contains': return { value: { $regex: value, $options: 'i' } }
        case 'not_contains': return { value: { $not: { $regex: value, $options: 'i' } } }
        case 'starts_with': return { value: { $regex: '^' + value, $options: 'i' } }
        case 'ends_with': return { value: { $regex: value + '$', $options: 'i' } }
        case 'gt': return { value: { $gt: isNaN(value) ? value : parseFloat(value) } }
        case 'gte': return { value: { $gte: isNaN(value) ? value : parseFloat(value) } }
        case 'lt': return { value: { $lt: isNaN(value) ? value : parseFloat(value) } }
        case 'lte': return { value: { $lte: isNaN(value) ? value : parseFloat(value) } }
        case 'between': return { value: { $gte: isNaN(value) ? value : parseFloat(value), $lte: isNaN(value2) ? value2 : parseFloat(value2) } }
        case 'is_empty': return { $or: [{ value: { $exists: false } }, { value: null }, { value: '' }] }
        case 'is_not_empty': return { value: { $exists: true, $nin: [null, ''] } }
        default: return null
    }
}

/**
 * GET /account/:account_number/api/widget/entity-fields/:entityId
 * Returns all filterable fields for a given entity (system fields + custom fields + classifications)
 * Used by the advanced filter builder in widget config modals
 */
router.get('/api/widget/entity-fields/:entityId', async (req, res) => {
    try {
        await tenantCollection(req, "Classification")
        await tenantCollection(req, "FieldTemplate")
        const Entity = await tenantCollection(req, "Entity")
        const entity = await Entity.findById(req.params.entityId)
            .populate('classifications')
            .populate({ path: 'customFields', select: 'name label type inputType options type_config ui' })
            .lean()

        if (!entity) return res.status(404).json({ error: 'Entity not found' })

        const fields = []

        // System fields
        fields.push(
            { _id: 'createdAt', label: 'Date de création', type: 'date', category: 'system' },
            { _id: 'updatedAt', label: 'Date de modification', type: 'date', category: 'system' },
            { _id: 'title', label: 'Titre', type: 'text', category: 'system' },
            { _id: 'computedTitle', label: 'Titre calculé', type: 'text', category: 'system' }
        )

            // Custom fields
            ; (entity.customFields || []).filter(cf => cf && typeof cf === 'object').forEach(cf => {
                fields.push({
                    _id: cf._id.toString(),
                    label: cf.label || cf.name || '',
                    type: cf.type || cf.inputType || 'text',
                    category: 'custom',
                    options: cf.options || []
                })
            })

            // Classifications
            ; (entity.classifications || []).filter(c => c && typeof c === 'object').forEach(c => {
                fields.push({
                    _id: 'classif:' + c._id.toString(),
                    label: c.name || '',
                    type: 'classification',
                    category: 'classification',
                    options: (c.options || []).map(o => ({
                        _id: (o._id || '').toString(),
                        label: o.label || o.name || '',
                        color: o.color || ''
                    }))
                })
            })

        res.json({ fields })
    } catch (error) {
        console.error('[API] Entity fields error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * GET /account/:account_number/api/widget/lines-history
 * Fetch DocumentLine entries across related records for the lines-history widget.
 *
 * Query params:
 *   - recordId       : current record ObjectId
 *   - schemaId       : LineSchema ObjectId to query
 *   - source         : 'direct' | 'indirect'
 *   - relationPath   : JSON string, array of { relationKey, targetEntityId }
 *   - limit          : max lines (default 100)
 *   - sortDirection  : 'asc' | 'desc' (default 'desc')
 */
router.get('/api/widget/lines-history', async (req, res) => {
    try {
        const mongoose = require('mongoose')
        const Record = await tenantCollection(req, 'Record')
        const DocumentLine = await tenantCollection(req, 'DocumentLine')
        const LineSchema = await tenantCollection(req, 'LineSchema')
        const Entity = await tenantCollection(req, 'Entity')
        if (!Record || !DocumentLine || !LineSchema) {
            return res.status(500).json({ error: 'Models not available' })
        }

        const { recordId, schemaId, source, relationPath: relationPathStr, limit: limitStr, sortDirection } = req.query
        if (!recordId || !schemaId) {
            return res.status(400).json({ error: 'recordId and schemaId are required' })
        }

        const limitNum = Math.min(parseInt(limitStr) || 100, 500)
        const sortDir = sortDirection === 'asc' ? 1 : -1

        // Load the schema for column definitions
        const schema = await LineSchema.findById(schemaId).lean()
        if (!schema) {
            return res.status(404).json({ error: 'LineSchema not found' })
        }

        let targetRecordIds = []

        if (source === 'direct') {
            // Direct: DocumentLines on the current record
            targetRecordIds = [new mongoose.Types.ObjectId(recordId)]
        } else {
            // Indirect: follow the relation chain to find target records
            let relationPath = []
            try { relationPath = JSON.parse(relationPathStr || '[]') } catch(e) { /* ignore */ }

            if (!relationPath.length) {
                return res.json({ groups: [], schema: { columns: schema.columns, name: schema.name }, total: 0 })
            }

            // Step through the relation chain
            let currentRecordIds = [new mongoose.Types.ObjectId(recordId)]

            for (const step of relationPath) {
                if (!step.relationKey) break

                // Find the relation definition on the source entity to determine direction
                // We need to find records that are linked via this relation
                const nextIds = new Set()

                // Strategy 1: Forward lookup — current records have relations[].value pointing to targets
                const forwardRecords = await Record.find({
                    _id: { $in: currentRecordIds },
                    'relations.relationKey': step.relationKey
                }).select('relations').lean()

                for (const r of forwardRecords) {
                    const rel = (r.relations || []).find(x => x.relationKey === step.relationKey)
                    if (rel && rel.value) {
                        const vals = Array.isArray(rel.value) ? rel.value : [rel.value]
                        vals.forEach(v => { if (v) nextIds.add(v.toString()) })
                    }
                }

                // Strategy 2: Inverse lookup — other records have relations[].value pointing to current records
                if (nextIds.size === 0) {
                    const inverseRecords = await Record.find({
                        'relations': {
                            $elemMatch: {
                                relationKey: step.relationKey,
                                value: { $in: currentRecordIds }
                            }
                        }
                    }).select('_id').lean()

                    for (const r of inverseRecords) {
                        nextIds.add(r._id.toString())
                    }

                    // Also check where value is an array containing any of currentRecordIds
                    if (nextIds.size === 0) {
                        const inverseRecords2 = await Record.find({
                            'relations.relationKey': step.relationKey,
                            'relations.value': { $in: currentRecordIds }
                        }).select('_id').lean()

                        for (const r of inverseRecords2) {
                            nextIds.add(r._id.toString())
                        }
                    }
                }

                currentRecordIds = [...nextIds].map(id => new mongoose.Types.ObjectId(id))
                if (currentRecordIds.length === 0) break
            }

            targetRecordIds = currentRecordIds
        }

        if (targetRecordIds.length === 0) {
            return res.json({ groups: [], schema: { columns: schema.columns, name: schema.name }, total: 0 })
        }

        // Fetch DocumentLines for all target records
        const lines = await DocumentLine.find({
            documentId: { $in: targetRecordIds },
            schemaId: new mongoose.Types.ObjectId(schemaId)
        }).sort({ order: 1 }).limit(limitNum).lean()

        // Fetch parent record metadata for grouping
        const parentRecords = await Record.find({
            _id: { $in: targetRecordIds }
        }).select('title computedTitle createdAt date entityId').lean()

        const parentMap = {}
        parentRecords.forEach(r => {
            parentMap[r._id.toString()] = {
                _id: r._id,
                title: r.computedTitle || r.title || 'Sans titre',
                date: r.date || r.createdAt,
                entityId: r.entityId
            }
        })

        // Group lines by parent record
        const groupMap = {}
        for (const line of lines) {
            const parentId = line.documentId.toString()
            if (!groupMap[parentId]) {
                groupMap[parentId] = {
                    record: parentMap[parentId] || { _id: parentId, title: 'Sans titre', date: null },
                    lines: []
                }
            }
            groupMap[parentId].lines.push(line)
        }

        // Sort groups by record date
        const groups = Object.values(groupMap).sort((a, b) => {
            const da = a.record.date ? new Date(a.record.date).getTime() : 0
            const db = b.record.date ? new Date(b.record.date).getTime() : 0
            return sortDir * (db - da)
        })

        res.json({
            groups,
            schema: {
                _id: schema._id,
                name: schema.name,
                columns: schema.columns
            },
            total: lines.length
        })
    } catch (error) {
        console.error('[API] Lines history error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * GET /account/:account_number/api/widget/available-schemas
 * Return all LineSchemas available for a given entity and its related entities.
 * Used by the lines-history widget config modal.
 */
router.get('/api/widget/available-schemas', async (req, res) => {
    try {
        const Entity = await tenantCollection(req, 'Entity')
        const LineSchema = await tenantCollection(req, 'LineSchema')
        if (!Entity || !LineSchema) {
            return res.status(500).json({ error: 'Models not available' })
        }

        const { entityId } = req.query
        if (!entityId) return res.status(400).json({ error: 'entityId required' })

        const entity = await Entity.findById(entityId)
            .populate('relations.targetEntity', 'name slug gridSchemas')
            .lean()
        if (!entity) return res.status(404).json({ error: 'Entity not found' })

        const result = []

        // 1. Direct schemas: schemas attached to this entity
        const directSchemaIds = (entity.gridSchemas || []).map(gs => gs.schemaId).filter(Boolean)
        if (directSchemaIds.length > 0) {
            const directSchemas = await LineSchema.find({ _id: { $in: directSchemaIds } }).select('name slug columns').lean()
            for (const s of directSchemas) {
                result.push({
                    schemaId: s._id,
                    schemaName: s.name,
                    source: 'direct',
                    path: [],
                    entityName: entity.name,
                    columns: (s.columns || []).map(c => ({ key: c.key, label: c.label, type: c.type }))
                })
            }
        }

        // 2. Indirect schemas: schemas on related entities (1 hop)
        for (const rel of (entity.relations || [])) {
            if (!rel.targetEntity) continue
            const target = rel.targetEntity
            const targetSchemaIds = (target.gridSchemas || []).map(gs => gs.schemaId).filter(Boolean)
            if (targetSchemaIds.length > 0) {
                const targetSchemas = await LineSchema.find({ _id: { $in: targetSchemaIds } }).select('name slug columns').lean()
                for (const s of targetSchemas) {
                    result.push({
                        schemaId: s._id,
                        schemaName: s.name,
                        source: 'indirect',
                        path: [{ relationKey: rel.key, targetEntityId: target._id, label: rel.label || target.name }],
                        entityName: target.name,
                        relationLabel: rel.label || target.name,
                        columns: (s.columns || []).map(c => ({ key: c.key, label: c.label, type: c.type }))
                    })
                }
            }

            // 2b. Indirect schemas: 2 hops (entity → related → related's related)
            if (target._id) {
                const deepTarget = await Entity.findById(target._id)
                    .populate('relations.targetEntity', 'name slug gridSchemas')
                    .lean()
                if (deepTarget) {
                    for (const rel2 of (deepTarget.relations || [])) {
                        if (!rel2.targetEntity) continue
                        const target2 = rel2.targetEntity
                        const t2SchemaIds = (target2.gridSchemas || []).map(gs => gs.schemaId).filter(Boolean)
                        if (t2SchemaIds.length > 0) {
                            const t2Schemas = await LineSchema.find({ _id: { $in: t2SchemaIds } }).select('name slug columns').lean()
                            for (const s of t2Schemas) {
                                result.push({
                                    schemaId: s._id,
                                    schemaName: s.name,
                                    source: 'indirect',
                                    path: [
                                        { relationKey: rel.key, targetEntityId: target._id, label: rel.label || target.name },
                                        { relationKey: rel2.key, targetEntityId: target2._id, label: rel2.label || target2.name }
                                    ],
                                    entityName: target2.name,
                                    relationLabel: `${rel.label || target.name} → ${rel2.label || target2.name}`,
                                    columns: (s.columns || []).map(c => ({ key: c.key, label: c.label, type: c.type }))
                                })
                            }
                        }
                    }
                }
            }
        }

        // 3. Fallback: All LineSchemas in workspace (not already found via entity.gridSchemas)
        // This ensures schemas that exist but aren't explicitly linked to entities are still available
        const foundSchemaIds = new Set(result.map(r => r.schemaId.toString()))
        const allSchemas = await LineSchema.find({}).select('name slug columns').lean()
        for (const s of allSchemas) {
            if (!foundSchemaIds.has(s._id.toString())) {
                result.push({
                    schemaId: s._id,
                    schemaName: s.name,
                    source: 'direct',
                    path: [],
                    entityName: entity.name,
                    columns: (s.columns || []).map(c => ({ key: c.key, label: c.label, type: c.type }))
                })
            }
        }

        res.json({ schemas: result })
    } catch (error) {
        console.error('[API] Available schemas error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * GET /account/:account_number/api/widget/dynamic-table-data
 * Fetch DocumentLines + Snapshots for the Dynamic Table widget in custom tabs.
 *
 * Query params:
 *   - recordId       : current record ObjectId
 *   - schemaId       : LineSchema ObjectId
 *   - source         : 'direct' | 'indirect'
 *   - relationPath   : JSON string, array of { relationKey, targetEntityId }
 *   - includeSnapshots : 'true' to also fetch grid snapshots
 */
router.get('/api/widget/dynamic-table-data', async (req, res) => {
    try {
        const mongoose = require('mongoose')
        const Record = await tenantCollection(req, 'Record')
        const DocumentLine = await tenantCollection(req, 'DocumentLine')
        const LineSchema = await tenantCollection(req, 'LineSchema')
        const Entity = await tenantCollection(req, 'Entity')
        if (!Record || !DocumentLine || !LineSchema) {
            return res.status(500).json({ error: 'Models not available' })
        }

        const { recordId, schemaId, source, relationPath: relationPathStr, includeSnapshots } = req.query
        if (!recordId || !schemaId) {
            return res.status(400).json({ error: 'recordId and schemaId are required' })
        }

        // Load the schema for column definitions
        const schema = await LineSchema.findById(schemaId).lean()
        if (!schema) {
            return res.status(404).json({ error: 'LineSchema not found' })
        }

        let targetRecordId = recordId

        if (source === 'indirect') {
            // Follow relation path to find the target record
            let relationPath = []
            try { relationPath = JSON.parse(relationPathStr || '[]') } catch (e) { /* ignore */ }

            if (relationPath.length) {
                let currentRecordIds = [new mongoose.Types.ObjectId(recordId)]

                for (const step of relationPath) {
                    if (!step.relationKey) break
                    const nextIds = new Set()

                    // Forward lookup
                    const forwardRecords = await Record.find({
                        _id: { $in: currentRecordIds },
                        'relations.relationKey': step.relationKey
                    }).select('relations').lean()

                    for (const r of forwardRecords) {
                        const rel = (r.relations || []).find(x => x.relationKey === step.relationKey)
                        if (rel && rel.value) {
                            const vals = Array.isArray(rel.value) ? rel.value : [rel.value]
                            vals.forEach(v => { if (v) nextIds.add(v.toString()) })
                        }
                    }

                    // Inverse lookup if forward yielded nothing
                    if (nextIds.size === 0) {
                        const inverseRecords = await Record.find({
                            'relations': {
                                $elemMatch: {
                                    relationKey: step.relationKey,
                                    value: { $in: currentRecordIds }
                                }
                            }
                        }).select('_id').lean()

                        for (const r of inverseRecords) {
                            nextIds.add(r._id.toString())
                        }
                    }

                    currentRecordIds = [...nextIds].map(id => new mongoose.Types.ObjectId(id))
                    if (currentRecordIds.length === 0) break
                }

                // Use the first target record found
                if (currentRecordIds.length > 0) {
                    targetRecordId = currentRecordIds[0].toString()
                }
            }
        }

        // Fetch DocumentLines for the target record
        const lines = await DocumentLine.find({
            documentId: targetRecordId,
            schemaId: new mongoose.Types.ObjectId(schemaId)
        }).sort({ order: 1 }).lean()

        // Fetch snapshots if requested
        let snapshots = []
        if (includeSnapshots === 'true') {
            try {
                const GridSnapshot = await tenantCollection(req, 'GridSnapshot')
                if (GridSnapshot) {
                    snapshots = await GridSnapshot.find({
                        schemaId: new mongoose.Types.ObjectId(schemaId),
                        targetRecordId: targetRecordId
                    }).sort({ createdAt: -1 }).lean()
                }
            } catch (e) { /* GridSnapshot model may not exist */ }
        }

        // Get entity info for linked documents
        const record = await Record.findById(targetRecordId).select('entityId title computedTitle').lean()
        let entityInfo = null
        if (record && record.entityId) {
            entityInfo = await Entity.findById(record.entityId).select('name slug icon color gridSchemas').lean()
        }

        // Find the gridSchema config for this schema (for lineTypes, catalog settings etc.)
        let gridSchemaConfig = null
        if (entityInfo && entityInfo.gridSchemas) {
            gridSchemaConfig = entityInfo.gridSchemas.find(gs => gs.schemaId && gs.schemaId.toString() === schemaId)
        }

        // Extract catalog entity from relation columns if gridSchemaConfig doesn't provide one
        let catalogEntityId = gridSchemaConfig?.catalogEntityId || null
        if (!catalogEntityId) {
            const relationCol = (schema.columns || []).find(c => c.type === 'relation' && c.config?.targetEntity)
            if (relationCol) {
                catalogEntityId = relationCol.config.targetEntity
            }
        }

        res.json({
            lines,
            schema: {
                _id: schema._id,
                name: schema.name,
                columns: schema.columns || [],
                totals: schema.totals || null,
                slug: schema.slug,
                lineTypes: schema.lineTypes || []
            },
            snapshots,
            targetRecordId,
            recordTitle: record ? (record.computedTitle || record.title || '') : '',
            gridSchemaConfig: gridSchemaConfig || null,
            catalogEntityId,
            entityInfo: entityInfo ? { _id: entityInfo._id, name: entityInfo.name, slug: entityInfo.slug, icon: entityInfo.icon, color: entityInfo.color } : null
        })
    } catch (error) {
        console.error('[API] Dynamic table data error:', error)
        res.status(500).json({ error: error.message })
    }
})

// ═══ Record Chat API (conversations + messages per record) ═══
require('./api/api-record-chat.router')(router)

// ═══════════════════════════════════════════════════════════════
// USER THEME PREFERENCE
// ═══════════════════════════════════════════════════════════════

/**
 * POST /account/:account_number/api/user/theme
 * Persist user's theme preference (light/dark) in the DB
 */
const User = require('../models/user.model')
router.post('/api/user/theme', async (req, res) => {
    try {
        const { theme } = req.body
        if (!theme || !['light', 'dark'].includes(theme)) {
            return res.status(400).json({ error: 'Invalid theme. Must be "light" or "dark".' })
        }
        if (!req.user?._id) {
            return res.status(401).json({ error: 'User not authenticated' })
        }
        await User.findByIdAndUpdate(req.user._id, {
            $set: { 'preferences.theme': theme }
        })
        res.json({ success: true, theme })
    } catch (error) {
        console.error('[API] Theme save error:', error)
        res.status(500).json({ error: error.message })
    }
})

module.exports = router
