var path = require('path');

// Must be the last middleware in the stack
// Responds when nothing else will

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.status(404);
    res.render(path.join(__dirname, '404'));
  });
};