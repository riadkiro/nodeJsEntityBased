const express = require("express");
const router = express.Router();
//Load Product model
const spaceController = require("../controllers/space.controller");
// Middleware d'upload dynamique basé sur l'account_id
const uploadTo = require("../middleware/upload");
const upload = uploadTo((req) => `public/uploads/${req.account_number}`);
//Auto generated routers
//Auto generated routers end

//list
router.get("/list", spaceController.list);
//Form
router.get("/add", spaceController.addForm);
//On post create new product
router.post("/add",upload.single("image"), spaceController.save);
//Single page
// router.get("/:id", spaceController.singlePage);
//Update form
router.get("/edit/:id", spaceController.editForm);
//Update form
router.post("/edit/:id",upload.single("image"), spaceController.update);
//Delete
router.delete("/:id", spaceController.delete);

//Generated from template

module.exports = router;