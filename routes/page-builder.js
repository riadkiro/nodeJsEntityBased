const express = require('express');
const router = express.Router();
const PageConfig = require('../models/PageConfig');

// Middleware pour vérifier l'authentification
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
};

// GET /api/page-configs - List all page configs for account
router.get('/api/page-configs', ensureAuthenticated, async (req, res) => {
    try {
        const { type, entityRef, status } = req.query;
        const query = { accountId: req.account_number };

        if (type) query.type = type;
        if (entityRef) query.entityRef = entityRef;
        if (status) query.status = status;

        const configs = await PageConfig.find(query)
            .sort({ updatedAt: -1 })
            .select('name type entityRef status version updatedAt');

        res.json(configs);
    } catch (error) {
        console.error('Error fetching page configs:', error);
        res.status(500).json({ error: 'Failed to fetch page configs' });
    }
});

// GET /api/page-configs/:id - Get single page config
router.get('/api/page-configs/:id', ensureAuthenticated, async (req, res) => {
    try {
        const config = await PageConfig.findOne({
            _id: req.params.id,
            accountId: req.account_number
        });

        if (!config) {
            return res.status(404).json({ error: 'Page config not found' });
        }

        res.json(config);
    } catch (error) {
        console.error('Error fetching page config:', error);
        res.status(500).json({ error: 'Failed to fetch page config' });
    }
});

// POST /api/page-configs - Create new page config
router.post('/api/page-configs', ensureAuthenticated, async (req, res) => {
    try {
        const configData = {
            ...req.body,
            accountId: req.account_number
        };

        const config = new PageConfig(configData);
        await config.save();

        res.status(201).json(config);
    } catch (error) {
        console.error('Error creating page config:', error);
        res.status(500).json({ error: 'Failed to create page config' });
    }
});

// PUT /api/page-configs/:id - Update page config
router.put('/api/page-configs/:id', ensureAuthenticated, async (req, res) => {
    try {
        const config = await PageConfig.findOneAndUpdate(
            {
                _id: req.params.id,
                accountId: req.account_number
            },
            req.body,
            { new: true, runValidators: true }
        );

        if (!config) {
            return res.status(404).json({ error: 'Page config not found' });
        }

        res.json(config);
    } catch (error) {
        console.error('Error updating page config:', error);
        res.status(500).json({ error: 'Failed to update page config' });
    }
});

// DELETE /api/page-configs/:id - Delete page config
router.delete('/api/page-configs/:id', ensureAuthenticated, async (req, res) => {
    try {
        const config = await PageConfig.findOneAndDelete({
            _id: req.params.id,
            accountId: req.account_number
        });

        if (!config) {
            return res.status(404).json({ error: 'Page config not found' });
        }

        res.json({ message: 'Page config deleted successfully' });
    } catch (error) {
        console.error('Error deleting page config:', error);
        res.status(500).json({ error: 'Failed to delete page config' });
    }
});

// PATCH /api/page-configs/:id/publish - Publish page config
router.patch('/api/page-configs/:id/publish', ensureAuthenticated, async (req, res) => {
    try {
        const config = await PageConfig.findOneAndUpdate(
            {
                _id: req.params.id,
                accountId: req.account_number
            },
            { status: 'published' },
            { new: true }
        );

        if (!config) {
            return res.status(404).json({ error: 'Page config not found' });
        }

        res.json(config);
    } catch (error) {
        console.error('Error publishing page config:', error);
        res.status(500).json({ error: 'Failed to publish page config' });
    }
});

module.exports = router;
