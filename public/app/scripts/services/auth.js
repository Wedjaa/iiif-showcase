'use strict';

/**
 * @ngdoc service
 * @name showcaseClientApp.Auth
 * @description
 * # Auth
 * Service in the showcaseClientApp.
 */
angular.module('showcaseClientApp')
  .service('AuthService', function ($q, $http, $rootScope) {

    function login(username, password) {
        return new $q(function(resolve, reject) {

                var loginInfo = {
                        username: username,
			password: password
                };

                $http.post('/auth/login', loginInfo)
                        .success(function(data) {
                                console.log(data);
                                if (!data.success) {
                                        reject(new Error('Error logging in: ' + data.message));
                                        return;
                                }
				$rootScope.$broadcast('user_login', data.details);
                                resolve(data.details);
                        })
                        .error(function(data,status) {
                                reject(new Error('Error logging in. Status: ' + status));
                        });
        });
    }

    function checkAuth() {
	return new $q(function(resolve, reject) {
		$http.get('/auth/user')
			.success(function(data) {
				if (data.success) {
					$rootScope.$broadcast('user_login', data.details);
					resolve(data.details);
					return;
				}	
			})
			.error(function(data, status) {
				reject(new Error('Failed user check request: ' + status));
			});
	});
    }

    function logout() {
	return new $q(function(resolve, reject) {
		$http.get('/auth/logout')
			.success(function(data) {
				// We did our best effort
				$rootScope.$broadcast('user_logout');
				resolve(true);
			})
			.error(function(data, status) {
				reject(new Error('Failed logout request: ' + status));
			});
	});
    };

   return {
	check: checkAuth,
	login: login,
	logout: logout
   };

  });
