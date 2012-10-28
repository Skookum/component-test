var should = require('should');
var path = require('path');
var superagent = require('superagent');

var utils = require('../../../shared/test/test.utils');

var app = utils.startApp(3000);

describe('Assumptions:', function() {
  it('should have an empty users collection', function(done) {
    app.users.model.remove(done);
  });
});

describe('User controller', function() {
  describe('/signup', function() {
    describe('with insufficient data', function() {
      it('should be rejected', function(done) {
        var agent = superagent.agent();
        agent
          .post('http://localhost:3000/signup')
          .send({ email: 'no@password.com' })
          .end(onResponse);

        function onResponse(err, res) {
          res.should.have.status(200);
          res.redirects.should.eql(['http://localhost:3000/']);
          res.text.should.include('Sorry, we were unable to create that account');
          return done();
        }
      });
    });
    describe('with a short password', function() {
      it('should be rejected', function(done) {
        var agent = superagent.agent();
        agent
          .post('http://localhost:3000/signup')
          .send({ email: 'test@dummy.com', password: 'bacon' })
          .end(onResponse);

        function onResponse(err, res) {
          res.should.have.status(200);
          res.redirects.should.eql(['http://localhost:3000/']);
          res.text.should.include('Sorry, we were unable to create that account');
          return done();
        }
      });
    });
    describe('with good data', function() {
      it('should create a new user', function(done) {
        var agent = superagent.agent();
        agent
          .post('http://localhost:3000/signup')
          .send({ email: 'test@dummy.com', password: 'baconbits' })
          .end(onResponse);

        function onResponse(err, res) {
          res.should.have.status(200);
          res.redirects.should.eql(['http://localhost:3000/', 'http://localhost:3000/dashboard']);
          res.text.should.include('Welcome to this app');
          return done();
        }
      });
    });
  });
  describe('/signin', function() {
    describe('with good credentials', function() {
      var agent = superagent.agent();
      it('should create a user session', loginUser(agent));
    });
    describe('with bad credentials', function() {
      var agent = superagent.agent();
      it('should be rejected', function(done) {
        agent
          .post('http://localhost:3000/signin')
          .send({ email: 'test@dummy.com', password: 'wrong' })
          .end(onResponse);

        function onResponse(err, res) {
          res.should.have.status(200);
          res.redirects.should.eql(['http://localhost:3000/']);
          res.text.should.include('Sorry, that username or password was not found');
          return done();
        }
      });
    });
  });
  describe('/signout', function() {
    var agent = superagent.agent();
    it('should start with signin', loginUser(agent));
    it('should sign the user out', function(done) {
      agent.get('http://localhost:3000/signout').end(function(err, res) {
        res.should.have.status(200);
        res.redirects.should.eql(['http://localhost:3000/']);
        res.text.should.include('Who are you?');
        return done();
      });
    });
    it('should destroy the user session', function(done) {
      agent.get('http://localhost:3000/dashboard').end(function(err, res) {
        res.should.have.status(200);
        res.redirects.should.eql(['http://localhost:3000/']);
        res.text.should.include('Please log in first');
        return done();
      });
    });
  });
  describe('/', function() {
    var agent = superagent.agent();

    before(loginUser(agent));

    it('should redirect to dashboard if user is logged in', function(done) {
      agent.get('http://localhost:3000/').end(function(err, res) {
        res.should.have.status(200);
        res.redirects.should.eql(['http://localhost:3000/dashboard']);
        res.text.should.include('Dashboard');
        return done();
      });
    });

    it('should render signin if user is not logged in', function(done) {
      var anon = superagent.agent();
      anon.get('http://localhost:3000/').end(function(err, res) {
        res.should.have.status(200);
        res.redirects.should.eql([]);
        res.text.should.include('Who are you?');
        return done();
      });
    });
  });
});

function loginUser(agent) {
  return function(done) {
    agent
      .post('http://localhost:3000/signin')
      .send({ email: 'test@dummy.com', password: 'baconbits' })
      .end(onResponse);

    function onResponse(err, res) {
      res.should.have.status(200);
      res.text.should.include('Dashboard');
      return done();
    }
  };
}