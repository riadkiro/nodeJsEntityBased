const express = require("express");
const router = express.Router();

router.use("/", require("./index.js"));
router.use("/auth", require("./auth.router"));
router.use("/user", require("./user.router"));

// SuperAdmin Panel (SaaS Platform Owner) — requires authentication
router.use("/superadmin", (req, res, next) => {
    if (!req.user) return res.redirect('/auth/login');
    next();
}, require("./superadmin.router"));


module.exports = router;

