var path = require('path');

module.exports = function(app, config) {

  // model

  var UserModel = require('./userModel')(config);

  // namespace

  app.user = {
    loggedIn: isLoggedIn,
    model: UserModel
  };

  // routes

  app.get   ('/', signIn);
  app.get   ('/signup', signUp);
  app.post  ('/signup', createUser);
  app.get   ('/oauth/github', githubOAuth);
  app.post  ('/signin', checkSignin);
  app.all   ('/signout', destroySession, redirectHome);

  // controller actions

  function signIn(req, res) {
    if (req.session.user) {
      return res.redirect('/dashboard');
    }
    return res.render(path.join(__dirname, 'signin'));
  }

  function signUp(req, res) {
    return res.render(path.join(__dirname, 'signup'));
  }

  function createUser(req, res, next) {
    UserModel.create(req.body, onCreate);

    function onCreate(err, newUser) {
      console.log('err:', err);
      if (err) req.flash('Sorry, we were unable to create that account.');
      else req.session.user = newUser;
      return res.redirect('/');
    }
  }

  function githubOAuth(req, res, next) {
    console.log('oauth returned from github');
    UserModel.authGitHub(req.param('code'), onAuth);

    function onAuth(err, user) {
      if (err) return next(err);
      req.session.user = user;
      return res.redirect('/');
    }
  }

  function checkSignin(req, res) {
    var creds = {
      email: req.body.email,
      password: req.body.password
    };
    UserModel.authEmail(creds, onAuth);

    function onAuth(err, user) {
      if (user) req.session.user = user;
      else req.flash('Sorry, that username or password was not found.');
      return res.redirect('/');
    }
  }

  function destroySession(req, res, next) {
    req.session.regenerate(next);
  }

  function redirectHome(req, res, next) {
    req.flash("You have been signed out.");
    return res.redirect('/');
  }

  function isLoggedIn(req, res, next) {
    if (req.session.user) {
      return next();
    }
    req.session.redirect = req.url;
    req.flash('Please log in first.');
    return res.redirect('/');
  }
};