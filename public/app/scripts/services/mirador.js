'use strict';

// From: http://stackoverflow.com/a/1349426
function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

function manifestsToLinks(manifests) {
	return manifests.reduce(function(processed, manifest) {
		processed.push({
			manifestUri: manifest['@id'],
			location: manifest['attribution']
		});
		return processed;
	}, []);
}

/**
 * @ngdoc service
 * @name showcaseClientApp.mirador
 * @description
 * # mirador
 * Service in the showcaseClientApp.
 */
angular.module('showcaseClientApp')
  .service('MiradorService', function () {

	this.openFavourites = function(favourites) {
		this.open(
			Object.keys(favourites).reduce(function(manifestArray, currentKey) {
				manifestArray.push(favourites[currentKey]);
				return manifestArray;
			}, [])
		);
	};

	this.open = function(manifests) {

                // Handle single manifests
                if ( !angular.isArray(manifests) ) {
                  var arrayManifests = [];
                  arrayManifests.push(manifests);
                  manifests = arrayManifests;
                }

                var manifestsLinks = manifestsToLinks(manifests);

		var miradorWindow = window.open('/mirador/index.html', 'mirador_' + makeid());
		if (!miradorWindow) {
			alert('Could not open Mirador windows - check for blocked pop-ups');
		} else {
			miradorWindow.addEventListener('load', function() {
				console.log('Initializing Mirador Window');
				miradorWindow.initialize(manifestsLinks);
			});
		}
	};
  });
