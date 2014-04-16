/**
 * AuthController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling auth requests.
 */

var passport = require('passport');

module.exports = {

	process: function(req,res){
		passport.authenticate(
		    'local',
		    function(err, user, info)
		    {
		        if ((err) || (!user))
		        {
		            res.redirect('/login');
		            return;
		        }
		        // use passport to log in the user using a local method
		        req.logIn(
		            user,
		            function(err)
		            {
		                if (err)
		                {
		                    res.redirect('/login');
		                    return;
		                }
		                res.redirect('/');
		                return;
		            }
		        );
		    }
		)(req, res);
	},

	logout: function(req,res){
		req.logout();
		res.redirect('/');
	}
 
};
