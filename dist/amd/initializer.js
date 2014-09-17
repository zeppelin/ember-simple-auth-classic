define(
  ["./stores/classic","./authorizers/classic","./authenticators/classic","./authenticators/auto","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var ClassicStore = __dependency1__["default"] || __dependency1__;
    var ClassicAuthorizer = __dependency2__["default"] || __dependency2__;
    var ClassicAuthenticator = __dependency3__["default"] || __dependency3__;
    var AutoAuthenticator = __dependency4__["default"] || __dependency4__;

    __exports__["default"] = {
      name: 'simple-auth-classic',
      before: 'simple-auth',

      initialize: function(container, application) {
        container.register('simple-auth-session-store:classic', ClassicStore);
        container.register('simple-auth-authorizer:classic', ClassicAuthorizer);
        container.register('simple-auth-authenticator:classic', ClassicAuthenticator);
        container.register('simple-auth-authenticator:auto', AutoAuthenticator);
      }
    };
  });