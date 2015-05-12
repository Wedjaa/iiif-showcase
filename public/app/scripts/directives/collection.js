'use strict';

var scripts = document.getElementsByTagName('script');
var collectionDirectivePath = scripts[scripts.length-1].src;
var collectionDirectiveTpl = collectionDirectivePath.replace(/\.js/, '.html');

/**
 * @ngdoc directive
 * @name showcaseClientApp.directive:collection
 * @description
 * # collection
 */
angular.module('showcaseClientApp')
  .directive('collection', function ($rootScope, HitService, MiradorService) {
    return {
      scope: {
	 manifest: '=',
	 favourite: '='
      },
      templateUrl: collectionDirectiveTpl,
      restrict: 'E',
      link: function postLink(scope /*, element, attrs */) {
	var manifestObject = scope.manifest;
	scope.license = HitService.getLicense(manifestObject);
	scope.attribution = HitService.getAttribution(manifestObject);
	scope.label = HitService.getLabel(manifestObject);
	scope.description = HitService.getDescription(manifestObject);	
	scope.linkback = HitService.getLinkback(manifestObject);	
	scope.thumbnail = HitService.getThumbnail(manifestObject);
	scope.loaded = true;
	scope.toggleFavourite = function() {
		$rootScope.$broadcast('toggle_favourite', manifestObject);
		scope.favourite = !scope.favourite;
	}
	scope.openMirador = function() {
		MiradorService.open(manifestObject);
		return false;
	}
      }
    };
  });
