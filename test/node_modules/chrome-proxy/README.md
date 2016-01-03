# chrome-proxy
An Object.observe based ES6 Proxy polyfill for Chrome

# Installation

npm install proxy-observe

Or, copy the contents of dist/proxy-observe.js to your local machine and include it like you would any Javascript file. Except for Chrome, which has native support for Object.observe and does not need to use Proxy, you will need to get a shim for Proxy if your browser does not support it.

# Philosophy

Chrome used to have a proxy and it was abruptly removed over a year ago for unspecified security reasons. Proxies are useful. This is a development placeholder based on Object.observe until they become available again. There is currently no plan to turn this into a robust long term implementation, particularly since the future of Object.observe is not guaranteed.


# Release History

v0.0.1 2015-11-07 Initial public release. No unit tests yet. Consider this an ALPHA.


# License

MIT License - see LICENSE file
