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
router.post("/api/fast-add", classificationController.fastAdd);

module.exports = router;
