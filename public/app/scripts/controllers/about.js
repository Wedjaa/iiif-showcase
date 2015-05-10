'use strict';

/**
 * @ngdoc function
 * @name showcaseClientApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the showcaseClientApp
 */
angular.module('showcaseClientApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
