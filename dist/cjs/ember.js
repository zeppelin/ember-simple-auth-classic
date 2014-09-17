"use strict";
var initializer = require("./initializer")["default"] || require("./initializer");

Ember.onLoad('Ember.Application', function(Application) {
  Application.initializer(initializer);
});