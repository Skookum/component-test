var express = require('express');
var stylus = require('stylus');
var path = require('path');

var stylesDir = path.join(__dirname, '../../shared');
var publicDir = path.join(__dirname, '../../shared/public');

module.exports = function(app, config) {

  // Stylus
  function compile(str, path) {
    return stylus(str)
      .set('compress', config.stylus_compress)
      .set('filename', path);
  }
  var styles = stylus.middleware({
    src: stylesDir,
    dest: publicDir,
    debug: config.stylus_debug,
    compile: compile,
    force: config.stylus_force
  });

  // Static files
  var staticFiles = express['static'](publicDir);

  app.use(styles);             // css
  app.use(staticFiles);        // 'public'

};