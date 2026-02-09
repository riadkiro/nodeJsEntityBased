const express = require('express');
const router = express.Router();
const lineSchemaCtrl = require('../controllers/line-schema.controller');

// ─── API Routes ────────────────────────────────────────────────────────
router.get('/api/line-schemas', lineSchemaCtrl.list);
router.get('/api/line-schemas/by-context', lineSchemaCtrl.getByContext);
router.get('/api/line-schemas/:id', lineSchemaCtrl.getById);
router.post('/api/line-schemas', lineSchemaCtrl.create);
router.put('/api/line-schemas/:id', lineSchemaCtrl.update);
router.delete('/api/line-schemas/:id', lineSchemaCtrl.delete);

// ─── Admin Pages ───────────────────────────────────────────────────────
router.get('/line-schemas', lineSchemaCtrl.adminList);
router.get('/line-schemas/:id/edit', lineSchemaCtrl.adminEdit);
router.get('/line-schemas/new', lineSchemaCtrl.adminEdit);

module.exports = router;
