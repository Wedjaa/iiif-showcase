'use strict';

describe('Service: hitsvc', function () {

  // load the service's module
  beforeEach(module('showcaseClientApp'));

  // instantiate service
  var hitsvc;
  beforeEach(inject(function (_hitsvc_) {
    hitsvc = _hitsvc_;
  }));

  it('should do something', function () {
    expect(!!hitsvc).toBe(true);
  });

});
