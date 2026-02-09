const express = require('express');
const router = express.Router();
const documentLineCtrl = require('../controllers/document-line.controller');

// ─── API Routes ────────────────────────────────────────────────────────
router.get('/api/document-lines/:documentId', documentLineCtrl.listByDocument);
router.post('/api/document-lines/:documentId/bulk', documentLineCtrl.bulkSave);
router.post('/api/document-lines/:documentId/recompute', documentLineCtrl.recompute);
router.get('/api/catalog-search', documentLineCtrl.catalogSearch);

module.exports = router;
