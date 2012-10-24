var path = require('path');

var GitHub = require('github');
var OAuth2 = require('oauth').OAuth2;

var UserModel = require('./userModel');

var clientId = '61c7ecbd017890538042';
var secret = '6c701e76797d323b4f8d2ee7e9c0be17cd2d08a4';

var oauth = new OAuth2(clientId, secret, "https://github.com/", "login/oauth/authorize", "login/oauth/access_token");
var github = new GitHub({ version: '3.0.0' });

module.exports = function(app) {

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
    oauth.getOAuthAccessToken(req.param('code'), {}, onTokenReceived);
    function onTokenReceived(err, token) {
      if (err) return next(err);
      github.authenticate({
        type: 'oauth',
        token: token
      });
      console.log("Logged in with token:", token);
      github.user.get({}, function onUserGet(err, user) {
        console.log("USER:", user);
        req.session.user = {
          email: user.email
        };
        return res.redirect('/');
      });
    }
  });

  app.post('/signin', function(req, res) {
    var creds = {
      email: req.body.email,
      password: req.body.password
    };
    UserModel.authenticate(creds, function(err, user) {
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
    function(req, res, next) {
      req.session.regenerate(next);
    },
    function(req, res, next) {
      req.flash("You have been signed out.");
      return res.redirect('/');
    }
  );
};