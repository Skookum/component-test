var should = require('should');

var config = {};
var UserModel = require('../userModel')(config);

describe('User model', function() {
  describe('authenticate()', function() {
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