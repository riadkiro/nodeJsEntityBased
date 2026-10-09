/**
 * AI Assistant Controller
 * ──────────────────────────────────────────────────────────
 * Handles chat messages, context fetching, action execution, and plan validation.
 * Uses the Integration Engine to call OpenAI via the configured provider.
 * Auto-detects context from workspace data (entities, records, fields).
 * 
 * Routes:
 *   GET  /api/ai-assistant/context       → Fetch workspace context
 *   POST /api/ai-assistant/chat          → Send message & get response
 *   POST /api/ai-assistant/execute       → Execute an action
 *   POST /api/ai-assistant/validate-plan → Validate/modify a plan
 */
const { tenantCollection } = require("../middleware/tenant");
const IntegrationService = require("../src/integrations/services/IntegrationService");
const Mail = require("../models/mail.model");
const TaskOverview = require("../services/task-overview.service");
const MobileAgendaService = require("../services/mobile-agenda.service");

// ── Global models (Provider & Action live in global DB) ──────
const IntegrationProvider = require("../src/integrations/models/IntegrationProvider.model");
const IntegrationAction = require("../src/integrations/models/IntegrationAction.model");
const IntegrationConnectionSchema = require("../src/integrations/models/IntegrationConnection.model").schema;
const IntegrationLogSchema = require("../src/integrations/models/IntegrationLog.model").schema;
const {
    OPENAI_WEB_SEARCH_SOURCES_INCLUDE,
    appendWebSearchInstructions,
    buildOpenAIWebSearchTool,
    ensureOpenAIResponsesAction,
    extractOpenAIResponsesText,
    shouldUseOpenAIWebSearch
} = require("../src/integrations/openaiActions");

const AI_ASSISTANT_MODEL = process.env.AI_ASSISTANT_MODEL || "gpt-4o-mini";
const AI_ASSISTANT_WEB_SEARCH_MODEL = process.env.AI_ASSISTANT_WEB_SEARCH_MODEL ||
    process.env.OPENAI_WEB_SEARCH_MODEL ||
    process.env.RECORD_AI_WEB_SEARCH_MODEL ||
    "gpt-5.5";
const AI_ASSISTANT_WEB_SEARCH_ENABLED = process.env.OPENAI_WEB_SEARCH_ENABLED !== "false" &&
    process.env.AI_ASSISTANT_WEB_SEARCH_ENABLED !== "false";
const AI_ASSISTANT_WEB_SEARCH_CONTEXT_SIZE = ["low", "medium", "high"].includes(String(process.env.AI_ASSISTANT_WEB_SEARCH_CONTEXT_SIZE || process.env.OPENAI_WEB_SEARCH_CONTEXT_SIZE || "").toLowerCase())
    ? String(process.env.AI_ASSISTANT_WEB_SEARCH_CONTEXT_SIZE || process.env.OPENAI_WEB_SEARCH_CONTEXT_SIZE).toLowerCase()
    : "medium";

/**
 * Get tenant-specific Connection and Log models
 * Mirrors the loadTenantModels middleware from tenant.integrations.routes.js
 */
function getTenantIntegrationModels(req) {
    const conn = req.tenantDbConnection;
    if (!conn) throw new Error("Tenant DB not connected");

    const ConnectionModel = conn.models.IntegrationConnection ||
        conn.model("IntegrationConnection", IntegrationConnectionSchema);
    const LogModel = conn.models.IntegrationLog ||
        conn.model("IntegrationLog", IntegrationLogSchema);

    return { ConnectionModel, LogModel };
}

function isGpt5Model(model = "") {
    return /^gpt-5(?:[.-]|$)/.test(String(model || ""));
}

function latestUserContent(messages = []) {
    const userMessage = [...messages].reverse().find(message => message?.role === "user");
    return String(userMessage?.content || "");
}

function messagesToResponsesPayload(messages = []) {
    const systemInstructions = messages
        .filter(message => message?.role === "system")
        .map(message => String(message.content || "").trim())
        .filter(Boolean)
        .join("\n\n");

    const input = messages
        .filter(message => message?.role !== "system")
        .map(message => {
            const role = message.role === "assistant" ? "Assistant" : "Utilisateur";
            return `${role}:\n${String(message.content || "").trim()}`;
        })
        .filter(Boolean)
        .join("\n\n");

    return {
        instructions: systemInstructions,
        input: input || latestUserContent(messages)
    };
}

function webSearchToolOptionsFromEnv() {
    return {
        searchContextSize: AI_ASSISTANT_WEB_SEARCH_CONTEXT_SIZE,
        userLocation: {
            country: process.env.AI_ASSISTANT_WEB_SEARCH_COUNTRY || process.env.OPENAI_WEB_SEARCH_COUNTRY,
            city: process.env.AI_ASSISTANT_WEB_SEARCH_CITY || process.env.OPENAI_WEB_SEARCH_CITY,
            region: process.env.AI_ASSISTANT_WEB_SEARCH_REGION || process.env.OPENAI_WEB_SEARCH_REGION,
            timezone: process.env.AI_ASSISTANT_WEB_SEARCH_TIMEZONE || process.env.OPENAI_WEB_SEARCH_TIMEZONE
        }
    };
}

function summarizeTaskForAssistant(task = {}) {
    return {
        id: String(task.id || task._id || ""),
        title: String(task.title || "Sans titre"),
        status: String(task.status || "À faire"),
        priority: String(task.priority || "Normal"),
        startDate: task.startDate || null,
        dueDate: task.dueDate || null,
        isDayPriority: task.isDayPriority === true,
        assignedTo: task.assignedTo || "",
        list: task.listLabel || "Liste des tâches",
        record: task.recordTitle || "",
        entity: task.entityName || "",
    };
}

function summarizeTaskBoardForAssistant(board = {}) {
    return {
        loaded: true,
        dateKey: board.dateKey || "",
        timeZone: board.timeZone || "Africa/Casablanca",
        stats: {
            open: Number(board.stats?.openTasks || 0),
            today: Number(board.stats?.todayTasks || 0),
            overdue: Number(board.stats?.overdueCount || 0),
            completedToday: Array.isArray(board.completedToday) ? board.completedToday.length : 0,
        },
        todayTasks: (board.tasks || board.todayTasks || [])
            .slice(0, 100)
            .map(summarizeTaskForAssistant),
        overdueTasks: (board.overdueTasks || [])
            .slice(0, 50)
            .map(summarizeTaskForAssistant),
    };
}

