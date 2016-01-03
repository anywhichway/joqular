# sessionstorage

[![Made by unshift][made-by]](http://unshift.io)[![Version npm][version]](http://browsenpm.org/package/sessionstorage)[![Build Status][build]](https://travis-ci.org/unshiftio/sessionstorage)[![Dependencies][david]](https://david-dm.org/unshiftio/sessionstorage)[![Coverage Status][cover]](https://coveralls.io/r/unshiftio/sessionstorage?branch=master)[![IRC channel][irc]](http://webchat.freenode.net/?channels=unshift)

[made-by]: https://img.shields.io/badge/made%20by-unshift-00ffcc.svg?style=flat-square
[version]: https://img.shields.io/npm/v/sessionstorage.svg?style=flat-square
[build]: https://img.shields.io/travis/unshiftio/sessionstorage/master.svg?style=flat-square
[david]: https://img.shields.io/david/unshiftio/sessionstorage.svg?style=flat-square
[cover]: https://img.shields.io/coveralls/unshiftio/sessionstorage/master.svg?style=flat-square
[irc]: https://img.shields.io/badge/IRC-irc.freenode.net%23unshift-00a8ff.svg?style=flat-square

The `sessionStorage` API is amazing and super useful when you need to store data
temporarily in the browser. We used to abuse cookies for this, but not all the
data that you want to store needs to be synced with the server. The
`sessionStorage` API filled that gap, but unfortunately we cannot expect this API
to be available and enabled in every browser context. This module provides
various of fallbacks which follow the same API as `sessionStorage` for when it's
not enabled. The following fallback's are supported:

- `window.name` - Storing data in the `name` property of the window.
- `cookies` - This doesn't really need an explanation.

## Install

It's build for browserify but it should work with Node.js as well as we provide
a fallback API. The module is released in the public npm registry and can be
installed using:

```
npm install --save sessionstorage
```

## Usage

The API is exactly the same as the DOM storage API so you can use the following
methods:

- `getItem(key)`
- `setItem(key, value)`
- `removeItem(key)`
- `clear()`

So all you need to do is require the module and you're ready to go:

```js
'use strict';

var sessionstorage = require('sessionstorage');
```

## License

MIT
