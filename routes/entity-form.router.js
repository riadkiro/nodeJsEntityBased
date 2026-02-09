const express = require("express");
const router = express.Router({ mergeParams: true });
const ctrl = require("../controllers/entity-form.controller");

// Pages
router.get("/", ctrl.listForms);
router.get("/add", ctrl.addFormBuilder);
router.get("/:formId/edit", ctrl.editFormBuilder);

// API
router.post("/api/save", ctrl.saveForm_Api);
router.post("/api/update/:formId", ctrl.updateForm_Api);
router.post("/api/publish/:formId", ctrl.publishForm_Api);
router.post("/api/set-default/:formId", ctrl.setDefault_Api);
router.delete("/api/:formId", ctrl.deleteForm_Api);

module.exports = router;
