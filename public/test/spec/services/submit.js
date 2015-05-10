'use strict';

describe('Service: Submit', function () {

  // load the service's module
  beforeEach(module('showcaseClientApp'));

  // instantiate service
  var Submit;
  beforeEach(inject(function (_Submit_) {
    Submit = _Submit_;
  }));

  it('should do something', function () {
    expect(!!Submit).toBe(true);
  });

});
