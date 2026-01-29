const express = require("express");
const router = express.Router();

router.use("/dashboard", require("./account.router.js"));
router.use("/entity", require("./entity.router.js"));
router.use("/field-template", require("./field-template.router.js"));
router.use("/record", require("./record.router.js"));
router.use("/view", require("./view.router.js"));
router.use("/classification", require("./classification.router.js"));
router.use("/mailbox", require("./mailbox.router.js"));

router.use("/api/", require("./api/api-account.router.js"));
router.use("/api/user", require("./api/api-user.router.js"));
router.use("/mailbox", require("./mailbox.router.js"));

// Document Builder
router.use("/documents", require("./document.routes.js"));

// Database Management
router.use("/db", require("./db.routes.js"));


module.exports = router;
