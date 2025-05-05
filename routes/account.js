const express = require("express");
const router = express.Router();
//Load Product model

const accountController = require("../controllers/Account");

//Auto generated routers
router.get("/listpopulate", accountController.listPopulate);
//Auto generated routers end

//Generated from template
//list
router.get("/list", accountController.list);
//Form
router.get("/add", accountController.addForm);
//On post create new product
router.post("/add", accountController.save);
//Single page
router.get("/", accountController.singlePage);
//Update form
router.get("/edit/:id", accountController.editForm);
//Update form
router.post("/edit/:id", accountController.update);
//Delete
router.delete("/:id", accountController.delete);

//Generated from template

module.exports = router;
