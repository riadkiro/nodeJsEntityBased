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
                            { referenceTitle: { $regex: q, $options: 'i' } },
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
            .select('title referenceTitle image customFields status classificationValues createdAt updatedAt')
            .populate({
                path: 'customFields.field_id',
                select: 'label fieldType'
            })
            .sort(sortObj)
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .lean()

        // Compute referenceTitle for each record from entity.referenceTitleTokens
        const tokens = entity.referenceTitleTokens || [];
        if (tokens.length > 0) {
            records.forEach(record => {
                const parts = tokens.map(token => {
                    if (token.t === 'text') return token.v || '';
                    if (token.t === 'field') {
                        // Standard fields
                        if (['title', 'slug', 'date', 'description'].includes(token.id)) {
                            return record[token.id] || '';
                        }
                        // Custom fields — match by field_id
                        if (record.customFields && Array.isArray(record.customFields)) {
                            const cf = record.customFields.find(c => {
                                const cfId = c.field_id?._id || c.field_id;
                                return cfId && cfId.toString() === token.id;
                            });
                            return cf?.value || '';
                        }
                    }
                    return '';
                });
                record.referenceTitle = parts.join('').trim() || record.title || '';
            });
        }
        let preferences = null
        if (req.user?._id) {
            const prefs = await UserPreferences.findOne({
                userId: req.user._id,
                viewId
            }).lean()
            preferences = prefs?.preferences || null
        }

        // Build columns from entity custom fields (which are now populated)
        const customFieldColumns = (entity.customFields || []).map(f => ({
            id: f._id.toString(),
            name: f.label || f.name || 'Champ',
            type: f.fieldType || 'text',
            sortable: true
        }))

        const columns = [
            { id: 'title', name: 'Titre', sortable: true },
            ...customFieldColumns,
            { id: 'createdAt', name: 'Créé le ▼', sortable: true },
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
                    titleDisplay: preferences.titleDisplay || 'avatar'
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

module.exports = router
