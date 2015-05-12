'use strict';

describe('Directive: typeahead', function () {

  // load the directive's module
  beforeEach(module('showcaseClientApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<typeahead></typeahead>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the typeahead directive');
  }));
});
