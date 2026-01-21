const express = require("express");
const router = express.Router();
//Load Product model

const userController = require("../controllers/user.controller");

//Auto generated routers
//Auto generated routers end

//Get user accounts
router.get("/accounts", userController.userAccounts);

//Generated from template
//list
router.get("/list", userController.list);
//Form
router.get("/add", userController.addForm);
//On post create new product
router.post("/add", userController.save);
//Single page
router.get("/:id", userController.singlePage);
//Update form
router.get("/edit/:id", userController.editForm);
//Update form
router.post("/edit/:id", userController.update);
//Delete
router.delete("/:id", userController.delete);

//Generated from template

module.exports = router;
