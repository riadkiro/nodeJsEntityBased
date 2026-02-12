/**
 * AI Assistant Routes
 * Mounted at /account/:account_id (within tenant-authenticated context)
 */
const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai-assistant.controller");

// Context endpoint - fetch workspace entities, counts, etc.
router.get("/api/ai-assistant/context", aiController.getContext);

// Chat endpoint - send message and get AI response
router.post("/api/ai-assistant/chat", aiController.chat);

// Execute action - confirm and run an action card
router.post("/api/ai-assistant/execute", aiController.execute);

// Validate plan - approve or modify a multi-step plan
router.post("/api/ai-assistant/validate-plan", aiController.validatePlan);

module.exports = router;
