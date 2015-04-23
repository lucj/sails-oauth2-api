/**
 * AuthCode
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {

        code: {
            type: 'string'
        },
        userId: {
            type: 'string',
            required: true
        },
        clientId: {
            type: 'string',
            required: true
        },
        redirectURI: {
            type: 'string',
            required: true
        }

  },

  beforeCreate: function(values, next){
    values.code = UtilsService.uid(16);
    next();
  }

};
