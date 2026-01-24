const express = require("express");
const router = express.Router();

router.use("/", require("./index.js"));
router.use("/auth", require("./auth.router"));
router.use("/user", require("./user.router"));


module.exports = router;
