'use strict';

var preferredLanguage;

/**
 * @ngdoc service
 * @name showcaseClientApp.LanguageService
 * @description
 * # LanguageService
 * Service in the showcaseClientApp.
 */
angular.module('showcaseClientApp')
  .service('LanguageService', function () {


	this.setPreferredLanguage = function(language) {
		preferredLanguage = language;
	};

        // Lifted from: http://stackoverflow.com/a/29106129
	this.getPreferredLanguage = function() {
	
	  if ( preferredLanguage ) {
		return preferredLanguage;
	  }

          var nav = window.navigator,
                browserLanguagePropertyKeys = ['language', 'browserLanguage', 'systemLanguage', 'userLanguage'],
                i,
                language;

          // support for HTML 5.1 "navigator.languages"
          if (angular.isArray(nav.languages)) {
            for (i = 0; i < nav.languages.length; i++) {
              language = nav.languages[i];
              if (language && language.length) {
		preferredLanguage = language.split('-')[0];
                return preferredLanguage;
              }
            }
          }

          // support for other well known properties in browsers
          for (i = 0; i < browserLanguagePropertyKeys.length; i++) {
            language = nav[browserLanguagePropertyKeys[i]];
            if (language && language.length) {
	      preferredLanguage = language.split('-')[0];
              return preferredLanguage;
            }
          }

	  // Default to english
	  preferredLanguage = 'en';
          return preferredLanguage;
	};
  });
