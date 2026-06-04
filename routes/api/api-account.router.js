const express = require('express');
const router = express.Router();
//Load Product model

const accountController = require('../../controllers/account.controller')
// Hierarchy
const hierarchyController = require('../../controllers/hierarchy.controller');
const uploadToDynamic = require('../../middleware/upload');
const viewController = require('../../controllers/view.controller');
const entityController = require('../../controllers/entity.controller');
const recordController = require('../../controllers/record.controller');
const { requirePerm } = require('../../middleware/permissions');

//Do not delete the comments
//Auto generated routers 
//Auto generated routers end

// Space Templates (tenant-facing) — must be before /:id catch-all
const SpaceTemplate = require('../../models/space-template.model');
router.get('/space-templates', async (req, res) => {
    try {
        const templates = await SpaceTemplate.find({ active: true })
            .sort({ featured: -1, order: 1, usageCount: -1 })
            .lean();
        res.json({ success: true, templates });
    } catch (err) {
        console.error('[SpaceTemplates] list error:', err);
        res.status(500).json({ error: err.message });
    }
});
router.post('/space-templates/:id/check-conflicts', requirePerm('entities.manage'), hierarchyController.checkTemplateConflicts);
router.post('/space-templates/:id/apply', requirePerm('entities.manage'), hierarchyController.applySpaceTemplate);

//Generated from template
//list
router.get('/list', accountController.list_Api);
//On post create new product
router.post('/add', accountController.save_Api);

router.get('/hierarchy/list', hierarchyController.getHierarchy);
// Rail Space CRUD (legacy name: Environment)
router.get('/hierarchy/spaces', hierarchyController.listSpaces);
router.post('/hierarchy/spaces', requirePerm('entities.manage'), hierarchyController.createRailSpace);
router.post('/hierarchy/spaces/update', requirePerm('entities.manage'), hierarchyController.updateRailSpace);
router.post('/hierarchy/spaces/delete', requirePerm('entities.manage'), hierarchyController.deleteRailSpace);
router.post('/hierarchy/spaces/reorder', requirePerm('entities.manage'), hierarchyController.reorderRailSpaces);
router.get('/hierarchy/environments', hierarchyController.listEnvironments);
router.post('/hierarchy/environment', requirePerm('entities.manage'), hierarchyController.createEnvironment);
router.post('/hierarchy/environment/update', requirePerm('entities.manage'), hierarchyController.updateEnvironment);
router.post('/hierarchy/environment/delete', requirePerm('entities.manage'), hierarchyController.deleteEnvironment);
router.post('/hierarchy/environment/reorder', requirePerm('entities.manage'), hierarchyController.reorderEnvironments);
router.post('/hierarchy/move', requirePerm('entities.manage'), hierarchyController.move);
router.post('/hierarchy/reorder', requirePerm('entities.manage'), hierarchyController.reorder);
router.post('/hierarchy/space', requirePerm('entities.manage'), hierarchyController.createSpace);
router.post('/hierarchy/space/update', requirePerm('entities.manage'), hierarchyController.updateSpaceCompat);
router.post('/hierarchy/section', requirePerm('entities.manage'), hierarchyController.createSection);
router.post('/hierarchy/section/update', requirePerm('entities.manage'), hierarchyController.updateSection);
router.post('/hierarchy/folder', requirePerm('entities.manage'), hierarchyController.createFolder);
router.post('/hierarchy/entity', requirePerm('entities.manage'), hierarchyController.createEntity);
router.post('/hierarchy/rename', requirePerm('entities.manage'), hierarchyController.renameItem);
router.post('/hierarchy/icon', requirePerm('entities.manage'), hierarchyController.updateIcon);
router.post('/hierarchy/delete', requirePerm('entities.manage'), hierarchyController.deleteItem);
router.get('/hierarchy/all-entities', hierarchyController.listAllEntities);
router.get('/hierarchy/all-entities', hierarchyController.listAllEntities);
router.get('/hierarchy/records', hierarchyController.searchRecords);
router.get('/hierarchy/entity/:entityId/fields', hierarchyController.getEntityFields);
router.post('/hierarchy/link-entity', requirePerm('entities.manage'), hierarchyController.linkEntity);
router.post('/hierarchy/hub', requirePerm('entities.manage'), hierarchyController.createHub);
router.post('/hierarchy/link-cockpit', requirePerm('entities.manage'), hierarchyController.linkCockpit);
router.post('/hierarchy/promote-section-to-space', requirePerm('entities.manage'), hierarchyController.promoteSectionToSpace);
router.post('/hierarchy/promote-folder-to-space', requirePerm('entities.manage'), hierarchyController.promoteFolderToSpace);
router.post('/hierarchy/promote-space-to-environment', requirePerm('entities.manage'), hierarchyController.promoteSpaceToEnvironment);
router.post('/hierarchy/promote-folder-to-environment', requirePerm('entities.manage'), hierarchyController.promoteFolderToEnvironment);
router.post('/hierarchy/demote-space-to-hierarchy', requirePerm('entities.manage'), hierarchyController.demoteSpaceToHierarchy);
router.post('/hierarchy/demote-environment-to-hierarchy', requirePerm('entities.manage'), hierarchyController.demoteEnvironmentToHierarchy);

