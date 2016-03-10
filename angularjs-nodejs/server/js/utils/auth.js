import passport 	    from 'passport';
import passportLocal    from 'passport-local';
import passportGoogle   from 'passport-google-oauth';
import passportFacebook from 'passport-facebook';
import request          from 'request';
import Promise          from 'promise';
import settings         from '../../node-config';
import crypto           from 'crypto';

const {Strategy: LocalStrategy} = passportLocal;
const {OAuth2Strategy: GoogleStrategy} = passportGoogle;
const {Strategy: FacebookStrategy} = passportFacebook;
const config = settings[process.env.NODE_ENV];
const apiUrl = (process.env.NODE_ENV === 'dev') ? config.api.host + ':' + config.api.port : config.api.host;

// used to serialize the user for the session
passport.serializeUser((user, done) => {
    console.log('Serializing: ', user);
    done(null, user._id);
});

// used to deserialize the user
passport.deserializeUser((id, done) => {
	console.log('Deserializing: ', id);
    new Promise((resolve, reject) => {
        request.get(apiUrl + '/users/' + id, {
            'auth': {
                'user': config.api.apiKey,
                'pass': config.api.apiSecret
            }
        }, (error, response, body) => {
        if (error)
            console.log(error);

        if (!error && response.statusCode == 200) {
            resolve(body);
        }
       });
    }).then((user) => {
        done(null, user);
    });
});

passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password'
}, (email, password, done) => {
    console.log('User email: ', email);
    if (email)
        email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

    console.log(apiUrl + '/users/' + email);
    new Promise((resolve, reject) => {
        request.get(apiUrl + '/users/' + email, {
        	'auth': {
        		'user': config.api.apiKey,
        		'pass': config.api.apiSecret
        	}
    	}, (error, response, body) => {
    	if (error)
    		console.log(error);

		if (!error && response.statusCode == 200) {
            resolve(body);
		}
	   });
    }).then((result) => {
        var result = JSON.parse(result);
        console.log('Logging in as: ' + email +':' + password);
        console.log('Get body: ', result);

        if (!result.user) {
            console.log('No user');
            return done(null, false, {message: 'Incorrect username or password.'});
        }

        let getPassword = crypto.createHash('sha1').update(result.user.salt + password).digest('hex')

        if (email !== result.user.email) {
            console.log('Email wrong');
            return done(null, false, {message: 'Incorrect username.'});
        }

        if (getPassword !== result.user.hash) {
            console.log('Wrong password');
            return done(null, false, {message: 'Incorrect password.'});
        }

        // all is well, return user
        var user = {email:result.user.email, uid: result.user.userid};
        console.log('User: ', user);
        return done(null, user);
    });
}));

// Google
passport.use('google', new GoogleStrategy({
    clientID        : config.auth.googleAuth.clientID,
    clientSecret    : config.auth.googleAuth.clientSecret,
    callbackURL     : config.auth.googleAuth.callbackURL,
    passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

}, (req, token, refreshToken, profile, done) => {
    // asynchronous
    process.nextTick(() => {
        // check if the user is already logged in
        if (!req.user) {
            console.log('User is not logged in');

            new Promise((resolve, reject) => {
                console.log(profile.id);
                request.get(apiUrl + '/users/google/' + profile.id, {
                    'auth': {
                        'user': config.api.apiKey,
                        'pass': config.api.apiSecret
                    }
                }, (error, response, body) => {
                if (error)
                    console.log(error);

                if (!error && response.statusCode == 200) {
                    resolve(JSON.parse(body).user);
                }
               });
            }).then((user) => {
                console.log('After API call: ', user);

                // There is user with this id
                if (user) {
                    // if there is a user id already but no token (user was linked at one point and then removed)
                    if (!user.google.token) {
                        new Promise((resolve, reject) => {
                            request({
                                    method: 'PUT',
                                    url: apiUrl + '/users/google/' + profile.id,
                                    auth: {
                                        'user': config.api.apiKey,
                                        'pass': config.api.apiSecret
                                    },
                                    body: {
                                        token: token,
                                        name: profile.displayName,
                                        email: (profile.emails[0].value || '').toLowerCase() // pull the first email
                                    },
                                    json: true
                                }, (error, response, body) => {
                                if (error)
                                    console.log(error);

                                if (!error && response.statusCode == 200) {
                                    resolve(JSON.parse(body));
                                }
                            });
                        }).then((user) => {
                            console.log('Updated user: ', user);
                            done(null, user);
                        });
                    }
                    console.log('User: ', user);
                    done(null, user);
                // There is no google account so create one
                } else {
                    const user = {
                        id: profile.id,
                        token: token,
                        name: profile.displayName,
                        email: (profile.emails[0].value || '').toLowerCase() // pull the first email
                    };

                    new Promise((resolve, reject) => {
                        request({
                                method: 'POST',
                                url: apiUrl + '/users/createuser/google',
                                auth: {
                                    'user': config.api.apiKey,
                                    'pass': config.api.apiSecret
                                },
                                body: user,
                                json: true
                            }, (error, response, body) => {
                            if (error)
                                console.log(error);

                            if (!error && response.statusCode == 200) {
                                resolve(body);
                            }
                        });
                    }).then((result) => {
                        console.log('Created user: ', result);
                        done(null, result.data);
                    }).then(null, (err) => {
                        console.log(err);
                        done(err);
                    });
                }
            });
        } else {
            console.log('User exists: ', req.user);
            // user already exists and is logged in, we have to link accounts
            let user = req.user; // pull the user out of the session

            /*user.google.id    = profile.id;
            user.google.token = token;
            user.google.name  = profile.displayName;
            user.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email

            console.log('User exists and is logged in: ', user);

            new Promise((resolve, reject) => {
                request({
                        method: 'PUT',
                        url: apiUrl + '/users/google/' + profile.id,
                        auth: {
                            'user': config.api.apiKey,
                            'pass': config.api.apiSecret
                        },
                        body: {
                            token: token,
                            name: profile.displayName,
                            email: (profile.emails[0].value || '').toLowerCase() // pull the first email
                        },
                        json: true
                    }, (error, response, body) => {
                    if (error)
                        console.log(error);

                    if (!error && response.statusCode == 200) {
                        resolve(body);
                    }
                });
            }).then((result) => {
                console.log('Updated user: ', result);
            });*/
        }
    });
}));

