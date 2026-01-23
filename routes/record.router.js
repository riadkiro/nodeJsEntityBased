const express = require("express");
const router = express.Router();
const recordController = require("../controllers/record.controller");

// Dynamic Record management based on Entity slug
router.get("/:entityName/list", recordController.list);
router.get("/:entityName/add", recordController.addForm);
router.post("/:entityName/save", recordController.save);
router.get("/:entityName/edit/:id", recordController.editForm);
router.post("/:entityName/update/:id", recordController.update);
router.get("/:entityName/delete/:id", recordController.delete);

// API for relations
router.get("/api/search", recordController.searchAjax);

module.exports = router;
