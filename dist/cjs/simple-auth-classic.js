"use strict";
var ClassicStore = require("./stores/classic")["default"] || require("./stores/classic");
var NoopAuthorizer = require("./authorizers/classic")["default"] || require("./authorizers/classic");
var ClassicAuthenticator = require("./authenticators/classic")["default"] || require("./authenticators/classic");
var AutoAuthenticator = require("./authenticators/auto")["default"] || require("./authenticators/auto");

exports.ClassicStore = ClassicStore;
exports.NoopAuthorizer = NoopAuthorizer;
exports.ClassicAuthenticator = ClassicAuthenticator;
exports.AutoAuthenticator = AutoAuthenticator;