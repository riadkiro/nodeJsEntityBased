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
const { tenantCollection } = require('../middleware/tenant')

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
            q = ''
        } = req.query

        const pageNum = parseInt(page)
        const limitNum = parseInt(limit)

        // Register FieldTemplate and Classification BEFORE Entity to allow populate
        await tenantCollection(req, 'FieldTemplate')
        await tenantCollection(req, 'Classification')

        // Get entity with customFields, statusClassification, classifications populated
        const entity = await Entity.findById(entityId)
            .populate('customFields')
            .populate('statusClassification')
            .populate('classifications')
            .lean()

        if (!entity) {
            return res.status(404).json({ error: 'Entity not found' })
        }

        // Build query - use entityId field name as in Record model
        let query = { entityId: entityId }
        if (q && q.trim()) {
            query = {
                $and: [
                    { entityId: entityId },
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
        console.log('[API] Search query:', JSON.stringify({ q, query }, null, 2))

        // Get total count (required for accurate pagination)
        const total = await Record.countDocuments(query)

        // Parse sort
        const [sortField, sortDirection] = sort.split(':')
        const sortObj = { [sortField]: sortDirection === 'asc' ? 1 : -1 }

        // Fetch records with pagination - minimal populate for performance
        const records = await Record.find(query)
            .select('title computedTitle image customFields status classificationValues relations _denorm createdAt updatedAt')
            .populate({
                path: 'customFields.field_id',
                select: 'label fieldType'
            })
            .sort(sortObj)
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .lean()

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
        if (req.user?._id) {
            const prefs = await UserPreferences.findOne({
                userId: req.user._id,
                viewId
            }).lean()
            preferences = prefs?.preferences || null

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
        const customFieldColumns = (entity.customFields || []).map(f => ({
            id: f._id.toString(),
            name: f.label || f.name || 'Champ',
            type: f.fieldType || 'text',
            sortable: f.category !== 'computed',
            computed: f.category === 'computed' || undefined,
            computedDisplay: f.category === 'computed' ? (f.render?.display?.table || 'text') : undefined,
            computedColor: f.category === 'computed' ? (f.color || '#4361ee') : undefined,
        }))

        // Relation columns
        const relationColumns = (entity.relations || []).map(rel => ({
            id: `rel:${rel.key}`,
            name: rel.label || rel.key,
            type: 'relation',
            sortable: false
        }))

        // Classification columns (use allClassifications for deduplication)
        const classificationColumns = allClassifications.filter(c => c && c.name).map(c => ({
            id: `classif:${c._id.toString()}`,
            name: c.name,
            type: 'classification',
            sortable: false
        }))

        const columns = [
            { id: 'title', name: 'Titre', sortable: true },
            ...relationColumns,
            ...customFieldColumns,
            ...classificationColumns,
            { id: 'createdAt', name: 'Créé le', sortable: true },
            { id: 'actions', name: 'Actions', sortable: false }
        ]

        // Build filter groups from entity classifications (for sidebar filtering)
        // allClassifications already defined above (deduplicated)

        // Get ALL records for counting (we already have them if limit was high enough, otherwise count separately)
        const allRecordsForCounts = await Record.find({ entityId }).select('classificationValues').lean()

        const filterGroups = allClassifications.map(cls => {
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

        // Load view settings for titleDisplay fallback
        let viewTitleDisplay = null
        try {
            const viewDoc = await View.findById(viewId).lean()
            if (viewDoc?.settings?.titleDisplay) {
                viewTitleDisplay = viewDoc.settings.titleDisplay
            }
        } catch (e) { /* view not found, no fallback */ }

        res.json({
            records,
            columns,
            preferences,
            entity, // Include entity for Kanban (statusClassification, classifications)
            filters: filterGroups,
            viewTitleDisplay, // View-level default for titleDisplay (icon vs avatar)
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
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
const TaskList = require('../models/task-list.model')
const RecordTask = require('../models/record-task.model')

/**
 * GET /account/:account_number/api/record/:recordId/task-lists
 * Get all task lists for a specific record with task counts
 */
router.get('/api/record/:recordId/task-lists', async (req, res) => {
    try {
        const lists = await TaskList.find({ recordId: req.params.recordId }).sort({ order: 1, createdAt: 1 }).lean()
        const tasks = await RecordTask.find({ recordId: req.params.recordId }).lean()

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
            return {
                _id: l._id.toString(),
                label: l.label,
                color: l.color || '#6366f1',
                count: listTasks.length,
                doneCount: listTasks.filter(t => t.status === 'Terminé').length,
                tasks: sorted.slice(0, 10).map(t => ({
                    _id: t._id.toString(),
                    title: t.title,
                    status: t.status,
                    statusColor: t.statusColor
                }))
            }
        })

        res.json({ success: true, lists: result })
    } catch (error) {
        console.error('[API] Task lists error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * POST /account/:account_number/api/record/:recordId/task-lists
 * Create a new task list for a specific record
 */
router.post('/api/record/:recordId/task-lists', async (req, res) => {
    try {
        const { label, color } = req.body
        if (!label?.trim()) return res.status(400).json({ error: 'Label required' })

        const maxOrder = await TaskList.findOne({ recordId: req.params.recordId }).sort({ order: -1 }).lean()
        const list = await TaskList.create({
            recordId: req.params.recordId,
            label: label.trim(),
            color: color || '#6366f1',
            order: (maxOrder?.order || 0) + 1
        })

        res.json({ success: true, list: { _id: list._id.toString(), label: list.label, color: list.color, count: 0, doneCount: 0 } })
    } catch (error) {
        console.error('[API] Create task list error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * PUT /account/:account_number/api/task-lists/:listId
 * Rename a task list
 */
router.put('/api/task-lists/:listId', async (req, res) => {
    try {
        const { label } = req.body
        if (!label?.trim()) return res.status(400).json({ error: 'Label required' })

        const list = await TaskList.findByIdAndUpdate(req.params.listId, { label: label.trim() }, { new: true })
        if (!list) return res.status(404).json({ error: 'List not found' })

        res.json({ success: true, label: list.label })
    } catch (error) {
        console.error('[API] Rename task list error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * PUT /account/:account_number/api/task-lists/:listId/color
 * Change a task list color
 */
router.put('/api/task-lists/:listId/color', async (req, res) => {
    try {
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
        const list = await TaskList.findByIdAndDelete(req.params.listId)
        if (!list) return res.status(404).json({ error: 'List not found' })

        // Also delete all tasks in this list
        await RecordTask.deleteMany({ taskListId: req.params.listId })

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
        const tasks = await RecordTask.find({ taskListId: req.params.listId }).sort({ order: 1, createdAt: -1 }).lean()
        res.json({ success: true, tasks: tasks.map(t => ({
            _id: t._id.toString(),
            title: t.title,
            status: t.status,
            statusColor: t.statusColor
        })) })
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
        const { title } = req.body
        if (!title?.trim()) return res.status(400).json({ error: 'Title required' })

        const list = await TaskList.findById(req.params.listId).lean()
        if (!list) return res.status(404).json({ error: 'List not found' })

        const task = await RecordTask.create({
            taskListId: req.params.listId,
            recordId: list.recordId,
            title: title.trim(),
            status: 'À faire',
            statusColor: '#9ca3af'
        })

        res.json({ success: true, task: {
            _id: task._id.toString(),
            title: task.title,
            status: task.status,
            statusColor: task.statusColor
        } })
    } catch (error) {
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
        const { title } = req.body
        if (!title?.trim()) return res.status(400).json({ error: 'Title required' })

        const task = await RecordTask.findByIdAndUpdate(req.params.taskId, { title: title.trim() }, { new: true })
        if (!task) return res.status(404).json({ error: 'Task not found' })

        res.json({ success: true, title: task.title })
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
        const { status } = req.body
        const statusColors = {
            'À faire': '#9ca3af',
            'En cours': '#3b82f6',
            'En revue': '#f59e0b',
            'Terminé': '#22c55e',
            'Bloqué': '#ef4444'
        }

        const statusColor = statusColors[status] || '#9ca3af'
        const task = await RecordTask.findByIdAndUpdate(req.params.taskId, { status, statusColor }, { new: true })
        if (!task) return res.status(404).json({ error: 'Task not found' })

        res.json({ success: true, status: task.status, statusColor: task.statusColor })
    } catch (error) {
        console.error('[API] Task status error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * DELETE /account/:account_number/api/record-tasks/:taskId
 * Delete a task
 */
router.delete('/api/record-tasks/:taskId', async (req, res) => {
    try {
        const task = await RecordTask.findByIdAndDelete(req.params.taskId)
        if (!task) return res.status(404).json({ error: 'Task not found' })
        res.json({ success: true })
    } catch (error) {
        console.error('[API] Delete task error:', error)
        res.status(500).json({ error: error.message })
    }
})

/**
 * POST /account/:account_number/api/task-lists/:listId/reorder
 * Reorder tasks in a list
 */
router.post('/api/task-lists/:listId/reorder', async (req, res) => {
    try {
        const { taskIds } = req.body
        if (!Array.isArray(taskIds)) return res.status(400).json({ error: 'taskIds array required' })

        const bulkOps = taskIds.map((id, index) => ({
            updateOne: { filter: { _id: id }, update: { $set: { order: index } } }
        }))
        if (bulkOps.length > 0) await RecordTask.bulkWrite(bulkOps)

        res.json({ success: true })
    } catch (error) {
        console.error('[API] Reorder tasks error:', error)
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
            'gridColumnWidths'
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

module.exports = router

