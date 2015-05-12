'use strict';

describe('Service: SuggesterSvc', function () {

  // load the service's module
  beforeEach(module('showcaseClientApp'));

  // instantiate service
  var SuggesterSvc;
  beforeEach(inject(function (_SuggesterSvc_) {
    SuggesterSvc = _SuggesterSvc_;
  }));

  it('should do something', function () {
    expect(!!SuggesterSvc).toBe(true);
  });

});
