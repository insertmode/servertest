var express = require("express");
var logfmt = require("logfmt");
var app = express();

var CouchDB = require( 'promised-couch' ).CouchDB
var db = CouchDB( { base: process.env.DBURL } );

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
    db.get('welcome').then(function(doc) {
        res.json(doc);
    }, function (err) {
        res.send(503, err.toString());
    });
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
      console.log("Listening on " + port);
});


