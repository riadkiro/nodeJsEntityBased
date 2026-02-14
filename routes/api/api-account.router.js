const express = require('express');
const router = express.Router();
//Load Product model

const accountController = require('../../controllers/account.controller')
// Hierarchy
const hierarchyController = require('../../controllers/hierarchy.controller');
const viewController = require('../../controllers/view.controller');
const entityController = require('../../controllers/entity.controller');
const recordController = require('../../controllers/record.controller');

//Do not delete the comments
//Auto generated routers 
//Auto generated routers end

//Generated from template
//list
router.get('/list', accountController.list_Api);
//On post create new product
router.post('/add', accountController.save_Api);
//Single page
router.get('/:id', accountController.singlePage_Api)
//Delete
router.delete('/:id', accountController.delete_Api);

router.get('/hierarchy/list', hierarchyController.getHierarchy);
// Environment CRUD
router.get('/hierarchy/environments', hierarchyController.listEnvironments);
router.post('/hierarchy/environment', hierarchyController.createEnvironment);
router.post('/hierarchy/environment/update', hierarchyController.updateEnvironment);
router.post('/hierarchy/environment/delete', hierarchyController.deleteEnvironment);
router.post('/hierarchy/environment/reorder', hierarchyController.reorderEnvironments);
router.post('/hierarchy/move', hierarchyController.move);
router.post('/hierarchy/reorder', hierarchyController.reorder);
router.post('/hierarchy/space', hierarchyController.createSpace);
router.post('/hierarchy/folder', hierarchyController.createFolder);
router.post('/hierarchy/entity', hierarchyController.createEntity);
router.post('/hierarchy/rename', hierarchyController.renameItem);
router.post('/hierarchy/icon', hierarchyController.updateIcon);
router.post('/hierarchy/delete', hierarchyController.deleteItem);
router.get('/hierarchy/all-entities', hierarchyController.listAllEntities);
router.get('/hierarchy/all-entities', hierarchyController.listAllEntities);
router.get('/hierarchy/entity/:entityId/fields', hierarchyController.getEntityFields);
router.post('/hierarchy/link-entity', hierarchyController.linkEntity);
router.post('/hierarchy/link-cockpit', hierarchyController.linkCockpit);

router.get('/hierarchy/icon-libraries', hierarchyController.getIconLibraries);
router.get('/hierarchy/icons', hierarchyController.getIcons);

// Sidebar Preferences
router.get('/user/sidebar-prefs', hierarchyController.getSidebarPrefs);
router.post('/user/sidebar-prefs', hierarchyController.saveSidebarPrefs);

router.get('/entity/:id', entityController.getDetails_Api);
router.post('/view/config', viewController.saveConfig);
router.post('/record/update-status', recordController.updateStatus);
router.post('/record/update-classification', recordController.updateClassification);

// Account Settings API
const Account = require('../../models/account.model');
const User = require('../../models/user.model');

// Update Account Info
router.post('/account/update', async (req, res) => {
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

module.exports = router;
