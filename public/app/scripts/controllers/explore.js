'use strict';

/**
 * @ngdoc function
 * @name showcaseClientApp.controller:ExploreCtrl
 * @description
 * # ExploreCtrl
 * Controller of the showcaseClientApp
 */
angular.module('showcaseClientApp')
  .controller('ExploreCtrl', function ($scope, SearchSvc, SuggesterSvc) {
	$scope.query = {};
        $scope.suggester = SuggesterSvc;
        $scope.terms = [];
        $scope.hits = [];
        $scope.$watchCollection('terms', function() {
                SearchSvc.search($scope.terms)
                        .then(function(results) {
                                $scope.collections = results;
                        });
        });
	SearchSvc.attributions()
		.then(function(attributions) {
			if ( attributions && attributions.length > 0 ) {
				$scope.query.attribution = attributions[0].attribution;
				$scope.attributions = attributions;
			}
		})
		.catch(function(error) {
			console.log(error);
		});
  });
