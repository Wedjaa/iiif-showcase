'use strict';

describe('Service: ManifestService', function () {

  // load the service's module
  beforeEach(module('showcaseClientApp'));

  // instantiate service
  var ManifestService;
  beforeEach(inject(function (_ManifestService_) {
    ManifestService = _ManifestService_;
  }));

  it('should do something', function () {
    expect(!!ManifestService).toBe(true);
  });

});
