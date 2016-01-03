# joex
Javascript Object Extensions

Adds lt, lte, eq, neq, gte, gt to Number, String, Boolean, Date

Adds between and outside to Number and String

Adds soundex to String

Adds before, adjacentOrBefore, afterAdjacentorAfter, isLeapYear and getLastDayOfMonth to Date

Adds intersects, disjoint, coincident, crossproduct, min, max, avg to Array and Set

Adds some, every, and toJSON to Set. toJSON results in an array like representation.

[![Codacy Badge](https://api.codacy.com/project/badge/grade/8ff33e04aa48424c97f63740e87afd9d)](https://www.codacy.com/app/syblackwell/joex)

# Installation

npm install joex

The index.js and package.json files are compatible with node-require so that joex can be served directly to the browser from the node-modules/joex directory when using node Express.

To modify the global objects a web browser set the global objetc to its extended equivalent, e.g. Date = ExtendedDate. To access them in node.js use the normal require syntax, e.g.

```
var Date = require("joex").ExtendedDate
```

# Release History (reverse chronological order)

v0.1.0 2015-12-31 Modified so code does not directly overload built-in objects. Started adding unit tests. This was a breaking change with respect to module loading, so semantic version was incremented.

v0.0.9 2015-12-31 Added isLeapYear and getLastDayOfMonth functions for Date. Remove dependencies on Time and TimeSpan.

v0.0.8 2015-12-13 Codacy improvements.

v0.0.7 2015-12-13 Removed data extensions to Date object.

v0.0.6 2015-12-13 Codacy improvements

v0.0.5 2015-11-29 Initial public release. No unit tests yet. Consider this an ALPHA.

# License

MIT License - see LICENSE file