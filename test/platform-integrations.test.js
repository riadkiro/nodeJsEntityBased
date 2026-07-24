const test = require("node:test");
const assert = require("node:assert/strict");

const PlatformIntegrations = require("../services/platform-integrations.service");
const SecretVault = require("../src/integrations/services/SecretVault");
const HttpRunner = require("../src/integrations/services/HttpRunner");
const IntegrationService = require("../src/integrations/services/IntegrationService");
const Account = require("../models/account.model");
const PlatformCredential = require("../models/platform-integration-credential.model");

test("a personal key takes precedence and remains decrypted only server-side", async () => {
  const previousKey = process.env.INTEGRATION_SECRETS_KEY;
  process.env.INTEGRATION_SECRETS_KEY = Buffer.alloc(32, 7).toString("base64");
  const encrypted = SecretVault.encrypt({ token: "tenant-secret" });

  try {
    const resolved = await PlatformIntegrations.resolveCredentials({
      ConnectionModel: {
        findOne: async () => ({
          _id: "connection-id",
          status: "connected",
          secrets: encrypted,
        }),
      },
      workspaceId: "5001",
      providerKey: "openai",
    });

    assert.equal(resolved.source, "account");
    assert.deepEqual(resolved.secrets, { token: "tenant-secret" });
    assert.equal(resolved.credential, null);
  } finally {
    if (previousKey === undefined) delete process.env.INTEGRATION_SECRETS_KEY;
    else process.env.INTEGRATION_SECRETS_KEY = previousKey;
  }
});

test("a global key resolves only when the provider is enabled for the account", async () => {
  const previousKey = process.env.INTEGRATION_SECRETS_KEY;
  const originalAccountFindOne = Account.findOne;
  const originalCredentialFindOne = PlatformCredential.findOne;
  process.env.INTEGRATION_SECRETS_KEY = Buffer.alloc(32, 8).toString("base64");
  const encrypted = SecretVault.encrypt({ token: "platform-secret" });

  Account.findOne = async () => ({
    platformIntegrations: {
      providers: [{ providerKey: "openai", enabled: true }],
    },
  });
  PlatformCredential.findOne = async () => ({
    providerKey: "openai",
    status: "active",
    secrets: encrypted,
  });

  try {
    const resolved = await PlatformIntegrations.resolveCredentials({
      ConnectionModel: { findOne: async () => null },
      workspaceId: "5001",
      providerKey: "openai",
    });

    assert.equal(resolved.source, "platform");
    assert.deepEqual(resolved.secrets, { token: "platform-secret" });
  } finally {
    Account.findOne = originalAccountFindOne;
    PlatformCredential.findOne = originalCredentialFindOne;
    if (previousKey === undefined) delete process.env.INTEGRATION_SECRETS_KEY;
    else process.env.INTEGRATION_SECRETS_KEY = previousKey;
  }
});

test("platform-funded OpenAI calls are capped, attributed and quota-aware", async () => {
  const originalResolve = PlatformIntegrations.resolveCredentials;
  const originalConsume = PlatformIntegrations.consumeBudget;
  const originalPrepare = PlatformIntegrations.preparePlatformInput;
  const originalExecuteWithRefresh = HttpRunner.executeWithRefresh;
  const logs = [];
  let executedInput;

  PlatformIntegrations.resolveCredentials = async () => ({
    source: "platform",
    secrets: { token: "global-secret" },
    credential: {
      estimatedCostPerCallEur: 0.05,
      maxOutputTokens: 800,
      defaultModel: "safe-model",
    },
  });
  PlatformIntegrations.consumeBudget = async () => ({
    allowed: true,
    estimatedCostEur: 0.05,
    quota: {
      dailyLimitEur: 0.5,
      monthlyLimitEur: 5,
      dayEstimatedCostEur: 0.05,
      monthEstimatedCostEur: 0.05,
    },
  });
  HttpRunner.executeWithRefresh = async ({ input }) => {
    executedInput = input;
    return { success: true, data: { output_text: "ok" } };
  };

  try {
    const result = await IntegrationService.executeAction({
      ProviderModel: { findOne: async () => ({ key: "openai" }) },
      ActionModel: {
        findOne: async () => ({
          providerKey: "openai",
          actionKey: "responses",
        }),
      },
      ConnectionModel: {},
      LogModel: { create: async (entry) => logs.push(entry) },
      workspaceId: "5001",
      providerKey: "openai",
      actionId: "responses",
      input: {
        model: "expensive-model",
        max_output_tokens: 5000,
        input: "Bonjour",
      },
    });

    assert.equal(result.success, true);
    assert.equal(result.credentialSource, "platform");
    assert.equal(executedInput.model, "safe-model");
    assert.equal(executedInput.max_output_tokens, 800);
    assert.equal(logs[0].credentialSource, "platform");
    assert.equal(logs[0].estimatedCostEur, 0.05);
    assert.equal(JSON.stringify(result).includes("global-secret"), false);
  } finally {
    PlatformIntegrations.resolveCredentials = originalResolve;
    PlatformIntegrations.consumeBudget = originalConsume;
    PlatformIntegrations.preparePlatformInput = originalPrepare;
    HttpRunner.executeWithRefresh = originalExecuteWithRefresh;
  }
});

test("an exhausted platform quota stops the request before the provider call", async () => {
  const originalResolve = PlatformIntegrations.resolveCredentials;
  const originalConsume = PlatformIntegrations.consumeBudget;
  const originalExecuteWithRefresh = HttpRunner.executeWithRefresh;
  let providerCalled = false;

  PlatformIntegrations.resolveCredentials = async () => ({
    source: "platform",
    secrets: { token: "global-secret" },
    credential: { estimatedCostPerCallEur: 0.05 },
  });
  PlatformIntegrations.consumeBudget = async () => ({
    allowed: false,
    quota: {
      dailyLimitEur: 0.5,
      monthlyLimitEur: 5,
      dayEstimatedCostEur: 0.5,
      monthEstimatedCostEur: 1.5,
    },
  });
  HttpRunner.executeWithRefresh = async () => {
    providerCalled = true;
    return { success: true };
  };

  try {
    const result = await IntegrationService.executeAction({
      ProviderModel: { findOne: async () => ({ key: "openai" }) },
      ActionModel: {
        findOne: async () => ({
          providerKey: "openai",
          actionKey: "responses",
        }),
      },
      ConnectionModel: {},
      LogModel: { create: async () => {} },
      workspaceId: "5001",
      providerKey: "openai",
      actionId: "responses",
      input: {},
    });

    assert.equal(result.success, false);
    assert.equal(result.code, "PLATFORM_QUOTA_EXHAUSTED");
    assert.match(result.error, /propres clés API OpenAI/);
    assert.equal(providerCalled, false);
  } finally {
    PlatformIntegrations.resolveCredentials = originalResolve;
    PlatformIntegrations.consumeBudget = originalConsume;
    HttpRunner.executeWithRefresh = originalExecuteWithRefresh;
  }
});
