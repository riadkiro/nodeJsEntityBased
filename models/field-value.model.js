const FieldValueSchema = new mongoose.Schema({
  entity: { type: mongoose.Schema.Types.ObjectId, ref: "Entity", required: true },
  field: { type: mongoose.Schema.Types.ObjectId, ref: "FieldTemplate", required: true },
  value: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.model("FieldValue", FieldValueSchema);