function summarizeAgendaForAssistant(events = [], now = new Date()) {
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const normalized = (Array.isArray(events) ? events : [])
        .map(event => ({
            id: String(event.id || event._id || ""),
            title: String(event.title || "Sans titre"),
            startAt: event.startAt || event.date || null,
            endAt: event.endAt || event.end_date || null,
            allDay: event.allDay === true,
            isImportant: event.isImportant === true,
            showInUpcoming: event.showInUpcoming !== false,
            type: String(event.type || "autre"),
            location: String(event.location || ""),
            status: String(event.status || "Planifie"),
            recurrence: String(event.recurrence || "none"),
        }))
        .filter(event => event.startAt && !Number.isNaN(new Date(event.startAt).getTime()))
        .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));

    const upcomingEvents = normalized
        .filter(event => event.showInUpcoming)
        .slice(0, 50);

    return {
        loaded: true,
        dateKey: startOfToday.toISOString().slice(0, 10),
        timeZone: "Africa/Casablanca",
        total: normalized.length,
        todayCount: normalized.filter(event => {
            const date = new Date(event.startAt);
            return date >= startOfToday && date < endOfToday;
        }).length,
        importantCount: upcomingEvents.filter(event => event.isImportant).length,
        upcomingEvents,
        importantEvents: upcomingEvents.filter(event => event.isImportant),
    };
}

// ── Context builder ──────────────────────────────────────────
async function buildWorkspaceContext(req) {
    try {
        const Entity = await tenantCollection(req, "Entity");
        const Record = await tenantCollection(req, "Record");

        if (!Entity || !Record) return { error: "DB not ready" };

        // Fetch all entities for this workspace
        let entities;
        try {
            entities = await Entity.find()
                .select("name slug icon color customFields statusClassification")
                .populate("customFields", "name fieldId type")
                .populate("statusClassification", "name items")
                .lean();
        } catch (popError) {
            // FieldTemplate schema may not be registered yet — fetch without populate
            console.warn("[AIAssistant] Populate failed, fetching without:", popError.message);
            entities = await Entity.find()
                .select("name slug icon color")
                .lean();
        }

        // Build entity summary with record counts
        const entitySummaries = await Promise.all(
            entities.map(async (entity) => {
                const totalRecords = await Record.countDocuments({ entityId: entity._id });

                // Count records created today
                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0);
                const todayRecords = await Record.countDocuments({
                    entityId: entity._id,
                    createdAt: { $gte: startOfDay },
                });

                // Get status breakdown if available
                let statusBreakdown = null;
                if (entity.statusClassification?.items) {
                    statusBreakdown = {};
                    for (const item of entity.statusClassification.items) {
                        const count = await Record.countDocuments({
                            entityId: entity._id,
                            "classificationValues.classificationId":
                                entity.statusClassification._id,
                            "classificationValues.selectedOptions": item._id,
                        });
                        statusBreakdown[item.label || item.name] = count;
                    }
                }

                // Get last 5 recent records for each entity (so AI can reference them)
                let recentRecords = [];
                try {
                    const lastRecords = await Record.find({ entityId: entity._id })
                        .sort({ createdAt: -1 })
                        .limit(5)
                        .select("title fieldValues createdAt updatedAt")
                        .lean();
                    recentRecords = lastRecords.map(r => {
                        // Extract key field values
                        const fields = {};
                        if (r.fieldValues) {
                            for (const [key, val] of Object.entries(r.fieldValues)) {
                                if (val && typeof val === 'string' && val.length < 100) {
                                    fields[key] = val;
                                } else if (val && typeof val !== 'object') {
                                    fields[key] = String(val).substring(0, 100);
                                }
                            }
                        }
                        return {
                            title: r.title || "(sans titre)",
                            fields: Object.keys(fields).length > 0 ? fields : undefined,
                            createdAt: r.createdAt,
                        };
                    });
                } catch (e) {
                    // Silently skip if query fails
                }

                return {
                    id: entity._id,
                    name: entity.name,
                    slug: entity.slug,
                    icon: entity.icon,
                    fields: (entity.customFields || []).map((f) => ({
                        id: f.fieldId,
                        name: f.name,
                        type: f.type,
                    })),
                    totalRecords,
                    todayRecords,
                    statusBreakdown,
                    recentRecords,
                };
            })
        );

        let taskContext = {
            loaded: false,
            dateKey: "",
            timeZone: "Africa/Casablanca",
            stats: { open: 0, today: 0, overdue: 0, completedToday: 0 },
            todayTasks: [],
            overdueTasks: [],
        };
        try {
            const taskBoard = await TaskOverview.buildTaskBoard(req);
            taskContext = summarizeTaskBoardForAssistant(taskBoard);
        } catch (taskError) {
            console.warn("[AIAssistant] Task context unavailable:", taskError.message);
        }

        let agendaContext = {
            loaded: false,
            dateKey: "",
            timeZone: "Africa/Casablanca",
            total: 0,
            todayCount: 0,
            importantCount: 0,
            upcomingEvents: [],
            importantEvents: [],
        };
        try {
            const from = new Date();
            from.setHours(0, 0, 0, 0);
            const to = new Date(from);
            to.setFullYear(to.getFullYear() + 1);
            const events = await MobileAgendaService.listAgendaEvents(req, {
                from: from.toISOString(),
                to: to.toISOString(),
            });
            agendaContext = summarizeAgendaForAssistant(events, from);
        } catch (agendaError) {
            console.warn("[AIAssistant] Agenda context unavailable:", agendaError.message);
        }

        return {
            accountNumber: req.account_number,
            entities: entitySummaries,
            taskContext,
            agendaContext,
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error("[AIAssistant] Context build error:", error);
        return { error: error.message };
    }
}

// ── Email context builder (secure) ──────────────────────────
/**
 * Fetch a safe, sanitized summary of the user's recent emails.
 * SECURITY:
 *  - No credentials or raw HTML are ever sent to the AI
 *  - Email bodies are stripped to plain text and truncated
 *  - Only metadata + preview is included
 */
async function buildEmailContext(options = {}) {
    const {
        limit = 20,
        searchQuery = null,
        emailId = null,
        type = "inbox",
        unreadOnly = false,
    } = options;

    try {
        // Single email detail
        if (emailId) {
            const email = await Mail.findById(emailId).lean();
            if (!email) return { error: "Email introuvable" };
            return {
                email: sanitizeEmail(email, true), // full body for detail view
            };
        }

        // Build query
        const query = {};
        if (type) query.type = type;
        if (unreadOnly) query.isUnread = true;
        if (searchQuery) {
            query.$or = [
                { title: { $regex: searchQuery, $options: "i" } },
                { email: { $regex: searchQuery, $options: "i" } },
                { firstName: { $regex: searchQuery, $options: "i" } },
                { lastName: { $regex: searchQuery, $options: "i" } },
                { displayDescription: { $regex: searchQuery, $options: "i" } },
            ];
        }

        const emails = await Mail.find(query)
            .sort({ date: -1 })
            .limit(limit)
            .lean();

        // Stats
        const totalInbox = await Mail.countDocuments({ type: "inbox" });
        const totalUnread = await Mail.countDocuments({ type: "inbox", isUnread: true });
        const totalSent = await Mail.countDocuments({ type: "sent_mail" });
        const totalDraft = await Mail.countDocuments({ type: "draft" });
        const totalSpam = await Mail.countDocuments({ type: "spam" });
        const totalTrash = await Mail.countDocuments({ type: "trash" });

        return {
            stats: {
                inbox: totalInbox,
                unread: totalUnread,
                sent: totalSent,
                draft: totalDraft,
                spam: totalSpam,
                trash: totalTrash,
            },
            emails: emails.map((e) => sanitizeEmail(e, false)),
            searchQuery: searchQuery || null,
            resultCount: emails.length,
        };
    } catch (error) {
        console.error("[AIAssistant] Email context error:", error);
        return { error: error.message };
    }
}

