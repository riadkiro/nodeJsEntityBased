const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
  // 🔗 Liens principaux
  entityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', required: true },
  spaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Space' }],
  folders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Folder' }],

  // 📄 Champs standards activables
  title: String,
  slug: String,
  content: String,
  description: String,
  image: String,
  icon: String,
  color: String,
  link: String,
  attachement: String,
  gallery: [String],
  medias: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  }],
  date: Date,
  end_date: Date,
  status: {
    type: String,
    default: 'draft'
  },
  published: { type: Boolean, default: false },
  order: { type: Number, default: 0 },

  // 📌 Denormalized title (pre-resolved from entity.referenceTitleTokens)
  computedTitle: String,

  // 🏷️ Tags & catégories (optionnelles, relation vers d'autres records)
  classificationValues: [{
    classificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classification' },
    optionId: mongoose.Schema.Types.ObjectId,
    label: String,   // Denormalized from classification option
    color: String    // Denormalized from classification option
  }],
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Record' }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Record' },

  // 🧩 Champs dynamiques (valeurs référencées à des FieldTemplate)
  customFields: [{
    field_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FieldTemplate' },
    value: mongoose.Schema.Types.Mixed
  }],

  // 🔗 Relations (stored separately from customFields because relation keys are UUIDs, not ObjectIds)
  relations: [{
    relationKey: { type: String, required: true },  // UUID key from entity.relations[].key
    value: mongoose.Schema.Types.Mixed               // ObjectId or [ObjectId] of related record(s)
  }],

  // 📊 Denormalized relation display data (for list view columns)
  _denorm: {
    relations: [{
      relationKey: String,
      records: [{
        _id: { type: mongoose.Schema.Types.ObjectId },
        title: String,
        entitySlug: String
      }]
    }]
  },

  // 📎 Attachements (fichiers joints)
  attachments: [{
    filename: { type: String, required: true },       // Nom stocké sur disque
    originalName: { type: String, required: true },   // Nom original du fichier
    mimeType: String,                                  // e.g. application/pdf, image/jpeg
    size: Number,                                      // Taille en bytes
    category: {                                        // Catégorie auto-détectée
      type: String,
      enum: ['image', 'pdf', 'word', 'excel', 'video', 'audio', 'other'],
      default: 'other'
    },
    folder: { type: String, default: '' },             // Dossier parent ('' = racine)
    isGenerated: { type: Boolean, default: false },   // Généré par SmartDoc
    generatedFrom: String,                             // ID du template de document
    generatedFromName: String,                         // Nom du template
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],

  // 🔧 Line Defaults (pre-encoded values for Dynamic Table columns)
  // When this record is selected as a catalog item in a TD,
  // these defaults auto-populate the line values
  lineDefaults: [{
    schemaId: { type: mongoose.Schema.Types.ObjectId, ref: 'LineSchema' },
    // Default values per column key: { moment: 'apres_repas', frequence: '3x_jour' }
    defaults: { type: mongoose.Schema.Types.Mixed, default: {} },
    // Available options per select/multiselect column key: { moment: ['avant_repas', 'apres_repas'] }
    // Empty = all options available
    availableOptions: { type: mongoose.Schema.Types.Mixed, default: {} },
    // Column keys that are N/A for this record: ['dosage']
    excludedColumns: { type: [String], default: [] }
  }],

  // 👤 Suivi
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Performance indexes for denormalization
RecordSchema.index({ entityId: 1, createdAt: -1 });      // List queries
RecordSchema.index({ 'relations.value': 1 });             // syncDependents: find records referencing a given record
RecordSchema.index({ entityId: 1, computedTitle: 1 });    // Search/sort by computed title

module.exports = mongoose.model('Record', RecordSchema);
