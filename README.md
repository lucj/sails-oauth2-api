Sails-OAuth2-API
----------------

Purposes
--------

Several purposes of this application:

* integrate OAuth2 to protect a REST API developped with sailsjs
* make this integration simple and easy to understand
* handle trusted and untrusted application
  - trusted application will use resource owner's password credential (no login form displayed to the user)
  - untrusted application will use authorization code grant (login form displayed and presenting the Allow / Deny options)


Status
------

WARNING: still under development - application not functional yet.

- models implemented
  * User: resource owner
  * Client: application willing to use the user's resource
  * AuthCode: authorization code that will be exchanged against an Access Token
  * AccessToken: token used by the client each time the API is called with the user's identity
  * RefreshToken: token used to get a new AccessToken

- controllers
  * InfoController: a basic controller that will be called to test the OAuth mecanism

- authentication
  * config/passport.js: defining passport strategy

- OAuth service
  * config/oauth2.js defining the OAuth server and the exchange strategy

- **TODO**
  * Create the links (ideally using sailsjs policies),  between the oauth endPoints and the grant strategies ("Resource Owner Password" and "Authorization Code").  
  * Still not sure how to automatically select one of those 2 strategies depending upon the client's type (trusted / untrusted) ?

Credits
-------

Several projects were used to start this one:

* http://aleksandrov.ws/2013/09/12/restful-api-with-nodejs-plus-mongodb/
* https://github.com/aaron524/sails-oauth2-provider-example
