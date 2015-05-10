'use strict';

describe('Controller: FavouritesctrlCtrl', function () {

  // load the controller's module
  beforeEach(module('showcaseClientApp'));

  var FavouritesctrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    FavouritesctrlCtrl = $controller('FavouritesctrlCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
