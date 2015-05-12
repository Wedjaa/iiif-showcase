'use strict';

/**
 * @ngdoc service
 * @name showcaseClientApp.Submit
 * @description
 * # Submit
 * Service in the showcaseClientApp.
 */
angular.module('showcaseClientApp')
  .service('SubmitService', function ($q, $http, ManifestService) {

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
				uri: ManifestService.getUri(manifest),
				label: ManifestService.getLabel(manifest),
				description: ManifestService.getAllDescriptions(manifest),
				metadata: ManifestService.getMetadata(manifest),
				attribution: ManifestService.getAttribution(manifest),
				thumbnail: ManifestService.getThumbnail(manifest, 320, 200, true),
				linkback: ManifestService.getLinkback(manifest),
				license: ManifestService.getLicense(manifest)
			};

			$http.post('/api/index', indexDocument).
			  success(function(data, status, headers, config) {
				if ( data && data.success ) {
					resolve(true);
				}
				reject(new Error(data.message));
			  }).
			  error(function(data, status, headers, config) {
				reject(new Error('Index request has failed - Status: ' + status));
			  });
		});
	};

	this.indexManifest = function(manifestDescriptor) {

		var self = this;

		return $q(function(resolve, reject) {
			manifestDescriptor.indexing = false;
			manifestDescriptor.indexed = false;
			manifestDescriptor.error = false;
			manifestDescriptor.fetching = true;
			ManifestService.getManifest(manifestDescriptor.uri)
				.then(function(manifest) {
					manifestDescriptor.indexing = true;
					return self.indexFetchedManifest(manifest);
				})
				.then(function(indexedDoc) {
					manifestDescriptor.indexed = true;
					resolve(true);
				})
				.catch(function(error) {
					manifestDescriptor.error = true;
					manifestDescriptor.message = error.message;
					reject(new Error('Failed to index manifest: ' + error.toString()));
				});
		});
	};
  });
