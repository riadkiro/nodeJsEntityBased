const express = require("express");
const router = express.Router();
//Load Product model
const fieldTemplateController = require("../controllers/field-template.controller");
// Middleware d'upload dynamique basé sur l'account_id
const uploadTo = require("../middleware/upload");
const upload = uploadTo((req) => `public/uploads/${req.account_number}`);
//Auto generated routers
//Auto generated routers end

//list
router.get("/list", fieldTemplateController.list);
//System fields API for picker
router.get("/api/system", fieldTemplateController.systemFields_Api);
//Form
router.get("/add", fieldTemplateController.addForm);
//On post create new product
router.post("/add", upload.single("image"), fieldTemplateController.save);
//Single page
router.get("/:id", fieldTemplateController.singlePage);
//Update form
router.get("/edit/:id", fieldTemplateController.editForm);
//Update form
router.post("/edit/:id", upload.single("image"), fieldTemplateController.update);
//Factory Reset - Restore default fields
router.post("/factory-reset", fieldTemplateController.factoryReset);
//Delete
router.delete("/:id", fieldTemplateController.delete);

//API: Create field from template
router.post("/api/create", fieldTemplateController.createApi);
//API: Update field template metadata/options
router.post("/api/:id/update", fieldTemplateController.updateApi);
//API: Add an option to a select/multiselect field
router.post("/api/:id/add-option", fieldTemplateController.addOption_Api);
//API: Delete an option from a select/multiselect field
router.post("/api/:id/delete-option", fieldTemplateController.deleteOption_Api);

//Generated from template

module.exports = router;