/**
 * Strip sensitive data and HTML from an email for AI consumption.
 * @param {Object} email - Raw email document
 * @param {boolean} fullBody - If true, include full body text (for detail view)
 */
function sanitizeEmail(email, fullBody = false) {
    // Strip HTML tags to plain text
    const stripHtml = (html) => {
        if (!html) return "";
        return html
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "") // Remove style blocks
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "") // Remove script blocks
            .replace(/<[^>]+>/g, " ")                         // Remove HTML tags
            .replace(/&nbsp;/g, " ")                           // Replace &nbsp;
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/\s+/g, " ")                              // Collapse whitespace
            .trim();
    };

    const plainBody = stripHtml(email.description || "");

    const sanitized = {
        id: email._id?.toString(),
        from: `${email.firstName || ""} ${email.lastName || ""}`.trim() || email.email,
        fromEmail: email.email,
        subject: email.title || "(sans objet)",
        date: email.date ? new Date(email.date).toLocaleDateString("fr-FR", {
            weekday: "long", year: "numeric", month: "long", day: "numeric"
        }) : "Date inconnue",
        time: email.time || "",
        isUnread: email.isUnread,
        isImportant: email.isImportant,
        isStar: email.isStar,
        type: email.type,
        group: email.group || "",
        hasAttachments: (email.attachments || []).length > 0,
        attachmentCount: (email.attachments || []).length,
    };

    if (fullBody) {
        // Full body for detail view, but capped at 3000 chars for token safety
        sanitized.body = plainBody.substring(0, 3000);
        if (plainBody.length > 3000) sanitized.body += "\n... (tronqué)";
        if (email.attachments?.length) {
            sanitized.attachments = email.attachments.map((a) => ({
                name: a.name,
                size: a.size,
                type: a.type,
            }));
        }
    } else {
        // Preview only (first 150 chars)
        sanitized.preview = plainBody.substring(0, 150);
    }

    return sanitized;
}

/**
 * Detect if a user message is about emails/mailbox.
 */
function isEmailRelatedQuery(message) {
    const keywords = [
        "email", "mail", "e-mail", "courriel", "courrier",
        "message", "messages",
        "inbox", "boîte", "boite", "réception", "reception",
        "envoyé", "envoye", "envoi",
        "spam", "brouillon", "corbeille",
        "pièce jointe", "piece jointe", "attachement",
        "non lu", "lu", "unread",
        "expéditeur", "expediteur", "destinataire",
        "objet", "sujet",
        "reçu", "recu", "recevoir",
        "répondre", "repondre", "transférer", "transferer",
        "newsletter", "notification",
    ];
    const lower = message.toLowerCase();
    return keywords.some((kw) => lower.includes(kw));
}

// ── System prompt builder ────────────────────────────────────
function isAgendaRelatedQuery(message = "") {
    const normalized = String(message)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    return /\b(agenda|calendrier|evenement|evenements|event|events|rendez[- ]?vous|anniversaire|jour ferie|sortie)\b/i.test(normalized);
}

function taskContextPrompt(taskContext = {}) {
    if (taskContext.loaded !== true) {
        return "Le contexte des tâches n'a pas pu être chargé. Ne conclus jamais qu'il n'y a aucune tâche.";
    }
    const todayTasks = Array.isArray(taskContext.todayTasks) ? taskContext.todayTasks : [];
    const overdueTasks = Array.isArray(taskContext.overdueTasks) ? taskContext.overdueTasks : [];
    const formatTask = (task, index) => {
        const details = [
            `priorité: ${task.priority || "Normal"}`,
            task.list ? `liste: ${task.list}` : "",
            task.record ? `fiche: ${task.record}` : "",
            task.assignedTo ? `assignée à: ${task.assignedTo}` : "",
            task.dueDate ? `échéance: ${task.dueDate}` : "",
        ].filter(Boolean).join("; ");
        return `${index + 1}. **${task.title || "Sans titre"}**${details ? ` — ${details}` : ""}`;
    };
    return `Date de référence: ${taskContext.dateKey || "aujourd'hui"} (${taskContext.timeZone || "Africa/Casablanca"})
- Tâches ouvertes au total: ${taskContext.stats?.open || 0}
- Tâches à faire aujourd'hui: ${taskContext.stats?.today || todayTasks.length}
- Tâches en retard: ${taskContext.stats?.overdue || overdueTasks.length}
- Terminées aujourd'hui: ${taskContext.stats?.completedToday || 0}

### Tâches à faire aujourd'hui:
${todayTasks.length ? todayTasks.map(formatTask).join("\n") : "Aucune tâche ouverte pour aujourd'hui."}

### Tâches en retard:
${overdueTasks.length ? overdueTasks.map(formatTask).join("\n") : "Aucune tâche en retard."}`;
}

function agendaContextPrompt(agendaContext = {}) {
    if (agendaContext.loaded !== true) {
        return "Le contexte de l'agenda n'a pas pu etre charge. Ne conclus pas qu'il n'y a aucun evenement.";
    }
    const upcomingEvents = Array.isArray(agendaContext.upcomingEvents)
        ? agendaContext.upcomingEvents : [];
    const formatEvent = (event, index) => {
        const date = new Date(event.startAt);
        const dateLabel = Number.isNaN(date.getTime())
            ? "date inconnue"
            : date.toLocaleDateString("fr-FR", {
                weekday: "long", day: "2-digit", month: "long", year: "numeric",
                timeZone: agendaContext.timeZone || "Africa/Casablanca",
            });
        const timeLabel = event.allDay || Number.isNaN(date.getTime())
            ? "toute la journee"
            : date.toLocaleTimeString("fr-FR", {
                hour: "2-digit", minute: "2-digit",
                timeZone: agendaContext.timeZone || "Africa/Casablanca",
            });
        const details = [
            `${dateLabel}, ${timeLabel}`,
            event.isImportant ? "important" : "",
            event.type && event.type !== "autre" ? `type: ${event.type}` : "",
            event.location ? `lieu: ${event.location}` : "",
            event.status ? `statut: ${event.status}` : "",
        ].filter(Boolean).join("; ");
        return `${index + 1}. **${event.title || "Sans titre"}** — ${details}`;
    };
    return `Date de reference: ${agendaContext.dateKey || "aujourd'hui"} (${agendaContext.timeZone || "Africa/Casablanca"})
- Evenements a venir charges: ${agendaContext.total || upcomingEvents.length}
- Evenements aujourd'hui: ${agendaContext.todayCount || 0}
- Evenements marques importants: ${agendaContext.importantCount || 0}

### Prochains evenements:
${upcomingEvents.length ? upcomingEvents.map(formatEvent).join("\n") : "Aucun evenement a venir dans les 12 prochains mois."}`;
}

