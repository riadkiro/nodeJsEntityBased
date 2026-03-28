const express = require('express');
const router = express.Router();
const documentLineCtrl = require('../controllers/document-line.controller');

// ─── API Routes ────────────────────────────────────────────────────────
router.get('/api/document-lines/:documentId', documentLineCtrl.listByDocument);
router.post('/api/document-lines/:documentId/bulk', documentLineCtrl.bulkSave);
router.post('/api/document-lines/:documentId/recompute', documentLineCtrl.recompute);
router.get('/api/catalog-search', documentLineCtrl.catalogSearch);
router.get('/api/catalog-frequent', documentLineCtrl.catalogFrequent);

router.post('/api/debug-log', require('express').json(), (req, res) => {
    const fs = require('fs');
    const text = new Date().toISOString() + ' : ' + JSON.stringify(req.body, null, 2) + '\n';
    fs.appendFileSync('c:/Users/pc/Documents/nodeJsProject/browser_debug.log', text);
    res.json({ ok: true });
});

module.exports = router;
