'use strict';

/**
 * @ngdoc service
 * @name showcaseClientApp.ManifestService
 * @description
 * # ManifestService
 * Service in the showcaseClientApp.
 */
angular.module('showcaseClientApp')
  .service('ManifestService', function ($http, $q, LanguageService) {

	this.getManifest = function(manifestUrl) {
	    return $q(function(resolve, reject) { 
		$http.get(manifestUrl).
		  success(function(data /*, status, headers, config */) {
			resolve(data);
		  }).
		  error(function(data, status /*, headers, config */) {
			reject(status);
		  });	
	    });	
	};

	this.getLinkback = function(manifest) {

		// Trying to get a link back to where this collection
		// has been found.
		if ( manifest.within ) {
			return manifest.within;
	 	}

		// Try and see if we can point them to the service
		if ( manifest.service ) {
			return manifest.service;
		}	

		// We are desperate now
		var idParser = document.createElement('a');
		idParser.href = manifest['@id'];
		return idParser.protocol + '//' + idParser.host + ( idParser.port ? ':' + idParser.port : '' ) + '/';
		
	};

	this.getLicense = function(manifest) {
		return manifest.license ? manifest.license : 'No License';
	};

	this.getAttribution = function(manifest) {
		return manifest.attribution ? manifest.attribution : 'No Attribution';
	};

	this.getLabel = function(manifest) {
		return manifest.label ? manifest.label : 'Untitled';
	};

	this.getUri = function(manifest) {
		return manifest['@id'];
	};

	this.getObjectValue = function(valueObj) {
		var objValue = {
			lang: 'en'
		};
		if (typeof valueObj === 'string' ) {
			objValue.value = valueObj;
			return objValue;
		}
		if ( valueObj['@value'] ) {
			objValue.lang = valueObj['@language'];
			objValue.value = valueObj['@value'];
			return objValue;
		}
		objValue.value = valueObj.toString();
		return objValue;
	};

	this.getPropertyValue = function(value, lang) {

		var self = this;

		if ( typeof value === 'string' ) {
			var objValue = {
				lang: 'en',
				value: value
			};
			return objValue;
		}

		if ( angular.isArray(value) ) {

			var selectedValues =  value.reduce(function(values, currentVal) {
				if (!lang) {
					values.push(self.getObjectValue(currentVal));
				} else {
					if (currentVal['@language'] && currentVal['@language'] === lang ) {	
						values.push(self.getObjectValue(currentVal));
					}
				}
				return values;
			}, []);	

			if ( selectedValues.length === 1 ) {
				return selectedValues[0];
			}

			return selectedValues;
		}
		
		return  {lang: 'en', value: ''};
	};

	this.getProperty = function(manifest, property) {
		var self = this;
		var lang = LanguageService.getPreferredLanguage();

		return this.getPropertyValue(manifest[property], lang);
	};

	this.getAllProperties = function(manifest, property) {
		return this.getPropertyValue(manifest[property]);
	};


	this.getDescription = function(manifest) {
		return this.getProperty(manifest, 'description');
	};

	this.getAllDescriptions = function(manifest) {
		return this.getAllProperties(manifest, 'description');
	};

	this.getMetadata = function(manifest) {
		var metadata = [];
		if ( manifest.metadata ) {
			for ( var metaIdx in manifest.metadata ) {
				var meta = manifest.metadata[metaIdx];
				if ( meta.label ) {
					var metaObj = {};
					metaObj.label = meta.label;
					metaObj.value = this.getPropertyValue(meta.value);
					metadata.push(metaObj);
				}
			}
		}
		return metadata;
	};

	this.isIIIFProfile = function(profile) {
		if (typeof profile === 'undefined') {
			return false;
		}
		if (typeof profile !== 'string') {
			return false;
		}
		if ( profile.startsWith('http://iiif.io/api/image') ) {
			return true;
		}
		if ( profile.startsWith('http://library.stanford.edu/iiif/image-api') ) {
			return true;
		}
		return false;
	}

	this.getImageThumbUri = function(resource, maxWidth, maxHeight) {

		if ( !resource || 
			!resource.service || 
				!resource.service.profile ||
					!this.isIIIFProfile(resource.service.profile)) {
			return '/images/rodent.jpg';
		} 

		var iiifEndpoint = resource.service['@id'];
		maxWidth = maxWidth ? maxWidth : 320;
		maxHeight = maxHeight ? maxHeight : 200;
		var thumbUrl = iiifEndpoint + '/full/!' + maxWidth + ',' + maxHeight + '/0/default.jpg';
		return thumbUrl;	
	};

	this.parseThumbnail = function(thumb, maxWidth, maxHeight) {
		if ( typeof thumb === 'string' ) {
			return thumb;
		}
		var thumbUri = this.getImageThumbUri(thumb);
		return thumbUri;
	}

	this.getThumbnail = function(manifest, maxWidth, maxHeight, notRandom) {

		var self = this;

		// First off - use the one in the manifest
		if ( manifest.thumbnail ) {
			return this.parseThumbnail(manifest.thumbnail, maxWidth, maxHeight);
		}

		if ( ! manifest.sequences || !manifest.sequences[0] ) {
			// botched manifest, no sequence in here
			return '/images/rodent.jpg';
		}

		var sequence = manifest.sequences[0];

		// Or the thumb of the first sequence
		if ( sequence.thumbnail ) {
			return this.parseThumbnail(sequence.thumbnail, maxWidth, maxHeight);
		}

		// Another botched manifest had no canvases
		if ( !sequence.canvases || sequence.canvases.length === 0 ) {
			return '/images/rodent.jpg';
		}	

		var canvas = sequence.canvases[0];	
		if ( !notRandom ) {
			canvas = sequence.canvases[Math.floor(Math.random() * sequence.canvases.length)];
		}
	
		// Or the thumb of the canvas 
		if ( canvas.thumbnail ) {
			return this.parseThumbnail(canvas.thumbnail, maxWidth, maxHeight);
		}

		var images = canvas.images ? canvas.images : canvas.resources;

		// Another botched manifest had no images 
		if ( !images || images.length === 0 ) {
			return '/images/rodent.jpg';
		}

		// Get the first one
		var image = images[0];

		if ( image.thumbnail ) {
			return this.parseThumbnail(image.thumbnail, maxWidth, maxHeight);
		}		

		return self.getImageThumbUri(image.resource, maxWidth, maxHeight);
	
	};
	
  });
