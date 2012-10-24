var path = require('path');

module.exports = function(app, config) {

  var UserModel = require('./userModel')(app, config);

  app.user = {
    loggedIn: function(req, res, next) {
      if (req.session.user) {
        return next();
      }
      req.session.redirect = req.url;
      req.flash('Please log in first.');
      return res.redirect('/');
    },
    model: UserModel
  };

  app.get('/', function signIn(req, res) {
    if (req.session.user) {
      return res.redirect('/dashboard');
    }
    return res.render(path.join(__dirname, 'signin'));
  });

  app.get('/oauth/github', function githubOAuth(req, res, next) {
    UserModel.authGitHub(req.param('code'), function(err, user) {
      if (err) return next(err);
      req.session.user = user;
      return res.redirect('/');
    });
  });

  app.post('/signin', function checkSignin(req, res) {
    var creds = {
      email: req.body.email,
      password: req.body.password
    };
    UserModel.authEmail(creds, function(err, user) {
      if (user) {
        req.session.user = user;
        return res.redirect('/dashboard');
      }
      else {
        req.flash('Sorry, that username or password was not found.');
        return res.redirect('/');
      }
    });
  });

  app.all('/signout',
    function destroySession(req, res, next) {
      req.session.regenerate(next);
    },
    function redirect(req, res, next) {
      req.flash("You have been signed out.");
      return res.redirect('/');
    }
  );
};