# chrome-proxy
An Object.observe based ES6 Proxy polyfill for Chrome

# Installation

npm install chrome-proxy

[![Codacy Badge](https://api.codacy.com/project/badge/grade/84821902325f4477b1797ca872232114)](https://www.codacy.com/app/syblackwell/chrome-proxy)
[![Code Climate](https://codeclimate.com/github/anywhichway/chrome-proxy/badges/gpa.svg)](https://codeclimate.com/github/anywhichway/chrome-proxy)
[![Test Coverage](https://codeclimate.com/github/anywhichway/chrome-proxy/badges/coverage.svg)](https://codeclimate.com/github/anywhichway/chrome-proxy/coverage)
[![Issue Count](https://codeclimate.com/github/anywhichway/chrome-proxy/badges/issue_count.svg)](https://codeclimate.com/github/anywhichway/chrome-proxy)

[![NPM](https://nodei.co/npm/chrome-proxy.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/<chrome-proxy>/)

# Notes

The limited unit tests currently implemented all pass in the Chrome browser. Property getting and setting work within Node, but *getPrototypeOf* and *getOwnPropertyDescriptor* unit tests fail within Node.

# Philosophy

Chrome used to have a proxy and it was abruptly removed over a year ago for unspecified security reasons. Proxies are useful. This is a development placeholder based on Object.observe until they become available again in early 2016. There is currently no plan to turn this into a robust long term implementation, particularly since Object.observe may disappear in 2016.

# Release History (reverse chronological order)

v0.0.9 2016-01-21  Reworked module closure wrapper so it would work regardless of wether *browserify* is used. 

v0.0.8 2016-01-18 Reworked module structure which seemed to fail to define Proxy in some situations.

v0.0.7 2016-01-18 Corrected issue where deleted properties were not properly restored if deleteProperty trap failed.

v0.0.6 2016-01-17 Created browserified and minified version. Added some unit tests. Added .travis.yml and .codeclimate.yml. Updated badges.

v0.0.5 2015-12-13 Corrected README

v0.0.4 2015-12-12 Codacy improvements, corrected error with setting __proxy__

v0.0.1 2015-11-07 Initial public release. No unit tests yet. Consider this an ALPHA.

# License

MIT License - see LICENSE file
