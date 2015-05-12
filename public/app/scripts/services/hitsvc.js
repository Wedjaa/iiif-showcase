'use strict';

/**
 * @ngdoc service
 * @name showcaseClientApp.HitService
 * @description
 * # HitService
 * Service in the showcaseClientApp.
 */
angular.module('showcaseClientApp')
  .service('HitService', function ($http, $q, LanguageService) {

	this.getLinkback = function(manifest) {
		return manifest.linkback;
	};

	this.getLicense = function(manifest) {
		return manifest.license;
	};

	this.getAttribution = function(manifest) {
		return manifest.attribution;
	};

	this.getLabel = function(manifest) {
		return manifest.label;
	};

	this.getUri = function(manifest) {
		return manifest.uri;
	};

	this.getObjectValue = function(valueObj) {

		if (typeof valueObj === 'string' ) {
			return valueObj;
		}

		if ( valueObj.value ) {
			return valueObj.value;
		}

		return valueObj.toString();
	};

	this.getPropertyValue = function(value, lang) {

		var self = this;

		if ( typeof value === 'string' ) {
			return value;
		}

		if ( angular.isArray(value) ) {

			var selectedValues =  value.reduce(function(values, currentVal) {
				if (!lang) {
					values.push(self.getObjectValue(currentVal));
				} else {
					if (currentVal.lang && currentVal.lang === lang ) {	
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
		
		return  value.toString();;
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
		return manifest.thumbnail;
	};
	
  });
