const express = require("express");
const router = express.Router();
//Load Product model
const entityController = require("../controllers/entity.controller");
const entityTemplateController = require("../controllers/entity-template.controller");
// Middleware d'upload dynamique basé sur l'account_id
const uploadTo = require("../middleware/upload");
const upload = uploadTo((req) => `public/uploads/${req.account_number}`);
const { requirePerm } = require('../middleware/permissions');
//Auto generated routers
//Auto generated routers end

// ── Entity Templates (read-only for tenants) ─────────────────
router.get("/api/templates", entityTemplateController.listApi);
router.get("/api/templates/:id", entityTemplateController.getApi);
router.post("/api/templates/:id/use", entityTemplateController.incrementUsage);

//list
router.get("/list", entityController.list);
//API - List all entities (lightweight, for pickers)
router.get("/api/list", entityController.listAll_Api);
//API - Get entity details by ID (JSON)
router.get("/api/:id", entityController.getDetails_Api);
//API - Get fields of a specific entity
router.get("/api/:id/fields", entityController.getEntityFields_Api);
//API - Update entity (JSON)
router.post("/api/update/:id", requirePerm('entities.manage'), entityController.update_Api);
//API - Publish form layout
router.post("/api/publish-form/:id", requirePerm('entities.manage'), entityController.publishFormLayout_Api);
//Form
router.get("/add", entityController.addForm);
//On post create new product
router.post("/add", requirePerm('entities.manage'), upload.single("image"), entityController.save);
//Settings page (create)
router.get("/settings", entityController.settingsForm);
//Settings page (edit)
router.get("/settings/:id", entityController.settingsForm);
//Cards page
router.get("/cards/:id", entityController.cardsPage);
//Single page
router.get("/:id", entityController.singlePage);
//Update form
router.get("/edit/:id", entityController.editForm);
//Update form
router.post("/edit/:id", requirePerm('entities.manage'), upload.single("image"), entityController.update);
//Update custom fields
router.post("/updatecf/:id", requirePerm('entities.manage'), entityController.updateCustomFields);
//Delete bulk
router.post("/api/bulk-delete", requirePerm('entities.manage'), entityController.bulkDelete);
//Inline field management (from record Fiche)
router.post("/api/:id/add-field", requirePerm('entities.manage'), entityController.addFieldToEntity_Api);
router.post("/api/:id/remove-field", requirePerm('entities.manage'), entityController.removeFieldFromEntity_Api);
//Delete
router.delete("/:id", requirePerm('entities.manage'), entityController.delete);

//Generated from template

module.exports = router;
