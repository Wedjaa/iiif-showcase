'use strict';

/**
 * @ngdoc function
 * @name showcaseClientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the showcaseClientApp
 */
angular.module('showcaseClientApp')
  .controller('MainCtrl', function ($scope, $q, SuggesterSvc, SearchSvc) {
	$scope.suggester = SuggesterSvc;
 	$scope.terms = [];
	$scope.hits = [];
	$scope.pager = false;
	$scope.page = 0;
	$scope.range = function(numpages) {
		return new Array(numpages);
	};

	$scope.gotoPage = function(page_num) {
		SearchSvc.search($scope.terms, undefined, 20, page_num) 
			.then(function(results) {
				$scope.page = page_num;
				$scope.collections = results.results;
			});
	}

	$scope.$watchCollection('terms', function() {
		SearchSvc.search($scope.terms) 
			.then(function(results) {
				if ( results.results && results.results.length > 0 ) {
					$scope.collections = results.results;
					$scope.total = results.total;
					$scope.count = results.results.length;
					if ( $scope.total > $scope.count ) {
						$scope.pager = true;
						$scope.page_size = $scope.count;
						$scope.pages = Math.ceil($scope.total / $scope.page_size);
						$scope.page = 0;
						console.log('Paging - pages: ' + $scope.pages);
					} else {
						$scope.pager = false;
					}
					console.log('Showing ' + $scope.count + ' of ' + $scope.total);
				}
			});
	});
	$scope.favourite = false;
  });
