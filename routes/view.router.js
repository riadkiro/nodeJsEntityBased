const express = require("express");
const router = express.Router();
const viewController = require("../controllers/view.controller");

router.get("/:viewId", viewController.renderView);

module.exports = router;
