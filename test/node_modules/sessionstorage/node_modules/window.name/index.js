'use strict';

var has = Object.prototype.hasOwnProperty
  , qs = require('querystringify')
  , storage = {}
  , prefix = '§';

/**
 * Refresh the storage as other users might also be writing against it.
 *
 * @api private
 */
function update() {
  if (!windowStorage.supported) return;

  var data = window.name
    , length = 0
    , key;

  storage = data.charAt(0) === prefix
    ? qs.parse(data.slice(1))
    : {};

  for (key in storage) {
    if (has.call(storage, key)) length++;
  }

  windowStorage.length = length;
}

/**
 * A DOM storage wrapper which abuses the window.name property to temporarily
 * store values in the browser.
 *
 * @type {Object}
 * @public
 */
var windowStorage = module.exports = {
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
    window.name = qs.stringify(storage, prefix);

    windowStorage.length++;
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
    window.name = qs.stringify(storage, prefix);

    windowStorage.length--;
  },

  /**
   * Completely remove all items from the store.
   *
   * @returns {Undefined}
   * @api pubilc
   */
  clear: function clear() {
    storage = {};
    window.name = '';
    windowStorage.length = 0;
  },

  /**
   * Is this storage system supported in the current environment.
   *
   * @type {Boolean}
   * @public
   */
  supported: (function supported() {
    return 'object' === typeof window && 'string' === typeof window.name;
  }())
};

//
// Make sure that we initialize the storage so it pre-fills the `.length`
//
update();
