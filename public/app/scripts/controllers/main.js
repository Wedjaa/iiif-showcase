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
	$scope.sample = 'http://www.e-codices.unifr.ch/metadata/iiif/zbz-D0217/manifest.json';
	$scope.suggester = SuggesterSvc;
 	$scope.terms = [];
	$scope.hits = [];
	$scope.$watchCollection('terms', function() {
		SearchSvc.search($scope.terms) 
			.then(function(results) {
				$scope.collections = results;
			});
	});
	$scope.favourite = false;
  });
