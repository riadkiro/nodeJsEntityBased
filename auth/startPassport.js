module.exports = function (app) {
  //Passport express config
  require("./passport-express-config")(app);
  //passport strategy
  require("./passport")();
};
