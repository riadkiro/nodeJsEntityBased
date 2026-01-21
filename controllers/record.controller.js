const Record = require("../models/record.model");
const tenantCollection = require("../middleware/tenant").tenantCollection;

module.exports = {
  addForm: async (req, res) => {
    res.render("record/record-add");
  },

  delete: async (req, res) => {
    let query = { _id: req.params.id };
    Record.findById(req.params.id, function (err, record) {
      Record.remove(query, function (err) {
        if (err) {
          console.log(err);
        }
        res.send("Deleted");
      });
    });
  },

  delete_Api: async (req, res) => {
    let query = { _id: req.params.id };
    Record.findById(req.params.id, function (err, record) {
      Record.remove(query, function (err) {
        if (err) {
          console.log(err);
        }
        res.send("Deleted");
      });
    });
  },

  editForm: async (req, res) => {
    Record.findById(req.params.id, function (err, record) {
      res.render("record/record-edit", {
        record,
      });
    });
  },

  list: async (req, res) => {
    Record.find({}, function (err, recordAll) {
      if (err) {
        console.log(err);
      } else {
        res.send({
          recordAll,
        });
      }
    });
  },
  list_Api: async (req, res) => {
    Record.find({}, function (err, recordAll) {
      if (err) {
        console.log(err);
      } else {
        res.send({
          recordAll,
        });
      }
    });
  },

  save: async (req, res) => {
    const record = req.body;
    let errors = [];
    if (errors.length > 0) {
      res.render("record/record-add", {
        errors,
      });
    } else {
      const newRecord = new Record(record);
      newRecord.save().then((record) => {
        res.redirect("/record/list");
      });
    }
  },

  save_Api: async (req, res) => {
    const record = req.body;
    let errors = [];
    if (errors.length > 0) {
      res.send({ errors });
    } else {
      const newRecord = new Record(record);
      newRecord.save().then((record) => {
        res.send(`${record} saved in databse`);
      });
    }
  },

  singlePage: async (req, res) => {
    Record.findById(req.params.id, function (err, record) {
      if (err) {
        console.log(err);
      } else {
        res.send("Record single Page");
      }
    });
  },

  singlePage_Api: async (req, res) => {
    Record.findById(req.params.id, function (err, record) {
      if (err) {
        console.log(err);
      } else {
        res.send(record);
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
