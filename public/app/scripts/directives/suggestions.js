'use strict';

var scripts = document.getElementsByTagName('script');
var suggestionsDirectivePath = scripts[scripts.length-1].src;
var suggestionsDirectiveTpl = suggestionsDirectivePath.replace(/\.js/, '.html');

/**
 * @ngdoc directive
 * @name showcaseClientApp.directive:suggestions
 * @description
 * # suggestions
 */
angular.module('showcaseClientApp')
  .directive('suggestions', function () {
    return {
      restrict: 'E',
      templateUrl: suggestionsDirectiveTpl,
      scope: {
          terms: '=',
          selected: '='
      },
      replace: 'true',
      link: function(scope, elem, attrs) {
      }
    };
  });
