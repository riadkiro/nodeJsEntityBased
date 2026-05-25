const passport = require("passport");
const User = require("../models/user.model");
const Account = require("../models/account.model");
const crypto = require("crypto");
const mailer = require("../services/mailer");

const PASSWORD_RESET_TTL_MINUTES = 60;
const PASSWORD_RESET_TTL_MS = PASSWORD_RESET_TTL_MINUTES * 60 * 1000;
const PASSWORD_RESET_SENT_MESSAGE = "Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé.";

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(String(token || "")).digest("hex");
}

function getAppUrl(req) {
  const configuredUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
  return configuredUrl.replace(/\/+$/, "");
}

module.exports = {
  // ── Login Form ────────────────────────────────────────────
  loginForm: async (req, res) => {
    const error = req.query.error || null;
    const success = req.query.success || null;
    res.render("auth/auth-login", { layout: false, error_msg: error, success_msg: success, error: null });
  },

  // ── Forgot Password Form ──────────────────────────────────
  forgotPasswordForm: async (req, res) => {
    res.render("auth/auth-forgot-password", {
      layout: false,
      error_msg: null,
      success_msg: null,
      email: "",
    });
  },

  // ── Forgot Password (POST) ────────────────────────────────
  forgotPassword: async (req, res) => {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.render("auth/auth-forgot-password", {
        layout: false,
        error_msg: "L'email est requis",
        success_msg: null,
        email: "",
      });
    }

    try {
      const user = await User.findOne({ email });

      if (user && !['inactive', 'suspended'].includes(user.status)) {
        const rawToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = hashResetToken(rawToken);
        user.resetPasswordExpires = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${getAppUrl(req)}/auth/reset-password/${rawToken}`;
        try {
          await mailer.sendPasswordReset({
            to: user.email,
            name: user.name || user.email,
            resetUrl,
            expiresInMinutes: PASSWORD_RESET_TTL_MINUTES,
          });
        } catch (mailError) {
          console.error("[Auth] Password reset email error:", mailError.message);
        }
      }

      return res.render("auth/auth-forgot-password", {
        layout: false,
        error_msg: null,
        success_msg: PASSWORD_RESET_SENT_MESSAGE,
        email: "",
      });
    } catch (error) {
      console.error("[Auth] Forgot password error:", error);
      return res.render("auth/auth-forgot-password", {
        layout: false,
        error_msg: "Erreur serveur. Veuillez réessayer.",
        success_msg: null,
        email,
      });
    }
  },

  // ── Reset Password Form ───────────────────────────────────
  resetPasswordForm: async (req, res) => {
    const token = String(req.params.token || "");

    try {
      const user = await User.findOne({
        resetPasswordToken: hashResetToken(token),
        resetPasswordExpires: { $gt: new Date() },
      }).select("email");

      if (!user) {
        return res.render("auth/auth-reset-password", {
          layout: false,
          error_msg: "Ce lien de réinitialisation est invalide ou expiré.",
          success_msg: null,
          token: "",
          email: "",
          invalidToken: true,
        });
      }

      return res.render("auth/auth-reset-password", {
        layout: false,
        error_msg: null,
        success_msg: null,
        token,
        email: user.email,
        invalidToken: false,
      });
    } catch (error) {
      console.error("[Auth] Reset password form error:", error);
      return res.render("auth/auth-reset-password", {
        layout: false,
        error_msg: "Erreur serveur. Veuillez réessayer.",
        success_msg: null,
        token: "",
        email: "",
        invalidToken: true,
      });
    }
  },

  // ── Reset Password (POST) ─────────────────────────────────
  resetPassword: async (req, res) => {
    const token = String(req.params.token || "");
    const { password, confirmPassword } = req.body;

    const renderResetError = (message, invalidToken = false) => res.render("auth/auth-reset-password", {
      layout: false,
      error_msg: message,
      success_msg: null,
      token: invalidToken ? "" : token,
      email: "",
      invalidToken,
    });

    if (!password || password.length < 6) {
      return renderResetError("Le mot de passe doit contenir au moins 6 caractères");
    }

    if (password !== confirmPassword) {
      return renderResetError("Les mots de passe ne correspondent pas");
    }

    try {
      const user = await User.findOne({
        resetPasswordToken: hashResetToken(token),
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        return renderResetError("Ce lien de réinitialisation est invalide ou expiré.", true);
      }

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      if (!user.authProvider) user.authProvider = 'local';
      await user.save();

      const success = encodeURIComponent("Votre mot de passe a été mis à jour. Vous pouvez vous connecter.");
      return res.redirect(`/auth/login?success=${success}`);
    } catch (error) {
      console.error("[Auth] Reset password error:", error);
      return renderResetError("Erreur serveur. Veuillez réessayer.");
    }
  },

  // ── Register Form ────────────────────────────────────────
  registerForm: async (req, res) => {
    const { invite, account } = req.query;
    let inviteEmail = '';
    let inviteInfo = null;

    // If we have an invite token, look up the email and account info
    if (invite) {
      try {
        const acc = await Account.findOne({
          'invitations.token': invite,
          'invitations.status': 'pending',
        }).lean();
        if (acc) {
          const inv = acc.invitations.find(i => i.token === invite && i.status === 'pending');
          if (inv && (!inv.expiresAt || new Date() < new Date(inv.expiresAt))) {
            inviteEmail = inv.email;
            inviteInfo = { accountName: acc.name, role: inv.role, accountIcon: acc.icon };
          }
        }
      } catch (e) {
        console.error('[Register] Invite lookup error:', e.message);
      }
    }

    res.render("auth/auth-register", {
      layout: false, error_msg: null, error: null,
      inviteToken: invite || '', accountNumber: account || '',
      inviteEmail, inviteInfo,
    });
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

      // Auto-accept invitation if invite token is present
      const inviteToken = req.body.inviteToken;
      let acceptedInviteAccountNumber = null;
      let acceptedInviteRole = null;
      if (inviteToken) {
        try {
          const invAcc = await Account.findOne({
            'invitations.token': inviteToken,
            'invitations.status': 'pending',
          });
          if (invAcc) {
            const inv = invAcc.invitations.find(i => i.token === inviteToken && i.status === 'pending');
            if (inv && (!inv.expiresAt || new Date() < new Date(inv.expiresAt))) {
              // Add user to the inviting account
              invAcc.users.push({
                userId: newUser._id.toString(),
                email: newUser.email,
                role: inv.role,
                status: 'active',
                invitedBy: inv.invitedBy,
                joinedAt: new Date(),
              });
              inv.status = 'accepted';
              await invAcc.save();

              // Add the inviting account to user's accounts
              newUser.accounts.push({
                account_number: invAcc.account_number,
                name: invAcc.name,
                icon: invAcc.icon || 'solar:home-2-bold-duotone',
                role: inv.role,
                joinedAt: new Date(),
              });
              await newUser.save();
              acceptedInviteAccountNumber = invAcc.account_number;
              acceptedInviteRole = inv.role;
              console.log(`[Register] Auto-accepted invitation for ${newUser.email} → account ${invAcc.account_number}`);
            }
          }
        } catch (invErr) {
          console.error('[Register] Auto-accept invite error:', invErr.message);
        }
      }

      // Auto-login after registration
      req.login(newUser, (err) => {
        if (err) {
          console.error('[Register] Auto-login error:', err);
          return res.redirect("/auth/login?error=Registration successful. Please login.");
        }
        if (acceptedInviteAccountNumber && acceptedInviteRole === 'guest') {
          return res.redirect(`/account/${acceptedInviteAccountNumber}/shared-with-you`);
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
