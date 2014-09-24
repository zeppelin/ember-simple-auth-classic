"use strict";
var Base = require("simple-auth/stores/base")["default"] || require("simple-auth/stores/base");
var getGlobalConfig = require("simple-auth/utils/get-global-config")["default"] || require("simple-auth/utils/get-global-config");
var flatObjectsAreEqual = require("simple-auth/utils/flat-objects-are-equal")["default"] || require("simple-auth/utils/flat-objects-are-equal");
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
    var domain  = '; domain=' + this.extractWildcardDomain();
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
  },

  extractWildcardDomain: function() {
    var ipv6Regex = /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i;
    var ipv4Regex = /^(\d{1,3}\.){3}(\d{1,3})$|^(0x[\da-fA-F]{2}\.){3}(0x[\da-fA-F]{2})$|^(0[0-3][0-7]{2}\.){3}(0[0-3][0-7]{2})|^0x[\da-fA-F]{8}$|^[0-4]\d{9}$|^0[0-3]\d{10}$/;
    var documentDomain = document.domain;
    var domain;

    if (documentDomain === 'localhost') {
      return '';
    } else if (domain = documentDomain.match(ipv6Regex)) {
      return domain[0];
    } else if (domain = documentDomain.match(ipv4Regex)) {
      return domain[0];
    }

    return '.' + documentDomain.split('.').slice(-2).join('.');
  },
});