'use strict';

describe('Controller: LinksctrlCtrl', function () {

  // load the controller's module
  beforeEach(module('showcaseClientApp'));

  var LinksctrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    LinksctrlCtrl = $controller('LinksctrlCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
