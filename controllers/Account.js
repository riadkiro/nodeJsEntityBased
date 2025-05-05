const Account = require("../models/Account");
const User = require("../models/User");
const tenantCollection = require("../middleware/tenant").tenantCollection;

module.exports = {
  addForm: async (req, res) => {
    res.render("account/account-add");
  },

  delete: async (req, res) => {
    let query = { _id: req.params.id };
    Account.findById(req.params.id, function (err, account) {
      Account.remove(query, function (err) {
        if (err) {
          console.log(err);
        }
        res.send("Deleted");
      });
    });
  },

  delete_Api: async (req, res) => {
    let query = { _id: req.params.id };
    Account.findById(req.params.id, function (err, account) {
      Account.remove(query, function (err) {
        if (err) {
          console.log(err);
        }
        res.send("Deleted");
      });
    });
  },

  editForm: async (req, res) => {
    Account.findById(req.params.id, function (err, account) {
      res.render("account/account-edit", {
        account,
      });
    });
  },

  list: async (req, res) => {
    Account.find({}, function (err, accountAll) {
      if (err) {
        console.log(err);
      } else {
        console.log(req.user);
        res.send({
          accountAll,
        });
      }
    });
  },

  listPopulate: async (req, res) => {
    Account.find({})
      .populate("Permission")
      .exec(function (err, accountAll) {
        if (err) {
          console.log(err);
        } else {
          res.send({
            accountAll,
          });
        }
      });
  },

  list_Api: async (req, res) => {
    Account.find({}, function (err, accountAll) {
      if (err) {
        console.log(err);
      } else {
        res.send({
          accountAll,
        });
      }
    });
  },

  save: async (req, res) => {
    const account = req.body;
    let errors = [];
    if (errors.length > 0) {
      res.render("account/account-add", {
        errors,
      });
    } else {
      const newAccount = new Account(account);
      newAccount.save().then((account) => {
        res.redirect("/account/list");
      });
    }
  },

  save_Api: async (req, res) => {
    const account = req.body;
    let errors = [];
    if (errors.length > 0) {
      res.send({ errors });
    } else {
      const newAccount = new Account(account);
      newAccount.save().then((account) => {
        res.send(`${account} saved in databse`);
      });
    }
  },

  singlePage: async (req, res) => {
    const Account = await tenantCollection(req, "Account");
    //req.tenantDbReady est true si l'utilisateur est bien connecté à sa base de donnée
    req.tenantDbReady &&
      Account.find({ account_id: req.account_number }, function (err, account) {
        if (err) {
          console.log(err);
        } else {
          account = account[0];
          console.log(account);
          res.render("account/account-dashboard", {
            account_number: req.account_number,
            account,
            layout: "layout-app",
          });
        }
      });
  },

  singlePage_Api: async (req, res) => {
    Account.find({ account_id: req.params.id }, function (err, account) {
      if (err) {
        console.log(err);
      } else {
        res.send(account);
      }
    });
  },

  update: async (req, res) => {
    res.send("Edit function here");
  },

  update_Api: async (req, res) => {
    res.send("Edit function here");
  },
};
