const express = require('express');
const router = express.Router();
const newsletterController = require('../../controllers/newsletter.controller');
const { requirePerm } = require('../../middleware/permissions');

router.get('/hub', requirePerm('email.view'), newsletterController.hubData);
router.post('/audiences', requirePerm('email.send'), newsletterController.saveAudience);
router.put('/audiences/:audienceId', requirePerm('email.send'), newsletterController.saveAudience);
router.delete('/audiences/:audienceId', requirePerm('email.send'), newsletterController.deleteAudience);
router.post('/templates', requirePerm('email.send'), newsletterController.saveTemplate);
router.put('/templates/:templateId', requirePerm('email.send'), newsletterController.saveTemplate);
router.delete('/templates/:templateId', requirePerm('email.send'), newsletterController.deleteTemplate);
router.post('/sequences', requirePerm('email.send'), newsletterController.saveSequence);
router.put('/sequences/:sequenceId', requirePerm('email.send'), newsletterController.saveSequence);
router.delete('/sequences/:sequenceId', requirePerm('email.send'), newsletterController.deleteSequence);

router.get('/entity/:entitySlug', requirePerm('email.view'), newsletterController.entityData);
router.post('/entity/:entitySlug/campaigns', requirePerm('email.send'), newsletterController.saveCampaign);
router.put('/entity/:entitySlug/campaigns/:campaignId', requirePerm('email.send'), newsletterController.saveCampaign);
router.post('/entity/:entitySlug/campaigns/:campaignId/preview', requirePerm('email.view'), newsletterController.previewCampaign);
router.post('/entity/:entitySlug/campaigns/:campaignId/send-test', requirePerm('email.send'), newsletterController.sendTest);
router.post('/entity/:entitySlug/campaigns/:campaignId/send', requirePerm('email.send'), newsletterController.sendCampaign);

module.exports = router;
