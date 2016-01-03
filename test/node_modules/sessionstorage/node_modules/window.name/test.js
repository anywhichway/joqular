describe('window.name', function () {
  'use strict';

  //
  // Polyfill
  //
  global.window = {
    name: '§foo=bar&bar=foo'
  };

  var ws = require('./')
    , assume = require('assume');

  describe('.supported', function () {
    it('is set to true as we polyfilled', function () {
      assume(ws.supported).is.true();
    });
  });

  describe('.length', function () {
    it('has a length of 2 as our window is prefilled', function () {
      assume(ws.length).equals(2);
    });

    it('increases/decreases when we set/remove a value', function () {
      ws.setItem('beep', 'boop');
      assume(ws.length).equals(3);

      ws.removeItem('beep');
      assume(ws.length).equals(2);
    });
  });

  describe('#getItem', function () {
    it('returns null for unknown items', function () {
      assume(ws.getItem('i dont really exist')).equals(null);
    });

    it('returns the set value', function () {
      ws.setItem('set-item', 'value');

      assume(ws.getItem('set-item')).equals('value');
      assume(ws.getItem('set-item')).equals('value');
    });
  });

  describe('#setItem', function () {
    it('stores the value', function () {
      assume(ws.setItem('set-item', 'value')).equals(undefined);
      assume(ws.getItem('set-item')).equals('value');
      assume(window.name).includes('set-item=value');
    });
  });

  describe('#removeItem', function () {
    it('removes added values', function () {
      assume(ws.getItem('set-item')).equals('value');
      assume(ws.removeItem('set-item')).equals(undefined);
      assume(window.name).does.not.include('set-item=value');
    });
  });

  describe('#clear', function () {
    it('removes all values', function () {
      ws.setItem('fooboop', 'foopi');

      ws.clear();
      assume(ws.length).equals(0);
      assume(window.name).equals('');
    });
  });
});
