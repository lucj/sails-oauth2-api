/**
 * ClientController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  /**
   * Action blueprints:
   *    `/client/create`
   */
   create: function (req, res) {

    var name = req.param("name");
    var redirectURI = req.param("redirectURI");

    Client.create({ name : name,
                    redirectURI: redirectURI
    }).exec(function(err, client){
      if(err){
        return res.send(500, {error: err.message});
      } else {
        return res.json(client);
      }
    });
  },


  /**
   * Action blueprints:
   *    `/client/index`
   *    `/client`
   */
   index: function (req, res) {
     Client.find({}, function(err, clients){
       if(err){
         return res.send(500, {error: err.message});
       } else {
         return res.json(clients);
       }
     });
  },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ClientController)
   */
  _config: {}


};
