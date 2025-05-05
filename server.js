//Initialiser les modules qu'on va utiliser
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

//Dont remove this comments
//Auto generated passport
const startPassport = require("./auth/startPassport");
startPassport(app);
//Auto generated passport end

const PORT = 3000;
var server = app.listen(PORT, console.log(`Server started on port ${PORT}`));

// DB Config
const db = require("./config/db").globalDbUri;

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected : Global DB"))
  .catch((err) => console.log(err));

//CSS and static files
//Maintenant tous les fichiers du répertoire www.domaine.com/public/monfichier.xx seront accéssibles
app.use(express.static(__dirname + "/public"));

// EJS
//EJS est un moteur de template JS, comme twig pour php
app.use(expressLayouts);
app.set("view engine", "ejs");

//Saas multi-tenant middleware START
const connectToTenantDb = require("./middleware/tenant").connectToTenantDb;
const setAccountNumber = require("./middleware/tenant").setAccountNumber;

//Cette fonction ajoute req.account_number = 123456 si l'url est myapp/account/123456
app.use(setAccountNumber);

//Si l'utilisateur est connecté et req.account_number est définie
//Cette fonction permet de se connecter à la base de donné du compte via req.tenantDbConnection
app.use(connectToTenantDb);

//Saas multi-tenant middleware END

const { ensureAuthenticated } = require("./auth/auth");
// Routes
const Routes = require("./routes/routes-inc.js");
const RoutesAccount = require("./routes/routes-inc-account.js");
app.use("/", Routes);
app.use("/account/:account_id", ensureAuthenticated, RoutesAccount);
