const express = require('express');
const router = express.Router({ mergeParams: true });
const tenantCollection = require('../middleware/tenant').tenantCollection;
const UserPreferences = require('../models/user-preferences.model');

/**
 * GET /account/:accountId/entity/:entityId/views/:viewId/table
 * HTMX endpoint for datatable partial refresh
 * Query params: q (search), page, limit, sort
 */
router.get('/entity/:entityId/views/:viewId/table', async (req, res) => {
    try {
        const { entityId, viewId } = req.params;
        const {
            q = '',
            page = 1,
            limit = 10,
            sort = 'createdAt:desc'
        } = req.query;

        // Parse sort parameter
        const [sortField, sortDirection] = sort.split(':');
        const sortObj = {
            [sortField]: sortDirection === 'desc' ? -1 : 1
        };

        // Get tenant-specific models
        // Register FieldTemplate BEFORE Entity to allow populate
        await tenantCollection(req, 'FieldTemplate');
        await tenantCollection(req, 'Classification');
        const Entity = await tenantCollection(req, 'Entity');
        const Record = await tenantCollection(req, 'Record');

        // Get entity for field definitions - MUST populate customFields
        const entity = await Entity.findById(entityId)
            .populate('customFields')
            .populate('classifications');
        if (!entity) {
            return res.status(404).send('Entity not found');
        }

        // Build query
        const query = { entityId };

        // Guest/External: restrict to shared records only
        const { getSharedRecordFilter } = require('../middleware/shared-records-helper');
        const sharedFilter = await getSharedRecordFilter(req, entityId);
        if (sharedFilter) {
            query._id = sharedFilter._id;
        }

        // Add search if provided
        if (q && q.trim()) {
            query.$or = [
                { title: { $regex: q, $options: 'i' } },
                // You can add custom field search here if needed
            ];
        }

        // Get user preferences
        let prefs = await UserPreferences.findOne({
            userId: req.user._id,
            viewId
        });

        // Build columns from entity + preferences
        const defaultColumns = [
            { id: 'title', name: 'Titre', hidden: false, order: 0 }
        ];

        // Safety check for customFields
        if (entity.customFields && Array.isArray(entity.customFields)) {
            entity.customFields.forEach((field, index) => {
                defaultColumns.push({
                    id: field._id.toString(),
                    fieldId: field._id,
                    name: field.label,
                    hidden: field.hidden || false,
                    order: index + 1
                });
            });
        }

        defaultColumns.push({
            id: 'createdAt',
            name: 'Créé le',
            hidden: false,
            order: defaultColumns.length
        });

        // Apply user preferences to columns if they exist
        let columns = defaultColumns;
        if (prefs?.preferences?.columns) {
            // Merge preferences with current columns
            columns = defaultColumns.map(col => {
                const pref = prefs.preferences.columns.find(p => p.id === col.id);
                if (pref) {
                    return { ...col, hidden: !pref.visible, order: pref.order };
                }
                return col;
            });
            columns.sort((a, b) => a.order - b.order);
        }

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const records = await Record.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Record.countDocuments(query);
        const pages = Math.ceil(total / parseInt(limit));

        // Check if this is a partial refresh (search targeting body only)
        const hxTarget = req.get('HX-Target') || '';
        const isBodyOnlyRefresh = hxTarget.includes('datatable-body');

        // Choose which partial to render
        const partial = isBodyOnlyRefresh
            ? 'record/partials/datatable/_body'
            : 'record/partials/datatable/_datatable';

        // Render datatable partial - NO LAYOUT for HTMX
        res.render(partial, {
            layout: '',  // Empty string to disable layout
            viewId,
            entityId,
            entity,
            records,
            columns,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages
            },
            sort: {
                field: sortField,
                direction: sortDirection
            },
            searchQuery: q,
            account_number: req.account_number
        });

    } catch (error) {
        console.error('[Datatable] Error:', error);
        res.status(500).send('Error loading table data');
    }
});

/**
 * POST /account/:accountId/entity/:entityId/views/:viewId/preferences
 * Save user preferences for datatable
 */
router.post('/entity/:entityId/views/:viewId/preferences', async (req, res) => {
    try {
        const { viewId } = req.params;
        const { columns, sort, density, pageSize } = req.body;

        // UserPreferences is global (not tenant-specific)
        // Upsert preferences
        await UserPreferences.findOneAndUpdate(
            {
                userId: req.user._id,
                viewId
            },
            {
                preferences: {
                    columns,
                    sort,
                    density,
                    pageSize
                },
                updatedAt: new Date()
            },
            {
                upsert: true,
                new: true
            }
        );

        res.json({ success: true });

    } catch (error) {
        console.error('[Datatable] Error saving preferences:', error);
        res.status(500).json({ error: 'Failed to save preferences' });
    }
});

/**
 * POST /account/:accountId/entity/:entityId/views/:viewId/preferences/reset
 * Reset user preferences to default
 */
router.post('/entity/:entityId/views/:viewId/preferences/reset', async (req, res) => {
    try {
        const { viewId } = req.params;

        await UserPreferences.findOneAndDelete({
            userId: req.user._id,
            viewId
        });

        res.json({ success: true });

    } catch (error) {
        console.error('[Datatable] Error resetting preferences:', error);
        res.status(500).json({ error: 'Failed to reset preferences' });
    }
});

module.exports = router;
