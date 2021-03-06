"use strict";
var Base = require("simple-auth/authenticators/base")["default"] || require("simple-auth/authenticators/base");
var resolve = Ember.RSVP.resolve;
var isEmpty = Ember.isEmpty;

exports["default"] = Base.extend({
  authenticate: function(credentials) {
    return resolve(credentials);
  },

  restore: function(credentials) {
    var user = credentials.user;
    if (!user) {
      return Ember.RSVP.reject();
    }

    var email = user.email;
    if (!isEmpty(email)) {
      return Ember.RSVP.resolve(credentials);
    }

    return Ember.RSVP.reject();
  }
});