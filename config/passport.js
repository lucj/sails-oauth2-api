var bcrypt = require('bcrypt'),
    moment = require('moment'),
    passport = require('passport'),
    BearerStrategy = require('passport-http-bearer').Strategy,
    BasicStrategy = require('passport-http').BasicStrategy,
    LocalStrategy = require('passport-local').Strategy,
    ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;

    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
      User.findOne({id:id}, function (err, user) {
        done(err, user);
      });
    });

    /**
     * LocalStrategy
     *
     * This strategy is used to authenticate users based on a username and password.
     * Anytime a request is made to authorize an application, we must ensure that
     * a user is logged in before asking them to approve the request.
     */
     passport.use(
     new LocalStrategy(

     function (username, password, done) {

         process.nextTick(


         function () {
             User.findOne({
                 email: username
             }).exec(function (err, user) {
                 if (err) {
                     console.log(err);
                     return;
                 }

                 if (!user) {
                     return done(
                     null, false, {
                         message: 'Unknown user ' + username
                     });
                 }

                 bcrypt.compare(password, user.hashedPassword, function(err, res){
                   if(err){
                     return done(err, null);
                   } else {
                     if (!res) {
                       return done( null, false, { message: 'Invalid password' });
                     } else {
                       return done(null, user);
                     }
                   }
                 });
             })
         });
     }));

/**
 * BasicStrategy & ClientPasswordStrategy
 *
 * These strategies are used to authenticate registered OAuth clients.  They are
 * employed to protect the `token` endpoint, which consumers use to obtain
 * access tokens.  The OAuth 2.0 specification suggests that clients use the
 * HTTP Basic scheme to authenticate.  Use of the client password strategy
 * allows clients to send the same credentials in the request body (as opposed
 * to the `Authorization` header).  While this approach is not recommended by
 * the specification, in practice it is quite common.
 */
passport.use(new BasicStrategy(

function (username, password, done) {

    User.findOne({
        email: username
    }, function (err, user) {

        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false);
        }
        bcrypt.compare(password, user.hashedPassword, function(err, res){
          if(err){
            return done(err, null);
          } else { 
            if (!res) {
              return done( null, false, { message: 'Invalid password' });
            } else { 
              return done(null, user);
            } 
          } 
        });
    });
}));

passport.use(new ClientPasswordStrategy(

function (clientId, clientSecret, done) {

    Client.findOne({
        clientId: clientId
    }, function (err, client) {
        if (err) {
            return done(err);
        }
        if (!client) {
            return done(null, false);
        }
        if (client.clientSecret != clientSecret) {
            return done(null, false);
        }
        return done(null, client);
    });
}));

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate users based on an access token (aka a
 * bearer token).  The user must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 */
passport.use(new BearerStrategy(
  function(accessToken, done) {

    AccessToken.findOne({token:accessToken}, function(err, token) {
      if (err) { return done(err); }
      if (!token) { return done(null, false); }

      var now = moment().unix();
      var creationDate = moment(token.createdAt).unix();

      if( now - creationDate > sails.config.oauth.tokenLife ) {
        AccessToken.destroy({ token: accessToken }, function (err) {
          if (err) return done(err);
         });
         console.log('Token expired');
         return done(null, false, { message: 'Token expired' });
       }

       var info = {scope: '*'};
       User.findOne({
         id: token.userId
       })
       .exec(function (err, user) {
         User.findOne({
           id: token.userId
         },done(err,user,info));
       });
    });
  }
));
