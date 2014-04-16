/**
 * Routes
 *
 * Sails uses a number of different strategies to route requests.
 * Here they are top-to-bottom, in order of precedence.
 *
 * For more information on routes, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.routes = {

  // Client authorization endPoints 

  '/login': {
    view: 'login'
  },
  'post /login': {
    controller: 'Auth',
    action: 'process'
  },

  // OAuth endPoints

  '/oauth/authorize': {
    controller: 'OAuthController',
    action: 'authorize'
  },
  '/oauth/token': {
    controller: 'OAuthController',
    action: 'token'
  },

  // Resources endPoints

  '/api/info': {
    controller: 'InfoController',
    action: 'index'
  },

}
