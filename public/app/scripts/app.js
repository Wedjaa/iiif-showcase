'use strict';

/**
 * @ngdoc overview
 * @name showcaseClientApp
 * @description
 * # showcaseClientApp
 *
 * Main module of the application.
 */
angular
  .module('showcaseClientApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
	tabName: 'main'
      })
      .when('/explore', {
        templateUrl: 'views/explore.html',
        controller: 'ExploreCtrl',
	tabName: 'explore'
      })
      .when('/favourites', {
        templateUrl: 'views/favourites.html',
        controller: 'FavouritesCtrl',
	tabName: 'favourites'
      })
      .when('/submit', {
        templateUrl: 'views/submit.html',
        controller: 'SubmitCtrl',
	tabName: 'submit'
      })
      .when('/links', {
        templateUrl: 'views/links.html',
        controller: 'LinksCtrl',
	tabName: 'links'
      })
      .when('/contacts', {
        templateUrl: 'views/contacts.html',
        controller: 'ContactsCtrl',
	tabName: 'contacts'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
