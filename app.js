var express = require('express');
var path = require('path');
var balance = require('./lib/balance');

// Require our modules

var balance = require('./lib/balance');
var middleware = require('./lib/middleware');
var flash = require('./lib/flash');

// Require our components

var users = require('./components/users');
var dashboard = require('./components/dashboard');

// Expose the app

module.exports = main;

// Decorate express with our components
// Marry the app to its running configuration

function main(config) {
  var app = express();
  app.config = app.locals.config = config;

  flash(app);
  middleware(app, config);
  users(app, config);
  dashboard(app);

  return app;
}

// Start listening if the app has been started directly

if (module === require.main) {
  balance(function() {
    var config = require('./package.json').publicConfig;
    var app = main(config);
    app.listen(config.http_port);
    console.log("Listening on", config.http_port);
  });
}