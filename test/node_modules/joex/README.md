# joex
Javascript Object Extensions

Adds lt, lte, eq, neq, gte, gt to Number, String, Boolean, Date. Dates can be compared with precision, e.g. *.lt(date,"Y")*.

Adds between and outside to Number and String.

Adds soundex to String.

Adds isLeapYear and getLastDayOfMonth methods to Date as well as properties for year, fullYear, month, etc.

Adds intersects, disjoint, coincident, crossproduct, min, max, avg to Array and Set.

Adds some, every, and toJSON to Set. toJSON results in an array like representation.

[![Codacy Badge](https://api.codacy.com/project/badge/grade/8ff33e04aa48424c97f63740e87afd9d)](https://www.codacy.com/app/syblackwell/joex)

### Philosophy

The design philosophy for Date involves making objects more declarative than is typical with Javascript because we find this leads to more concise and less bug prone code. It also happens to be useful when indexing objects for [JOQULAR](http://www.github.com/anywhichway/joqular) or other JSON data stores. This is accomplished through the use of Object.defineProperty on class prototypes to create virtual properties with get and set functions hidden from the application implementor, e.g. 

```Object.defineProperty(Date.prototype,"fullYear",{enumerable:true,configurable:true,set:function(value) { this.setFullYear(value); },get:function() {return this.getFullYear();}).```

The design philosophy for the other extensions is primarily driven be a need for additional functionality.

Extensions are created by extending the *.prototype* for native constructors so that *instanceOf* behaves as expected across closures.

# Installation

npm install joex

The index.js and package.json files are compatible with node-require so that joex can be served directly to the browser from the node-modules/joex directory when using node Express.

To modify the global objects a web browser set the global object to its extended equivalent, e.g. Date = Date.extend() To access them in node.js use the normal require syntax, e.g.

```
var Date = require("joex").Date.extend()
```

## Usage

The constructors for Array, Set, Boolean, Number, String, Date remain the same as the native implementations.

Number, String, Boolean support *.lt, .lte, .eq, .neq, .gte, .gt*. See Array, Set, Date documentation for their respective comparisons.

### Array

#### Methods

*.avg(all)* - Returns the avg value of numeric values or items coerceable into numerics (e.g. Date, Time) in the array. Non-numeric values are ignored unless *all* is set. If *all* is *true*, then non-numeric values increment the count by which the average is computed. If *all* is a function and returns a numeric when called with a value, the numeric is added to the values to be averaged. If it returns a non-numeric, the value is ignored and the count is not incremented.

*.max()* - Returns the max value in the array.

*.min()* - Returns the max value in the array.

*.sum(filter)* - Returns the avg value of numeric values or items coerceable into numerics (e.g. Date, Time) in the array. Non-numeric values are ignored unless *all* is a function and returns a numeric when called with a value. In which case, the numeric is added to the sum. If it returns a non-numeric, the value is ignored.

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

# Release History (reverse chronological order)

v0.1.1 2016-01-03 Added substantial amounts of documentation and unit tests. Add filter capability to *.sum* and *.avg*. Corrected a flaw in DAte precision that resulted in only part of a date being considered.

v0.1.0 2015-12-31 Modified so code does not directly overload built-in objects. Started adding unit tests. This was a breaking change with respect to module loading, so semantic version was incremented.

v0.0.9 2015-12-31 Added isLeapYear and getLastDayOfMonth functions for Date. Remove dependencies on Time and TimeSpan.

v0.0.8 2015-12-13 Codacy improvements.

v0.0.7 2015-12-13 Removed data extensions to Date object.

v0.0.6 2015-12-13 Codacy improvements

v0.0.5 2015-11-29 Initial public release. No unit tests yet. Consider this an ALPHA.

# License

MIT License - see LICENSE file