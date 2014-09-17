var package = require('broccoli-dist-es6-module');
var esNext = require('broccoli-esnext');

module.exports = package(esNext('lib'), {
  global:      'SimpleAuthSessionCookie',
  packageName: 'simple-auth-classic',
  main:        'simple-auth-classic',

  shim: {
    'simple-auth/authenticators/base':          'SimpleAuth.Authenticators.Base',
    'simple-auth/authorizers/base':             'SimpleAuth.Authorizers.Base',
    'simple-auth/stores/base':                  'SimpleAuth.Stores.Base',
    'simple-auth/utils/is-secure-url':          'SimpleAuth.Utils.flatObjectsAreEqual',
    'simple-auth/utils/is-secure-url':          'SimpleAuth.Utils.isSecureUrl',
    'simple-auth/utils/get-global-config':      'SimpleAuth.Utils.getGlobalConfig',
    'simple-auth/utils/flat-objects-are-equal': 'SimpleAuth.Utils.flatObjectsAreEqual',

    'ember': 'Ember'
  }
});