router.get('/hierarchy/icon-libraries', hierarchyController.getIconLibraries);
router.get('/hierarchy/icons', hierarchyController.getIcons);
router.get('/hierarchy/find-space', hierarchyController.findSpaceByEntitySlug);
router.get('/hierarchy/find-environment', hierarchyController.findEnvironmentByEntitySlug);

// Environment image upload
const envImageUpload = uploadToDynamic((req) => `public/${req.account_number}/uploads/environments`);
router.post('/hierarchy/spaces/upload-image', envImageUpload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }
        const imagePath = `/${req.account_number}/uploads/environments/${req.file.filename}`;
        res.json({ success: true, imagePath });
    } catch (error) {
        console.error('[Hierarchy] Upload space image error:', error);
        res.status(500).json({ success: false, error: 'Upload failed' });
    }
});
router.post('/hierarchy/environment/upload-image', envImageUpload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }
        const imagePath = `/${req.account_number}/uploads/environments/${req.file.filename}`;
        res.json({ success: true, imagePath });
    } catch (error) {
        console.error('[Hierarchy] Upload environment image error:', error);
        res.status(500).json({ success: false, error: 'Upload failed' });
    }
});



// Sidebar Preferences
router.get('/user/sidebar-prefs', hierarchyController.getSidebarPrefs);
router.post('/user/sidebar-prefs', hierarchyController.saveSidebarPrefs);

router.get('/entity/:id', entityController.getDetails_Api);
router.post('/view/config', viewController.saveConfig);
router.post('/record/update-status', requirePerm('records.update'), recordController.updateStatus);
router.post('/record/update-classification', requirePerm('records.update'), recordController.updateClassification);
router.post('/record/update-title', requirePerm('records.update'), recordController.updateTitle);

// Account Settings API
const Account = require('../../models/account.model');
const User = require('../../models/user.model');

// Update Account Info — requires settings.update permission
router.post('/account/update', requirePerm('settings.update'), async (req, res) => {
    try {
        const { name, icon, status } = req.body;
        const account_number = req.account_number;

        // Update the Account document (or create if doesn't exist with upsert)
        const account = await Account.findOneAndUpdate(
            { account_number: account_number },
            {
                $set: {
                    name: name,
                    icon: icon || 'solar:settings-bold-duotone',
                    status: status
                },
                $setOnInsert: {
                    account_number: account_number,
                    users: req.user ? [req.user.email] : [],
                    created_on: new Date()
                }
            },
            { new: true, upsert: true }
        );

        // Also update the account name and icon in the user's accounts array
        if (req.user && req.user._id) {
            await User.updateOne(
                {
                    _id: req.user._id,
                    'accounts.account_number': account_number
                },
                {
                    $set: {
                        'accounts.$.name': name,
                        'accounts.$.icon': icon || 'solar:settings-bold-duotone'
                    }
                }
            );
        }

        res.json({ success: true, message: 'Account updated successfully', account });
    } catch (error) {
        console.error('Account update error:', error);
        res.status(500).json({ success: false, message: 'Error updating account' });
    }
});

// Get Account Stats
router.get('/account/stats', async (req, res) => {
    try {
        const tenantCollection = require('../../middleware/tenant').tenantCollection;
        const account_number = req.account_number;

        // Get account info
        const account = await Account.findOne({ account_number: account_number });

        // Get collections count
        const EntityModel = await tenantCollection(req, 'Entity');
        const collectionsCount = await EntityModel.countDocuments();

        // Get records count
        const RecordModel = await tenantCollection(req, 'Record');
        const recordsCount = await RecordModel.countDocuments();

        res.json({
            success: true,
            stats: {
                users: account?.users?.length || 0,
                collections: collectionsCount,
                records: recordsCount,
                createdAt: account?.created_on ? new Date(account.created_on).toLocaleDateString('fr-FR') : '-'
            }
        });
    } catch (error) {
        console.error('Account stats error:', error);
        res.status(500).json({ success: false, message: 'Error fetching account stats' });
    }
});

// Single page / delete catch-alls must stay after specific API routes.
router.get('/:id', accountController.singlePage_Api);
router.delete('/:id', accountController.delete_Api);

module.exports = router;
