var GitHub = require('github');
var OAuth2 = require('oauth').OAuth2;

var clientId = '61c7ecbd017890538042';
var secret = '6c701e76797d323b4f8d2ee7e9c0be17cd2d08a4';
var users = {
  'hunter@hunterloftis.com': 'password',
  'test@dummy.com': 'bacon'
};

module.exports = function(app, config) {
  var oauth = new OAuth2(config.github_client, config.github_secret, "https://github.com/", "login/oauth/authorize", "login/oauth/access_token");
  var github = new GitHub({ version: '3.0.0' });

  return {
    authEmail: function(creds, done) {
      if (!(creds.email && creds.password)) {
        return done(new Error('Email and pass required'));
      }
      var password = users[creds.email];
      if (!password) {
        return done(new Error('No such user'));
      }
      if (password === creds.password) {
        return done(undefined, {
          email: creds.email
        });
      }
      return done(new Error('Invalid password'));
    },
    authGitHub: function(code, done) {
      oauth.getOAuthAccessToken(code, {}, onTokenReceived);
      function onTokenReceived(err, token) {
        if (err) return done(err);
        github.authenticate({
          type: 'oauth',
          token: token
        });
        var user = {};
        github.user.get({}, function onUserGet(err, info) {
          user.name = info.name || info.login;
          user.email = info.email;
          user.github = info;
          github.user.getOrgs({}, function onOrgsGet(err, orgs) {
            user.orgs = orgs;
            return done(undefined, user);
          });
        });
      }
    }
  };
};