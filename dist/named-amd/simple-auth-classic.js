define("simple-auth-classic/authenticators/auto",
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
define("simple-auth-classic/authenticators/classic",
  ["simple-auth/authenticators/base","simple-auth/utils/is-secure-url","simple-auth/utils/get-global-config","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var Base = __dependency1__["default"] || __dependency1__;
    var isSecureUrl = __dependency2__["default"] || __dependency2__;
    var getGlobalConfig = __dependency3__["default"] || __dependency3__;

    var $ = Ember.$;
    var run = Ember.run;
    var isEmpty = Ember.isEmpty;

    var Promise = Ember.RSVP.Promise;
    var resolve = Ember.RSVP.resolve;
    var reject = Ember.RSVP.reject;


    __exports__["default"] = Base.extend({

      serverTokenEndpoint: '/users/sign_in',
      resourceName: 'user',

      init: function() {
        var globalConfig         = getGlobalConfig('simple-auth-classic');
        this.serverTokenEndpoint = globalConfig.serverTokenEndpoint || this.serverTokenEndpoint;
        this.resourceName        = globalConfig.resourceName || this.resourceName;
      },

      restore: function(properties) {
        if (!isEmpty(properties.user.email)) {
          return resolve(properties);
        } else {
          return reject();
        }
      },

      authenticate: function(credentials) {
        var _this = this;

        return new Promise(function(resolve, reject) {
          var data = {};
          data[_this.resourceName] = {
            email:    credentials.identification,
            password: credentials.password
          };

          _this.makeRequest(data).then(function(response) {
            run(function() {
              resolve(response);
            });
          }, function(xhr, status, error) {
            run(function() {
              reject(xhr.responseJSON || xhr.responseText);
            });
          });
        });
      },

      invalidate: function() {
        return resolve();
      },

      makeRequest: function(data, resolve, reject) {
        if (!isSecureUrl(this.serverTokenEndpoint)) {
          Ember.warn('Credentials are transmitted via an insecure connection - use HTTPS to keep them secure.');
        }

        return $.ajax({
          url:        this.serverTokenEndpoint,
          type:       'POST',
          data:       data,
          dataType:   'json',
          beforeSend: function(xhr, settings) {
            xhr.setRequestHeader('Accept', settings.accepts.json);
          }
        });
      }
    });
  });
define("simple-auth-classic/authorizers/classic",
  ["simple-auth/authorizers/base","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Base = __dependency1__["default"] || __dependency1__;

    __exports__["default"] = Base.extend();
  });
define("simple-auth-classic/ember",
  ["./initializer"],
  function(__dependency1__) {
    "use strict";
    var initializer = __dependency1__["default"] || __dependency1__;

    Ember.onLoad('Ember.Application', function(Application) {
      Application.initializer(initializer);
    });
  });
define("simple-auth-classic/initializer",
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
define("simple-auth-classic",
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
define("simple-auth-classic/stores/classic",
  ["simple-auth/stores/base","simple-auth/utils/get-global-config","simple-auth/utils/flat-objects-are-equal","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var Base = __dependency1__["default"] || __dependency1__;
    var getGlobalConfig = __dependency2__["default"] || __dependency2__;
    var flatObjectsAreEqual = __dependency3__["default"] || __dependency3__;
    var EmberError = Ember.Error;
    var isEmpty = Ember.isEmpty;

    __exports__["default"] = Base.extend({
      cookieName: null,
      data: null,
      _secureCookies: window.location.protocol === 'https:',
      _syncDataTimeout: null,

      init: function() {
        var globalConfig = getGlobalConfig('simple-auth-classic');
        this.data = globalConfig.auth;
        this.data.authenticator = globalConfig.authenticator;
        this.cookieName = globalConfig.cookieName;
        if (!this.cookieName) {
          throw new EmberError("No 'cookieName' provided");
        }

        this.syncData();
      },

      persist: function(data) {
        this.data = data || {};
      },

      restore: function() {
        var cookie = this.read();
        if (isEmpty(cookie)) {
          return {};
        }

        // this.data.authenticator = 'simple-auth-authenticator:auto';
        return this.data;
      },

      clear: function() {
        this.write(null, 0);
        this._lastData = null;
      },

      read: function() {
        var value = document.cookie.match(new RegExp(this.cookieName + name + '=([^;]+)')) || [];
        return decodeURIComponent(value[1] || '');
      },

      write: function(value, expiration) {
        var path = '; path=/';
        var expires = Ember.isEmpty(expiration) ? '' : '; expires=' + new Date(expiration).toUTCString();
        var secure  = !!this._secureCookies ? ';secure' : '';
        var domain  = '; domain=' + document.domain; // TODO do i need domain?
        document.cookie = this.cookieName + '=' + encodeURIComponent(value) + path + expires + secure + domain;
      },

      syncData: function() {
        var data = this.restore();
        if (!flatObjectsAreEqual(data, this._lastData)) {
          this._lastData = data;
          this.trigger('sessionDataUpdated', data);
        }
        if (!Ember.testing) {
          Ember.run.cancel(this._syncDataTimeout);
          this._syncDataTimeout = Ember.run.later(this, this.syncData, 500);
        }
      }
    });
  });