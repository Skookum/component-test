module.exports = {
  startApp: function(port) {
    var config = require('../../config.json');
    config.test = true;
    var app = require('../../server')(config);
    var server = app.listen(port);
    return server;
  }
};
