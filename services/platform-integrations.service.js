const Account = require("../models/account.model");
const PlatformCredential = require("../models/platform-integration-credential.model");
const PlatformUsage = require("../models/platform-integration-usage.model");
const IntegrationProvider = require("../src/integrations/models/IntegrationProvider.model");
const SecretVault = require("../src/integrations/services/SecretVault");

const DAILY_LIMIT_EUR = 0.5;
const MONTHLY_LIMIT_EUR = 5;
const QUOTA_EXHAUSTED_MESSAGE =
  "Quota offert épuisé. Veuillez mettre vos propres clés API OpenAI, Unsplash, Google ou une autre intégration pour continuer.";

const PROVIDER_PRESETS = [
  { key: "openai", name: "OpenAI", category: "IA", defaultCost: 0.05 },
  { key: "unsplash", name: "Unsplash", category: "Images", defaultCost: 0.002 },
  { key: "google", name: "Google", category: "Google", defaultCost: 0.01 },
];

function normalizeProviderKey(value) {
  const key = String(value || "").trim().toLowerCase();
  if (!/^[a-z0-9-]+$/.test(key)) {
    throw new Error("Clé de fournisseur invalide");
  }
  return key;
}

function periodKeys(now = new Date()) {
  const iso = now.toISOString();
  return {
    dayKey: iso.slice(0, 10),
    monthKey: iso.slice(0, 7),
  };
}

function defaultCostFor(providerKey) {
  return PROVIDER_PRESETS.find((provider) => provider.key === providerKey)?.defaultCost || 0.01;
}

function publicCredential(credential) {
  if (!credential) return null;
  return {
    providerKey: credential.providerKey,
    configured: Boolean(credential.secrets?.ciphertext),
    status: credential.status,
    estimatedCostPerCallEur: credential.estimatedCostPerCallEur,
    defaultModel: credential.defaultModel || "",
    maxOutputTokens: credential.maxOutputTokens || 1200,
    configuredAt: credential.configuredAt,
    updatedAt: credential.updatedAt,
  };
}

async function listProviderCatalog() {
  const [providers, credentials] = await Promise.all([
    IntegrationProvider.find().sort({ category: 1, name: 1 }).lean(),
    PlatformCredential.find().lean(),
  ]);

  const providerMap = new Map();
  for (const preset of PROVIDER_PRESETS) {
    providerMap.set(preset.key, { ...preset, status: "preset" });
  }
  for (const provider of providers) {
    providerMap.set(provider.key, {
      key: provider.key,
      name: provider.name,
      category: provider.category || "Autre",
      status: provider.status,
    });
  }
  for (const credential of credentials) {
    if (!providerMap.has(credential.providerKey)) {
      providerMap.set(credential.providerKey, {
        key: credential.providerKey,
        name: credential.providerKey,
        category: "Autre",
        status: "credential-only",
      });
    }
  }

  const credentialMap = new Map(
    credentials.map((credential) => [credential.providerKey, publicCredential(credential)])
  );

  return [...providerMap.values()].map((provider) => ({
    ...provider,
    credential: credentialMap.get(provider.key) || {
      providerKey: provider.key,
      configured: false,
      status: "disabled",
      estimatedCostPerCallEur: defaultCostFor(provider.key),
      defaultModel: "",
      maxOutputTokens: 1200,
    },
  }));
}

async function saveCredential({
  providerKey,
  token,
  estimatedCostPerCallEur,
  defaultModel,
  maxOutputTokens,
  userId,
}) {
  const key = normalizeProviderKey(providerKey);
  const existing = await PlatformCredential.findOne({ providerKey: key });
  const normalizedToken = String(token || "").trim();

  if (!existing && !normalizedToken) {
    throw new Error("La clé API est obligatoire lors de la première configuration");
  }

  const parsedCost = Number(estimatedCostPerCallEur);
  const safeCost = Number.isFinite(parsedCost)
    ? Math.min(0.5, Math.max(0.0001, parsedCost))
    : existing?.estimatedCostPerCallEur || defaultCostFor(key);
  const parsedMaxTokens = Number(maxOutputTokens);
  const safeMaxTokens = Number.isFinite(parsedMaxTokens)
    ? Math.min(4096, Math.max(64, Math.round(parsedMaxTokens)))
    : existing?.maxOutputTokens || 1200;

  const update = {
    status: "active",
    estimatedCostPerCallEur: safeCost,
    defaultModel: String(defaultModel || "").trim(),
    maxOutputTokens: safeMaxTokens,
    updatedBy: userId,
    configuredAt: existing?.configuredAt || new Date(),
  };
  if (normalizedToken) {
    update.secrets = SecretVault.encrypt({ token: normalizedToken });
  }

  const credential = await PlatformCredential.findOneAndUpdate(
    { providerKey: key },
    { $set: update },
    { upsert: true, new: true, runValidators: true }
  );
  return publicCredential(credential);
}

