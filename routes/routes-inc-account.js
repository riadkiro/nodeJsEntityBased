const express = require("express");
const router = express.Router();

router.use("/dashboard", require("./account.router.js"));
router.use("/entity", require("./entity.router.js"));
router.use("/field-template", require("./field-template.router.js"));
router.use("/record", require("./record.router.js"));

router.use("/api/", require("./api/api-account.router.js"));
router.use("/api/user", require("./api/api-user.router.js"));


module.exports = router;
