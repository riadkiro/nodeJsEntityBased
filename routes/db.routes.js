const express = require("express");
const router = express.Router();
const dbController = require("../controllers/db.controller.js");

// Page routes
router.get("/list", dbController.list);

// API routes
router.get("/api/tree", dbController.getDatabaseTree);
router.post("/api/move-collection", dbController.moveCollection);
router.post("/api/create", dbController.createDatabase);
router.put("/api/:id", dbController.updateDatabase);
router.delete("/api/:id", dbController.deleteDatabase);

module.exports = router;
