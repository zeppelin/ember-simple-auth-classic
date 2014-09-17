import ClassicStore from './stores/classic';
import ClassicAuthorizer from './authorizers/classic';
import ClassicAuthenticator from './authenticators/classic';
import AutoAuthenticator from './authenticators/auto';

export default {
  name: 'simple-auth-classic',
  before: 'simple-auth',

  initialize: function(container, application) {
    container.register('simple-auth-session-store:classic', ClassicStore);
    container.register('simple-auth-authorizer:classic', ClassicAuthorizer);
    container.register('simple-auth-authenticator:classic', ClassicAuthenticator);
    container.register('simple-auth-authenticator:auto', AutoAuthenticator);
  }
};
