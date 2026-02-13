const express = require('express');
const router = express.Router({ mergeParams: true });
const mailboxController = require('../controllers/mailbox.controller');

// IMAP sync
router.get('/sync', mailboxController.sync);

// API routes (must be before the catch-all /:id)
router.post('/api/star/:mailId', mailboxController.toggleStar);
router.post('/api/important/:mailId', mailboxController.toggleImportant);
router.post('/api/group', mailboxController.setGroup);
router.post('/api/type', mailboxController.setType);
router.post('/api/read-status', mailboxController.setReadStatus);
router.post('/api/delete', mailboxController.deleteMails);

// Main mailbox views
router.get('/inbox', mailboxController.index);
router.get('/sent', mailboxController.index);
router.get('/draft', mailboxController.index);
router.get('/spam', mailboxController.index);
router.get('/trash', mailboxController.index);
router.get('/archive', mailboxController.index);
router.get('/:id', mailboxController.index);

module.exports = router;
