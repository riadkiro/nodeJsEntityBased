const express = require("express");
const router = express.Router();

router.use("/dashboard", require("./account.js"));

router.use("/api/", require("./api_account.js"));
router.use("/api/user", require("./api_user.js"));


module.exports = router;
