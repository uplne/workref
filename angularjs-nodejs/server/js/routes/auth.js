import passport from 'passport';
import auth     from '../utils/auth';

export default (app) => {
	// GOOGLE
	// send to google to do the authentication
	app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

	// the callback after google has authenticated the user
	app.get('/auth/google/callback', auth.isAuthenticatedGoogle);

	// Already logged in
	// send to google to do the authentication
    app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

    // the callback after google has authorized the user
    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect : '/dashboard',
            failureRedirect : '/login'
        }
    ));

    // =============================================================================
    // UNLINK ACCOUNTS =============================================================
    // =============================================================================
    // used to unlink accounts. for social accounts, just remove the token
    // for local account, remove email and password
    // user account will stay active in case they want to reconnect in the future

    // google ---------------------------------
    app.get('/unlink/google', auth.isLoggedIn, function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/dashboard');
        });
    });

    // Facebook
    // send to facebook to do the authentication
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email'] }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/dashboard',
            failureRedirect : '/login'
        }));

    // Already logged in
    // send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', { scope : ['email'] }));

    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect : '/dashboard',
            failureRedirect : '/login'
        }));

    app.get('/unlink/facebook', auth.isLoggedIn, function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/dashboard');
        });
    });
};