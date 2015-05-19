'use strict';

/**
 * @ngdoc service
 * @name showcaseClientApp.SearchSvc
 * @description
 * # SearchSvc
 * Service in the showcaseClientApp.
 */
angular.module('showcaseClientApp')
  .service('SearchSvc', function($q, $http) {
    
    function search(terms) {
	return new $q(function(resolve, reject) {

		var query = {
			terms: terms
		};

		if ( !terms || terms.length === 0 ) {
			resolve([]);
		};

		$http.post('/api/search/query', query)
			.success(function(data) {
				console.log(data);
				if (!data.success) {
					reject(new Error('Error fetching results: ' + data.message));
					return;
				}
				resolve(data.details);
			})
			.error(function(data,status) {
				reject(new Error('Error fetching results. Status: ' + status));
			});
	});
		
    }

    function attributions() {
	return new $q(function(resolve, reject) {

		$http.get('/api/search/attributions')
			.success(function(data) {
				console.log(data);
				if (!data.success) {
					reject(new Error('Error fetching results: ' + data.message));
					return;
				}
				resolve(data.details);
			})
			.error(function(data,status) {
				reject(new Error('Error fetching results. Status: ' + status));
			});
	});
    }
    
    return {
	attributions: attributions,
        search: function(terms) {
	    return new $q(function(resolve, reject) { 
		    if ( terms.length === 0 ) {
			resolve({});
		    }
		    search(terms)
			.then(function(results) {
				resolve(results);
			})
			.catch(function(error) {
				console.log('Error fetching results: ' + error.message);
				resolve({});
			});
	    });
        }
    };
});
