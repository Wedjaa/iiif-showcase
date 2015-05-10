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
		console.log('Received toggle for: ' + manifest['@id']);
		if ( $rootScope.favourites[manifest['@id']] ) {
			console.log('Removing favourite');
			delete $rootScope.favourites[manifest['@id']];
			manifest.favourite = false;
			$rootScope.numFavourites--;
		} else {
			console.log('Adding favourite');
			$rootScope.favourites[manifest['@id']] = manifest;
			manifest.favourite = true;
			$rootScope.numFavourites++;
		}
	});
  });
