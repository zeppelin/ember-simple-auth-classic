"use strict";
var ClassicStore = require("./stores/classic")["default"] || require("./stores/classic");
var ClassicAuthorizer = require("./authorizers/classic")["default"] || require("./authorizers/classic");
var ClassicAuthenticator = require("./authenticators/classic")["default"] || require("./authenticators/classic");
var AutoAuthenticator = require("./authenticators/auto")["default"] || require("./authenticators/auto");

exports["default"] = {
  name: 'simple-auth-classic',
  before: 'simple-auth',

  initialize: function(container, application) {
    container.register('simple-auth-session-store:classic', ClassicStore);
    container.register('simple-auth-authorizer:classic', ClassicAuthorizer);
    container.register('simple-auth-authenticator:classic', ClassicAuthenticator);
    container.register('simple-auth-authenticator:auto', AutoAuthenticator);
  }
};