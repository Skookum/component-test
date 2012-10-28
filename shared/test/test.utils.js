module.exports = {
  startApp: function(port) {
    var config = process.env;
    var app = require('../../app')(config);
    var server = app.listen(port);
    return app;
  }
};
