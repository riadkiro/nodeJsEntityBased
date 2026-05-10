const mongoose = require("mongoose");
const dbConfig = require("../config/db");
const model = require("mongoose").model;
const { hydrateWorkspaceRole } = require('./permissions');

const cachedConnections = {};

const tenantCollection = async (req, collection) => {
  const { tenantDbConnection, tenantDbReady } = req;

  // Ensure the model is registered globally
  let collectionSchema;
  try {
    collectionSchema = model(collection).schema;
  } catch (e) {
    // If not registered, try to require it
    try {
      // Use original case for regex before lowercasing to find word boundaries
      const fileName = collection.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() + '.model.js';
      const modelPath = require('path').join(__dirname, '..', 'models', fileName);
      console.log(`[Tenant] Requiring model from ${modelPath}`);
      require(modelPath);
      collectionSchema = model(collection).schema;
    } catch (err) {
      console.error(`Could not load schema for ${collection}:`, err);
      return false;
    }
  }

  if (tenantDbReady) {
    return tenantDbConnection.model(collection, collectionSchema);
  } else {
    return false;
  }
};

const connectToTenantDb = async (req, res, next) => {
  try {
    if (req.isAuthenticated() && req.account_number) {
      if (
        req.user.accounts.some(
          (account) => account.account_number === req.account_number
        )
      ) {
        // Check account is not suspended
        const Account = require('../models/account.model');
        const account = await Account.findOne({ account_number: req.account_number });
        if (account && account.status === 'suspended') {
          return res.status(403).render('admin/admin-403', {
            layout: false,
            user: req.user,
            account_number: req.account_number,
          });
        }

        const tenantId = req.account_number;
        const dbUrl = `${dbConfig.uri}saas_app_rb_${tenantId}`;

        if (!cachedConnections[tenantId]) {
          console.log(`[Tenant] Initializing NEW connection to ${dbUrl}`);
          const connection = await mongoose.createConnection(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 20,
          });

          await new Promise((resolve, reject) => {
            connection.once('open', () => {
              console.log(`[Tenant] Connection OPENED for ${tenantId}`);
              resolve();
            });
            connection.once('error', (err) => {
              console.error(`[Tenant] Connection ERROR for ${tenantId}:`, err);
              reject(err);
            });
          });

          cachedConnections[tenantId] = connection;
        }

        req.tenantDbConnection = cachedConnections[tenantId];
        req.tenantDbReady = true;

        // Hydrate workspace role & permissions
        return hydrateWorkspaceRole(req, res, next);
      } else {
        req.tenantDbReady = false;
        console.log("No permission to manage this account");
        res.status(500).json({ error: "No permissions" });
      }
    } else {
      req.tenantDbReady = false;
      // No logs here to avoid noise for non-account routes
      next();
    }
  } catch (error) {
    console.error("[Tenant] Error in connectToTenantDb:", error);
    res.status(500).json({ error: "Error connecting to database" });
  }
};

module.exports = { connectToTenantDb, tenantCollection };

