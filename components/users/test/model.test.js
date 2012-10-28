var should = require('should');
var mockery = require('mockery');
var path = require('path');

// Reset state from other tests

var utils = require('../../../shared/test/test.utils');
utils.clearRequireCache();

// Replace oauth and github with mocks

var githubInfo = {
  email: 'mocked@email.com',
  name: 'Mocked Name',
  login: 'mockedlogin'
};
function mockedOAuth2() {}
mockedOAuth2.prototype.getOAuthAccessToken = function(code, opts, done) {
  return done(undefined, 'faketoken');
};
function mockedGitHub() {}
mockedGitHub.prototype.authenticate = function(opts) {};
mockedGitHub.prototype.user = {};
mockedGitHub.prototype.user.get = function(opts, done) {
  return done(undefined, githubInfo);
};
mockery.enable();
mockery.warnOnUnregistered(false);
mockery.registerMock('oauth', { OAuth2: mockedOAuth2 });
mockery.registerMock('github', mockedGitHub);

// Load the app

var config = process.env;
var app = require('../../../app')(config);
var UserModel = app.users.model;

// Test

describe('User model', function() {
  describe('Assumptions:', function() {
    it('should have an empty users collection', function(done) {
      UserModel.remove(done);
    });
  });
  describe('create()', function() {
    it('should accept an email and password', function(done) {
      UserModel.create({ email: 'test@dummy.com', password: 'baconbits' }, onCreate);
      function onCreate(err, newUser) {
        should.not.exist(err);
        should.exist(newUser);
        newUser.email.should.eql('test@dummy.com');
        return done();
      }
    });
    it('should accept a github login', function(done) {
      UserModel.create({ githubLogin: 'hunterloftis' }, onCreate);
      function onCreate(err, newUser) {
        should.not.exist(err);
        should.exist(newUser);
        newUser.githubLogin.should.eql('hunterloftis');
        return done();
      }
    });
    it('should reject an email and short password', function(done) {
      UserModel.create({ email: 'short@dummy.com', password: 'bacon' }, onCreate);
      function onCreate(err, newUser) {
        should.exist(err);
        err.message.should.eql('Password must be at least 8 characters');
        should.not.exist(newUser);
        return done();
      }
    });
    it('should reject a password without an email', function(done) {
      UserModel.create({ password: 'baconbits' }, onCreate);
      function onCreate(err, newUser) {
        should.exist(err);
        err.message.should.eql('Either email and password, or github login, is required');
        should.not.exist(newUser);
        return done();
      }
    });
    it('should reject a duplicate email/password', function(done) {
      UserModel.create({ email: 'test@dummy.com', password: 'baconbits' }, onCreate);
      function onCreate(err, newUser) {
        should.exist(err);
        err.message.should.eql('User already exists');
        should.not.exist(newUser);
        return done();
      }
    });
    it('should reject a duplicate github login', function(done) {
      UserModel.create({ githubLogin: 'hunterloftis' }, onCreate);
      function onCreate(err, newUser) {
        should.exist(err);
        err.message.should.eql('User already exists');
        should.not.exist(newUser);
        return done();
      }
    });
  });
  describe('authEmail()', function() {
    it('should reject a request without an email', function(done) {
      UserModel.authEmail({ password: 'bacon' }, onAuth);
      function onAuth(err, user) {
        should.exist(err);
        should.not.exist(user);
        err.message.should.equal('Email and password required');
        return done();
      }
    });
    it('should reject a request without a password', function(done) {
      UserModel.authEmail({ email: 'test@dummy.com' }, onAuth);
      function onAuth(err, user) {
        should.exist(err);
        should.not.exist(user);
        err.message.should.equal('Email and password required');
        return done();
      }
    });
    it('should reject a request with the wrong password', function(done) {
      UserModel.authEmail({ email: 'test@dummy.com', password: 'wrong' }, onAuth);
      function onAuth(err, user) {
        should.exist(err);
        should.not.exist(user);
        err.message.should.equal('Username or password not found');
        return done();
      }
    });
    it('should reject a request with a non-registered email', function(done) {
      UserModel.authEmail({ email: 'doesnt@exist.com', password: 'bacon' }, onAuth);
      function onAuth(err, user) {
        should.exist(err);
        should.not.exist(user);
        err.message.should.equal('Username or password not found');
        return done();
      }
    });
    it('should accept a valid email/password', function(done) {
      UserModel.authEmail({ email: 'test@dummy.com', password: 'baconbits' }, onAuth);
      function onAuth(err, user) {
        should.not.exist(err);
        should.exist(user);
        should.exist(user.email);
        should.exist(user.password);
        user.email.should.eql('test@dummy.com');
        return done();
      }
    });
  });
  describe('authGitHub()', function() {
    describe('with a new user', function() {
      it('should start without a user in the db', function(done) {
        UserModel.findOne({ githubLogin: 'mockedlogin' }, onFind);
        function onFind(err, match) {
          should.not.exist(err);
          should.not.exist(match);
          return done();
        }
      });
      it('should get data from github', function(done) {
        UserModel.authGitHub('code', onAuth);
        function onAuth(err, user) {
          should.not.exist(err);
          should.exist(user);
          user.email.should.eql(githubInfo.email);
          user.name.should.eql(githubInfo.name);
          user.githubLogin.should.eql(githubInfo.login);
          return done();
        }
      });
      it('should create a new user in the db', function(done) {
        UserModel.findOne({ githubLogin: 'mockedlogin' }, onFind);
        function onFind(err, match) {
          should.not.exist(err);
          should.exist(match);
          match.githubLogin.should.eql(githubInfo.login);
          return done();
        }
      });
    });
    describe('with an existing user', function(done) {
      var savedId, user;
      it('should start with a user in the db', function(done) {
        UserModel.findOne({ githubLogin: 'mockedlogin' }, onFind);
        function onFind(err, match) {
          should.not.exist(err);
          should.exist(match);
          should.exist(match._id);
          match.githubLogin.should.eql(githubInfo.login);
          savedId = match._id;
          return done();
        }
      });
      it('should get data from github', function(done) {
        UserModel.authGitHub('code', onAuth);
        function onAuth(err, authedUser) {
          user = authedUser;
          should.not.exist(err);
          should.exist(user);
          user.email.should.eql(githubInfo.email);
          user.name.should.eql(githubInfo.name);
          user.githubLogin.should.eql(githubInfo.login);
          return done();
        }
      });
      it('should return the previously saved user', function() {
        user._id.should.eql(savedId);
      });
    });
    it('should reject requests without a code', function(done) {
      UserModel.authGitHub(undefined, onAuth);
      function onAuth(err, authedUser) {
        should.exist(err);
        should.not.exist(authedUser);
        err.message.should.eql('Code required for github authentication');
        return done();
      }
    });
  });
});