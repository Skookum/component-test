var express = require('express');
var path = require('path');

// Require our modules

var middleware = require('./lib/middleware');
var flash = require('./lib/flash');
var mongoose = require('./lib/mongoose');

// Require our components

var users = require('./components/users');
var dashboard = require('./components/dashboard');
var notFound = require('./components/notFound');

// Expose the app

module.exports = createApp;

// Decorate express with our components
// Marry the app to its running configuration

function createApp(config) {
  var app = express();
  app.locals.config = config;

  mongoose(app, config);
  flash(app);
  middleware(app, config);
  users(app, config);
  dashboard(app);
  notFound(app);

  return app;
}

// Start listening if the app has been started directly

if (module === require.main) {
  var config = process.env;
  var app = createApp(config);
  app.listen(config.http_port);
  console.log("Listening on", config.http_port);
}