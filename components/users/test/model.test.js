var should = require('should');

var config = process.env;
var app = require('../../../app')(config);
var UserModel = app.users.model;

describe('Assumptions:', function() {
  it('should have an empty users collection', function(done) {
    app.users.model.remove(done);
  });
});

describe('User model', function() {
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
});