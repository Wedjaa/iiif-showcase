'use strict';

/**
 * @ngdoc function
 * @name showcaseClientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the showcaseClientApp
 */
angular.module('showcaseClientApp')
  .controller('MainCtrl', function ($scope) {
	$scope.sample = 'http://www.e-codices.unifr.ch/metadata/iiif/kba-0026-4/manifest.json';
	$scope.favourite = false;
  });
