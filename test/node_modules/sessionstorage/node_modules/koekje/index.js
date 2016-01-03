'use strict';

var has = Object.prototype.hasOwnProperty
  , monster = require('cookie-monster')
  , qs = require('querystringify')
  , storage = {}
  , prefix = '§'
  , cookie;

//
// The export interface of the cookie-monster module is quite odd, if there is
// no `document` in global it will simply not export the `get` and `set`
// methods. Causing this module to fail on `undefined` function calls. Default
// to an empty object when document doesn't exists solves it.
//
cookie = monster('undefined' !== typeof document ? document : {});

/**
 * Refresh the storage as other users might also be writing against it.
 *
 * @api private
 */
function update() {
  if (!koekje.supported) return;

  var data = cookie.get('koekje')
    , length = 0
    , key;

  storage = data && data.charAt(0) === prefix
    ? qs.parse(data.slice(1))
    : {};

  for (key in storage) {
    if (has.call(storage, key)) length++;
  }

  koekje.length = length;
}

var koekje = module.exports = {
  /**
   * The total number items stored in the storage.
   *
   * @type {Number}
   * @public
   */
  length: 0,

  /**
   * Find an item in the storage.
   *
   * @param {String} key Name of the value we lookup.
   * @returns {String|Null} Found item or null.
   * @api public
   */
  getItem: function getItem(key) {
    if (has.call(storage, key)) return storage[key];
    return null;
  },

  /**
   * Add a new item in the storage.
   *
   * @param {String} key Name under which we store the value.
   * @param {String} value Value for the key.
   * @returns {Undefined}
   * @api public
   */
  setItem: function setItem(key, value) {
    storage[key] = value;
    cookie.set('koekje', qs.stringify(storage, prefix));

    koekje.length++;
  },

  /**
   * Remove a single item from the storage.
   *
   * @param {String} key Name of the value we need to remove.
   * @returns {Undefined}
   * @api pubilc
   */
  removeItem: function removeItem(key) {
    delete storage[key];
    cookie.set('koekje', qs.stringify(storage, prefix));

    koekje.length--;
  },

  /**
   * Completely remove all items from the store.
   *
   * @returns {Undefined}
   * @api pubilc
   */
  clear: function clear() {
    storage = {};

    cookie.set('koekje', '', {
      expires: new Date(0)
    });

    koekje.length = 0;
  },

  /**
   * Is this storage system supported in the current environment.
   *
   * @type {Boolean}
   * @public
   */
  supported: (function supported() {
    return 'object' === typeof navigator && navigator.cookieEnabled;
  }()),

  /**
   * Completely re-initiate the storage.
   *
   * @type {Function}
   * @api private
   */
  update: update
};

//
// Make sure that we initialize the storage so it pre-fills the `.length`
//
update();
