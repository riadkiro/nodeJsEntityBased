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
    order: { type: Number, default: 0 },

    // Champs standards activés
    enabledStandardFields: [String], // ex: ['title', 'slug', 'date']

    // Token-based reference title format
    referenceTitleTokens: {
      type: [
        {
          t: { type: String, enum: ['field', 'text'], required: true },
          id: String,  // field id (for field tokens)
          v: String    // text value (for text tokens)
        }
      ],
      default: [{ t: 'field', id: 'title' }]
    },

    // Hierarchy
    spaces: [{ type: mongoose.Schema.Types.ObjectId, ref: "Space" }],
    folders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Folder" }],

    // Champs personnalisés
    customFields: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FieldTemplate",
      },
    ],
    // Classification principale (utilisée pour le Kanban / Statuts)
    statusClassification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classification",
    },
    // Autres classifications activées pour cette entité
    classifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Classification",
      },
    ],
    // Configuration visuelle des champs (lignes/colonnes)
    layout: {
      type: mongoose.Schema.Types.Mixed,
      default: [], // ex: [ { id: "row1", columns: [ { fields: ["id1"] }, { fields: ["id2"] } ] } ]
    },
    // Overrides par entité pour les FieldTemplates partagés
    // Clé: FieldTemplate._id (string), Valeur: { label, required, width, order, visible, ... }
    fieldOverrides: {
      type: Map,
      of: new mongoose.Schema({
        label: String,              // Override du label pour cette entité
        required: Boolean,          // Champ obligatoire pour cette entité
        width: { type: String, enum: ['full', 'half', 'third', 'quarter'] },
        order: Number,              // Ordre d'affichage
        visible: { type: Boolean, default: true },
        placeholder: String,        // Placeholder spécifique
        helpText: String,           // Texte d'aide contextuel
        defaultValue: mongoose.Schema.Types.Mixed // Valeur par défaut
      }, { _id: false }),
      default: new Map()
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Entity", EntitySchema);
