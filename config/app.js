var passsport = require('passport'),
    login = require('connect-ensure-login');

module.exports = {
  express: {
    customMiddleware: function(app) {
      // app.get('/oauth/authorize', login.ensureLoggedIn() 
    }
  }
}
