define(
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