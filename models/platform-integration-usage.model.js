const mongoose = require("mongoose");

const PlatformIntegrationUsageSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    dayKey: { type: String, required: true },
    monthKey: { type: String, required: true },
    dayEstimatedCostEur: { type: Number, default: 0, min: 0 },
    monthEstimatedCostEur: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "PlatformIntegrationUsage",
  PlatformIntegrationUsageSchema
);
