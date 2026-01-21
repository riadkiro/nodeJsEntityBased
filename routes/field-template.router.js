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
//Form
router.get("/add", fieldTemplateController.addForm);
//On post create new product
router.post("/add",upload.single("image"), fieldTemplateController.save);
//Single page
router.get("/:id", fieldTemplateController.singlePage);
//Update form
router.get("/edit/:id", fieldTemplateController.editForm);
//Update form
router.post("/edit/:id",upload.single("image"), fieldTemplateController.update);
//Delete
router.delete("/:id", fieldTemplateController.delete);

//Generated from template

module.exports = router;
