const express = require('express');
const router = express.Router({ mergeParams: true });
const mailboxController = require('../controllers/mailbox.controller');

// Main mailbox route
router.get('/sync', mailboxController.sync);
router.get('/:id', mailboxController.index);

module.exports = router;
