define(
  ["./stores/classic","./authorizers/classic","./authenticators/classic","./authenticators/auto","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var ClassicStore = __dependency1__["default"] || __dependency1__;
    var NoopAuthorizer = __dependency2__["default"] || __dependency2__;
    var ClassicAuthenticator = __dependency3__["default"] || __dependency3__;
    var AutoAuthenticator = __dependency4__["default"] || __dependency4__;

    __exports__.ClassicStore = ClassicStore;
    __exports__.NoopAuthorizer = NoopAuthorizer;
    __exports__.ClassicAuthenticator = ClassicAuthenticator;
    __exports__.AutoAuthenticator = AutoAuthenticator;
  });