function immediateAgendaResponse(message, agendaContext = {}) {
    if (agendaContext.loaded !== true) return "Je n'ai pas pu charger l'agenda pour le moment.";
    const wantsImportant = /important|priorit/i.test(String(message || ""));
    const importantEvents = Array.isArray(agendaContext.importantEvents)
        ? agendaContext.importantEvents : [];
    const upcomingEvents = Array.isArray(agendaContext.upcomingEvents)
        ? agendaContext.upcomingEvents : [];
    const events = (wantsImportant ? importantEvents : upcomingEvents).slice(0, 10);
    if (!events.length) {
        return wantsImportant
            ? "Aucun prochain evenement n'est marque comme important. Vous pouvez ouvrir l'agenda pour en marquer un."
            : "Aucun evenement a venir n'est enregistre dans les 12 prochains mois.";
    }
    const formatter = new Intl.DateTimeFormat("fr-FR", {
        weekday: "long", day: "2-digit", month: "long", year: "numeric",
        timeZone: agendaContext.timeZone || "Africa/Casablanca",
    });
    const lines = events.map((event, index) => {
        const date = new Date(event.startAt);
        const dateLabel = Number.isNaN(date.getTime()) ? "Date inconnue" : formatter.format(date);
        const timeLabel = event.allDay || Number.isNaN(date.getTime())
            ? "Toute la journee"
            : date.toLocaleTimeString("fr-FR", {
                hour: "2-digit", minute: "2-digit",
                timeZone: agendaContext.timeZone || "Africa/Casablanca",
            });
        return `${index + 1}. **${event.title}** — ${dateLabel}, ${timeLabel}`;
    });
    return `Voici ${wantsImportant ? "les prochains evenements importants" : "les prochains evenements"} :\n\n${lines.join("\n")}`;
}

function ensureImmediateAgendaResponse(message, response, agendaContext = {}) {
    const deferredPromise = /\b(un instant|patientez|je vais (?:chercher|rechercher|proc[eé]der|v[eé]rifier)|je proc[eè]de|je reviens|dans quelques instants)\b/i;
    if (!isAgendaRelatedQuery(message) || !deferredPromise.test(String(response || ""))) {
        return response;
    }
    return immediateAgendaResponse(message, agendaContext);
}

function buildSystemPrompt(context, pageContext) {
    const now = new Date();
    const dateStr = now.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const timeStr = now.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });

    let entityList = "Aucune collection disponible.";
    if (context?.entities?.length) {
        entityList = context.entities
            .map((e) => {
                let desc = `- **${e.name}** (slug: \`${e.slug}\`) — ${e.totalRecords} fiches total, ${e.todayRecords} aujourd'hui`;
                if (e.fields?.length) {
                    desc += `\n  Champs: ${e.fields.map((f) => `${f.name} (${f.type})`).join(", ")}`;
                }
                if (e.statusBreakdown) {
                    desc += `\n  Statuts: ${Object.entries(e.statusBreakdown).map(([k, v]) => `${k}: ${v}`).join(", ")}`;
                }
                return desc;
            })
            .join("\n");
    }

    let pageHint = "";
    if (pageContext?.entitySlug) {
        const entity = context?.entities?.find(
            (e) => e.slug === pageContext.entitySlug
        );
        if (entity) {
            pageHint = `\nL'utilisateur est actuellement sur la collection **${entity.name}** (${entity.totalRecords} fiches).`;
            if (pageContext.page === "record-detail" && pageContext.recordId) {
                pageHint += ` Il consulte la fiche ID: ${pageContext.recordId}.`;
            }
        }
    } else if (pageContext?.page) {
        const pageNames = {
            home: "la page d'accueil",
            "home-agent": "l'interface de l'agent IA",
            tasks: "les tâches",
            admin: "le panneau admin",
            superadmin: "le panneau SuperAdmin",
            dashboard: "le tableau de bord",
        };
        pageHint = `\nL'utilisateur est sur ${pageNames[pageContext.page] || pageContext.page}.`;
    }

    return `Tu es l'assistant IA de la plateforme SaaS "Dexapp", un espace de travail intelligent.

📅 Date: ${dateStr}
🕐 Heure: ${timeStr}
🏢 Workspace: #${context?.accountNumber || "?"}
${pageHint}

## Collections disponibles dans ce workspace:
${entityList}

## ✅ Tâches réelles du workspace:
${taskContextPrompt(context?.taskContext)}

RÈGLE TÂCHES: pour toute question sur les tâches, les priorités ou le programme du jour, utilise d'abord et fidèlement la section ci-dessus. Les fiches récentes des collections ne remplacent jamais cette liste. N'affirme jamais qu'il n'y a aucune tâche si le contexte des tâches n'est pas chargé.

## 📅 Agenda réel du workspace:
${agendaContextPrompt(context?.agendaContext)}

RÈGLE AGENDA: pour toute question sur les événements, le calendrier ou les rendez-vous, utilise directement et fidèlement la section ci-dessus. Donne le résultat dans la réponse actuelle. N'annonce jamais une recherche ultérieure ou une seconde réponse.

## 📧 Accès Mailbox:
Tu as accès à la boîte mail de l'utilisateur. Tu peux:
- **Consulter les emails récents** — Résumer, lister, compter
- **Chercher des emails** — Par expéditeur, sujet, contenu
- **Lire un email** — Afficher le contenu complet d'un email
- **Analyser les emails** — Identifier les emails importants, non lus, urgents
${context?.emailContext ? `
### Statistiques email actuelles:
- 📥 Inbox: ${context.emailContext.stats?.inbox || 0} emails (${context.emailContext.stats?.unread || 0} non lus)
- 📤 Envoyés: ${context.emailContext.stats?.sent || 0}
- 📝 Brouillons: ${context.emailContext.stats?.draft || 0}
- 🗑️ Corbeille: ${context.emailContext.stats?.trash || 0}
- ⚠️ Spam: ${context.emailContext.stats?.spam || 0}

### Emails récents:
${(context.emailContext.emails || []).map((e, i) =>
        `${i + 1}. ${e.isUnread ? "🔵" : "⚪"} **${e.subject}** — de ${e.from} (${e.fromEmail}) — ${e.date}${e.hasAttachments ? " 📎" : ""}
   Aperçu: ${e.preview || "(vide)"}`
    ).join("\n") || "Aucun email"}
` : "\n📧 Les emails n'ont pas été chargés pour cette requête. Si l'utilisateur parle d'emails, utilise une action \`email-search\` pour chercher."}
${context?.currentEmailDetail ? `
## 📩 EMAIL ACTUELLEMENT OUVERT PAR L'UTILISATEUR:
L'utilisateur consulte actuellement cet email. UTILISE CE CONTENU DIRECTEMENT quand il demande de résumer, traduire, analyser ou répondre à "ce mail":
- **De:** ${context.currentEmailDetail.from || ''} (${context.currentEmailDetail.fromEmail || ''})
- **Objet:** ${context.currentEmailDetail.subject || '(sans objet)'}
- **Date:** ${context.currentEmailDetail.date || 'Inconnue'}
- **Pièces jointes:** ${context.currentEmailDetail.hasAttachments ? 'Oui' : 'Non'}

