const passport = require("passport");
const User = require("../models/user.model");
const Account = require("../models/account.model");
const crypto = require("crypto");
const mailer = require("../services/mailer");
const {
  createAccountUser,
  RegistrationError,
} = require("../services/account-registration.service");

const PASSWORD_RESET_TTL_MINUTES = 60;
const PASSWORD_RESET_TTL_MS = PASSWORD_RESET_TTL_MINUTES * 60 * 1000;
const PASSWORD_RESET_SENT_MESSAGE = "Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé.";
const EMAIL_VERIFICATION_TTL_HOURS = 24;
const EMAIL_VERIFICATION_TTL_MS = EMAIL_VERIFICATION_TTL_HOURS * 60 * 60 * 1000;
const EMAIL_VERIFICATION_SENT_MESSAGE = "Si un compte existe avec cet email, un lien de confirmation vient d'être envoyé.";

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

function buildVerificationUrl(req, rawToken) {
  return `${getAppUrl(req)}/auth/verify-email/${rawToken}`;
}

async function issueVerificationEmail(req, user) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  user.verificationToken = hashResetToken(rawToken);
  user.verificationTokenExpires = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);
  user.emailVerified = false;
  user.status = 'pending';
  await user.save({ validateBeforeSave: false });

  try {
    await mailer.sendEmailVerification({
      to: user.email,
      name: user.name || user.email,
      verifyUrl: buildVerificationUrl(req, rawToken),
      expiresInHours: EMAIL_VERIFICATION_TTL_HOURS,
    });
  } catch (mailError) {
    console.error("[Auth] Email verification send error:", mailError.message);
  }
}

module.exports = {
  // ── Login Form ────────────────────────────────────────────
  loginForm: async (req, res) => {
    const error = req.query.error || null;
    const success = req.query.success || null;
    res.render("auth/auth-login", {
      layout: false,
      error_msg: error,
      success_msg: success,
      error: null,
      unverifiedEmail: req.query.unverified ? normalizeEmail(req.query.email) : "",
    });
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

  // ── Verify Email ──────────────────────────────────────────
  verifyEmail: async (req, res) => {
    const token = String(req.params.token || "");

    try {
      const user = await User.findOne({
        verificationToken: hashResetToken(token),
        verificationTokenExpires: { $gt: new Date() },
      });

      if (!user) {
        const error = encodeURIComponent("Ce lien de confirmation est invalide ou expiré.");
        return res.redirect(`/auth/login?error=${error}`);
      }

      user.emailVerified = true;
      user.status = user.status === 'pending' ? 'active' : user.status;
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save({ validateBeforeSave: false });

      const success = encodeURIComponent("Votre compte est confirmé. Vous pouvez vous connecter.");
      return res.redirect(`/auth/login?success=${success}`);
    } catch (error) {
      console.error("[Auth] Verify email error:", error);
      const message = encodeURIComponent("Erreur serveur. Veuillez réessayer.");
      return res.redirect(`/auth/login?error=${message}`);
    }
  },

  // ── Resend Email Verification ─────────────────────────────
  resendVerification: async (req, res) => {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      const error = encodeURIComponent("L'email est requis");
      return res.redirect(`/auth/login?error=${error}`);
    }

    try {
      const user = await User.findOne({ email });

      if (user && (user.status === 'pending' || user.emailVerified === false)) {
        await issueVerificationEmail(req, user);
      }

      const success = encodeURIComponent(EMAIL_VERIFICATION_SENT_MESSAGE);
      return res.redirect(`/auth/login?success=${success}&unverified=1&email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error("[Auth] Resend verification error:", error);
      const message = encodeURIComponent("Erreur serveur. Veuillez réessayer.");
      return res.redirect(`/auth/login?error=${message}`);
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
      const registration = await createAccountUser({
        req,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        plan: req.body.plan || 'free',
        role: 'user',
        requireEmailVerification: true,
        requirePasswordConfirmation: true,
        inviteToken: req.body.inviteToken,
      });
      const successMessage = encodeURIComponent("Compte cree. Verifiez votre email pour confirmer votre compte avant connexion.");
      return res.redirect(`/auth/login?success=${successMessage}&unverified=1&email=${encodeURIComponent(registration.user.email)}`);

    } catch (error) {
      if (error instanceof RegistrationError) {
        return res.render("auth/auth-register", {
          layout: false,
          error_msg: error.message,
          error: null,
          name: req.body.name,
          email: req.body.email,
        });
      }

      console.error("[Register] Error:", error);
      res.render("auth/auth-register", {
        layout: false,
        error_msg: "Erreur serveur. Veuillez réessayer.",
        error: null,
      });
    }
  },

  // ── Login (POST) ─────────────────────────────────────────
  authenticate: async (req, res, next) => {
    passport.authenticate("local", (err, user, info = {}) => {
      if (err) return next(err);

      if (!user) {
        const message = encodeURIComponent(info.message || "Email ou mot de passe incorrect");
        const unverified = info.code === 'EMAIL_NOT_VERIFIED' && req.body.email
          ? `&unverified=1&email=${encodeURIComponent(normalizeEmail(req.body.email))}`
          : "";
        return res.redirect(`/auth/login?error=${message}${unverified}`);
      }

      req.logIn(user, (loginError) => {
        if (loginError) return next(loginError);
        return res.redirect("/user/accounts");
      });
    })(req, res, next);
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
