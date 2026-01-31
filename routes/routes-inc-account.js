const express = require("express");
const router = express.Router();

router.use("/dashboard", require("./account.router.js"));
router.use("/entity", require("./entity.router.js"));
router.use("/field-template", require("./field-template.router.js"));
router.use("/field-type", require("./field-type.router.js")); // Admin: Types de champs
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

// Page Builder
router.use("/page-builder", require("./page-builder.routes.js"));

// Profile Page
router.use("/profile", require("./profile.routes.js"));

// Tasks Page
router.get("/tasks", (req, res) => {
    res.render("record/record-tasks", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Chat Page
router.get("/chat", (req, res) => {
    res.render("record/record-chat", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Notes Page
router.get("/notes", (req, res) => {
    res.render("record/record-notes", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Data Table Page
router.get("/datatable", (req, res) => {
    res.render("record/record-demo-datatable", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

module.exports = router;
