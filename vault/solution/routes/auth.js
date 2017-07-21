// Add Passport-related auth routes here.

var express = require('express');
var router = express.Router();
var models = require('../models/models');
var hashPassword = require('../hashPassword');

module.exports = function(passport) {

  // GET Login page
  router.get('/login', function(req, res) {
    res.render('login');
  });

  // POST Login page
  router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
  });

  // GET Logout page
  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
  });

  // These will only work for mongo strategies.

  // GET registration page
  router.get('/signup', function(req, res) {
    res.render('signup');
  });

  router.post('/signup', function(req, res) {
    var password;
    // Unhashed version
    // password = req.body.password;
    // Hashed version
    password = hashPassword(req.body.password);

    var u = new models.User({
      username: req.body.username,
      password: password
    });
    u.save(function(err, user) {
      if (err) {
        console.log(err);
        res.status(500).redirect('/register');
        return;
      }
      console.log(user);
      res.redirect('/login');
    });
  });

  return router;
};
