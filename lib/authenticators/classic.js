import Base from 'simple-auth/authenticators/base';
import isSecureUrl from 'simple-auth/utils/is-secure-url';
import getGlobalConfig from 'simple-auth/utils/get-global-config';

var $ = Ember.$;
var run = Ember.run;
var isEmpty = Ember.isEmpty;

var Promise = Ember.RSVP.Promise;
var resolve = Ember.RSVP.resolve;
var reject = Ember.RSVP.reject;


export default Base.extend({

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
