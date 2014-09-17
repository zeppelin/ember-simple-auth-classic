define(
  ["simple-auth/authenticators/base","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Base = __dependency1__["default"] || __dependency1__;
    var resolve = Ember.RSVP.resolve;
    var isEmpty = Ember.isEmpty;

    __exports__["default"] = Base.extend({
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
  });