passport.use(new FacebookStrategy({
    clientID        : config.auth.facebookAuth.clientID,
    clientSecret    : config.auth.facebookAuth.clientSecret,
    callbackURL     : config.auth.facebookAuth.callbackURL,
    passReqToCallback : true,
    profileFields: ['id', 'displayName', 'emails', 'picture']
},
(req, token, refreshToken, profile, done) => {
    // asynchronous
    process.nextTick(() => {

        // check if the user is already logged in
        if (!req.user) {
            console.log('User is not logged in');
            new Promise((resolve, reject) => {
                console.log(profile.id);
                request.get(apiUrl + '/users/facebook/' + profile.id, {
                    'auth': {
                        'user': config.api.apiKey,
                        'pass': config.api.apiSecret
                    }
                }, (error, response, body) => {
                if (error)
                    console.log(error);

                if (!error && response.statusCode == 200) {
                    console.log('User: ', body);
                    resolve(JSON.parse(body).user);
                }
               });
            }).then((user) => {

                if (user) {
                    console.log('There is user', user);
                    // if there is a user id already but no token (user was linked at one point and then removed)
                    if (!user.facebook.token) {
                        console.log('Update user');
                        new Promise((resolve, reject) => {
                            request({
                                    method: 'PUT',
                                    url: apiUrl + '/users/facebook/' + profile.id,
                                    auth: {
                                        'user': config.api.apiKey,
                                        'pass': config.api.apiSecret
                                    },
                                    body: {
                                        token: token,
                                        name: profile.displayName,
                                        email: (profile.emails[0].value || '').toLowerCase() // pull the first email
                                    },
                                    json: true
                                }, (error, response, body) => {
                                if (error)
                                    console.log(error);

                                if (!error && response.statusCode == 200) {
                                    resolve(JSON.parse(body));
                                }
                            });
                        }).then((user) => {
                            console.log('Updated user: ', user);
                            done(null, user);
                        });

                    }

                    console.log('Updated user: ', user);
                    done(null, user);
                } else {
                    console.log('There is no user', profile, token);
                    const user = {
                        id: profile.id,
                        token: token,
                        name: profile.displayName,
                        email: (profile.emails[0].value || '').toLowerCase() // pull the first email
                    };

                    console.log('Create user', user);

                    new Promise((resolve, reject) => {
                        request({
                                method: 'POST',
                                url: apiUrl + '/users/createuser/facebook',
                                auth: {
                                    'user': config.api.apiKey,
                                    'pass': config.api.apiSecret
                                },
                                body: user,
                                json: true
                            }, (error, response, body) => {
                            if (error)
                                console.log(error);

                            if (!error && response.statusCode == 200) {
                                resolve(body);
                            }
                        });
                    }).then((result) => {
                        console.log('Created user: ', result);
                        done(null, result.data);
                    }).then(null, (err) => {
                        console.log(err);
                        done(err);
                    });
                }
            });

        } else {
            console.log('User exists: ', req.user);
            // user already exists and is logged in, we have to link accounts
            var user            = req.user; // pull the user out of the session

            user.facebook.id    = profile.id;
            user.facebook.token = token;
            user.facebook.name  = profile.displayName;
            user.facebook.email = (profile.emails[0].value || '').toLowerCase();

            /*user.save(function(err) {
                if (err)
                    return done(err);
                    
                return done(null, user);
            });*/

        }
    });

}));

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/login');
}

export default {
	isAuthenticatedLocal: passport.authenticate('local-login', { successRedirect: '/profile', 
                                                            failureRedirect: '/login'}),
    isAuthenticatedGoogle: passport.authenticate('google', { successRedirect: '/dashboard', 
                                                            failureRedirect: '/connect/google'}),
	isLoggedIn: isLoggedIn
}