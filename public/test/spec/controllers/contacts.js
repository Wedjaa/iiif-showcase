'use strict';

describe('Controller: ContactsctrlCtrl', function () {

  // load the controller's module
  beforeEach(module('showcaseClientApp'));

  var ContactsctrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ContactsctrlCtrl = $controller('ContactsctrlCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