async function deleteCredential(providerKey) {
  const key = normalizeProviderKey(providerKey);
  await Promise.all([
    PlatformCredential.deleteOne({ providerKey: key }),
    Account.updateMany(
      {},
      { $pull: { "platformIntegrations.providers": { providerKey: key } } }
    ),
  ]);
}

async function setAccountProvider({ accountId, providerKey, enabled, userId }) {
  const key = normalizeProviderKey(providerKey);
  const account = await Account.findById(accountId);
  if (!account) throw new Error("Compte introuvable");

  if (enabled) {
    const credential = await PlatformCredential.findOne({
      providerKey: key,
      status: "active",
      "secrets.ciphertext": { $exists: true, $ne: "" },
    });
    if (!credential) {
      throw new Error("Configurez d’abord la clé API globale de ce fournisseur");
    }
  }

  const providers = account.platformIntegrations?.providers || [];
  const current = providers.find((provider) => provider.providerKey === key);
  if (current) {
    current.enabled = Boolean(enabled);
    current.updatedAt = new Date();
    current.updatedBy = userId;
  } else {
    providers.push({
      providerKey: key,
      enabled: Boolean(enabled),
      updatedAt: new Date(),
      updatedBy: userId,
    });
  }
  account.platformIntegrations = account.platformIntegrations || {};
  account.platformIntegrations.providers = providers;
  account.markModified("platformIntegrations.providers");
  await account.save();
}

async function getAccountAccess(accountNumber, providerKeys = []) {
  const keys = [...new Set(providerKeys.map(normalizeProviderKey))];
  const [account, credentials, usage] = await Promise.all([
    Account.findOne({ account_number: String(accountNumber) })
      .select("platformIntegrations")
      .lean(),
    PlatformCredential.find({
      providerKey: { $in: keys },
      status: "active",
    }).lean(),
    getUsage(accountNumber),
  ]);

  const enabledKeys = new Set(
    (account?.platformIntegrations?.providers || [])
      .filter((provider) => provider.enabled)
      .map((provider) => provider.providerKey)
  );
  const credentialMap = new Map(
    credentials.map((credential) => [credential.providerKey, credential])
  );
  const access = {};
  for (const key of keys) {
    const credential = credentialMap.get(key);
    const configured = Boolean(credential?.secrets?.ciphertext);
    const enabled = enabledKeys.has(key);
    access[key] = {
      enabled,
      configured,
      available: enabled && configured,
    };
  }
  return { access, quota: usage };
}

async function resolveCredentials({
  ConnectionModel,
  workspaceId,
  providerKey,
  allowErroredConnection = false,
}) {
  const key = normalizeProviderKey(providerKey);
  const connection = await ConnectionModel.findOne({
    workspaceId,
    providerKey: key,
  });

  const canUsePersonalConnection =
    connection?.status === "connected" ||
    (allowErroredConnection && connection?.status === "error");
  if (canUsePersonalConnection && connection.secrets?.ciphertext) {
    return {
      source: "account",
      secrets: SecretVault.decrypt(connection.secrets),
      connection,
      credential: null,
    };
  }
  if (connection?.secrets?.ciphertext) {
    return {
      source: null,
      error:
        connection.lastError ||
        "Votre clé personnelle est en erreur. Corrigez-la ou déconnectez-la pour utiliser l’accès offert.",
    };
  }

  const resolvedAccount = await Account.findOne({
    account_number: String(workspaceId),
    "platformIntegrations.providers": {
      $elemMatch: { providerKey: key, enabled: true },
    },
  });

  const enabled = Boolean(
    resolvedAccount?.platformIntegrations?.providers?.some(
      (provider) => provider.providerKey === key && provider.enabled
    )
  );
  if (!enabled) {
    return { source: null, error: "Not connected to this provider" };
  }

  const credential = await PlatformCredential.findOne({
    providerKey: key,
    status: "active",
  });
  if (!credential?.secrets?.ciphertext) {
    return {
      source: null,
      error: "La clé API globale de ce fournisseur n’est pas configurée",
    };
  }

  return {
    source: "platform",
    secrets: SecretVault.decrypt(credential.secrets),
    connection: null,
    credential,
  };
}

function quotaResponse(usage) {
  return {
    dailyLimitEur: DAILY_LIMIT_EUR,
    monthlyLimitEur: MONTHLY_LIMIT_EUR,
    dayEstimatedCostEur: Number(usage?.dayEstimatedCostEur || 0),
    monthEstimatedCostEur: Number(usage?.monthEstimatedCostEur || 0),
    dayKey: usage?.dayKey || periodKeys().dayKey,
    monthKey: usage?.monthKey || periodKeys().monthKey,
  };
}

