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

        res.json({
            records,
            columns,
            preferences,
            entity, // Include entity for Kanban (statusClassification, classifications)
            filters: filterGroups,
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
            let statusLabel = '', statusColor = '', priorityLabel = '', priorityColor = '', tags = []

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
            'sidebar_panels'
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
            preferences: prefs?.preferences || null
        })

    } catch (error) {
        console.error('[API] Preferences fetch error:', error)
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

        const entity = await Entity.findById(entityId)
        if (!entity) return res.status(404).json({ error: 'Entity not found' })

        entity.sidebarWidgets = (entity.sidebarWidgets || []).filter(w => w._id.toString() !== widgetId)
        await entity.save()
        res.json({ success: true })

    } catch (error) {
        console.error('[API] Sidebar widget delete error:', error)
        res.status(500).json({ error: error.message })
    }
})

module.exports = router

