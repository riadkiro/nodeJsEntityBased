const express = require("express");
const router = express.Router();
const dbController = require("../controllers/db.controller.js");

// List all databases (folders of type 'database')
router.get("/list", dbController.list);

module.exports = router;
