const express = require("express");
const router = express.Router();

router.use("/dashboard", require("./account.router.js"));

// Admin Panel
router.use("/admin", require("./admin.router.js"));

// AI Assistant
router.use("/", require("./ai-assistant.router.js"));

// Home Page
router.get("/home", (req, res) => {
    res.render("home/home", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

router.use("/entity", require("./entity.router.js"));
router.use("/entity/:entityId/forms", require("./entity-form.router.js"));
router.use("/field-template", require("./field-template.router.js"));
router.use("/field-type", require("./field-type.router.js")); // Admin: Types de champs
router.use("/record", require("./record.router.js"));
router.use("/view", require("./view.router.js"));
router.use("/classification", require("./classification.router.js"));
router.use("/mailbox", require("./mailbox.router.js"));

// LineBuilder (Schema Builder + Document Lines) — MUST be before api-account (has catch-all /:id)
router.use("/", require("./line-schema.router.js"));
router.use("/", require("./document-line.router.js"));
router.use("/", require("./grid-template.router.js"));
router.use("/", require("./grid-snapshot.router.js"));
router.use("/", require("./line-defaults.router.js"));

// Global Drive API (aggregated attachments across all records) — must be before api-account (has /:id catch-all)
router.use("/api", require("./api/api-drive.router.js"));

router.use("/api/", require("./api/api-account.router.js"));
router.use("/api/user", require("./api/api-user.router.js"));
router.use("/mailbox", require("./mailbox.router.js"));

// React Islands API (JSON endpoints)
router.use("/", require("./api.routes.js"));

// Secure Attachment Download API (Simple Tenant Verification)
router.get("/uploads/attachments/:filename", (req, res) => {
    const path = require("path");
    const fs = require("fs");
    // Verify user is connected to THIS account
    if (!req.user || req.account_number !== String(req.params.accountNumber || req.account_number)) {
        return res.status(403).send("Accès refusé. Ce document appartient à un autre compte.");
    }
    const filePath = path.join(__dirname, "../public/uploads/attachments", String(req.account_number), req.params.filename);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send("Document introuvable.");
    }
});

// Attachment API (file uploads for records)
router.use("/api", require("./api/api-attachment.router.js"));

// SmartDoc API (template-based document generation for records)
router.use("/api", require("./api/api-smartdoc.router.js"));

// Document Builder
router.use("/documents", require("./document.routes.js"));

// Database Management
router.use("/db", require("./db.routes.js"));

// Page Builder
router.use("/page-builder", require("./page-builder.routes.js"));

// Cockpit View (clean URL)
// Pre-register PageConfig model (non-standard filename: PageConfig.js instead of page-config.model.js)
try { require('../models/PageConfig'); } catch (e) { }
router.get("/cockpit/:id", async (req, res) => {
    try {
        const PageConfig = await tenantCollection(req, "PageConfig");

        // Support both ObjectId and slug
        const idParam = req.params.id;
        let query;
        if (mongoose.Types.ObjectId.isValid(idParam)) {
            query = { $or: [{ _id: idParam }, { slug: idParam }] };
        } else {
            query = { slug: idParam };
        }

        const pageConfig = await PageConfig.findOne(query);

        if (!pageConfig) {
            return res.status(404).send('Cockpit not found');
        }

        res.render('page-builder/cockpit-view', {
            layout: 'layout-app',
            user: req.user,
            account_number: req.account_number,
            pageConfig
        });
    } catch (error) {
        console.error('Error loading cockpit:', error);
        res.status(500).send('Error loading cockpit');
    }
});

// DataTable HTMX
router.use("/", require("./datatable.routes.js"));

// Profile Page
router.use("/profile", require("./profile.routes.js"));

// App Presets (factory reset / preset installer)
router.use("/", require("./preset.router.js"));

// Integration Engine
router.use("/integrations/admin", require("../src/integrations/routes/admin.providers.routes.js"));
router.use("/integrations/admin", require("../src/integrations/routes/admin.actions.routes.js"));
router.use("/integrations", require("../src/integrations/routes/oauth.routes.js"));
router.use("/integrations", require("../src/integrations/routes/tenant.integrations.routes.js"));
router.use("/workflows", require("../src/integrations/routes/workflows.routes.js"));

// Tasks Page
router.get("/tasks", (req, res) => {
    res.render("record/record-tasks", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Chat System (WebSocket + REST API)
router.use("/chat", require("./chat.router.js"));

// Media Page
router.get("/media", (req, res) => {
    res.render("account/account-media", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Global Drive Page
router.get("/drive", (req, res) => {
    res.render("account/account-drive", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});



// Doctor Clinical Command Center
router.get("/doctor", (req, res) => {
    res.render("account/account-doctor-dashboard", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Ordonnance (Prescription with LineBuilder)
const { tenantCollection } = require('../middleware/tenant');
const mongoose = require('mongoose');
router.get("/ordonnance", async (req, res) => {
    try {
        const LineSchema = await tenantCollection(req, 'LineSchema');
        const schema = LineSchema ? await LineSchema.findOne({ slug: 'traitement' }).lean() : null;

        if (!schema) {
            return res.status(404).send('Schema traitement introuvable. Lancez: node scripts/seed-cabinet-medical.js 5001');
        }

        // Generate a temporary document ID for this new ordonnance
        const documentId = new mongoose.Types.ObjectId();

        res.render("account/ordonnance", {
            layout: "layout-app",
            user: req.user,
            account_number: req.account_number,
            schemaId: schema._id,
            documentId: documentId
        });
    } catch (error) {
        console.error('[Ordonnance] Error:', error);
        res.status(500).send('Server Error');
    }
});
const { loadCockpitConfig } = require('../utils/cockpit-loader');
router.get("/doctor/cockpit", async (req, res) => {
    const cockpitConfig = await loadCockpitConfig('consultation', req.account_number);
    res.render("account/demo/doctor-cockpit", {
        layout: "layout-app",
        cockpitId: 'consultation',
        cockpitConfig,
        demo: true,
        user: req.user,
        account_number: req.account_number
    });
});

// Demo API for Cockpit
router.use("/api/demo", require("./api/api-demo.router.js"));

// Demo API for Timeline Widgets
router.use("/api/demo", require("./api/api-timeline-demo.router.js"));

// Demo API for Calendar Widgets
router.use("/api/demo", require("./api/api-calendar-demo.router.js"));

// Timeline Widgets Demo Page
router.get("/timeline-widgets", (req, res) => {
    res.render("account/demo/timeline-widgets", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Calendar Widgets Demo Page
router.get("/calendar-widgets", (req, res) => {
    res.render("account/demo/calendar-widgets", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Team Page
router.get("/team", (req, res) => {
    res.render("account/account-team", {
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

// Showcase — Index of all pages/views/modules
router.get("/showcase", (req, res) => {
    res.render("showcase/showcase", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Test HTMX DataTable with full layout
router.get("/test-datatable/:entityName", async (req, res) => {
    try {
        const tenantCollection = require('../middleware/tenant').tenantCollection;

        // Register all required models BEFORE using populate
        await tenantCollection(req, "FieldTemplate");
        await tenantCollection(req, "Classification");
        const EntityModel = await tenantCollection(req, "Entity");
        const RecordModel = await tenantCollection(req, "Record");

        const entity = await EntityModel.findOne({ slug: req.params.entityName })
            .populate('customFields')
            .populate('classifications')
            .populate('statusClassification');

        if (!entity) {
            return res.status(404).send("Entity not found");
        }

        // Fetch records for initial render
        const limit = 10;
        const records = await RecordModel.find({ entityId: entity._id })
            .sort({ createdAt: -1 })
            .limit(limit);

        // Get total count for pagination
        const totalRecords = await RecordModel.countDocuments({ entityId: entity._id });

        // Create a mock view object for compatibility
        const view = {
            _id: entity._id,
            viewType: 'table',
            entity: entity._id
        };

        res.render("record/record-view-htmx-test", {
            entity,
            records,
            view,
            totalRecords,
            limit,
            layout: "layout-app",
            account_number: req.account_number,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// Test Progressive DataTable (React Island vs HTMX mode)
// Use ?virtualize=true to force React Island mode
router.get("/test-progressive/:entityName", async (req, res) => {
    try {
        const tenantCollection = require('../middleware/tenant').tenantCollection;

        // Register all required models BEFORE using populate
        await tenantCollection(req, "FieldTemplate");
        await tenantCollection(req, "Classification");
        const EntityModel = await tenantCollection(req, "Entity");
        const RecordModel = await tenantCollection(req, "Record");

        const entity = await EntityModel.findOne({ slug: req.params.entityName })
            .populate('customFields')
            .populate('classifications')
            .populate('statusClassification');

        if (!entity) {
            return res.status(404).send("Entity not found");
        }

        // Check if virtualize mode is requested
        const virtualize = req.query.virtualize === 'true';

        // Fetch records for initial render (only if not virtualize mode)
        const limit = virtualize ? 0 : 10;
        const records = virtualize ? [] : await RecordModel.find({ entityId: entity._id })
            .sort({ createdAt: -1 })
            .limit(limit);

        // Get total count for mode decision
        const totalRecords = await RecordModel.countDocuments({ entityId: entity._id });

        // Check viewType from query params (table or kanban)
        const viewType = req.query.viewType || 'table';

        // Create a mock view object for compatibility
        const view = {
            _id: entity._id,
            viewType: viewType,
            entity: entity._id,
            virtualize: virtualize || totalRecords > 5000
        };

        res.render("record/record-view-progressive", {
            entity,
            records,
            view,
            totalRecords,
            limit,
            pagination: {
                page: 1,
                limit: limit || 25,
                total: totalRecords,
                pages: Math.ceil(totalRecords / (limit || 25))
            },
            layout: "layout-app-progressive",
            account_number: req.account_number,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

module.exports = router;


