'use strict';

exports = module.exports = function (doc) {
  if (!doc) doc = {};
  if (typeof doc === 'string') doc = { cookie: doc };
  if (doc.cookie === undefined) doc.cookie = '';

  var self = {};
  self.get = function (key) {
    var cookiesSplat = doc.cookie.split(/;\s*/);
    for (var i = 0; i < cookiesSplat.length; i++) {
      var ps = cookiesSplat[i].split('=');
      var k = decodeURIComponent(ps[0]);
      if (k === key) return decodeURIComponent(ps[1]);
    }
  };

  self.set = function (key, value, opts) {
    if (!opts) opts = {};
    var newCookie = encodeURIComponent(key) + '=' + encodeURIComponent(value);

    if (opts.hasOwnProperty('expires')){
      newCookie += '; expires=' + opts.expires;
    }

    if (opts.hasOwnProperty('path')) {
      newCookie += '; path=' + opts.path;
    }

    if (opts.hasOwnProperty('domain')) {
      newCookie += '; domain=' + opts.domain;
    }

    if (opts.hasOwnProperty('secure')) {
      newCookie += '; secure';
    }

    doc.cookie = newCookie;

    return newCookie;
  };
  return self;
};

if (typeof document !== 'undefined') {
  var cookie = exports(document);
  exports.get = cookie.get;
  exports.set = cookie.set;
}
