const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema({
  name: { type: String },
  users: [{ type: String }],
  account_number: { type: String },
  status: {
    type: String,
  },
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }],
  created_on: {
    type: Date,
  },
});

const Account = mongoose.model("Account", AccountSchema);

module.exports = Account;
