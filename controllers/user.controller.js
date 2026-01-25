const User = require("../models/user.model");

module.exports = {
  addForm: async (req, res) => {
    res.render("user/user-add");
  },

  delete: async (req, res) => {
    let query = { _id: req.params.id };
    User.findById(req.params.id, function (err, user) {
      User.remove(query, function (err) {
        if (err) {
          console.log(err);
        }
        res.send("Deleted");
      });
    });
  },

  delete_Api: async (req, res) => {
    let query = { _id: req.params.id };
    User.findById(req.params.id, function (err, user) {
      User.remove(query, function (err) {
        if (err) {
          console.log(err);
        }
        res.send("Deleted");
      });
    });
  },

  editForm: async (req, res) => {
    User.findById(req.params.id, function (err, user) {
      res.render("user/user-edit", {
        user,
      });
    });
  },

  list: async (req, res) => {
    User.find({}, function (err, userAll) {
      if (err) {
        console.log(err);
      } else {
        res.send({
          userAll,
        });
      }
    });
  },
  list_Api: async (req, res) => {
    User.find({}, function (err, userAll) {
      if (err) {
        console.log(err);
      } else {
        res.send({
          userAll,
        });
      }
    });
  },

  save: async (req, res) => {
    const user = req.body;
    let errors = [];
    if (errors.length > 0) {
      res.render("user/user-add", {
        errors,
      });
    } else {
      const newUser = new User(user);
      newUser.save().then((user) => {
        res.redirect("/user/list");
      });
    }
  },

  save_Api: async (req, res) => {
    const user = req.body;
    let errors = [];
    if (errors.length > 0) {
      res.send({ errors });
    } else {
      const newUser = new User(user);
      newUser.save().then((user) => {
        res.send(`${user} saved in databse`);
      });
    }
  },

  singlePage: async (req, res) => {
    User.findById(req.params.id, function (err, user) {
      if (err) {
        console.log(err);
      } else {
        res.send("User single Page");
      }
    });
  },

  singlePage_Api: async (req, res) => {
    User.findById(req.params.id, function (err, user) {
      if (err) {
        console.log(err);
      } else {
        res.send(user);
      }
    });
  },

  update: async (req, res) => {
    res.send("Edit function here");
  },

  update_Api: async (req, res) => {
    res.send("Edit function here");
  },

  userAccounts: async (req, res) => {
    if (req.user) {
      res.render("user/user-accounts", {
        accounts: req.user.accounts,
        layout: false,
      });
    } else {
      res.send("You are not logged in !");
    }
  },

  savePreferences: async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { key, value } = req.body;
      if (!key) {
        return res.status(400).json({ error: "Key is required" });
      }

      const update = {};
      update[`preferences.${key}`] = value;

      await User.findByIdAndUpdate(req.user._id, { $set: update });

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server Error" });
    }
  },
};
