describe('koekje', function () {
  'use strict';

  //
  // Needs to be defined **before** we require the module so it doesn't start
  // failing.
  //
  global.document = {
    cookie: 'koekje=%C2%A7foo%3Dbar%26bar%3Dfoo'
  };

  global.navigator = {
    cookieEnabled: true
  };

  var cs = require('./')
    , assume = require('assume');

  describe('.supported', function () {
    it('is set to true as we polyfilled', function () {
      assume(cs.supported).is.true();
    });
  });

  describe('.length', function () {
    it('has a length of 2 as our window is prefilled', function () {
      assume(cs.length).equals(2);
    });

    it('increases/decreases when we set/remove a value', function () {
      cs.setItem('beep', 'boop');
      assume(cs.length).equals(3);

      cs.removeItem('beep');
      assume(cs.length).equals(2);
    });
  });

  describe('#getItem', function () {
    it('returns null for unknown items', function () {
      assume(cs.getItem('i dont really exist')).equals(null);
    });

    it('returns the set value', function () {
      cs.setItem('set-item', 'value');

      assume(cs.getItem('set-item')).equals('value');
      assume(cs.getItem('set-item')).equals('value');
    });
  });

  describe('#setItem', function () {
    it('stores the value', function () {
      assume(cs.setItem('set-item', 'value')).equals(undefined);
      assume(cs.getItem('set-item')).equals('value');
      assume(document.cookie).includes(encodeURIComponent('set-item=value'));
    });
  });

  describe('#removeItem', function () {
    it('removes added values', function () {
      assume(cs.getItem('set-item')).equals('value');
      assume(cs.removeItem('set-item')).equals(undefined);
      assume(document.cookie).does.not.include(encodeURIComponent('set-item=value'));
    });
  });

  describe('#clear', function () {
    it('removes all values', function () {
      cs.setItem('fooboop', 'foopi');

      cs.clear();
      assume(cs.length).equals(0);
      assume(document.cookie).includes('koekje=; expires=Thu Jan 01 1970');
    });
  });

  describe('#update', function () {
    it('works without a cookie', function () {
      global.document.cookie = '';

      cs.update();
    });
  });
});
