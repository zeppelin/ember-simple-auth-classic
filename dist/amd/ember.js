define(
  ["./initializer"],
  function(__dependency1__) {
    "use strict";
    var initializer = __dependency1__["default"] || __dependency1__;

    Ember.onLoad('Ember.Application', function(Application) {
      Application.initializer(initializer);
    });
  });