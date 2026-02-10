const express = require("express");
const router = express.Router();
const recordController = require("../controllers/record.controller");
const uploadTo = require("../middleware/upload");
const upload = uploadTo((req) => `public/uploads/${req.account_number}`);

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

// Record detail page (fiche) — must be AFTER all specific routes
router.get("/:entityName/:id", recordController.detailPage);

// API for relations
router.get("/api/search", recordController.searchAjax);

module.exports = router;
