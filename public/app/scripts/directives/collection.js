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
  .directive('collection', function ($rootScope, ManifestService, MiradorService) {
    return {
      scope: {
	 manifest: '=',
	 favourite: '='
      },
      templateUrl: collectionDirectiveTpl,
      restrict: 'E',
      link: function postLink(scope /*, element, attrs */) {
	scope.spinner = collectionDirectivePath.replace(/\.js/, '.gif');
	ManifestService.getManifest(scope.manifest)
		.then(function(manifestObject) {
			scope.license = ManifestService.getLicense(manifestObject);
			scope.attribution = ManifestService.getAttribution(manifestObject);
			scope.label = ManifestService.getLabel(manifestObject);
			scope.description = ManifestService.getDescription(manifestObject);	
			scope.linkback = ManifestService.getLinkback(manifestObject);	
			scope.thumbnail = ManifestService.getThumbnail(manifestObject, 320, 200);
			scope.loaded = true;
			scope.toggleFavourite = function() {
				$rootScope.$broadcast('toggle_favourite', manifestObject);
				scope.favourite = !scope.favourite;
			}
			scope.openMirador = function() {
				MiradorService.open(manifestObject);
				return false;
			}
		})
		.catch(function(error) {
			console.log('Error: ' + error.message);
		});
      }
    };
  });
