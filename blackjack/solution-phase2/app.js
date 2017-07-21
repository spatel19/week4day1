#!/usr/bin/env node
var http = require('http');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var routes = require('./routes/index');
//var users = require('./routes/users');
var exphbs = require('express-handlebars');
var app = express();
var port = '3000'
var expressValidator = require('express-validator');
var config = require('./config');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Account = require('./models/account');


mongoose.connect(config.db.localhost, function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
});


app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({defaultLayout: 'single', extname: '.hbs'}));
app.set('view engine', '.hbs');
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressValidator());

app.use(require('express-session')({
    secret: 'MrBigglesworth',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());



// passport config
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());


app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);

app.set('port', port);
var server = http.createServer(app);
server.listen(port);
