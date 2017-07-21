var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var routes = require('./routes/index');
var auth = require('./routes/auth');
var models = require('./models/models');
var hashPassword = require('./hashPassword');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Mongoose stuff here

var mongoose = require('mongoose');
var connect = process.env.MONGODB_URI || require('./models/connect');
mongoose.connect(connect);

// Passport stuff here
// YOUR CODE HERE

app.use(session({
  secret: process.env.SECRET,
  cookie: {
    // In milliseconds, i.e., five minutes
    maxAge: 1000 * 60 * 5
  },
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection: mongoose.connection})
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

// Used for both password file strategies

// passport.deserializeUser(function(id, done) {
//   passdict.forEach(function(entry) {
//     if (entry._id===id) {
//       done(null, entry);
//     }
//   });
// });

// Unhashed password file
// var passdict = require('../passwords.plain.json').passwords;
//
// passport.use(new LocalStrategy(function(username, password, done) {
//   var found = false;
//   passdict.forEach(function(entry) {
//     if (entry.username===username && entry.password===password) {
//       // Found a match
//       console.log("Found matching user: " + JSON.stringify(entry));
//       found = true;
//       done(null, entry);
//     }
//   });
//
//   if (!found) {
//     // No match
//     console.log("No matching user found");
//     return done(null, false, {message: 'No match'});
//   }
// }));

// Hashed password file
// var passdict = require('../passwords.hashed.json').passwords;
//
// passport.use(new LocalStrategy(function(username, password, done) {
//   var found = false;
//   var hash = hashPassword(password);
//   passdict.forEach(function(entry) {
//     if (entry.username===username && entry.password===hash) {
//       // Found a match
//       console.log("Found matching user: " + JSON.stringify(entry));
//       found = true;
//       done(null, entry);
//     }
//   });
//
//   if (!found) {
//     // No match
//     console.log("No matching user found");
//     return done(null, false, {message: 'No match'});
//   }
// }));

// Used for both mongo strategies

passport.deserializeUser(function(id, done) {
  models.User.findById(id, function(err, user) {
    done(err, user);
  });
});

// Unhashed mongo
// passport.use(new LocalStrategy(function(username, password, done) {
//     // Find the user with the given username
//     models.User.findOne({ username: username }, function (err, user) {
//       // if there's an error, finish trying to authenticate (auth failed)
//       if (err) {
//         console.error(err);
//         return done(err);
//       }
//       // if no user present, auth failed
//       if (!user) {
//         console.log(user);
//         return done(null, false, { message: 'Incorrect username.' });
//       }
//       // if passwords do not match, auth failed
//       if (user.password !== password) {
//         return done(null, false, { message: 'Incorrect password.' });
//       }
//       // auth has has succeeded
//       return done(null, user);
//     });
//   }
// ));

// Hashed mongo
passport.use(new LocalStrategy(function (username, password, done) {
    var hash = hashPassword(password);

    // Find the user with the given username
    models.User.findOne({username: username}, function (err, user) {
      // if there's an error, finish trying to authenticate (auth failed)
      if (err) {
        console.error(err);
        return done(err);
      }
      // if no user present, auth failed
      if (!user) {
        console.log(user);
        return done(null, false, {message: 'Incorrect username.'});
      }
      // if passwords do not match, auth failed
      if (user.password !== hash) {
        return done(null, false, {message: 'Incorrect password.'});
      }
      // auth has has succeeded
      return done(null, user);
    });
  }
));

app.use('/', auth(passport));
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
