const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String },
  avatar: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: {
    type: String,
  },
  accounts: [
    {
      account_number: { type: String },
      name: { type: String },
    },
  ],
  preferences: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  sidebarPreferences: {
    expandedIds: { type: [String], default: [] }
  },

  created_on: {
    type: Date,
    default: Date.now,
  },
});

// Avant de sauvegarder l'utilisateur, hacher son mot de passe avec bcrypt
UserSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) {
    return next();
  }

  bcrypt.genSalt(10, function (err, salt) {
    if (err) {
      return next(err);
    }

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) {
        return next(err);
      }

      user.password = hash;
      next();
    });
  });
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
