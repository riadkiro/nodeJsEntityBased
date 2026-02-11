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

        // Use pre-computed title (denormalized at save time)
        records.forEach(record => {
            record.referenceTitle = record.computedTitle || record.title || 'Sans titre';
        });

        let preferences = null
        if (req.user?._id) {
            const prefs = await UserPreferences.findOne({
                userId: req.user._id,
                viewId
            }).lean()
            preferences = prefs?.preferences || null
        }

        // Build columns from entity fields
        const customFieldColumns = (entity.customFields || []).map(f => ({
            id: f._id.toString(),
            name: f.label || f.name || 'Champ',
            type: f.fieldType || 'text',
            sortable: true
        }))

        // Relation columns
        const relationColumns = (entity.relations || []).map(rel => ({
            id: `rel:${rel.key}`,
            name: rel.label || rel.key,
            type: 'relation',
            sortable: false
        }))

        // Classification columns
        const classificationColumns = (entity.classifications || []).filter(c => c && c.name).map(c => ({
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


        res.json({
            records,
            columns,
            preferences,
            entity, // Include entity for Kanban (statusClassification, classifications)
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
            { id: 'name', name: 'Nom', sortable: true, link: `/account/${req.account_number}/entity/{id}/settings` },
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
 * POST /account/:account_number/api/user/view-preferences
 * Save user preferences for a specific view
 */
router.post('/api/user/view-preferences', async (req, res) => {
    try {
        const UserPreferences = await tenantCollection(req, "UserPreferences")
        const { viewId, preferences } = req.body
        console.log('[API] Save preferences - showSidebar:', preferences?.showSidebar, 'viewId:', viewId)

        if (!viewId) {
            return res.status(400).json({ error: 'viewId is required' })
        }

        if (!req.user?._id) {
            return res.status(401).json({ error: 'User not authenticated' })
        }

        await UserPreferences.findOneAndUpdate(
            { userId: req.user._id, viewId },
            {
                userId: req.user._id,
                viewId,
                preferences: {
                    columns: preferences.columns || [],
                    sort: preferences.sort || { field: 'createdAt', direction: 'desc' },
                    density: preferences.density || 'normal',
                    pageSize: preferences.pageSize || 25,
                    titleDisplay: preferences.titleDisplay || 'avatar',
                    showSidebar: preferences.showSidebar !== undefined ? preferences.showSidebar : true
                },
                updatedAt: new Date()
            },
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

module.exports = router
