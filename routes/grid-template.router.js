const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/grid-template.controller');

// API routes
router.get('/api/grid-templates', ctrl.list);
router.get('/api/grid-templates/by-schema/:schemaId', ctrl.getBySchema);
router.get('/api/grid-templates/:id', ctrl.getById);
router.post('/api/grid-templates', ctrl.create);
router.post('/api/grid-templates/save-from-record', ctrl.saveFromRecord);
router.put('/api/grid-templates/:id', ctrl.update);
router.delete('/api/grid-templates/:id', ctrl.delete);
router.post('/api/grid-templates/:id/apply/:documentId', ctrl.apply);

module.exports = router;
