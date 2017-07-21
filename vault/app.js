"use strict";

var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var jsonFiles = require('./passwords.plain.json')
var app = express();

var session = require('cookie-session');
app.use(session({
  keys: ['my very secret password'],
  maxAge: 1000*10
}));

// Express setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());

// MONGODB SETUP HERE
var mongoose = require('mongoose');
mongoose.connection.on('connected', function(){
  console.log('Connected to MongoDb!');
})
mongoose.connect('MONGODB_URI')

// SESSION SETUP HERE


// PASSPORT LOCALSTRATEGY HERE
passport.use(new LocalStrategy(
  function(username, password, done) {
    for(var i = 0; i < jsonFiles.passwords.length; i++){
      if(jsonFiles.passwords[i].username === username && jsonFiles.passwords[i].password === password){
       return done(null, jsonFiles.passwords[i]);//done
      }

 }
}));



    //   if (!us) {
    //     return done(null, false, { message: 'Incorrect username.' });
    //   }
    //   if (!user.validPassword(password)) {
    //     return done(null, false, { message: 'Incorrect password.' });
    //   }
    //   return done(null, user);
    // });


//Adding passport



// PASSPORT SERIALIZE/DESERIALIZE USER HERE HERE

passport.serializeUser(function(user, done){
  done(null, user._id)
})



// PASSPORT MIDDLEWARE HERE


passport.deserializeUser(function(id,done){
  var user;
  for(var i = 0; i<jsonFiles.passwords.length; i++){
    if(jsonFiles.passwords[i]._id === id){
      user = jsonFiles.passwords[i];
    }
  }
  done(null, user);
})


//mongooseConnection


// YOUR ROUTES HERE
//INDEX ROUTE
app.get('/', function(req, res){
  if(!req.user){
    res.redirect('/login')
    console.log("here")
  }
  else{
    res.render('index', {user: req.user})
  }

});
//LOGIN ROUTE
app.get('/login', function ( req, res){
  res.render('login')
});
//LOGIN POST ROUTE
app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRediect: '/login'
}));

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


module.exports = app;

app.listen(3001);
