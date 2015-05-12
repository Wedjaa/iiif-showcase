'use strict';

/**
 * @ngdoc function
 * @name showcaseClientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the showcaseClientApp
 */
angular.module('showcaseClientApp')
  .controller('MainCtrl', function ($scope,SuggesterSvc) {
	$scope.sample = 'http://www.e-codices.unifr.ch/metadata/iiif/zbz-D0217/manifest.json';
	$scope.suggester = SuggesterSvc;
 	$scope.terms = [];
	$scope.favourite = false;
  });
