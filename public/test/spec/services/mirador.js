'use strict';

describe('Service: mirador', function () {

  // load the service's module
  beforeEach(module('showcaseClientApp'));

  // instantiate service
  var mirador;
  beforeEach(inject(function (_mirador_) {
    mirador = _mirador_;
  }));

  it('should do something', function () {
    expect(!!mirador).toBe(true);
  });

});
