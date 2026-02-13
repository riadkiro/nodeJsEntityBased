const express = require('express');
const router = express.Router({ mergeParams: true });
const mailboxController = require('../controllers/mailbox.controller');

// IMAP sync (API)
router.post('/api/sync', mailboxController.sync);

// API routes - Mail actions
router.post('/api/star/:mailId', mailboxController.toggleStar);
router.post('/api/important/:mailId', mailboxController.toggleImportant);
router.post('/api/group', mailboxController.setGroup);
router.post('/api/type', mailboxController.setType);
router.post('/api/read-status', mailboxController.setReadStatus);
router.post('/api/delete', mailboxController.deleteMails);

// API routes - Mail accounts
router.get('/api/accounts', mailboxController.getAccounts);
router.post('/api/accounts', mailboxController.createAccount);
router.put('/api/accounts/:accountId', mailboxController.updateAccount);
router.delete('/api/accounts/:accountId', mailboxController.deleteAccount);
router.post('/api/accounts/:accountId/default', mailboxController.setDefaultAccount);
router.post('/api/accounts/test-connection', mailboxController.testConnection);

// Main mailbox views
router.get('/inbox', mailboxController.index);
router.get('/sent', mailboxController.index);
router.get('/draft', mailboxController.index);
router.get('/spam', mailboxController.index);
router.get('/trash', mailboxController.index);
router.get('/archive', mailboxController.index);
router.get('/:id', mailboxController.index);

module.exports = router;
