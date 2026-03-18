const express = require('express');
const router = express.Router();
const gridSnapshotCtrl = require('../controllers/grid-snapshot.controller');

// ─── API Routes ────────────────────────────────────────────────────────
router.post('/api/grid-snapshots', gridSnapshotCtrl.create);
router.get('/api/grid-snapshots/:schemaId/:targetRecordId', gridSnapshotCtrl.list);
router.delete('/api/grid-snapshots/:id', gridSnapshotCtrl.delete);

module.exports = router;
