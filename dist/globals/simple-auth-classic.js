!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self),o.SimpleAuthSessionCookie=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
"use strict";
var Base = window.SimpleAuth.Authenticators.Base["default"] || window.SimpleAuth.Authenticators.Base;
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
},{}],2:[function(_dereq_,module,exports){
"use strict";
var Base = window.SimpleAuth.Authenticators.Base["default"] || window.SimpleAuth.Authenticators.Base;
var isSecureUrl = window.SimpleAuth.Utils.isSecureUrl["default"] || window.SimpleAuth.Utils.isSecureUrl;
var getGlobalConfig = window.SimpleAuth.Utils.getGlobalConfig["default"] || window.SimpleAuth.Utils.getGlobalConfig;

var $ = Ember.$;
var run = Ember.run;
var isEmpty = Ember.isEmpty;

var Promise = Ember.RSVP.Promise;
var resolve = Ember.RSVP.resolve;
var reject = Ember.RSVP.reject;


exports["default"] = Base.extend({

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
},{}],3:[function(_dereq_,module,exports){
"use strict";
var Base = window.SimpleAuth.Authorizers.Base["default"] || window.SimpleAuth.Authorizers.Base;

exports["default"] = Base.extend();
},{}],4:[function(_dereq_,module,exports){
"use strict";
var ClassicStore = _dereq_("./stores/classic")["default"] || _dereq_("./stores/classic");
var NoopAuthorizer = _dereq_("./authorizers/classic")["default"] || _dereq_("./authorizers/classic");
var ClassicAuthenticator = _dereq_("./authenticators/classic")["default"] || _dereq_("./authenticators/classic");
var AutoAuthenticator = _dereq_("./authenticators/auto")["default"] || _dereq_("./authenticators/auto");

exports.ClassicStore = ClassicStore;
exports.NoopAuthorizer = NoopAuthorizer;
exports.ClassicAuthenticator = ClassicAuthenticator;
exports.AutoAuthenticator = AutoAuthenticator;
},{"./authenticators/auto":1,"./authenticators/classic":2,"./authorizers/classic":3,"./stores/classic":5}],5:[function(_dereq_,module,exports){
"use strict";
var Base = window.SimpleAuth.Stores.Base["default"] || window.SimpleAuth.Stores.Base;
var getGlobalConfig = window.SimpleAuth.Utils.getGlobalConfig["default"] || window.SimpleAuth.Utils.getGlobalConfig;
var flatObjectsAreEqual = window.SimpleAuth.Utils.flatObjectsAreEqual["default"] || window.SimpleAuth.Utils.flatObjectsAreEqual;
var EmberError = Ember.Error;
var isEmpty = Ember.isEmpty;

exports["default"] = Base.extend({
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
},{}]},{},[4])
(4)
});