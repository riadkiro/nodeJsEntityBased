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
router.post('/hierarchy/link-entity', hierarchyController.linkEntity);

router.get('/hierarchy/icon-libraries', hierarchyController.getIconLibraries);
router.get('/hierarchy/icons', hierarchyController.getIcons);

// Sidebar Preferences
router.get('/user/sidebar-prefs', hierarchyController.getSidebarPrefs);
router.post('/user/sidebar-prefs', hierarchyController.saveSidebarPrefs);

router.get('/entity/:id', entityController.getDetails_Api);
router.post('/view/config', viewController.saveConfig);
router.post('/record/update-status', recordController.updateStatus);
router.post('/record/update-classification', recordController.updateClassification);

module.exports = router;
