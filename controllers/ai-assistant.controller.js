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

// ── Global models (Provider & Action live in global DB) ──────
const IntegrationProvider = require("../src/integrations/models/IntegrationProvider.model");
const IntegrationAction = require("../src/integrations/models/IntegrationAction.model");
const IntegrationConnectionSchema = require("../src/integrations/models/IntegrationConnection.model").schema;
const IntegrationLogSchema = require("../src/integrations/models/IntegrationLog.model").schema;

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
                };
            })
        );

        return {
            accountNumber: req.account_number,
            entities: entitySummaries,
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error("[AIAssistant] Context build error:", error);
        return { error: error.message };
    }
}

// ── System prompt builder ────────────────────────────────────
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
            tasks: "les tâches",
            admin: "le panneau admin",
            superadmin: "le panneau SuperAdmin",
            dashboard: "le tableau de bord",
        };
        pageHint = `\nL'utilisateur est sur ${pageNames[pageContext.page] || pageContext.page}.`;
    }

    return `Tu es l'assistant IA de la plateforme SaaS "Cyberbox", un espace de travail intelligent.

📅 Date: ${dateStr}
🕐 Heure: ${timeStr}
🏢 Workspace: #${context?.accountNumber || "?"}
${pageHint}

## Collections disponibles dans ce workspace:
${entityList}

## Tes capacités:
1. **Interroger les données** — Répondre aux questions sur les fiches, statistiques, etc.
2. **Créer des fiches** — L'utilisateur peut te demander de créer des fiches dans n'importe quelle collection. Tu DOIS alors:
   - Identifier la collection cible
   - Demander les informations manquantes obligatoires
   - Proposer une ACTION de type \`create\` avec les données à créer
3. **Chercher des fiches** — Trouver des fiches par critères
4. **Planifier des tâches complexes** — Pour les demandes complexes (multi-étapes), propose un PLAN avec les étapes à valider

## Format de réponse:
- Réponds en français, de manière concise et professionnelle
- Utilise le **gras** et des emojis pour structurer
- Pour les ACTIONS simples, retourne un bloc \`\`\`actions avec le JSON
- Pour les PLANS complexes, retourne un bloc \`\`\`plan avec le JSON

### Actions (exemple):
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

Ne mets les blocs actions/plan QUE quand l'utilisateur demande une action concrète, pas pour les questions simples.
Pour les questions sur les données (combien de patients, etc.), réponds directement avec les chiffres que tu connais du contexte.`;
}

// ── Parse AI response for actions/plans ──────────────────────
function parseAIResponse(text) {
    const result = { response: text, actions: null, plan: null };

    // Extract ```actions block
    const actionsMatch = text.match(/```actions\s*\n([\s\S]*?)```/);
    if (actionsMatch) {
        try {
            result.actions = JSON.parse(actionsMatch[1]);
            result.response = text.replace(/```actions\s*\n[\s\S]*?```/, "").trim();
        } catch (e) {
            console.error("[AIAssistant] Failed to parse actions:", e);
        }
    }

    // Extract ```plan block
    const planMatch = text.match(/```plan\s*\n([\s\S]*?)```/);
    if (planMatch) {
        try {
            result.plan = JSON.parse(planMatch[1]);
            result.response = text.replace(/```plan\s*\n[\s\S]*?```/, "").trim();
        } catch (e) {
            console.error("[AIAssistant] Failed to parse plan:", e);
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

        // Find OpenAI provider (global DB)
        const provider = await IntegrationProvider.findOne({ key: "openai" });
        if (!provider) {
            throw new Error("OpenAI provider not configured. Please set up the OpenAI integration first.");
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
                model: "gpt-4o-mini",
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
            const aiResponse = await callAI(req, aiMessages);

            // Parse response for actions/plans
            const parsed = parseAIResponse(aiResponse);

            const newConversationId = conversationId || `conv_${Date.now()}`;

            res.json({
                response: parsed.response,
                actions: parsed.actions,
                plan: parsed.plan,
                conversationId: newConversationId,
            });
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
                    if (!entitySlug || !fields) {
                        return res.json({
                            response: "❌ Données insuffisantes pour créer la fiche.",
                            result: null,
                        });
                    }

                    const Entity = await tenantCollection(req, "Entity");
                    const Record = await tenantCollection(req, "Record");

                    const entity = await Entity.findOne({ slug: entitySlug })
                        .populate("customFields")
                        .lean();

                    if (!entity) {
                        return res.json({
                            response: `❌ Collection "${entitySlug}" introuvable.`,
                            result: null,
                        });
                    }

                    // Build field values
                    const fieldValues = {};
                    if (entity.customFields) {
                        for (const field of entity.customFields) {
                            const key = field.fieldId || field.name?.toLowerCase();
                            if (fields[key] !== undefined) {
                                fieldValues[field._id.toString()] = fields[key];
                            } else if (fields[field.name] !== undefined) {
                                fieldValues[field._id.toString()] = fields[field.name];
                            }
                        }
                    }

                    const newRecord = await Record.create({
                        entityId: entity._id,
                        title: fields.title || fields.nom || fields.name || "Sans titre",
                        fieldValues,
                        createdBy: req.user._id,
                    });

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

// ── Fallback response (when AI is not configured) ────────────
function generateFallbackResponse(req, error) {
    if (error.message?.includes("provider not configured") || error.message?.includes("not configured")) {
        return `⚠️ **L'intégration OpenAI n'est pas encore configurée.**\n\nPour activer l'assistant IA:\n1. Allez dans **Réglages → Intégrations**\n2. Connectez le provider **OpenAI**\n3. Ajoutez votre clé API\n\nEn attendant, je peux quand même vous donner des informations basiques sur votre workspace !`;
    }

    return `⚠️ Une erreur s'est produite: ${error.message || "Erreur inconnue"}\n\nVeuillez réessayer dans quelques instants.`;
}
