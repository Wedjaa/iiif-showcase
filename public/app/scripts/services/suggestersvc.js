'use strict';

/**
 * @ngdoc service
 * @name showcaseClientApp.SuggesterSvc
 * @description
 * # SuggesterSvc
 * Service in the showcaseClientApp.
 */
angular.module('showcaseClientApp')
  .service('SuggesterSvc', function($q, $http) {
    
    function suggest(terms, hint, attribution) {
	return new $q(function(resolve, reject) {
		var query = {
			value: hint,
			terms: terms,
			attribution: attribution
		};

		$http.post('/api/search/suggest', query)
			.success(function(data) {
				console.log(data);
				if (!data.success) {
					reject(new Error('Error fetching suggestions: ' + data.message));
					return;
				}
				resolve(data.details);
			})
			.error(function(data,status) {
				reject(new Error('Error fetching suggestions. Status: ' + status));
			});
	});
		
    }
    
    return {
        suggest: function(terms, complete, attribution) {
	    return new $q(function(resolve, reject) { 
		    var hint = complete.split(/\s/).slice(-1)[0];
		    console.log('Last hint: ' + hint);
		    if ( hint.length === 0 ) {
			resolve([]);
		    }
		    suggest(terms, hint, attribution)
			.then(function(suggestions) {
				resolve(suggestions);
			})
			.catch(function(error) {
				console.log('Error fetching suggestions: ' + error.message);
				resolve([]);
			});
	    });
        }
    };
});
