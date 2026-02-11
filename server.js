//Charger les variables d'environnement
require('dotenv').config();

//Initialiser les modules qu'on va utiliser
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

//Dont remove this comments
//Auto generated passport
const startPassport = require("./auth/startPassport");
startPassport(app);
//Auto generated passport end

const PORT = 3000;
var server = app.listen(PORT, console.log(`Server started on port ${PORT}`));

// Initialize Socket.IO for real-time chat
const { sessionMiddleware } = require("./auth/passport-express-config");
const { initSocketIO } = require("./src/chat/socketServer");
const io = initSocketIO(server, sessionMiddleware);

// DB Config
const db = require("./config/db").globalDbUri;

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(async () => {
    console.log("MongoDB Connected : Global DB");

    // Start workflow worker with tenant DB connection
    try {
      const WorkflowWorker = require('./src/integrations/services/WorkflowWorker');
      const dbConfig = require('./config/db');
      const defaultTenant = process.env.DEFAULT_TENANT || '5001';
      const tenantDbUrl = `${dbConfig.uri}saas_app_rb_${defaultTenant}`;
      const tenantConn = await mongoose.createConnection(tenantDbUrl, { useNewUrlParser: true });
      console.log(`[WorkflowWorker] Connected to tenant DB: saas_app_rb_${defaultTenant}`);
      WorkflowWorker.start(tenantConn);
    } catch (err) {
      console.error('[WorkflowWorker] Failed to start:', err.message);
    }
  })
  .catch((err) => console.log(err));

//CSS and static files
//Maintenant tous les fichiers du répertoire www.domaine.com/public/monfichier.xx seront accéssibles
app.use(express.static(__dirname + "/public"));

// EJS
//EJS est un moteur de template JS, comme twig pour php
app.use(expressLayouts);
app.set("view engine", "ejs");

//Saas multi-tenant middleware END

const { ensureAuthenticated } = require("./auth/auth");
// Routes
const Routes = require("./routes/routes-inc.js");
const RoutesAccount = require("./routes/routes-inc-account.js");
const { connectToTenantDb } = require("./middleware/tenant");

app.use("/", Routes);

// Routes with Tenant DB
app.use(
  "/account/:account_id",
  ensureAuthenticated,
  (req, res, next) => {
    req.account_number = req.params.account_id;
    res.locals.account_number = req.account_number;
    res.locals.path = req.originalUrl;
    next();
  },
  connectToTenantDb,
  RoutesAccount
);
