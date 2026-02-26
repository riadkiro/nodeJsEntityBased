const express = require('express');
const router = express.Router();
const presetController = require('../controllers/preset.controller');

router.get('/app-presets', presetController.list);
router.post('/api/app-presets/install', presetController.install);

module.exports = router;
