# koekje

[![Made by unshift][made-by]](http://unshift.io)[![Version npm][version]](http://browsenpm.org/package/koekje)[![Build Status][build]](https://travis-ci.org/unshiftio/koekje)[![Dependencies][david]](https://david-dm.org/unshiftio/koekje)[![Coverage Status][cover]](https://coveralls.io/r/unshiftio/koekje?branch=master)[![IRC channel][irc]](http://webchat.freenode.net/?channels=unshift)

[made-by]: https://img.shields.io/badge/made%20by-unshift-00ffcc.svg?style=flat-square
[version]: https://img.shields.io/npm/v/koekje.svg?style=flat-square
[build]: https://img.shields.io/travis/unshiftio/koekje/master.svg?style=flat-square
[david]: https://img.shields.io/david/unshiftio/koekje.svg?style=flat-square
[cover]: https://img.shields.io/coveralls/unshiftio/koekje/master.svg?style=flat-square
[irc]: https://img.shields.io/badge/IRC-irc.freenode.net%23unshift-00a8ff.svg?style=flat-square

Koekje is dutch for `cookie` and it's also DOM Storage API compatible storage
layer for storing data in a... **cookie**.

## Installation

This module was designed with browserify in mind and can be installed from the
public npm registry:

```
npm install --save koekje
```

## Usage

In all examples we assume that you've required the module as:

```js
'use strict';

var koekje = require('koekje');
```

The API is we expose is compatible with the API of the DOM Storage methods. They
can be found at:

https://developer.mozilla.org/en-US/docs/Web/API/Storage

```js
koekje.setItem('foo', 'bar');  // Returns undefined and stores the value.
koekje.getItem('bar');         // Not found, returns null.
koekje.getItem('foo');         // Returns `bar`.
koekje.length;                 // 1
koekje.removeItem('foo');      // Returns undefined, length is now 0.
koekje.clear();                // Returns undefined and clears all items.
```

## License

MIT
