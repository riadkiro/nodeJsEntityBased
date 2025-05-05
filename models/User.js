const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
  },
  accounts: [
    {
      account_number: { type: String },
      name: { type: String },
    },
  ],

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
