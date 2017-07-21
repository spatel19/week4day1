var express = require('express');
var router = express.Router();

// Require login past this point.
router.use(function(req, res, next){
  if (!req.user) {
    res.redirect('/login');
  } else {
    return next();
  }
});

/* GET home page. */
router.get('/', function(req, res, next) {
  // Your code here.
  res.render('index', {messages: req.session.messages});
});

router.post('/', function(req, res, next) {
  if (!req.body || !req.body.message) {
    res.status(400).send("bad request");
  }
  else if (!req.session) {
    res.status(500).send("no session data!");
  }
  else {
    if (req.session.messages) {
      req.session.messages.push(req.body.message);
    }
    else {
      req.session.messages = [req.body.message];
    }
    res.redirect('/');
  }
});

module.exports = router;
