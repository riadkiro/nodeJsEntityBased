const mongoose = require("mongoose");

const EntitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    image: String,
    icon: String,
    color: String,

    // Champs standards activés
    enabledStandardFields: [String], // ex: ['title', 'slug', 'date']

    // Champs personnalisés
    customFields: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FieldTemplate",
      },
    ],
    // Configuration visuelle des champs (lignes/colonnes)
    layout: {
      type: mongoose.Schema.Types.Mixed,
      default: [], // ex: [ { id: "row1", columns: [ { fields: ["id1"] }, { fields: ["id2"] } ] } ]
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Entity", EntitySchema);
