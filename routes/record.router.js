const express = require("express");
const router = express.Router();
const recordController = require("../controllers/record.controller");
const uploadTo = require("../middleware/upload");
const upload = uploadTo((req) => `public/uploads/${req.account_number}`);

// API for relations — MUST be before dynamic /:entityName routes
router.get("/api/search", recordController.searchAjax);

// Bulk actions — MUST be before dynamic /:entityName routes
router.post("/api/bulk-delete", recordController.bulkDelete);
router.post("/api/bulk-update-classification", recordController.bulkUpdateClassification);
router.post("/api/quick-create", recordController.quickCreate);

// Dynamic Record management based on Entity slug
router.get("/:entityName/list", recordController.list);
router.get("/:entityName/list-view", recordController.listView);
router.get("/:entityName/list-api", recordController.listApi);
router.get("/:entityName/tasks", recordController.tasks);
router.get("/:entityName/add", recordController.addForm);
router.post("/:entityName/save", upload.single("image"), recordController.save);
router.get("/:entityName/edit/:id", recordController.editForm);
router.get("/:entityName/:id/edit", recordController.editForm);
router.post("/:entityName/update/:id", upload.single("image"), recordController.update);
router.get("/:entityName/delete/:id", recordController.delete);

// Relation update (add/remove related record — used by quick-create for many-to-many)
router.post("/:entityName/:id/update-relation", recordController.updateRelation);

// Inline field update from overview
router.post("/:entityName/:id/update-field", recordController.updateField);

// Contextual module pages (overview, fiche, docs, drive, tasks, notes, chat, emails, agenda)
router.get("/:entityName/:id/:moduleName(overview|fiche|docs|drive|tasks|notes|chat|emails|agenda)", recordController.modulePage);

// Record detail page (fiche) — must be AFTER all specific routes
router.get("/:entityName/:id", recordController.detailPage);

module.exports = router;

