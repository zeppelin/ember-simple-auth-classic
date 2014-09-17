import Base from 'simple-auth/stores/base';
import getGlobalConfig from 'simple-auth/utils/get-global-config';
import flatObjectsAreEqual from 'simple-auth/utils/flat-objects-are-equal';
var EmberError = Ember.Error;
var isEmpty = Ember.isEmpty;

export default Base.extend({
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
