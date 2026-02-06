const express = require('express');
const router = express.Router();
const PageConfig = require('../models/PageConfig');

// List page configs
router.get('/list', async (req, res) => {
    try {
        const configs = await PageConfig.find({ accountId: req.user.accountNumber })
            .sort({ updatedAt: -1 })
            .select('name type entityRef status version updatedAt');

        res.render('page-builder/page-list', {
            layout: 'layout-app',
            user: req.user,
            account_number: req.account_number,
            configs
        });
    } catch (error) {
        console.error('Error fetching page configs:', error);
        res.status(500).send('Error loading page configs');
    }
});

// List page configs (alias)
router.get('/', async (req, res) => {
    try {
        const configs = await PageConfig.find({ accountId: req.user.accountNumber })
            .sort({ updatedAt: -1 })
            .select('name type entityRef status version updatedAt');

        res.render('page-builder/page-list', {
            layout: 'layout-app',
            user: req.user,
            account_number: req.account_number,
            configs
        });
    } catch (error) {
        console.error('Error fetching page configs:', error);
        res.status(500).send('Error loading page configs');
    }
});

// New page builder
router.get('/new', (req, res) => {
    res.render('page-builder/page-builder', {
        layout: 'layout-app',
        user: req.user,
        account_number: req.account_number,
        builderMode: 'page'
    });
});

// New cockpit builder
router.get('/cockpit/new', (req, res) => {
    res.render('page-builder/page-builder', {
        layout: 'layout-app',
        user: req.user,
        account_number: req.account_number,
        builderMode: 'cockpit'
    });
});

// Edit page builder
router.get('/edit/:id', async (req, res) => {
    try {
        const pageConfig = await PageConfig.findOne({
            _id: req.params.id,
            accountId: req.user.accountNumber
        });

        if (!pageConfig) {
            return res.status(404).send('Page config not found');
        }

        res.render('page-builder/page-builder', {
            layout: 'layout-app',
            user: req.user,
            account_number: req.account_number,
            pageConfig
        });
    } catch (error) {
        console.error('Error loading page config:', error);
        res.status(500).send('Error loading page config');
    }
});

// API routes (CRUD)
const pageBuilderAPI = require('./page-builder');
router.use('/', pageBuilderAPI);

module.exports = router;
