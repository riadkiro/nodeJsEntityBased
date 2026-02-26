const express = require("express");
const router = express.Router();
const classificationController = require("../controllers/classification.controller");

router.get("/list", classificationController.list);
router.get("/add", classificationController.addForm);
router.get("/edit/:id", classificationController.editForm);
router.post("/save", classificationController.save);
router.post("/update/:id", classificationController.update);
router.delete("/delete/:id", classificationController.delete);

// API
router.get("/api/list", classificationController.list_Api);
router.post("/api/create", classificationController.createApi);
router.post("/api/fast-add", classificationController.fastAdd);
router.post("/api/reorder", classificationController.reorderOptions);
router.post("/api/update-option", classificationController.updateOption);
router.post("/api/delete-option", classificationController.deleteOption);

module.exports = router;
