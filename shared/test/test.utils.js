module.exports = {
  startApp: function(port) {
    var config = require('../../config.json');
    config.test = true;
    var app = require('../../app')(config);
    var server = app.listen(port);
    return server;
  }
};
