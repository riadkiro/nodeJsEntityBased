const mongoose = require("mongoose");
const dbConfig = require("../config/db");
const model = require("mongoose").model;

async function setAccountNumber(req, res, next) {
  const parts = req.url.split("/");
  if (parts[1] == "account") {
    req.account_number = parts[2];
  }
  next();
}

const tenantCollection = async (req, collection) => {
  const { tenantDbConnection, tenantDbReady } = req;
  const collectionSchema = model(collection).schema;
  if (tenantDbReady) {
    return tenantDbConnection.model(collection, collectionSchema);
  } else {
    return false;
  }
};

const connectToTenantDb = async (req, res, next) => {
  try {
    //Ce middleware s'appliquera si l'utilisateur est connecté
    //et que l'url est sous forme de myapp/account/123456
    //il connecte l'app à la base de donné du compte 123456
    if (req.isAuthenticated() && req.account_number) {
      //Vérifier si l'utilisateur peut gérer ce compte
      if (
        req.user.accounts.some(
          (account) => account.account_number === req.account_number
        )
      ) {
        const tenantId = req.account_number;
        const dbUrl = `${dbConfig.uri}saas_app_${tenantId}`;
        console.log("Data from tenant DB");
        const connection = await mongoose.createConnection(dbUrl, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          maxPoolSize: 20, // Définir le nombre de connexions à conserver dans le pool
        });
        req.tenantDbConnection = connection;
        req.tenantDbReady = true;
        next();
      } else {
        req.tenantDbReady = false;
        console.log("No permission to manage this account");
        res.status(500).json({ error: "No permissions" });
      }
    } else {
      req.tenantDbReady = false;
      next();
    }
  } catch (error) {
    res.status(500).json({ error: "Error connecting to database" });
  }
};

module.exports = { connectToTenantDb, tenantCollection, setAccountNumber };
