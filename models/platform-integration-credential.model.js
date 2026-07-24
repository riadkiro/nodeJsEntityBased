const mongoose = require("mongoose");

const EncryptedSecretSchema = new mongoose.Schema(
  {
    v: { type: Number, default: 1 },
    iv: String,
    authTag: String,
    ciphertext: String,
  },
  { _id: false }
);

const PlatformIntegrationCredentialSchema = new mongoose.Schema(
  {
    providerKey: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]+$/,
    },
    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
    },
    secrets: EncryptedSecretSchema,
    estimatedCostPerCallEur: {
      type: Number,
      min: 0.0001,
      max: 0.5,
      default: 0.05,
    },
    defaultModel: {
      type: String,
      trim: true,
      default: "",
    },
    maxOutputTokens: {
      type: Number,
      min: 64,
      max: 4096,
      default: 1200,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    configuredAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "PlatformIntegrationCredential",
  PlatformIntegrationCredentialSchema
);
