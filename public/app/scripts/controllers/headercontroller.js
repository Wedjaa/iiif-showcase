'use strict';

/**
 * @ngdoc function
 * @name showcaseClientApp.controller:HeadercontrollerCtrl
 * @description
 * # HeadercontrollerCtrl
 * Controller of the showcaseClientApp
 */
angular.module('showcaseClientApp')
  .controller('HeadercontrollerCtrl', function ($scope, $route, $rootScope) {
	$rootScope.favourites = {};
	$rootScope.numFavourites = 0;
	$scope.route = $route;
	$scope.$on('toggle_favourite', function(event, manifest) {
		console.log('Received toggle for: ' + manifest.uri);
		if ( $rootScope.favourites[manifest.uri] ) {
			console.log('Removing favourite');
			delete $rootScope.favourites[manifest.uri];
			manifest.favourite = false;
			$rootScope.numFavourites--;
		} else {
			console.log('Adding favourite');
			$rootScope.favourites[manifest.uri] = manifest;
			manifest.favourite = true;
			$rootScope.numFavourites++;
		}
	});
  });
