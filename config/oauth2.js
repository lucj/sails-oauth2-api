var oauth2orize         = require('oauth2orize'),
    passport            = require('passport'),
    login               = require('connect-ensure-login'),
    bcrypt              = require('bcrypt'),
    trustedClientPolicy = require('../api/policies/isTrustedClient.js');

// Create OAuth 2.0 server
var server = oauth2orize.createServer();

server.serializeClient(function(client, done) {
  return done(null, client.id);
});

server.deserializeClient(function(id, done) {
Client.findOne(id, function(err, client) {
  if (err) { return done(err); }
    return done(null, client);
  });
});

// Generate authorization code
server.grant(oauth2orize.grant.code(function(client, redirectURI, user, ares, done) {
  AuthCode.create({
                    clientId: client.clientId,
                    redirectURI: redirectURI,
                    userId: user.id,
                    scope: ares.scope
                  }).exec(function(err,code){
                    if(err){return done(err,null);}
                    return done(null,code.code);
                  });
}));

// Generate access token for Implicit flow
// Only access token is generated in this flow, no refresh token is issued
server.grant(oauth2orize.grant.token(function(client, user, ares, done) {
  AccessToken.destroy({ userId: user.id, clientId: client.clientId }, function (err) {
    if (err){
      return done(err);
    } else {
      AccessToken.create({ userId: user.id, clientId: client.clientId }, function(err, accessToken){
        if(err) {
          return done(err);
        } else {
          return done(null, accessToken.token);
        }
      });
    }
  });
}));

// Exchange authorization code for access token
server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {
  AuthCode.findOne({
                     code: code
                   }).exec(function(err,code){
                     if(err || !code) {
                       return done(err);
                     }
                     if (client.clientId !== code.clientId) {
                       return done(null, false);
                     }
                     if (redirectURI !== code.redirectURI) {
                       return done(null, false);
                     }

                     // Remove Refresh and Access tokens and create new ones
                     RefreshToken.destroy({ userId: code.userId, clientId: code.clientId }, function (err) {
                       if (err) {
                         return done(err);
                       } else {
                         AccessToken.destroy({ userId: code.userId, clientId: code.clientId }, function (err) {
                           if (err){
                             return done(err);
                           } else {
                             RefreshToken.create({ userId: code.userId, clientId: code.clientId }, function(err, refreshToken){
                               if(err){
                                 return done(err);
                               } else {
                                 AccessToken.create({ userId: code.userId, clientId: code.clientId }, function(err, accessToken){
                                   if(err) {
                                     return done(err);
                                   } else {
                                     return done(null, accessToken.token, refreshToken.token, { 'expires_in': sails.config.oauth.tokenLife });
                                   }
                                 });
                               }
                             });
                           }
                         });
                       }
                     });

                   });
}));

// Exchange username & password for access token.
server.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {
    User.findOne({ email: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }

        var pwdCompare = bcrypt.compareSync(password, user.hashedPassword);
        if(!pwdCompare){ return done( null, false); };

        // Remove Refresh and Access tokens and create new ones
        RefreshToken.destroy({ userId: user.id, clientId: client.clientId }, function (err) {
            if (err) {
              return done(err);
            } else {
              AccessToken.destroy({ userId: user.id, clientId: client.clientId }, function (err) {
                if (err){
                  return done(err);
                } else {
                  RefreshToken.create({ userId: user.id, clientId: client.clientId }, function(err, refreshToken){
                    if(err){
                      return done(err);
                    } else {
                      AccessToken.create({ userId: user.id, clientId: client.clientId }, function(err, accessToken){
                        if(err) {
                          return done(err);
                        } else {
                          done(null, accessToken.token, refreshToken.token, { 'expires_in': sails.config.oauth.tokenLife });
                        }
                      });
                    }
                  });
                }
              });
            }
        });
    });
}));

// Exchange refreshToken for access token.
server.exchange(oauth2orize.exchange.refreshToken(function(client, refreshToken, scope, done) {

    RefreshToken.findOne({ token: refreshToken }, function(err, token) {

        if (err) { return done(err); }
        if (!token) { return done(null, false); }
        if (!token) { return done(null, false); }

        User.findOne({id: token.userId}, function(err, user) {

            if (err) { return done(err); }
            if (!user) { return done(null, false); }

            // Remove Refresh and Access tokens and create new ones 
            RefreshToken.destroy({ userId: user.id, clientId: client.clientId }, function (err) {
              if (err) {
                return done(err);
              } else {
                AccessToken.destroy({ userId: user.id, clientId: client.clientId }, function (err) {
                  if (err){ 
                    return done(err);
                  } else {
                    RefreshToken.create({ userId: user.id, clientId: client.clientId }, function(err, refreshToken){
                      if(err){
                        return done(err);
                      } else {
                        AccessToken.create({ userId: user.id, clientId: client.clientId }, function(err, accessToken){
                          if(err) {
                            return done(err);
                          } else {
                            done(null, accessToken.token, refreshToken.token, { 'expires_in': sails.config.oauth.tokenLife });
                          }
                        });
                      }
                    });
                  }
                });
              }
           });
        });
    });
}));

module.exports = {
 http: {
    customMiddleware: function(app){

      // Initialize passport
      app.use(passport.initialize());
      app.use(passport.session());

      /***** OAuth authorize endPoints *****/

      app.get('/oauth/authorize',
        login.ensureLoggedIn(),
        server.authorize(function(clientId, redirectURI, done) {

          Client.findOne({clientId: clientId}, function(err, client) {
            if (err) { return done(err); }
            if (!client) { return done(null, false); }
            if (client.redirectURI != redirectURI) { return done(null, false); }
            return done(null, client, client.redirectURI);
          });
        }),
        function(req, res, next){

            // TRUSTED CLIENT
            // if client is trusted, skip ahead to next,
            // which is the server.decision() function
            // that normally is called when you post the auth dialog form
            if (req.oauth2.client.trusted) {

                // add needed params to simulate auth dialog being posted
                req.trusted = true;
                req.body = req.query;
                req.body.transaction_id = req.oauth2.transactionID;
                return next();

            }

            return res.render('dialog', {
                transactionID: req.oauth2.transactionID,
                user: req.user,
                client: req.oauth2.client,
                jwtToken: req.query.token
            });

        },
        // We added this 2 methods here in case the form is skipped (TRUSTED CLIENT)
        server.decision(),
        server.errorHandler()
      );

      app.post('/login', passport.authenticate('local', { successReturnToOrRedirect: '/', failureRedirect: '/login' }));

      app.post('/oauth/authorize/decision',
        login.ensureLoggedIn(), 
        server.decision());

      /***** OAuth token endPoint *****/

      app.post('/oauth/token',
        trustedClientPolicy,
        passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
        server.token(),
        server.errorHandler()
      );

    }
 }
}; 
