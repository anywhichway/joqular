describe('sessionStorage', function () {
  'use strict';

  var assume = require('assume')
    , sessionStorage = require('./');

  it('is exported as object', function () {
    assume(sessionStorage).is.a('object');
  });

  it('as the API methods', function () {
    assume(sessionStorage.getItem).is.a('function');
    assume(sessionStorage.setItem).is.a('function');
    assume(sessionStorage.removeItem).is.a('function');
    assume(sessionStorage.clear).is.a('function');
    assume(sessionStorage.length).is.a('number');
  });
});
