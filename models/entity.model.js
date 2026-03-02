const mongoose = require("mongoose");

const EntitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    nameSingular: String,   // ex: "un Patient", "une Consultation"
    namePlural: String,     // ex: "Patients", "Documents Médicaux"
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
    // Relations vers d'autres entités
    relations: [{
      key: { type: String, required: true },          // uuid stable
      targetEntity: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', required: true },
      label: String,                                    // "Patient", "Médecin"
      inverseLabel: String,                             // "Consultations" (vu depuis l'entité cible)
      cardinality: {
        type: String,
        enum: ['one-to-one', 'one-to-many', 'many-to-many'],
        default: 'one-to-many'
      },
      inputMode: {
        type: String,
        enum: ['select', 'autocomplete', 'modal-picker'],
        default: 'autocomplete'
      },
      storage: {
        type: String,
        enum: ['on-source', 'on-target', 'join'],
        default: 'on-source'
      },
      searchFields: [String],                           // fieldIds to search on
      displayFields: [String],                          // fieldIds to show in dropdown
      bidirectional: { type: Boolean, default: false },
      required: { type: Boolean, default: false }
    }],
    // Legacy: flat field layout (deprecated, kept for migration)
    layout: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    // Form Builder layout (versioned)
    formLayout: {
      type: mongoose.Schema.Types.Mixed,
      default: { version: 1, rows: [] }
    },
    // Form Builder status (draft/published)
    formLayoutStatus: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft'
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
        defaultValue: mongoose.Schema.Types.Mixed, // Valeur par défaut
        showOnQuickForm: Boolean     // Afficher dans le formulaire rapide
      }, { _id: false }),
      default: new Map()
    },
    // 🎯 Record Header Configuration (hero identity bar)
    headerConfig: {
      type: new mongoose.Schema({
        // Icon/Avatar
        showIcon: { type: Boolean, default: true },
        avatarSource: {
          type: { type: String, enum: ['record-image', 'relation-image', 'entity-icon', 'field'], default: 'entity-icon' },
          relationKey: String,
          fieldId: String
        },
        // Title
        showTitle: { type: Boolean, default: true },
        titleSource: {
          type: { type: String, enum: ['entity', 'relation'], default: 'entity' },
          relationKey: String
        },
        // Classifications
        showClassifications: { type: Boolean, default: true },
        shownClassifications: [String],
        // Attachments quick icon
        showAttachments: { type: Boolean, default: true },
        // Indirect relation icons to show (keys). Empty = none shown
        shownRelations: [String],
        // Fields to display in hero bar (icon + truncated value)
        heroFields: [{
          fieldId: String,
          entitySource: { type: String, default: 'self' }, // 'self' or relation key
          maxChars: { type: Number, default: 20 }
        }],
        // Legacy
        metaFields: [{
          fieldId: String,
          type: { type: String, enum: ['field', 'relation', 'computed'], default: 'field' },
          display: { type: String, enum: ['badge', 'text', 'icon'], default: 'text' }
        }],
        subtitleRelation: {
          relationKey: String,
          displayFields: [String]
        },
        showDuration: { type: Boolean, default: false }
      }, { _id: false }),
      default: {}
    },
    // 📎 Attachements
    enableAttachments: {
      type: Boolean,
      default: true
    },
    // 📊 DataGrid schemas attached to this entity
    gridSchemas: [{
      schemaId: { type: mongoose.Schema.Types.ObjectId, ref: 'LineSchema' },
      position: { type: String, enum: ['main', 'sidebar', 'tab', 'panel'], default: 'main' },
      order: { type: Number, default: 0 },
      label: String   // Override of schema name for this entity
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Entity", EntitySchema);
