# window.name

[![Made by unshift][made-by]](http://unshift.io)[![Version npm][version]](http://browsenpm.org/package/window.name)[![Build Status][build]](https://travis-ci.org/unshiftio/window.name)[![Dependencies][david]](https://david-dm.org/unshiftio/window.name)[![Coverage Status][cover]](https://coveralls.io/r/unshiftio/window.name?branch=master)[![IRC channel][irc]](http://webchat.freenode.net/?channels=unshift)

[made-by]: https://img.shields.io/badge/made%20by-unshift-00ffcc.svg?style=flat-square
[version]: https://img.shields.io/npm/v/window.name.svg?style=flat-square
[build]: https://img.shields.io/travis/unshiftio/window.name/master.svg?style=flat-square
[david]: https://img.shields.io/david/unshiftio/window.name.svg?style=flat-square
[cover]: https://img.shields.io/coveralls/unshiftio/window.name/master.svg?style=flat-square
[irc]: https://img.shields.io/badge/IRC-irc.freenode.net%23unshift-00a8ff.svg?style=flat-square

A DOM Storage API compatible storage layer for storing data in the `window.name`
property.

## Installation

This module was designed with browserify in mind and can be installed from the
public npm registry:

```
npm install --save window.name
```

## Usage

In all examples we assume that you've required the module as:

```js
'use strict';

var windowStorage = require('window.name');
```

The API is we expose is compatible with the API of the DOM Storage methods. They
can be found at:

https://developer.mozilla.org/en-US/docs/Web/API/Storage

```js
windowStorage.setItem('foo', 'bar');  // Returns undefined and stores the value.
windowStorage.getItem('bar');         // Not found, returns null.
windowStorage.getItem('foo');         // Returns `bar`.
windowStorage.length;                 // 1
windowStorage.removeItem('foo');      // Returns undefined, length is now 0.
widnowStorage.clear();                // Returns undefined and clears all items.
```

## License

MIT
