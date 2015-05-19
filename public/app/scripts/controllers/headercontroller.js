'use strict';

/**
 * @ngdoc function
 * @name showcaseClientApp.controller:HeadercontrollerCtrl
 * @description
 * # HeadercontrollerCtrl
 * Controller of the showcaseClientApp
 */
angular.module('showcaseClientApp')
  .controller('HeadercontrollerCtrl', function ($scope, $route, $rootScope, AuthService) {
	$rootScope.favourites = {};
	$rootScope.numFavourites = 0;
	$scope.route = $route;
	$scope.loginForm = {};

	
	$scope.$on('clear_favourites', function(event) {
	  $rootScope.favourites = {};
	  $rootScope.numFavourites = 0;
	});

	$scope.$on('user_login', function(event, user) {
		$scope.isLoggedIn = true;
	});

	$scope.$on('user_logout', function(event, user) {
		$scope.isLoggedIn = false;
	});

	// If the user is already logged in this
	// will generate a login event.
	AuthService.check();

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

	$scope.login = function() {
		console.log('Trying to login');
		AuthService.login($scope.loginForm.username, $scope.loginForm.password)
			.then(function(user) {
			})
			.catch(function(error) {
				$scope.error('Error logging in: ' + error.message);
			});
	};

	$scope.logout = function() {
		AuthService.logout()
			.then(function(done) {
			})
			.catch(function(error) {
				console.log('Error logging out: ' + error.message);
			});
	};
		
  });
