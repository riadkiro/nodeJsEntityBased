const passport = require("passport");

module.exports = {
  loginForm: async (req, res) => {
    res.render("auth/auth-login", { layout: false });
  },
  logout: async (req, res) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/auth/login");
    });
  },
  authenticate: async (req, res, done) => {
    passport.authenticate("local", {
      successRedirect: "/user/accounts",
      failureRedirect: "/failure",
    })(req, res, done);
  },
};
