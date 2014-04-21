var oauth2orize         = require('oauth2orize');
var passport            = require('passport');

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
                    clientId: client.id,
                    redirectURI: redirectURI,
                    userId: user.id,
                    scope: ares.scope
                  }).done(function(err,code){
                    if(err){return done(err,null);}
                    return done(null,code.code);
                  });
}));

// Exchange authorization code for access token
server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {
  AuthCode.findOne({
                     code: code
                   }).done(function(err,code){
                     if(err || !code) {
                       return done(err);
                     }
                     if (client.id !== code.clientId) {
                       return done(null, false);
                     }
                     if (redirectURI !== code.redirectURI) {
                       return done(null, false);
                     }
                     AccessToken.create({
                                    userId: code.userId,
                                    clientId: code.clientId,
                                    scope: code.scope
                                  }).done(function(err, accessToken){
                                    if (err) {
                                      return done(err); 
                                    }
                                    return done(null, accessToken.token);
                                  });
                   });
}));

// Exchange username & password for access token.
server.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {
    User.findOne({ email: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }

        var pwdCompare = bcrypt.compareSync(password, user.hashedPassword);
        if(!pwdCompare){ return done( null, false) };

        // Remove Refresh and Access tokens and create new ones
        RefreshToken.remove({ userId: user.userId, clientId: client.clientId }, function (err) {
            if (err) {
              return done(err);
            } else {
              AccessToken.remove({ userId: user.userId, clientId: client.clientId }, function (err) {
                if (err){
                  return done(err);
                } else {
                  RefreshToken.create({ userId: user.userId, clientId: client.clientId }, function(err, refreshToken){
                    if(err){
                      return done(err);
                    } else {
                      AccessToken.create({ userId: user.userId, clientId: client.clientId }, function(err, accessToken){
                        if(err) {
                          return done(err);
                        } else {
                          done(null, accessToken.token, refreshToken.token, { 'expires_in': config.get('security:tokenLife') });
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

        User.findById(token.userId, function(err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }

            // Remove Refresh and Access tokens and create new ones 
            RefreshToken.remove({ userId: user.userId, clientId: client.clientId }, function (err) {
              if (err) {
                return done(err);
              } else {
                AccessToken.remove({ userId: user.userId, clientId: client.clientId }, function (err) {
                  if (err){ 
                    return done(err);
                  } else {
                    RefreshToken.create({ userId: user.userId, clientId: client.clientId }, function(err, refreshToken){
                      if(err){
                        return done(err);
                      } else {
                        AccessToken.create({ userId: user.userId, clientId: client.clientId }, function(err, accessToken){
                          if(err) {
                            return done(err);
                          } else {
                            done(null, accessToken.token, refreshToken.token, { 'expires_in': config.get('security:tokenLife') });
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
 express: {
    customMiddleware: function(app){

      // Initialize passport
      app.use(passport.initialize());
      app.use(passport.session());

      // OAuth authorize endPoints
      //TODO
      // app.get('/oauth/authorize', ... 
      // app.post('/oauth/authorize/decision', ...

      // OAuth token endPoint
      app.post('/oauth/token',
        passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
        server.token(),
        server.errorHandler()
      );

    }
 }
}; 
