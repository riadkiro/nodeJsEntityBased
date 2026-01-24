const session = require("express-session");
const express = require("express");
const passport = require("passport");

//Express configuration for passport
module.exports = function (app) {
  // Express session
  app.use(
    session({
      secret: "12hhGYIUJI87!!7",
      resave: true,
      saveUninitialized: true,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  // Express body parser, it allows you to parse req.body,
  app.use(express.urlencoded({ extended: true }));

  // Global variables
  //Ces variables seront accéssibles partout sur le site
  app.use(function (req, res, next) {
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.user = req.user || null;
    next();
  });
};
