const express = require("express");
const router = express.Router();
const recordController = require("../controllers/record.controller");
const uploadTo = require("../middleware/upload");
const upload = uploadTo((req) => `public/uploads/${req.account_number}`);
const { requirePerm } = require('../middleware/permissions');

// API for relations — MUST be before dynamic /:entityName routes
router.get("/api/search", recordController.searchAjax);

// Bulk actions — MUST be before dynamic /:entityName routes
router.post("/api/bulk-delete", requirePerm('records.delete'), recordController.bulkDelete);
router.post("/api/bulk-update-classification", requirePerm('records.update'), recordController.bulkUpdateClassification);
router.post("/api/quick-create", requirePerm('records.create'), recordController.quickCreate);
router.post("/api/create-draft", requirePerm('records.create'), recordController.createDraft);

// Dynamic Record management based on Entity slug
router.get("/:entityName/list", recordController.list);
router.get("/:entityName/list-view", recordController.listView);
router.get("/:entityName/list-api", recordController.listApi);
router.get("/:entityName/tasks", recordController.tasks);
router.get("/:entityName/add", recordController.addForm);
router.post("/:entityName/save", requirePerm('records.create'), upload.single("image"), recordController.save);
router.get("/:entityName/edit/:id", recordController.editForm);
router.get("/:entityName/:id/edit", recordController.editForm);
router.post("/:entityName/update/:id", requirePerm('records.update'), upload.single("image"), recordController.update);
router.get("/:entityName/delete/:id", requirePerm('records.delete'), recordController.delete);

// Relation update (add/remove related record — used by quick-create for many-to-many)
router.post("/:entityName/:id/update-relation", requirePerm('records.update'), recordController.updateRelation);

// Inline field update from overview
router.post("/:entityName/:id/update-field", requirePerm('records.update'), recordController.updateField);

// Record sheet data
router.get("/:entityName/:id/sheet-data", requirePerm('records.read'), recordController.getSheet);
router.post("/:entityName/:id/sheet-data", requirePerm('records.update'), recordController.saveSheet);

// Contextual module pages (overview, fiche, docs, drive, data-room, tasks, notes, ai, chat, emails, agenda, sheet)
router.get("/:entityName/:id/:moduleName(overview|fiche|docs|drive|data-room|tasks|notes|ai|chat|emails|agenda|sheet|team)", recordController.modulePage);

// Named list view, e.g. /record/entreprises/clients
router.get("/:entityName/:viewSlug", recordController.listByViewSlug);

// Record detail page (fiche) — must be AFTER all specific routes
router.get("/:entityName/:id", recordController.detailPage);

module.exports = router;