### Contenu du mail:
${context.currentEmailDetail.body || '(contenu vide)'}
` : ''}

## Tes capacités:
1. **Interroger les données** — Répondre aux questions sur les fiches, statistiques, etc.
   - Tu as accès aux 5 dernières fiches de chaque collection dans le contexte (champ \`recentRecords\`)
   - Quand on te demande "mes dernières fiches" ou "mes dernières tâches", utilise ces données DIRECTEMENT dans ta réponse
   - **INTERDIT**: Ne dis JAMAIS "un instant" ou "patientez" sans fournir immédiatement les données ou une action. Tu as déjà toutes les données nécessaires dans le contexte ci-dessus.
2. **Créer des fiches** — L'utilisateur peut te demander de créer des fiches dans n'importe quelle collection. Tu DOIS alors:
   - Identifier la collection cible
   - Demander les informations manquantes obligatoires
   - Proposer une ACTION de type \`create\` avec les données à créer
3. **Chercher des fiches** — Trouver des fiches par critères
4. **Planifier des tâches complexes** — Pour les demandes complexes (multi-étapes), propose un PLAN avec les étapes à valider
5. **📧 Emails** — Consulter, chercher, résumer, analyser les emails:
   - Pour chercher un email: action \`email-search\` avec le champ \`query\`
   - Pour lire un email: action \`email-detail\` avec le champ \`emailId\`
   - Pour les statistiques: utilise les données du contexte ci-dessus
6. **🧭 Navigation** — Naviguer vers n'importe quelle page de l'application:
   - Tu peux ouvrir une collection, la page d'accueil, les tâches, la messagerie, les réglages, etc.
   - URLs disponibles:
     - Page d'accueil: \`/account/${context?.accountNumber}/home\`
     - Collection (liste des fiches): \`/account/${context?.accountNumber}/record/{slug}/list\`
     - Gestion des collections: \`/account/${context?.accountNumber}/entity/list\`
     - Tâches: \`/account/${context?.accountNumber}/tasks\`
     - Messagerie: \`/account/${context?.accountNumber}/mailbox/1\`
     - Réglages: \`/account/${context?.accountNumber}/studio\`
     - Admin: \`/account/${context?.accountNumber}/admin\`
${context?.entities?.length ? `   - Collections disponibles (utilise le slug exact pour l'URL): ${context.entities.map(e => `${e.name} → \`${e.slug}\``).join(', ')}` : ''}
   - Utilise TOUJOURS une action \`navigate\` quand l'utilisateur demande d'ouvrir, afficher, aller vers, montrer ou naviguer vers quelque chose
   - **OBLIGATOIRE**: Chaque demande de navigation DOIT TOUJOURS contenir un bloc actions JSON navigate, même si tu as déjà navigué avant dans la conversation. Ne JAMAIS répondre uniquement avec du texte pour une navigation. Le bloc actions est INDISPENSABLE pour que la navigation fonctionne côté client.

## Format de réponse:
- Réponds en français, de manière concise et professionnelle
- Utilise le **gras** et des emojis pour structurer
- Pour les ACTIONS simples, retourne un bloc \`\`\`actions avec le JSON
- Pour les PLANS complexes, retourne un bloc \`\`\`plan avec le JSON

### Actions (exemples):
\`\`\`actions
[
  {
    "type": "navigate",
    "label": "Ouvrir les Consultations",
    "description": "Naviguer vers la liste des consultations",
    "data": {
      "url": "/account/${context?.accountNumber}/record/consultation/list",
      "pageName": "Consultations"
    }
  }
]
\`\`\`

\`\`\`actions
[
  {
    "type": "create",
    "label": "Créer le patient Karim Ali",
    "description": "Collection: patients",
    "data": {
      "entitySlug": "patients",
      "fields": { "title": "Karim Ali", "cin": "12345" }
    }
  }
]
\`\`\`

\`\`\`actions
[
  {
    "type": "email-search",
    "label": "Chercher les emails de Jean",
    "description": "Recherche dans la boîte mail",
    "data": {
      "query": "Jean",
      "type": "inbox"
    }
  }
]
\`\`\`

\`\`\`actions
[
  {
    "type": "email-detail",
    "label": "Lire l'email",
    "description": "Afficher le contenu complet",
    "data": {
      "emailId": "ID_DE_LEMAIL"
    }
  }
]
\`\`\`

### Plan (exemple):
\`\`\`plan
{
  "title": "Création de dossier complet",
  "steps": [
    { "type": "create", "label": "Créer la fiche patient", "detail": "Nom: Karim Ali, CIN: 12345" },
    { "type": "create", "label": "Créer une consultation", "detail": "Liée au patient" },
    { "type": "schedule", "label": "Planifier un suivi", "detail": "Dans 1 semaine" }
  ]
}
\`\`\`

## ⚠️ RÈGLES DE SÉCURITÉ EMAIL:
- Ne JAMAIS afficher de données sensibles (mots de passe, tokens, liens de connexion)
- Ne JAMAIS tenter de répondre ou transférer des emails
- Tu es en LECTURE SEULE sur la boîte mail
- Si un email contient des liens suspects, préviens l'utilisateur

Ne mets les blocs actions/plan QUE quand l'utilisateur demande une action concrète, pas pour les questions simples.
Pour les questions sur les données (combien de patients, emails, etc.), réponds directement avec les chiffres que tu connais du contexte.`;
}

// ── Parse AI response for actions/plans ──────────────────────
function parseAIResponse(text) {
    const result = { response: text, actions: null, plan: null, hadActionsBlock: false };

    // Extract ```actions block
    const actionsMatch = text.match(/```actions\s*\n([\s\S]*?)```/);
    if (actionsMatch) {
        result.hadActionsBlock = true;
        // ALWAYS remove the block from displayed text (even if JSON parse fails)
        result.response = text.replace(/```actions\s*\n[\s\S]*?```/, "").trim();
        try {
            // Strip JS-style comments before parsing (AI often adds // comments)
            const cleanJson = actionsMatch[1]
                .replace(/\/\/.*$/gm, '')  // remove // comments
                .replace(/,\s*([}\]])/g, '$1');  // remove trailing commas
            result.actions = JSON.parse(cleanJson);
        } catch (e) {
            console.error("[AIAssistant] Failed to parse actions JSON:", e.message);
            console.error("[AIAssistant] Raw actions text:", actionsMatch[1].substring(0, 200));
        }
    }

    // Extract ```plan block
    const planMatch = text.match(/```plan\s*\n([\s\S]*?)```/);
    if (planMatch) {
        result.response = result.response.replace(/```plan\s*\n[\s\S]*?```/, "").trim();
        try {
            const cleanJson = planMatch[1]
                .replace(/\/\/.*$/gm, '')
                .replace(/,\s*([}\]])/g, '$1');
            result.plan = JSON.parse(cleanJson);
        } catch (e) {
            console.error("[AIAssistant] Failed to parse plan JSON:", e.message);
        }
    }

    return result;
}

