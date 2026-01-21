const express = require("express");
const router = express.Router();
//Load Product model
const folderController = require("../controllers/folder.controller");
// Middleware d'upload dynamique basé sur l'account_id
const uploadTo = require("../middleware/upload");
const upload = uploadTo((req) => `public/uploads/${req.account_number}`);
//Auto generated routers
//Auto generated routers end

//list
router.get("/list", folderController.list);
//Form
router.get("/add", folderController.addForm);
//On post create new product
router.post("/add",upload.single("image"), folderController.save);
//Single page
// router.get("/:id", folderController.singlePage);
//Update form
router.get("/edit/:id", folderController.editForm);
//Update form
router.post("/edit/:id",upload.single("image"), folderController.update);
//Delete
router.delete("/:id", folderController.delete);

//Generated from template

module.exports = router;