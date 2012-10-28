var path = require('path');

module.exports = function(app) {

  app.get('/dashboard', app.users.loggedIn, function(req, res) {
    return res.render(path.join(__dirname, 'dashboard'), {
      user: req.session.user
    });
  });
};