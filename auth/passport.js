const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const passport = require("passport");

module.exports = function () {
  // ── Local Strategy ──────────────────────────────────────────
  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
          return done(null, false, { message: "Cet email n'est pas enregistré" });
        }

        if (user.status === 'suspended') {
          return done(null, false, { message: "Votre compte est suspendu. Contactez l'administrateur." });
        }

        if (user.status === 'inactive') {
          return done(null, false, { message: "Votre compte est désactivé." });
        }

        if (!user.password) {
          return done(null, false, { message: "Ce compte utilise Google. Connectez-vous avec Google." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          // Update last login
          user.lastLogin = new Date();
          user.loginCount = (user.loginCount || 0) + 1;
          await user.save();
          return done(null, user);
        } else {
          return done(null, false, { message: "Mot de passe incorrect" });
        }
      } catch (err) {
        return done(err);
      }
    })
  );

  // ── Google OAuth 2.0 Strategy ──────────────────────────────
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID') {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user already exists with this Google ID
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
              // User exists, update last login
              user.lastLogin = new Date();
              user.loginCount = (user.loginCount || 0) + 1;
              if (profile.photos?.[0]?.value) user.avatar = profile.photos[0].value;
              await user.save();
              return done(null, user);
            }

            // Check if email already exists (local account)
            const email = profile.emails?.[0]?.value;
            if (email) {
              user = await User.findOne({ email });
              if (user) {
                // Link Google account to existing local account
                user.googleId = profile.id;
                user.authProvider = 'google';
                user.emailVerified = true;
                user.lastLogin = new Date();
                user.loginCount = (user.loginCount || 0) + 1;
                if (profile.photos?.[0]?.value && !user.avatar) user.avatar = profile.photos[0].value;
                await user.save();
                return done(null, user);
              }
            }

            // Create new user from Google profile
            const newUser = new User({
              googleId: profile.id,
              email: email,
              name: profile.displayName,
              avatar: profile.photos?.[0]?.value || null,
              authProvider: 'google',
              emailVerified: true,
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
            return done(null, newUser);
          } catch (err) {
            return done(err);
          }
        }
      )
    );
    console.log('[Passport] Google OAuth strategy registered');
  } else {
    console.log('[Passport] Google OAuth not configured (set GOOGLE_CLIENT_ID in .env)');
  }

  // ── Serialize / Deserialize ────────────────────────────────
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async function (id, done) {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
