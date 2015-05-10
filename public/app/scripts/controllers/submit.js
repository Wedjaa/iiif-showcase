'use strict';

/**
 * @ngdoc function
 * @name showcaseClientApp.controller:SubmitCtrl
 * @description
 * # SubmitCtrl
 * Controller of the showcaseClientApp
 */
angular.module('showcaseClientApp')
  .controller('SubmitCtrl', function ($scope, $q, SubmitService) {
    $scope.submit = SubmitService;
    $scope.manifestText = {};
    $scope.manifestText.content = '';

    $scope.indexManifests = function() {

	var promises = $scope.manifestList.map(function(manifest) {
		if ( manifest.selected ) {
			return SubmitService.indexManifest(manifest);
		}
	});

	$q.all(promises)
		.then(function() {
			console.log("Done!");
		});	
    }

    $scope.parseManifests = function() {
	SubmitService.parseManifests($scope.manifestText.content)
		.then(function(parsedManifests) {
			$scope.manifestList = parsedManifests;
		});
    }

    $scope.selectAll = function() {
	$scope.manifestList.map(function(manifest) { manifest.selected = !$scope.selectedAll });
	$scope.selectedAll = !$scope.selectedAll;
    }

    $scope.uploadFile = function(ele) {
		SubmitService.readFile(ele.files[0])
			.then(function(manifests) {
				$scope.manifestText.content = manifests;
				return SubmitService.parseManifests(manifests);
			})
			.then(function(manifestObjs) {
				$scope.manifestList = manifestObjs;
			})
			.catch(function(error) {
				console.log("Error: " + error.message);
			});
	};
  });
