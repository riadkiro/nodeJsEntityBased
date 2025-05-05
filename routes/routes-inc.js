const express = require("express");
const router = express.Router();

router.use("/", require("./index.js"));
router.use("/auth", require("./auth.js"));
router.use("/user", require("./User.js"));

module.exports = router;
