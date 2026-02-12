const passport = require("passport");
const User = require("../models/user.model");
const Account = require("../models/account.model");
const crypto = require("crypto");

module.exports = {
  // ── Login Form ────────────────────────────────────────────
  loginForm: async (req, res) => {
    const error = req.query.error || null;
    res.render("auth/auth-login", { layout: false, error_msg: error, error: null });
  },

  // ── Register Form ────────────────────────────────────────
  registerForm: async (req, res) => {
    res.render("auth/auth-register", { layout: false, error_msg: null, error: null });
  },

  // ── Register (POST) ──────────────────────────────────────
  register: async (req, res) => {
    try {
      const { name, email, password, confirmPassword } = req.body;
      const errors = [];

      if (!name || !name.trim()) errors.push("Le nom est requis");
      if (!email || !email.trim()) errors.push("L'email est requis");
      if (!password || password.length < 6) errors.push("Le mot de passe doit contenir au moins 6 caractères");
      if (password !== confirmPassword) errors.push("Les mots de passe ne correspondent pas");

      if (errors.length > 0) {
        return res.render("auth/auth-register", {
          layout: false,
          error_msg: errors.join(". "),
          error: null,
          name, email
        });
      }

      // Check if email already exists
      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        return res.render("auth/auth-register", {
          layout: false,
          error_msg: "Cet email est déjà utilisé",
          error: null,
          name, email
        });
      }

      // Create user with free plan
      const newUser = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        authProvider: 'local',
        status: 'active',
        role: 'user',
        membership: {
          plan: 'free',
          startDate: new Date(),
          maxAccounts: 1,
          maxUsersPerAccount: 3,
          storageLimit: 500,
        },
        lastLogin: new Date(),
        loginCount: 1,
      });

      await newUser.save();

      // Auto-create first account/workspace
      let account_number;
      let attempts = 0;
      do {
        account_number = (5000 + Math.floor(Math.random() * 5000)).toString();
        const existing = await Account.findOne({ account_number });
        if (!existing) break;
        attempts++;
      } while (attempts < 100);

      const newAccount = new Account({
        name: `${name.trim()}'s Workspace`,
        icon: 'solar:home-2-bold-duotone',
        ownerId: newUser._id,
        users: [{
          userId: newUser._id.toString(),
          email: newUser.email,
          role: 'owner',
          status: 'active',
        }],
        account_number,
        status: 'active',
      });

      await newAccount.save();

      // Add account to user
      newUser.accounts.push({
        account_number,
        name: newAccount.name,
        icon: 'solar:home-2-bold-duotone',
        role: 'owner',
      });
      await newUser.save();

      // Auto-login after registration
      req.login(newUser, (err) => {
        if (err) {
          console.error('[Register] Auto-login error:', err);
          return res.redirect("/auth/login?error=Registration successful. Please login.");
        }
        res.redirect("/user/accounts");
      });
    } catch (error) {
      console.error("[Register] Error:", error);
      res.render("auth/auth-register", {
        layout: false,
        error_msg: "Erreur serveur. Veuillez réessayer.",
        error: null,
      });
    }
  },

  // ── Login (POST) ─────────────────────────────────────────
  authenticate: async (req, res, done) => {
    passport.authenticate("local", {
      successRedirect: "/user/accounts",
      failureRedirect: "/auth/login?error=Email ou mot de passe incorrect",
    })(req, res, done);
  },

  // ── Google OAuth ──────────────────────────────────────────
  googleAuth: (req, res, next) => {
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })(req, res, next);
  },

  googleCallback: (req, res, next) => {
    passport.authenticate("google", {
      successRedirect: "/user/accounts",
      failureRedirect: "/auth/login?error=Google authentication failed",
    })(req, res, next);
  },

  // ── Logout ────────────────────────────────────────────────
  logout: async (req, res) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/auth/login");
    });
  },
};