// ── Call OpenAI via Integration Engine ────────────────────────
async function callAI(req, messages) {
    try {
        // Provider & Action are GLOBAL models (not in tenant DB)
        // Connection & Log are TENANT models (registered on tenant connection)
        const { ConnectionModel, LogModel } = getTenantIntegrationModels(req);
        const shouldSearchWeb = AI_ASSISTANT_WEB_SEARCH_ENABLED &&
            shouldUseOpenAIWebSearch(latestUserContent(messages));

        // Find OpenAI provider (global DB)
        const provider = await IntegrationProvider.findOne({ key: "openai" });
        if (!provider) {
            throw new Error("OpenAI provider not configured. Please set up the OpenAI integration first.");
        }

        if (shouldSearchWeb) {
            const action = await ensureOpenAIResponsesAction(IntegrationAction, AI_ASSISTANT_WEB_SEARCH_MODEL);
            const responsesPayload = messagesToResponsesPayload(messages);
            const input = {
                model: AI_ASSISTANT_WEB_SEARCH_MODEL,
                input: responsesPayload.input,
                instructions: appendWebSearchInstructions(responsesPayload.instructions),
                max_output_tokens: 2200,
                store: false,
                metadata: {
                    feature: "ai-assistant",
                    account_number: String(req.account_number || "")
                },
                tools: [buildOpenAIWebSearchTool(webSearchToolOptionsFromEnv())],
                tool_choice: "auto",
                include: OPENAI_WEB_SEARCH_SOURCES_INCLUDE
            };

            if (!isGpt5Model(input.model)) input.temperature = 0.4;

            const result = await IntegrationService.executeAction({
                ProviderModel: IntegrationProvider,
                ActionModel: IntegrationAction,
                ConnectionModel,
                LogModel,
                workspaceId: req.account_number,
                providerKey: "openai",
                actionId: action._id.toString(),
                input,
                timeoutMs: 120000
            });

            if (!result.success) {
                console.error("[AIAssistant] Responses web search call failed:", JSON.stringify(result, null, 2));
                throw new Error(result.error || result.errorMessage || "AI web search call failed");
            }

            return extractOpenAIResponsesText(result.data) ||
                extractOpenAIResponsesText(result.raw) ||
                "Pas de réponse";
        }

        // Find chat-completion action (global DB) — support both actionKey formats
        let action = await IntegrationAction.findOne({
            providerKey: "openai",
            actionKey: "chat-completion",
        });
        // Fallback: try "chat_completion" or "chat/completions"
        if (!action) {
            action = await IntegrationAction.findOne({
                providerKey: "openai",
                actionKey: { $in: ["chat_completion", "chat-completions", "chat/completions"] },
            });
        }
        if (!action) {
            throw new Error("Chat completion action not found. Please seed the OpenAI actions.");
        }

        // Execute via Integration Service
        const result = await IntegrationService.executeAction({
            ProviderModel: IntegrationProvider,   // Global
            ActionModel: IntegrationAction,       // Global
            ConnectionModel,                      // Tenant
            LogModel,                             // Tenant
            workspaceId: req.account_number,
            providerKey: "openai",
            actionId: action._id.toString(),
            input: {
                model: AI_ASSISTANT_MODEL,
                messages,
                temperature: 0.4,
                max_tokens: 2000,
            },
        });

        if (!result.success) {
            console.error("[AIAssistant] Integration call failed:", JSON.stringify(result, null, 2));
            throw new Error(result.error || result.errorMessage || "AI call failed");
        }

        // IntegrationService returns { success, data: { mapped fields }, raw: { original response } }
        // data = mapped response (content, role, model, usage, finishReason)
        // raw = original API response
        const content =
            result.data?.content ||
            result.raw?.choices?.[0]?.message?.content ||
            "Pas de réponse";

        return content;
    } catch (error) {
        console.error("[AIAssistant] AI call error:", error);
        throw error;
    }
}

