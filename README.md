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

- flows
  * only resource owner password flow is currently available

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

Details
-------

When lifting the sails application, a default user and 2 defaults clients are created (among which one is trusted and the other is not).
In the console, the client_id and client_secret of each client are displayed and the default user credential as well.

- Resource owner password flow

Just issue the following curl request:

curl -XPOST "http://localhost:1340/oauth/token" -d "grant_type=password&client_id=CLIENT_ID&client_secret=CLIENT_SECRET&username=USERNAME&password=PASSWORD"

And receive an access token (if the trusted client credential were used).

{"access_token":"UeCnysUiLLzxS6tCKkEeMnRxvTsyq5bri9AFUeQV4OEOqoketVZd7HVQpjOeWOLwBhwaWokFXdBsQ34oU0Kcafq8cHgS3lu2Si6I2xvKifo46F8HiU18aicWTzizNocfHVKYYFEhcYftEVEmyvrkcPt1loaAHcKAhY8IzobgkTiMh6ZTfAdQKWn7pM0iS1sojW8H0v6pL9xLNRj0lwbTNHcMDWwdfCCGEq9NuZAiFuKspOg5LeLYKSXxm0vQAHFr","refresh_token":"zu1dbMCuP46NS2hqjmq1ZFPzNrVsSpM9BvFCOizo3GmrE9jRwrY26m1b6JK3Jbud4ejb2xw3MZZc56snT15Y9hWXsmvGSOyKufS0cu8ZKGfVwUjwBcyu7SkcZCcCLUDgq5BJzFJ9ZBv6TKwltdUb8LQAEcDSLLRAXbIHsorStKW0CXqNuL9iSVdKgTXMVkiT2ik8Z4PUMf3daLQSMvwPK69srvYttFNpM3mUMOC2Y2U0AmiRDLYIr3Nsid0hwGsi","expires_in":3600,"token_type":"Bearer"}

If the curl command above is issued with the client_id of the untrusted client (third party client applications that require access to the resource), a 401 error is raised.

Note: the refresh token mecanism is not fully functional yet

- Authorization code grant

Note: this will be done once the Resource owner flow is fully functional

Credits
-------

Several projects were used to start this one:

* http://aleksandrov.ws/2013/09/12/restful-api-with-nodejs-plus-mongodb/
* https://github.com/aaron524/sails-oauth2-provider-example
