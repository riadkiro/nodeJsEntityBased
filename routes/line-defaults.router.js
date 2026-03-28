const express = require('express');
const router = express.Router();
const lineDefaultsCtrl = require('../controllers/line-defaults.controller');

// ─── API Routes ────────────────────────────────────────────────────────
router.get('/api/records/:recordId/line-defaults', lineDefaultsCtrl.getDefaults);
router.put('/api/records/:recordId/line-defaults', lineDefaultsCtrl.saveDefaults);
router.get('/api/line-schemas/by-source-entity/:entityId', lineDefaultsCtrl.getSchemasBySourceEntity);

module.exports = router;
