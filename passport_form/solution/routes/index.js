var express = require('express');
var router = express.Router();

module.exports = function(passport) {
  
  /* GET home page. */
  // router.get('/', passport.authenticate('local'), function(req, res, next) {
  router.get('/', function(req, res, next) {
    console.log(req.isAuthenticated());
    if (!req.isAuthenticated()) {
      res.redirect('/login');
    }
    res.render('index', { title: 'Express' });
  });
  
  return router;
};
