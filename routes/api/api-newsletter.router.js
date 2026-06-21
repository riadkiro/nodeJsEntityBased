const express = require('express');
const router = express.Router();
const newsletterController = require('../../controllers/newsletter.controller');
const { requirePerm } = require('../../middleware/permissions');

router.get('/entity/:entitySlug', requirePerm('email.view'), newsletterController.entityData);
router.post('/entity/:entitySlug/campaigns', requirePerm('email.send'), newsletterController.saveCampaign);
router.put('/entity/:entitySlug/campaigns/:campaignId', requirePerm('email.send'), newsletterController.saveCampaign);
router.post('/entity/:entitySlug/campaigns/:campaignId/preview', requirePerm('email.view'), newsletterController.previewCampaign);
router.post('/entity/:entitySlug/campaigns/:campaignId/send-test', requirePerm('email.send'), newsletterController.sendTest);
router.post('/entity/:entitySlug/campaigns/:campaignId/send', requirePerm('email.send'), newsletterController.sendCampaign);

module.exports = router;
