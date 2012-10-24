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
        err.message.should.equal('Email and pass required');
        return done();
      }
    });
    it('should reject a request without a password', function(done) {
      UserModel.authEmail({ email: 'test@dummy.com' }, onAuth);
      function onAuth(err, user) {
        should.exist(err);
        should.not.exist(user);
        err.message.should.equal('Email and pass required');
        return done();
      }
    });
    it('should reject a request with the wrong password', function(done) {
      UserModel.authEmail({ email: 'test@dummy.com', password: 'wrong' }, onAuth);
      function onAuth(err, user) {
        should.exist(err);
        should.not.exist(user);
        err.message.should.equal('Invalid password');
        return done();
      }
    });
    it('should reject a request with a non-registered email', function(done) {
      UserModel.authEmail({ email: 'doesnt@exist.com', password: 'bacon' }, onAuth);
      function onAuth(err, user) {
        should.exist(err);
        should.not.exist(user);
        err.message.should.equal('No such user');
        return done();
      }
    });
    it('should accept a valid email/password', function(done) {
      UserModel.authEmail({ email: 'test@dummy.com', password: 'bacon' }, onAuth);
      function onAuth(err, user) {
        should.not.exist(err);
        should.exist(user);
        user.should.eql({ email: 'test@dummy.com' });
        return done();
      }
    });
  });
});