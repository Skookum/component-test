var mongoose = require('mongoose');
var GitHub = require('github');
var OAuth2 = require('oauth').OAuth2;
var bcrypt = require('bcrypt');

// Constants

var MIN_PASSWORD_LENGTH = 8;

// Exports

module.exports = function(config) {

  var oauth = new OAuth2(config.github_client, config.github_secret, "https://github.com/", "login/oauth/authorize", "login/oauth/access_token");
  var github = new GitHub({ version: '3.0.0' });

  var schema = mongoose.Schema({
    email:        { type: String },
    password:     { type: String, set: encrypt },
    githubLogin:  { type: String },
    name:         { type: String }
  });

  schema.statics.create = create;
  schema.statics.authEmail = authEmail;
  schema.statics.authGitHub = authGitHub;

  var User = mongoose.model('User', schema);
  return User;

  // Setters

  function encrypt(plain) {
    var salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(plain, salt);
  }

  // Statics

  function create(props, done) {
    var filter;

    // Standard email + password account
    if (props.email && props.password) {
      if (props.password.length < MIN_PASSWORD_LENGTH) return done(new Error('Password must be at least ' + MIN_PASSWORD_LENGTH + ' characters'));
      filter = { email: props.email };
    }
    // Account linked to github
    else if (props.githubLogin) filter = { githubLogin: props.githubLogin };
    // Insufficient account data
    else return done(new Error('Either email and password, or github login, is required'));
    // See if this account already exists
    User.findOne(filter, onMatch);

    function onMatch(err, match) {
      if (!err && match) return done(new Error('User already exists'));
      var newUser = new User(props);
      newUser.save(done);
    }
  }

  function authEmail(creds, done) {
    if (!(creds.email && creds.password)) {
      return done(new Error('Email and password required'));
    }
    User.findOne({ email: creds.email }, onMatch);

    function onMatch(err, match) {
      if (err) return done(new Error("Database error"));
      var encrypted = encrypt(creds.password);
      var passMatch = match && match.password && bcrypt.compareSync(creds.password, match.password);
      if (match && passMatch) return done(undefined, match);
      return done(new Error("Username or password not found"));
    }
  }

  function authGitHub(code, done) {
    oauth.getOAuthAccessToken(code, {}, onToken);

    function onToken(err, token) {
      if (err) return done(err);
      github.authenticate({
        type: 'oauth',
        token: token
      });
      var user = {};
      github.user.get({}, onInfo);
    }

    function onInfo(err, info) {
      User.findOne({ githubLogin: info.login }, function(err, match) {
        if (err) return done(new Error('Database error'));
        // User already exists in the db:
        // TODO: update from github to follow changes in name etc
        if (match) return done(undefined, match);
        // User doesn't exist yet and should be saved to the db:
        return User.create({
          email: info.email,
          name: info.name || info.login,
          githubLogin: info.login
        }, onCreate);
      });
    }

    function onCreate(err, newUser) {
      if (err || !newUser) return done(new Error('Database error'));
      return done(undefined, newUser);
    }
  }

};
