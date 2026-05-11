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

router.use("/api/team", require("./api/api-team.router.js"));
router.use("/api/team-chat", require("./api/api-team-chat.router.js"));
router.use("/api/record-access", require("./api/api-record-access.router.js"));
router.use("/api/billing", require("./api/api-billing.router.js"));

// Notes Hub API — must be before api-account (has /:id catch-all)
router.use("/api/notes-hub", require("./api/api-notes-hub.router.js"));
// Agenda Hub API — must be before api-account (has /:id catch-all)
router.get("/api/agenda-hub", async (req, res) => {
    try {
        const _tc = require('../middleware/tenant').tenantCollection;
        const Entity = await _tc(req, "Entity");
        const Record = await _tc(req, "Record");
        await _tc(req, "FieldTemplate");
        await _tc(req, "Classification");

        const eventsEntity = await Entity.findOne({ slug: 'events' })
            .populate('customFields')
            .populate('classifications')
            .populate('statusClassification')
            .lean();
        if (!eventsEntity) {
            return res.json({ success: true, events: [], entities: [], entityData: null });
        }

        const allEvents = await Record.find({ entityId: eventsEntity._id })
            .populate({ path: 'customFields.field_id', select: 'label type name render ui type_config' })
            .sort({ date: 1 })
            .lean();

        const recordIds = new Set();
        allEvents.forEach(ev => {
            (ev.relations || []).forEach(rel => {
                const ids = Array.isArray(rel.value) ? rel.value : [rel.value];
                ids.forEach(id => { if (id) recordIds.add(id.toString()); });
            });
        });

        const parentRecords = recordIds.size > 0
            ? await Record.find({ _id: { $in: [...recordIds] } }).select('title entityId computedTitle').lean()
            : [];
        const parentEntityIds = [...new Set(parentRecords.map(r => r.entityId?.toString()).filter(Boolean))];
        const parentEntities = parentEntityIds.length > 0
            ? await Entity.find({ _id: { $in: parentEntityIds } }).select('name slug icon color').lean()
            : [];

        const entityLookup = {};
        parentEntities.forEach(e => { entityLookup[e._id.toString()] = e; });
        const recordLookup = {};
        parentRecords.forEach(r => { recordLookup[r._id.toString()] = r; });

        const entityMap = {};
        allEvents.forEach(ev => {
            let parentId = null;
            (ev.relations || []).forEach(rel => {
                const ids = Array.isArray(rel.value) ? rel.value : [rel.value];
                if (ids[0]) parentId = ids[0].toString();
            });
            if (!parentId) return;
            const parent = recordLookup[parentId];
            if (!parent) return;
            const eId = parent.entityId?.toString() || 'unknown';
            const entityInfo = entityLookup[eId] || {};
            if (!entityMap[eId]) {
                entityMap[eId] = {
                    entityId: eId, entityName: entityInfo.name || 'Unknown',
                    entitySlug: entityInfo.slug || '',
                    entityIcon: entityInfo.icon || 'solar:folder-bold-duotone',
                    entityColor: entityInfo.color || '#4361ee', records: {}
                };
            }
            if (!entityMap[eId].records[parentId]) {
                entityMap[eId].records[parentId] = {
                    recordId: parentId,
                    recordTitle: parent.computedTitle || parent.title || 'Sans titre',
                    eventCount: 0
                };
            }
            entityMap[eId].records[parentId].eventCount++;
        });

        const entities = Object.values(entityMap).map(e => ({
            ...e,
            records: Object.values(e.records).sort((a, b) => a.recordTitle.localeCompare(b.recordTitle)),
            totalEvents: Object.values(e.records).reduce((sum, r) => sum + r.eventCount, 0)
        }));

        res.json({ success: true, events: allEvents, entities, entityData: eventsEntity });
    } catch (error) {
        console.error('[AgendaHub] Error:', error);
        res.status(500).json({ error: error.message });
    }
});
// Tasks Hub API — must be before api-account (has /:id catch-all)
const TaskListModel = require('../models/task-list.model');
const RecordTaskModel = require('../models/record-task.model');
router.get("/api/tasks-hub", async (req, res) => {
    try {
        const _tc = require('../middleware/tenant').tenantCollection;
        const Entity = await _tc(req, "Entity");
        const Record = await _tc(req, "Record");

        const allLists = await TaskListModel.find({}).lean();
        if (allLists.length === 0) {
            return res.json({ success: true, entities: [], totalTasks: 0, doneTasks: 0 });
        }

        const allTasks = await RecordTaskModel.find({}).lean();
        const recordIds = [...new Set(allLists.map(l => l.recordId.toString()))];
        const records = await Record.find({ _id: { $in: recordIds } }).select('title referenceTitle entityId').lean();
        const recordMap = {};
        records.forEach(r => { recordMap[r._id.toString()] = r; });

        const entityIds = [...new Set(records.map(r => r.entityId?.toString()).filter(Boolean))];
        const entities = await Entity.find({ _id: { $in: entityIds } }).select('name slug icon color').lean();
        const entityMap = {};
        entities.forEach(e => { entityMap[e._id.toString()] = e; });

        const entityGroups = {};
        let totalTasks = 0, totalDone = 0;

        allLists.forEach(list => {
            const rId = list.recordId.toString();
            const record = recordMap[rId];
            if (!record) return;
            const eId = record.entityId?.toString() || 'unknown';
            const entity = entityMap[eId];

            if (!entityGroups[eId]) {
                entityGroups[eId] = {
                    entityId: eId, entityName: entity?.name || 'Sans entité',
                    entitySlug: entity?.slug || '', entityIcon: entity?.icon || 'solar:folder-bold-duotone',
                    entityColor: entity?.color || '#4361ee', totalTasks: 0, doneTasks: 0, records: {}
                };
            }
            if (!entityGroups[eId].records[rId]) {
                entityGroups[eId].records[rId] = {
                    recordId: rId, recordTitle: record.referenceTitle || record.title || 'Sans titre',
                    totalTasks: 0, doneTasks: 0, listsCount: 0
                };
            }

            const listTasks = allTasks.filter(t => t.taskListId.toString() === list._id.toString());
            const done = listTasks.filter(t => t.status === 'Terminé').length;
            entityGroups[eId].records[rId].totalTasks += listTasks.length;
            entityGroups[eId].records[rId].doneTasks += done;
            entityGroups[eId].records[rId].listsCount += 1;
            entityGroups[eId].totalTasks += listTasks.length;
            entityGroups[eId].doneTasks += done;
            totalTasks += listTasks.length;
            totalDone += done;
        });

        const result = Object.values(entityGroups).map(eg => ({
            ...eg, records: Object.values(eg.records).sort((a, b) => a.recordTitle.localeCompare(b.recordTitle))
        })).sort((a, b) => b.totalTasks - a.totalTasks);

        res.json({ success: true, entities: result, totalTasks, doneTasks: totalDone });
    } catch (error) {
        console.error('[TasksHub] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.use("/api/", require("./api/api-account.router.js"));
router.use("/api/user", require("./api/api-user.router.js"));
router.use("/mailbox", require("./mailbox.router.js"));

// Record Chat API (conversations + messages per record)
require('./api/api-record-chat.router')(router);

// Record Notes API (rich-text notes per record)
require('./api/api-record-notes.router')(router);

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

// Unified Settings Page (consolidates admin + account-settings)
router.get("/settings", async (req, res) => {
    try {
        const { buildCanObject } = require("../middleware/permissions");

        // Only owner/admin can access settings
        if (!req.can || !req.can('settings.view')) {
            return res.redirect(`/account/${req.account_number}/dashboard`);
        }

        const Account = require("../models/account.model");
        const User = require("../models/user.model");

        const account = await Account.findOne({ account_number: req.account_number });
        if (!account) return res.status(404).send("Account not found");

        const userRole = req.workspaceRole || 'member';
        const isOwner = userRole === 'owner';
        const isAdmin = userRole === 'owner' || userRole === 'admin';

        // Get members
        const activeMembers = account.users.filter(u => u.status === 'active');
        const userIds = activeMembers.map(u => u.userId);
        const users = await User.find({ _id: { $in: userIds } })
            .select('name email avatar status membership.plan lastLogin created_on');

        const members = users.map(u => {
            const entry = activeMembers.find(m => String(m.userId) === String(u._id));
            return {
                ...u.toObject(),
                workspaceRole: entry?.role || 'member',
                joinedAt: entry?.joinedAt,
            };
        });

        // Pending invitations
        const pendingInvites = account.invitations.filter(i => i.status === 'pending');

        // Build permission object for template
        const can = buildCanObject(userRole);

        res.render("account/account-settings-unified", {
            layout: "layout-app",
            user: req.user,
            account_number: req.account_number,
            account,
            members,
            pendingInvites,
            isAdmin,
            isOwner,
            userRole,
            can,
        });
    } catch (error) {
        console.error("[Settings] Error:", error);
        res.status(500).send("Error loading settings page");
    }
});

// App Presets (factory reset / preset installer)
router.use("/", require("./preset.router.js"));

// Integration Engine
router.use("/integrations/admin", require("../src/integrations/routes/admin.providers.routes.js"));
router.use("/integrations/admin", require("../src/integrations/routes/admin.actions.routes.js"));
router.use("/integrations", require("../src/integrations/routes/oauth.routes.js"));
router.use("/integrations", require("../src/integrations/routes/tenant.integrations.routes.js"));
router.use("/workflows", require("../src/integrations/routes/workflows.routes.js"));

// Tasks Hub (aggregated tasks across all records)
router.get("/tasks", (req, res) => {
    res.render("account/account-tasks-hub", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Tasks Embed (chromeless render of record-tasks-module for iframe in Tasks Hub)
router.get("/tasks-embed/:recordId", async (req, res) => {
    try {
        const _tc = require('../middleware/tenant').tenantCollection;
        const EntityModel = await _tc(req, "Entity");
        const RecordModel = await _tc(req, "Record");

        const record = await RecordModel.findById(req.params.recordId).select('title _id entityId');
        if (!record) return res.status(404).send("Record not found");

        const entity = await EntityModel.findById(record.entityId).select('name slug icon color');
        if (!entity) return res.status(404).send("Entity not found");

        res.render("account/account-tasks-embed", {
            layout: "layout-embed",
            user: req.user,
            account_number: req.account_number,
            record,
            entity,
            moduleName: 'tasks',
            _isTasksTab: true
        });
    } catch (error) {
        console.error('[TasksEmbed] Error:', error);
        res.status(500).send("Error loading tasks embed");
    }
});

// Agenda Hub (aggregated events across all records)
router.get("/agenda", (req, res) => {
    res.render("account/account-agenda-hub", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Chat System — old chat hub removed, now served by team-chat below

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
    const userRole = req.workspaceRole || 'member';
    const isAdmin = userRole === 'owner' || userRole === 'admin';
    res.render("account/account-team", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number,
        userRole,
        isAdmin,
    });
});

// Permissions & Roles Page
const { requirePerm: requirePermRoute } = require('../middleware/permissions');
router.get("/permissions", (req, res) => {
    // Guard: only admin/owner can access (actual API is already guarded, but page should be too)
    if (!req.can || !req.can('members.changeRole')) {
        return res.redirect(`/account/${req.account_number}/dashboard`);
    }
    res.render("account/account-permissions", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Roles Configuration Page
router.get("/roles", (req, res) => {
    if (!req.can || !req.can('settings.view')) {
        return res.redirect(`/account/${req.account_number}/dashboard`);
    }
    res.render("account/account-roles", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Sharing Hub Page
router.get("/sharing", (req, res) => {
    res.render("account/account-sharing", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Team Chat Page (unified at /chat)
router.get("/chat", (req, res) => {
    res.render("account/account-team-chat", {
        layout: "layout-app",
        user: req.user,
        account_number: req.account_number
    });
});

// Notes Hub (aggregated notes across all records)
router.get("/notes", (req, res) => {
    res.render("account/account-notes-hub", {
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