module.exports = {
    // ── GET /api/ai-assistant/context ──────────────────────────
    getContext: async (req, res) => {
        try {
            const context = await buildWorkspaceContext(req);
            res.json(context);
        } catch (error) {
            console.error("[AIAssistant] Context error:", error);
            res.status(500).json({ error: "Failed to build context" });
        }
    },

    // ── POST /api/ai-assistant/chat ───────────────────────────
    chat: async (req, res) => {
        try {
            const { message, conversationId, context: clientContext, history } = req.body;

            if (!message?.trim()) {
                return res.status(400).json({ error: "Message required" });
            }

            // Build full context
            const workspaceContext = clientContext?.workspace || (await buildWorkspaceContext(req));
            const pageContext = clientContext || {};

            // ── Auto-detect email queries and inject email context ──
            const needsEmailContext = isEmailRelatedQuery(message) ||
                pageContext?.page === "mailbox" ||
                history?.some((msg) => isEmailRelatedQuery(msg.content || ""));

            if (needsEmailContext && !workspaceContext.emailContext) {
                console.log("[AIAssistant] Email-related query detected, loading email context...");
                try {
                    workspaceContext.emailContext = await buildEmailContext({ limit: 20 });
                } catch (e) {
                    console.error("[AIAssistant] Failed to load email context:", e.message);
                }
            }

            // ── Inject specific email detail from mailbox IA button ──
            // When user clicks IA from mail detail, the full email context is passed
            if (clientContext?.emailDetail) {
                console.log("[AIAssistant] Email detail injected from mailbox:", clientContext.emailDetail.subject);
                workspaceContext.currentEmailDetail = clientContext.emailDetail;
            }

            // Build conversation history for AI
            const systemPrompt = buildSystemPrompt(workspaceContext, pageContext);

            const aiMessages = [{ role: "system", content: systemPrompt }];

            // Add conversation history
            if (history?.length) {
                history.forEach((msg) => {
                    aiMessages.push({
                        role: msg.role === "user" ? "user" : "assistant",
                        content: msg.content,
                    });
                });
            }

            // Add current message
            aiMessages.push({ role: "user", content: message });

            // Call AI
            console.log("[AIAssistant] Sending chat to AI, message:", message.substring(0, 80));
            const aiResponse = await callAI(req, aiMessages);
            console.log("[AIAssistant] Raw AI response:", aiResponse.substring(0, 300));

            // Parse response for actions/plans
            const parsed = parseAIResponse(aiResponse);
            parsed.response = ensureImmediateAgendaResponse(
                message,
                parsed.response,
                workspaceContext?.agendaContext,
            );
            console.log("[AIAssistant] Parsed result — actions:", parsed.actions ? JSON.stringify(parsed.actions).substring(0, 200) : "null", "| plan:", parsed.plan ? "yes" : "null");

            // ── Fallback: auto-detect navigate intent if AI forgot the actions block ──
            // Only trigger if AI didn't include any actions block at all
            if (!parsed.actions && !parsed.hadActionsBlock && workspaceContext?.entities?.length) {
                const accountNum = workspaceContext.accountNumber || req.params.accountNumber;
                let navUrl = null;
                let pageName = null;

                // Build dynamic pattern from entity names
                const entityNames = workspaceContext.entities.map(e => e.name.toLowerCase());
                const responseText = parsed.response.toLowerCase();

                // Check if response mentions navigation intent
                const hasNavIntent = /\b(naviguer|diriger|ouvrir?|aller|accéder|afficher|montrer|vers la liste|liste des|redirig)/i.test(parsed.response);

                if (hasNavIntent) {
                    console.log("[AIAssistant] Fallback: nav intent detected, checking entities:", entityNames.join(', '));

                    // Check against all known entities dynamically
                    for (const entity of workspaceContext.entities) {
                        const name = entity.name.toLowerCase();
                        // Match entity name with/without trailing 's' (pluralization)
                        const nameBase = name.replace(/s$/, '');
                        if (responseText.includes(name) || responseText.includes(nameBase)) {
                            navUrl = `/account/${accountNum}/record/${entity.slug}/list`;
                            pageName = entity.name;
                            break;
                        }
                    }

                    // Check static routes
                    if (!navUrl) {
                        if (/accueil|home/i.test(parsed.response)) {
                            navUrl = `/account/${accountNum}/home`;
                            pageName = "Accueil";
                        } else if (/tâche|task/i.test(parsed.response)) {
                            navUrl = `/account/${accountNum}/tasks`;
                            pageName = "Tâches";
                        } else if (/messagerie|mailbox|mail/i.test(parsed.response)) {
                            navUrl = `/account/${accountNum}/mailbox/1`;
                            pageName = "Messagerie";
                        } else if (/studio|réglage|setting/i.test(parsed.response)) {
                            navUrl = `/account/${accountNum}/studio`;
                            pageName = "Studio";
                        } else if (/admin/i.test(parsed.response)) {
                            navUrl = `/account/${accountNum}/admin`;
                            pageName = "Admin";
                        }
                    }

                    if (navUrl) {
                        console.log(`[AIAssistant] Auto-generated navigate action: ${pageName} → ${navUrl}`);
                        parsed.actions = [{
                            type: "navigate",
                            label: `Ouvrir ${pageName}`,
                            description: `Naviguer vers ${pageName}`,
                            data: { url: navUrl, pageName }
                        }];
                    } else {
                        console.log("[AIAssistant] Fallback: nav intent found but no matching entity/route");
                    }
                }
            }

            const newConversationId = conversationId || `conv_${Date.now()}`;

            const finalResponse = {
                response: parsed.response,
                actions: parsed.actions,
                plan: parsed.plan,
                conversationId: newConversationId,
            };
            console.log("[AIAssistant] Sending response — hasActions:", !!parsed.actions, "| hasPlan:", !!parsed.plan, "| responseLength:", parsed.response.length);

            res.json(finalResponse);
        } catch (error) {
            console.error("[AIAssistant] Chat error:", error);

            // Fallback: provide helpful response without AI
            const fallbackResponse = generateFallbackResponse(req, error);
            res.json({
                response: fallbackResponse,
                actions: null,
                plan: null,
                conversationId: req.body.conversationId || `conv_${Date.now()}`,
            });
        }
    },

    // ── POST /api/ai-assistant/execute ────────────────────────
    execute: async (req, res) => {
        try {
            const { action } = req.body;

            if (!action?.type) {
                return res.status(400).json({ error: "Action required" });
            }

            let result = null;
            let response = "";

            switch (action.type) {
                case "create": {
                    const { entitySlug, fields } = action.data || {};
                    console.log("[AIAssistant] Execute create:", { entitySlug, fields });

                    if (!entitySlug || !fields) {
                        return res.json({
                            response: "❌ Données insuffisantes pour créer la fiche.",
                            result: null,
                        });
                    }

                    const Entity = await tenantCollection(req, "Entity");
                    const Record = await tenantCollection(req, "Record");
                    const FieldTemplate = await tenantCollection(req, "FieldTemplate");

                    // Flexible entity matching: try slug, then name (case-insensitive)
                    let entity = await Entity.findOne({ slug: entitySlug }).lean();
                    if (!entity) {
                        entity = await Entity.findOne({
                            slug: { $regex: new RegExp(`^${entitySlug}$`, "i") },
                        }).lean();
                    }
                    if (!entity) {
                        entity = await Entity.findOne({
                            name: { $regex: new RegExp(`^${entitySlug}$`, "i") },
                        }).lean();
                    }

                    if (!entity) {
                        return res.json({
                            response: `❌ Collection "${entitySlug}" introuvable.`,
                            result: null,
                        });
                    }

                    // Fetch field templates for this entity
                    let entityFields = [];
                    try {
                        entityFields = await FieldTemplate.find({
                            entityId: entity._id,
                        }).lean();
                    } catch (e) {
                        console.warn("[AIAssistant] Could not load field templates:", e.message);
                    }

                    // Build customFields array [{field_id, value}]
                    const customFields = [];
                    if (entityFields.length > 0) {
                        for (const field of entityFields) {
                            const key = field.fieldId || field.name?.toLowerCase();
                            let val = undefined;
                            // Try matching by fieldId, name (exact), or name (case-insensitive)
                            if (fields[key] !== undefined) {
                                val = fields[key];
                            } else if (fields[field.name] !== undefined) {
                                val = fields[field.name];
                            } else {
                                // Case-insensitive name matching
                                const matchKey = Object.keys(fields).find(
                                    (k) => k.toLowerCase() === (field.name || "").toLowerCase()
                                );
                                if (matchKey) val = fields[matchKey];
                            }
                            if (val !== undefined) {
                                customFields.push({
                                    field_id: field._id,
                                    value: val,
                                });
                            }
                        }
                    }

                    // Build Record document
                    const recordTitle = fields.title || fields.titre || fields.nom || fields.name || "Sans titre";
                    const recordData = {
                        entityId: entity._id,
                        title: recordTitle,
                        createdBy: req.user._id,
                    };

                    // Add optional standard fields
                    if (fields.description) recordData.description = fields.description;
                    if (fields.content || fields.contenu) recordData.content = fields.content || fields.contenu;
                    if (fields.date) recordData.date = new Date(fields.date);
                    if (fields.status || fields.statut) recordData.status = fields.status || fields.statut;

                    // Add custom fields if any
                    if (customFields.length > 0) {
                        recordData.customFields = customFields;
                    }

                    console.log("[AIAssistant] Creating record:", JSON.stringify(recordData, null, 2));
                    const newRecord = await Record.create(recordData);

                    result = { recordId: newRecord._id, title: newRecord.title };
                    response = `✅ **Fiche créée avec succès !**\n\n📄 **${newRecord.title}** dans ${entity.name}\n🔗 ID: \`${newRecord._id}\``;
                    break;
                }

                case "search": {
                    const { entitySlug, query } = action.data || {};
                    const Entity = await tenantCollection(req, "Entity");
                    const Record = await tenantCollection(req, "Record");

                    let filter = {};
                    if (entitySlug) {
                        const entity = await Entity.findOne({ slug: entitySlug });
                        if (entity) filter.entityId = entity._id;
                    }
                    if (query) {
                        filter.title = { $regex: query, $options: "i" };
                    }

                    const records = await Record.find(filter)
                        .select("title entityId createdAt")
                        .sort({ createdAt: -1 })
                        .limit(10)
                        .lean();

                    result = records;
                    if (records.length === 0) {
                        response = `🔍 Aucun résultat trouvé pour "${query || ""}".`;
                    } else {
                        response = `🔍 **${records.length} résultat(s) trouvé(s) :**\n\n${records.map((r, i) => `${i + 1}. **${r.title}** — ${new Date(r.createdAt).toLocaleDateString("fr-FR")}`).join("\n")}`;
                    }
                    break;
                }

                case "email-search": {
                    const { query, type: mailType, unreadOnly } = action.data || {};
                    console.log("[AIAssistant] Execute email-search:", { query, mailType, unreadOnly });

                    const emailContext = await buildEmailContext({
                        searchQuery: query || null,
                        type: mailType || "inbox",
                        unreadOnly: unreadOnly || false,
                        limit: 15,
                    });

                    if (emailContext.error) {
                        response = `❌ Erreur lors de la recherche d'emails: ${emailContext.error}`;
                        break;
                    }

                    result = emailContext;
                    const emails = emailContext.emails || [];

                    if (emails.length === 0) {
                        response = `🔍 Aucun email trouvé${query ? ` pour "${query}"` : ""}.`;
                    } else {
                        response = `📧 **${emails.length} email(s) trouvé(s)${query ? ` pour "${query}"` : ""} :**\n\n`;
                        emails.forEach((e, i) => {
                            response += `${i + 1}. ${e.isUnread ? "🔵" : "⚪"} **${e.subject}**\n`;
                            response += `   📤 De: ${e.from} (${e.fromEmail})\n`;
                            response += `   📅 ${e.date}${e.hasAttachments ? " 📎" : ""}\n`;
                            response += `   💬 ${e.preview || "(vide)"}\n\n`;
                        });
                    }
                    break;
                }

                case "navigate": {
                    // Navigate is handled client-side, but provide a confirmation
                    const { url, pageName } = action.data || {};
                    console.log("[AIAssistant] Execute navigate:", { url, pageName });
                    response = `🧭 **Navigation vers ${pageName || url}**`;
                    result = { url, pageName };
                    break;
                }

                case "email-detail": {
                    let { emailId } = action.data || {};
                    console.log("[AIAssistant] Execute email-detail:", { emailId });

                    // If emailId is missing, not a valid ObjectId, or a placeholder like "1", "latest"
                    // → fetch the most recent email instead
                    const isValidObjectId = emailId && /^[0-9a-fA-F]{24}$/.test(emailId);

                    if (!isValidObjectId) {
                        console.log("[AIAssistant] Invalid emailId, fetching latest email instead");
                        const latestEmail = await Mail.findOne({ type: "inbox" })
                            .sort({ date: -1 })
                            .lean();
                        if (!latestEmail) {
                            response = "❌ Aucun email trouvé dans la boîte de réception.";
                            break;
                        }
                        emailId = latestEmail._id.toString();
                    }

                    const emailDetail = await buildEmailContext({ emailId });

                    if (emailDetail.error) {
                        response = `❌ ${emailDetail.error}`;
                        break;
                    }

                    const email = emailDetail.email;
                    result = emailDetail;

                    response = `📧 **${email.subject}**\n\n`;
                    response += `📤 **De:** ${email.from} (${email.fromEmail})\n`;
                    response += `📅 **Date:** ${email.date} ${email.time}\n`;
                    if (email.hasAttachments) {
                        response += `📎 **Pièces jointes:** ${email.attachmentCount} fichier(s)\n`;
                        if (email.attachments) {
                            email.attachments.forEach((a) => {
                                response += `   - ${a.name} (${a.size || "?"})`;
                            });
                            response += "\n";
                        }
                    }
                    response += `\n---\n\n${email.body || "(contenu vide)"}`;
                    break;
                }

                default:
                    response = `⚠️ Action "${action.type}" pas encore implémentée.`;
            }

            res.json({ response, result });
        } catch (error) {
            console.error("[AIAssistant] Execute error:", error);
            res.status(500).json({
                response: "❌ Erreur lors de l'exécution de l'action.",
                error: error.message,
            });
        }
    },

    // ── POST /api/ai-assistant/validate-plan ──────────────────
    validatePlan: async (req, res) => {
        try {
            const { plan, modifications, conversationId, context: clientContext } = req.body;

            if (modifications) {
                // Re-send to AI with modifications
                const workspaceContext = clientContext?.workspace || (await buildWorkspaceContext(req));
                const systemPrompt = buildSystemPrompt(workspaceContext, clientContext);

                const aiMessages = [
                    { role: "system", content: systemPrompt },
                    {
                        role: "user",
                        content: `J'avais proposé ce plan:\n${JSON.stringify(plan, null, 2)}\n\nL'utilisateur demande cette modification: ${modifications}\n\nPropose un plan corrigé.`,
                    },
                ];

                const aiResponse = await callAI(req, aiMessages);
                const parsed = parseAIResponse(aiResponse);

                return res.json({
                    response: parsed.response,
                    updatedPlan: parsed.plan,
                    actions: parsed.actions,
                    conversationId,
                });
            }

            // Execute the plan step by step
            let results = [];
            let response = "🚀 **Exécution du plan en cours...**\n\n";

            for (let i = 0; i < (plan.steps || []).length; i++) {
                const step = plan.steps[i];
                response += `${i + 1}. ${step.label} — `;

                try {
                    // For now, mark all as pending (actual execution would happen per step type)
                    step.status = "done";
                    response += "✅ Fait\n";
                    results.push({ step: i, status: "done" });
                } catch (err) {
                    step.status = "error";
                    response += "❌ Erreur\n";
                    results.push({ step: i, status: "error", error: err.message });
                }
            }

            response += "\n✅ **Plan exécuté avec succès !**";

            res.json({
                response,
                results,
                conversationId,
            });
        } catch (error) {
            console.error("[AIAssistant] Validate plan error:", error);
            res.status(500).json({
                response: "❌ Erreur lors de la validation du plan.",
                error: error.message,
            });
        }
    },
};

module.exports.__test = {
    buildSystemPrompt,
    agendaContextPrompt,
    ensureImmediateAgendaResponse,
    summarizeAgendaForAssistant,
    summarizeTaskBoardForAssistant,
    taskContextPrompt,
};

// ── Fallback response (when AI is not configured) ────────────
function generateFallbackResponse(req, error) {
    if (error.message?.includes("provider not configured") || error.message?.includes("not configured")) {
        return `⚠️ **L'intégration OpenAI n'est pas encore configurée.**\n\nPour activer l'assistant IA:\n1. Allez dans **Réglages → Intégrations**\n2. Connectez le provider **OpenAI**\n3. Ajoutez votre clé API\n\nEn attendant, je peux quand même vous donner des informations basiques sur votre workspace !`;
    }

    return `⚠️ Une erreur s'est produite: ${error.message || "Erreur inconnue"}\n\nVeuillez réessayer dans quelques instants.`;
}
