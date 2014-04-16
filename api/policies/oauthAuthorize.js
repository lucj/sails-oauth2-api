/**
 * oauthAuthorize policy
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

var passport = require('passport'),
    login = require('connect-ensure-login');

module.exports = function(req, res, next) {

  //TODO  
  next();

};
