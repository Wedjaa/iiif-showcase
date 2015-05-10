'use strict';

/**
 * @ngdoc function
 * @name showcaseClientApp.controller:FavouritesctrlCtrl
 * @description
 * # FavouritesctrlCtrl
 * Controller of the showcaseClientApp
 */
angular.module('showcaseClientApp')
  .controller('FavouritesCtrl', function ($scope, $rootScope,  MiradorService) {
	$scope.openMirador = function() {
		MiradorService.openFavourites($rootScope.favourites);
	}
  });
