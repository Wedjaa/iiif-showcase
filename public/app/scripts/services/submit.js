'use strict';

/**
 * @ngdoc service
 * @name showcaseClientApp.Submit
 * @description
 * # Submit
 * Service in the showcaseClientApp.
 */
angular.module('showcaseClientApp')
  .service('SubmitService', function ($q, ManifestService) {

	this.hasFileRead = function() {
		if (window.File && window.FileReader && window.FileList && window.Blob) {
			return true;
		}
		return false;
	};

	this.readFile = function(file) {
            return $q(function(resolve, reject) {
		if ( !file ) {
			reject(new Error("Was not able to read the file"));
			return;
		}
		var fReader = new FileReader();
		fReader.onload = function(loaded) { 
			resolve(loaded.target.result);
		};	
		fReader.readAsText(file);
            });
	};

	this.loadManifests = function(file) {
		this.readFile(file)
			.then(function(textContent) {
				return $q(function(resolve, reject) {
					resolve(textList.match(/[^\r\n]+/g).map(function(manifest) { return { uri: manifest, selected: false }; }));
				});
			});
	};

	this.parseManifests = function(textList) {
		return $q(function(resolve, reject) {
			resolve(textList.match(/[^\r\n]+/g).map(function(manifest) { return { uri: manifest, selected: false }; }));
		});
	};
	
	this.indexFetchedManifest = function(manifest) {
		return $q(function(resolve, reject) {

			var indexDocument = {
				label: ManifestService.getLabel(manifest),
				description: ManifestService.getAllDescriptions(manifest),
				metadata: ManifestService.getMetadata(manifest),
				attribution: ManifestService.getAttribution(manifest),
				thumbnail: ManifestService.getThumbnail(manifest, 320, 200, true)
			};

			console.log("Index: " + JSON.stringify(indexDocument, undefined, 4));
			resolve(indexDocument);
		});
	};

	this.indexManifest = function(manifestDescriptor) {

		var self = this;

		return $q(function(resolve, reject) {
			ManifestService.getManifest(manifestDescriptor.uri)
				.then(function(manifest) {
					manifestDescriptor.fetched = true;
					return self.indexFetchedManifest(manifest);
				})
				.then(function(indexedDoc) {
					manifestDescriptor.indexed = true;
				})
				.catch(function(error) {
					manifestDescriptor.error = true;
					manifestDescriptor.message = error.message;
					reject(new Error('Failed to read manifest for indexing: ' + error.toString()));
				});
		});
	};
  });
