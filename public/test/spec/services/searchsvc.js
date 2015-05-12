'use strict';

describe('Service: searchsvc', function () {

  // load the service's module
  beforeEach(module('showcaseClientApp'));

  // instantiate service
  var searchsvc;
  beforeEach(inject(function (_searchsvc_) {
    searchsvc = _searchsvc_;
  }));

  it('should do something', function () {
    expect(!!searchsvc).toBe(true);
  });

});
