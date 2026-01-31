const express = require("express");
const router = express.Router();
//Load Product model
const entityController = require("../controllers/entity.controller");
// Middleware d'upload dynamique basé sur l'account_id
const uploadTo = require("../middleware/upload");
const upload = uploadTo((req) => `public/uploads/${req.account_number}`);
//Auto generated routers
//Auto generated routers end

//list
router.get("/list", entityController.list);
//API - Get entity details by ID (JSON)
router.get("/api/:id", entityController.getDetails_Api);
//API - Update entity (JSON)
router.post("/api/update/:id", entityController.update_Api);
//Form
router.get("/add", entityController.addForm);
//On post create new product
router.post("/add", upload.single("image"), entityController.save);
//Single page
router.get("/:id", entityController.singlePage);
//Update form
router.get("/edit/:id", entityController.editForm);
//Update form
router.post("/edit/:id", upload.single("image"), entityController.update);
//Update custom fields
router.post("/updatecf/:id", entityController.updateCustomFields);
//Delete
router.delete("/:id", entityController.delete);

//Generated from template

module.exports = router;
