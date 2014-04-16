/**
 * RefreshToken
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {

        userId: {
            type: 'string',
            required: true
        },
        clientId: {
            type: 'string',
            required: true
        },
        token: {
            type: 'string',
        } 

  },

  beforeCreate: function(values, next){
    values.token = UtilsService.uid(256);
    next();
  }

};
