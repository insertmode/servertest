var express = require("express");
var logfmt = require("logfmt");
var passport = require('passport');
var flash    = require('connect-flash');

var app = express();

var CouchDB = require( 'promised-couch' ).CouchDB;
var db = CouchDB( { base: process.env.DBURL } );

// used to serialize the user for the session
passport.serializeUser(function(user, cb) {
    console.log('user', user);
    cb(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, cb) {
    db.get(id).then(function(user) {
        cb(null, user);
    }, function(err) {
        cb(err);
    });
});

app.use(logfmt.requestLogger());
app.use(express.cookieParser());
app.use(express.bodyParser());

app.set('view engine', 'ejs');

// required for passport
app.use(express.session({ secret: 'eukjhfudhbfdb' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// configure passport for twitter
require('./auth/twitter')(app, db, passport);

app.get('/', function(req, res) {
    db.get('welcome').then(function(doc) {
        res.render('index.ejs', doc);
    }, function (err) {
        res.send(503, err.toString());
    });
});

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.redirect('/');
}

app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile.ejs', {
        user : req.user
    });
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
      console.log("Listening on " + port);
});

