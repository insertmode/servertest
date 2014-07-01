var TwitterStrategy  = require('passport-twitter').Strategy;

module.exports = function(app, db, passport) {
    
    var config = {
        consumerKey     : process.env.TWITTER_CONSUMERKEY,
        consumerSecret  : process.env.TWITTER_CONSUMERSECRET,
        callbackURL     : process.env.BASE_IRI + '/auth/twitter/callback' 
    };

    var handler = function(token, tokenSecret, profile, cb) {
        var promise = db.get(
            '_design/user/_view/twitter', 
            {key: profile.id}
        ).then(function(users) {
            if (users.length) return users[0];

            // if there is no user, create them
            var user = {
                'type': 'user'
            };
            user.twitter = {
                id: profile.id,
                token: token,
                username: profile.username,
                displayName: profile.displayName
            };
            // save our user into the database
            return db.put(user);
        });
        promise.then(
            function(user) {cb(null, user);}, 
            function(err) {cb(err);}
        );
    };

    passport.use(new TwitterStrategy(config, handler));
    
    app.get('/auth/twitter', passport.authenticate('twitter'));

	app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
			successRedirect : '/profile',
			failureRedirect : '/'
		})
    );

};


