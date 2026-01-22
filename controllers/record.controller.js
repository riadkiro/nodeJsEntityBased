const Entity = require("../models/entity.model");
const Record = require("../models/record.model");
const FieldTemplate = require("../models/field-template.model");
const tenantCollection = require("../middleware/tenant").tenantCollection;

module.exports = {
  list: async (req, res) => {
    try {
      // Pre-register models needed for populate
      await tenantCollection(req, "FieldTemplate");
      const EntityModel = await tenantCollection(req, "Entity");
      const RecordModel = await tenantCollection(req, "Record");

      const entity = await EntityModel.findOne({ slug: req.params.entityName }).populate('customFields');
      if (!entity) return res.status(404).render("errors/404", {
        message: "Entity not found",
        account_number: req.account_number,
        layout: "layout-app"
      });

      const records = await RecordModel.find({ entityId: entity._id }).populate('customFields.field_id');

      res.render("record/record-list", {
        entity,
        records,
        account_number: req.account_number,
        layout: "layout-app"
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  },

  addForm: async (req, res) => {
    try {
      await tenantCollection(req, "FieldTemplate");
      const EntityModel = await tenantCollection(req, "Entity");

      const entity = await EntityModel.findOne({ slug: req.params.entityName }).populate('customFields');
      if (!entity) return res.status(404).render("errors/404", {
        message: "Entity not found",
        account_number: req.account_number,
        layout: "layout-app"
      });

      res.render("record/record-add", {
        entity,
        account_number: req.account_number,
        layout: "layout-app"
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  },

  save: async (req, res) => {
    try {
      const EntityModel = await tenantCollection(req, "Entity");
      const RecordModel = await tenantCollection(req, "Record");
      const entity = await EntityModel.findOne({ slug: req.params.entityName });
      if (!entity) return res.status(404).render("errors/404", {
        message: "Entity not found",
        account_number: req.account_number,
        layout: "layout-app"
      });

      const { standard, custom } = req.body;

      const customFieldsArray = [];
      if (custom) {
        for (const [fieldId, value] of Object.entries(custom)) {
          customFieldsArray.push({
            field_id: fieldId,
            value: value
          });
        }
      }

      const newRecord = new RecordModel({
        entityId: entity._id,
        ...standard,
        customFields: customFieldsArray,
        createdBy: req.user._id
      });

      await newRecord.save();
      res.redirect(`/account/${req.account_number}/record/${entity.slug}/list`);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  },

  editForm: async (req, res) => {
    try {
      await tenantCollection(req, "FieldTemplate");
      const EntityModel = await tenantCollection(req, "Entity");
      const RecordModel = await tenantCollection(req, "Record");

      const entity = await EntityModel.findOne({ slug: req.params.entityName }).populate('customFields');
      if (!entity) return res.status(404).render("errors/404", {
        message: "Entity not found",
        account_number: req.account_number,
        layout: "layout-app"
      });

      const record = await RecordModel.findById(req.params.id);
      if (!record) return res.status(404).render("errors/404", {
        message: "Record not found",
        account_number: req.account_number,
        layout: "layout-app"
      });

      res.render("record/record-edit", {
        entity,
        record,
        account_number: req.account_number,
        layout: "layout-app"
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  },

  update: async (req, res) => {
    try {
      const EntityModel = await tenantCollection(req, "Entity");
      const RecordModel = await tenantCollection(req, "Record");
      const entity = await EntityModel.findOne({ slug: req.params.entityName });
      if (!entity) return res.status(404).render("errors/404", {
        message: "Entity not found",
        account_number: req.account_number,
        layout: "layout-app"
      });

      const { standard, custom } = req.body;

      const customFieldsArray = [];
      if (custom) {
        for (const [fieldId, value] of Object.entries(custom)) {
          customFieldsArray.push({
            field_id: fieldId,
            value: value
          });
        }
      }

      await RecordModel.findByIdAndUpdate(req.params.id, {
        ...standard,
        customFields: customFieldsArray,
        updatedBy: req.user._id
      });

      res.redirect(`/account/${req.account_number}/record/${entity.slug}/list`);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  },

  delete: async (req, res) => {
    try {
      const RecordModel = await tenantCollection(req, "Record");
      await RecordModel.findByIdAndRemove(req.params.id);
      res.redirect(`/account/${req.account_number}/record/${req.params.entityName}/list`);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  }
};
