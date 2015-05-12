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

	this.getThumbnail = function(manifest, maxWidth, maxHeight, notRandom) {

		// First off - use the one in the manifest
		if ( manifest.thumbnail ) {
			return manifest.thumbnail;
		}

		if ( ! manifest.sequences || !manifest.sequences[0] ) {
			// botched manifest, no sequence in here
			return '/images/rodent.jpg';
		}

		var sequence = manifest.sequences[0];

		// Or the thumb of the first sequence
		if ( sequence.thumbnail ) {
			return sequence.thumbnail;
		}

		// Another botched manifest had no canvases
		if ( !sequence.canvases || sequence.canvases.length === 0 ) {
			return '/images/rodent.jpg';
		}	

		// Ok - let's use a random page	
		var canvas = sequence.canvases[Math.floor(Math.random() * sequence.canvases.length)];
	
		// - unless we are told not to
		if ( notRandom ) {
			canvas = sequence.canvases[0];
		}
	
		// Or the thumb of the canvas 
		if ( canvas.thumbnail ) {
			return canvas.thumbnail;
		}

		// Another botched manifest had no images 
		if ( !canvas.images || canvas.images.length === 0 ) {
			return '/images/rodent.jpg';
		}

		// Get the first one
		var image = canvas.images[0];

		if ( image.thumbnail ) {
			return image.thumbnail;
		}		

	
		// Ok - find out if we have a resource and a service to get
		// a thumbnail generated for us.
	
		if ( !image.resource || 
			!image.resource.service || 
				!image.resource.service.profile ||
					!image.resource.service.profile.startsWith('http://library.stanford.edu/iiif/image-api')) {
			return '/images/rodent.jpg';
		} 

		// Ok - generate our own thumbnail
		var iiifEndpoint = image.resource.service['@id'];
		maxWidth = maxWidth ? maxWidth : 320;
		maxHeight = maxHeight ? maxHeight : 200;
		var thumbUrl = iiifEndpoint + '/full/!' + maxWidth + ',' + maxHeight + '/0/default.jpg';
		return thumbUrl;	
	};
	
  });
