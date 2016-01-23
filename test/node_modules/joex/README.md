# joex
Javascript Object Extensions

Adds *.lt, .lte, .eq, .neq, .gte, .gt* to Number, String, Boolean, Date. Dates can be compared with precision, e.g. *.lt(date,"Y")*.

Adds *.between* and *.outside* to Number and String.

Adds *.echoes(string)* and *.soundex* to String.

Adds isLeapYear and getLastDayOfMonth methods to Date. Also adds data members to represent all of the parts of a Date so that they can be treated in a declarative manner, e.g. year, fullYear, month, etc.

Adds *.intersection, .intersects, .disjoint, .coincident, .crossproduct, .min, .max, .avg* to Array and Set.

Adds *.some*, *.every*, and *.toJSON* to Set. *.toJSON* results in an array like representation.

[![Build Status](https://travis-ci.org/anywhichway/joex.svg)](https://travis-ci.org/anywhichway/joex)
[![Codacy Badge](https://api.codacy.com/project/badge/grade/8ff33e04aa48424c97f63740e87afd9d)](https://www.codacy.com/app/syblackwell/joex)
[![Code Climate](https://codeclimate.com/github/anywhichway/joex/badges/gpa.svg)](https://codeclimate.com/github/anywhichway/joex)
[![Test Coverage](https://codeclimate.com/github/anywhichway/joex/badges/coverage.svg)](https://codeclimate.com/github/anywhichway/joex/coverage)
[![Issue Count](https://codeclimate.com/github/anywhichway/joex/badges/issue_count.svg)](https://codeclimate.com/github/anywhichway/joex)


[![NPM](https://nodei.co/npm/joex.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/<joex>/)

### Philosophy

The design philosophy for most extensions is primarily driven be a need for additional functionality.

Note, there are risks in using polyfills as documented here: http://adamsilver.io/articles/the-disadvantages-of-javascript-polyfills/. However, we have found there are cases where facades and wrappers will not work, making polyfills or subclassing the only choice, i.e. where instanceof semantics must be preserved or major portions of existing code will have to be re-written (introducing yet another set of risks). We attempted to develop the library using subclassing; however, the Chrome engine does some internal checking on instances before method invocation and we were getting errors related to generic function calls and instances not being of the correct type. We will continue to endeavor to enhance this library so that it does not compel the use of a polyfill so that all choice is in the end developer's hands. Meanwhile, the library was designed in such a way that the programmer has the ability to select which polyfills to use and can take the risks in an informed manner.

Extensions are created by extending the *.prototype* for native constructors so that *instanceOf* behaves as expected across closures.

For selectivity, extensions are only created upon request for any given class by calling */<constructor/>.extend()*.

The design philosophy for Date involves making objects more declarative than is typical with Javascript because we find this leads to more concise and less bug prone code. It also happens to be useful when indexing objects for [JOQULAR](http://www.github.com/anywhichway/joqular) or other JSON data stores. This is accomplished through the use of Object.defineProperty on class prototypes to create virtual properties with get and set functions, e.g. 

```Object.defineProperty(Date.prototype,"fullYear",{enumerable:true,configurable:true,set:function(value) { this.setFullYear(value); },get:function() {return this.getFullYear();}).```

Since they are semantically un-necessary the *.toJSON* method for Date is not updated to add these properties and they will not be persisted.


# Installation

npm install joex

The index.js and package.json files are compatible with https://github.com/anywhichway/node-require so that joex can be served directly to the browser from the node-modules/joex directory when using node Express.

To modify the global objects, set the global object to its extended equivalent, e.g. Date = Date.extend().

```
require("joex");
var Date = Date.extend()
```

## Usage

The constructors for Array, Set, Boolean, Number, String, Date remain the same as the native implementations.

Number, String, Boolean support *.lt, .lte, .eq, .neq, .gte, .gt*. See Array, Set, Date documentation for their respective comparisons.

### Array

#### Methods

*.avg(all)* - Returns the avg value of numeric values or items coerceable into numerics (e.g. Date, Time) in the array. Non-numeric values are ignored unless *all* is set. If *all* is *true*, then non-numeric values increment the count by which the average is computed. If *all* is a function and returns a numeric when called with a value, the numeric is added to the values to be averaged. If it returns a non-numeric, the value is ignored and the count is not incremented.

*.max()* - Returns the max value in the array.

*.min()* - Returns the max value in the array.

*.sum(filter)* - Returns the avg value of numeric values or items coerceable into numerics (e.g. Date, Time) in the array. Non-numeric values are ignored unless *all* is a function and returns a numeric when called with a value; in which case, the numeric is added to the sum. If the function returns a non-numeric, the value is ignored.

### Date

#### Properties

*.year, .fullYear, .month, .dayofMonth, .hours, .minutes, .seconds, .milliseconds* are all exposed as properties that correspond to the similarly named get and set functions. Note, since *.getYear* is being deprecated from Javascript, *.year* always corresponds to *.fullYear*.

#### Methods

Supports *.lt, .lte, .eq, .neq, .gte, .gt* with an additional *precision* argument, i.e. "Y","M","D","h","m","s","ms". For example:

```
new Date().eq(new Date(),"Y");
```

Precision operates at the least number of milliseconds required to represent a Date, i.e. "Y" is effectively represented by converting an internal value to *new Date(this.getFullYear(),0)*.

*.getLastDayOfMonth* - Returns the last day of the month for the instance.

*.isLeapYear()* - Returns *true* if the instance is a leap year.

### Number

#### Methods

*.between(a,b)* - Returns *true* if instance is between *a* and *b*, including the boundaries.

*.outside(a,b)* - Returns *true* if instance is not between *a* and *b*.


### Set

#### Methods

Supports the same extended summary methods as Array.

*.every* - Behaves the same as *.every* for Arrays.

*.some* - Behaves the same as *.some* for Arrays.

*.toJSON* - Returns the set as an Array.

### String

#### Methods

*.between(a,b)* - Returns *true* if instances is between *a* and *b*, including the boundaries.

*.echoes(string)* - Returns *true* if instance sounds like *string*.

*.outside(a,b)* - Returns *true* if instances is not between *a* and *b*.

*.soundex()* - Returns soundex encoding of instance.

# Building & Testing

Building & testing is conducted using Travis, Mocha, Chai, and Istanbul. 

# Release History (reverse chronological order)

v0.1.7 2016-01-22 Completely eliminated built-in prototype "pollution" except at programmer request.

v0.1.6 2016-01-22 Corrected bad reference to client file in *package.json*. 

v0.1.5 2016-01-21 Reworked module closure wrapper so it would work regardless of whether *browserify* is used. 

v0.1.4 2016-01-15 Updated Set *.every* and *.some* to avoid use of not yet generally supported *for ... of ...* construct. Added unit tests. Updated badges.

v0.1.3 2016-01-09 Updated documentation to alert users to the risks of polyfills.

v0.1.2 2016-01-07 Added *.intersection* to Array and Set. Enhanced *.intersects*,*.coincident*, and *.disjoint* to take any number of arguments, added more documentation and unit tests.

v0.1.1 2016-01-03 Added substantial amounts of documentation and unit tests. Add filter capability to *.sum* and *.avg*. Corrected a flaw in Date precision that resulted in only part of a date being considered.

v0.1.0 2015-12-31 Modified so code does not directly overload built-in objects. Started adding unit tests. This was a breaking change with respect to module loading, so semantic version was incremented.

v0.0.9 2015-12-31 Added isLeapYear and getLastDayOfMonth functions for Date. Remove dependencies on Time and TimeSpan.

v0.0.8 2015-12-13 Codacy improvements.

v0.0.7 2015-12-13 Removed data extensions to Date object.

v0.0.6 2015-12-13 Codacy improvements

v0.0.5 2015-11-29 Initial public release. No unit tests yet. Consider this an ALPHA.

# License

MIT License - see LICENSE file