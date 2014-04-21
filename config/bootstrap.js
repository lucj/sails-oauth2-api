/**
 * Bootstrap
 *
 * An asynchronous boostrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.bootstrap = function (cb) {

  // Create a user
  User.findOne({email: 'me@gmail.com'}, function(err, user){
    if(!user){
      User.create({
  	email: 'me@gmail.com',
  	password: 'testuser',
      }).done(function(err,user){
  	console.log("Created user: " + user.email);
      });
    }
  });

  // Create a trusted application
  Client.findOne({'name': 'trustedTestClient'}, function(err, client){
    if(err){
      console.log(err.message);
    } else {
      if(!client){
        Client.create({name : 'trustedTestClient',
                       redirectURI: 'http://localhost:1338',
                       trusted: true
        }).done(function(err, client){
          if(err){
            console.log(err.message);
          } else {
            console.log("trustedTestClient created");
            console.log("clientId:" + client.clientId);
            console.log("clientSecret:" + client.clientSecret);
          }
        });
      }
    }
  }); 

  // Create an untrusted application
  Client.findOne({'name': 'untrustedTestClient'}, function(err, client){
    if(err){
      console.log(err.message);
    } else {
      if(!client){
        Client.create({name : 'untrustedTestClient',
                       redirectURI: 'http://localhost:1338'
        }).done(function(err, client){
          if(err){
            console.log(err.message);
          } else {
            console.log("untrustedTestClient created");
            console.log("clientId:" + client.clientId);
            console.log("clientSecret:" + client.clientSecret);
          }
        });
      }
    }
  }); 

  cb();
};
