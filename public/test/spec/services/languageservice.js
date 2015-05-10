'use strict';

describe('Service: LanguageService', function () {

  // load the service's module
  beforeEach(module('showcaseClientApp'));

  // instantiate service
  var LanguageService;
  beforeEach(inject(function (_LanguageService_) {
    LanguageService = _LanguageService_;
  }));

  it('should do something', function () {
    expect(!!LanguageService).toBe(true);
  });

});