async function getUsage(accountNumber) {
  const { dayKey, monthKey } = periodKeys();
  const usage = await PlatformUsage.findOne({ accountNumber: String(accountNumber) }).lean();
  return quotaResponse({
    dayKey,
    monthKey,
    dayEstimatedCostEur: usage?.dayKey === dayKey ? usage.dayEstimatedCostEur : 0,
    monthEstimatedCostEur: usage?.monthKey === monthKey ? usage.monthEstimatedCostEur : 0,
  });
}

async function consumeBudget({ accountNumber, credential }) {
  const { dayKey, monthKey } = periodKeys();
  const estimatedCostEur = Math.min(
    DAILY_LIMIT_EUR,
    Math.max(0.0001, Number(credential.estimatedCostPerCallEur) || 0.01)
  );
  const accountKey = String(accountNumber);

  const resetPeriodPipeline = [
    {
      $set: {
        accountNumber: accountKey,
        dayEstimatedCostEur: {
          $cond: [
            { $eq: ["$dayKey", dayKey] },
            { $ifNull: ["$dayEstimatedCostEur", 0] },
            0,
          ],
        },
        monthEstimatedCostEur: {
          $cond: [
            { $eq: ["$monthKey", monthKey] },
            { $ifNull: ["$monthEstimatedCostEur", 0] },
            0,
          ],
        },
        dayKey,
        monthKey,
      },
    },
  ];
  try {
    await PlatformUsage.updateOne(
      { accountNumber: accountKey },
      resetPeriodPipeline,
      { upsert: true }
    );
  } catch (error) {
    // Two first calls can race on the unique accountNumber index. The winner
    // created the counter, so the loser only needs to retry without upsert.
    if (error?.code !== 11000) throw error;
    await PlatformUsage.updateOne(
      { accountNumber: accountKey },
      resetPeriodPipeline
    );
  }

  const usage = await PlatformUsage.findOneAndUpdate(
    {
      accountNumber: accountKey,
      dayKey,
      monthKey,
      $expr: {
        $and: [
          {
            $lte: [
              { $add: ["$dayEstimatedCostEur", estimatedCostEur] },
              DAILY_LIMIT_EUR + Number.EPSILON,
            ],
          },
          {
            $lte: [
              { $add: ["$monthEstimatedCostEur", estimatedCostEur] },
              MONTHLY_LIMIT_EUR + Number.EPSILON,
            ],
          },
        ],
      },
    },
    {
      $inc: {
        dayEstimatedCostEur: estimatedCostEur,
        monthEstimatedCostEur: estimatedCostEur,
      },
    },
    { new: true }
  ).lean();

  if (!usage) {
    return {
      allowed: false,
      estimatedCostEur,
      quota: await getUsage(accountKey),
    };
  }
  return {
    allowed: true,
    estimatedCostEur,
    quota: quotaResponse(usage),
    dayKey,
    monthKey,
  };
}

async function refundBudget({ accountNumber, reservation }) {
  if (!reservation?.allowed) return;
  await PlatformUsage.updateOne(
    {
      accountNumber: String(accountNumber),
      dayKey: reservation.dayKey,
      monthKey: reservation.monthKey,
    },
    [
      {
        $set: {
          dayEstimatedCostEur: {
            $max: [
              0,
              { $subtract: ["$dayEstimatedCostEur", reservation.estimatedCostEur] },
            ],
          },
          monthEstimatedCostEur: {
            $max: [
              0,
              { $subtract: ["$monthEstimatedCostEur", reservation.estimatedCostEur] },
            ],
          },
        },
      },
    ]
  );
}

function preparePlatformInput(providerKey, input, credential) {
  const prepared = { ...(input || {}) };
  if (providerKey !== "openai") return prepared;

  const cap = Math.min(4096, Math.max(64, Number(credential.maxOutputTokens) || 1200));
  const requested = Number(prepared.max_output_tokens);
  prepared.max_output_tokens = Number.isFinite(requested)
    ? Math.min(cap, Math.max(1, Math.round(requested)))
    : cap;
  const requestedLegacy = Number(prepared.max_tokens);
  if (Object.prototype.hasOwnProperty.call(prepared, "max_tokens")) {
    prepared.max_tokens = Number.isFinite(requestedLegacy)
      ? Math.min(cap, Math.max(1, Math.round(requestedLegacy)))
      : cap;
  }
  if (credential.defaultModel) {
    prepared.model = credential.defaultModel;
  }
  return prepared;
}

module.exports = {
  DAILY_LIMIT_EUR,
  MONTHLY_LIMIT_EUR,
  QUOTA_EXHAUSTED_MESSAGE,
  listProviderCatalog,
  saveCredential,
  deleteCredential,
  setAccountProvider,
  getAccountAccess,
  resolveCredentials,
  consumeBudget,
  refundBudget,
  preparePlatformInput,
  getUsage,
  normalizeProviderKey,
};
