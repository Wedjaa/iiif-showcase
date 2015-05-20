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
        $scope.query.terms = [];
        $scope.hits = [];
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

        $scope.pager = false;
        $scope.page = 0;
        $scope.range = function(numpages) {
                return new Array(numpages);
        };

        $scope.gotoPage = function(page_num) {
                SearchSvc.search($scope.query.terms, $scope.query.attribution, 20, page_num)
                        .then(function(results) {
                                $scope.page = page_num;
                                $scope.collections = results.results;
                        });
        }

	$scope.$watch('query.attribution', function() {
                SearchSvc.search($scope.query.terms, $scope.query.attribution, 20, 0, true)
                        .then(function(results) {
                                if ( results.results ) {
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

        $scope.$watchCollection('query.terms', function() {
                SearchSvc.search($scope.query.terms, $scope.query.attribution, 20, 0, true)
                        .then(function(results) {
                                if ( results.results ) {
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

  });
