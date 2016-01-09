# about-time
About-time is Javascript browser and server library for managing, comparing, and doing arithmetic on Time, Duration, TimeSpan objects in manners similar to and beyond those provided by Date.

Time supports all the methods supported by Date, declarative access to all get and set values, e.g. */<instance/>.fullYear* is the same as getFullYear(), and adds the capability to represent only a specific precision, e.g. "Y", "M", "h", plus the ability to determine if it is within a given TimeSpan.

Durations are stored as milliseconds but may be Infinite in length and provide access at the typically useful levels of seconds, minutes, hours, days, weeks, months, quarters, years. Durations support arithmetic manipulation and can also be compared at varying precisions.

TimeSpans are stored as starting and ending milliseconds which include -Infinity and Infinity. They support comparisons with other TimeSpans and Times such as before, after, intersection, coincident, and disjoint.


[![Codacy Badge](https://api.codacy.com/project/badge/grade/44679d69e6a749d29cb67c75b2212951)](https://www.codacy.com/app/syblackwell/about-time)

### Philosophy

The classes in about-time were originally part of [JOQULAR](http://www.github.com/anywhichway/joqular) v1 in order to support temporal database logic. Because they are generically useful and in order to simplify the code base of JOQULAR in preparation for release of JOQULAR v2, they were extracted into their own library and re-written.

The design philosophy involves making objects more declarative than is typical with Javascript because we find this leads to more concise and less bug prone code. It also happens to be useful when indexing objects for JOQULAR or other JSON data stores. This is accomplished through the use of Object.defineProperty on class prototypes to create virtual properties with get and set functions, e.g. 

```Object.defineProperty(Time.prototype,"fullYear",{enumerable:true,configurable:true,set:function(value) { this.setFullYear(value); },get:function() {return this.getFullYear();}).```

Note, the property is enumerable; however, since it is not semantically necessary for serializing and restoring, a toJSON method is also defined, i.e.

```Time.prototype.toJSON = function() { return {time: this.time, precisions: this.precision} }```

# Installation

npm install about-time

The index.js and package.json files are compatible with [node-require](http://www.github.com/anywhichway/node-require) so that about-time can be served directly to the browser from the node-modules/about-time directory when using node Express.

Time, Duration, and TimeSpan become global objects when loaded in a web browser. To access them in node.js use the normal require syntax, e.g.

```
var Time = require("about-time").Time
```

# Usage

Time, Duration, TimeSpan all support *.toJSON* and *.revive*.

*.toJSON* - creates an object with just those properties required to persist or revive an instance without loosing information.

*.revive(object)* - will return an instance based on properties of the provided object. A TypeError is thrown if insufficient data is available.

They all also support the comparison functions: *.lt, .lte, .eq, .neq, .gte, .gt*.


## Time

### Constructor

*new Time([(milliseconds|Date|TimeSpan|datestring)=new Date()[,precision)* - Constructs a Time instance from a value of one of the types at the provided precision, "Y","M","D","h","m","s","ms". The time is represented internally as the number of milliseconds since January 1st, 1970. The values -Infinity and Infinity are legal for milliseconds. If no first argument is provided, the Time defaults to the current time by using new Date().

Precision boundaries exist at the lowest number of milliseconds required to represent the Time; hence, a year precision has less milliseconds than a month precision. For example, "Y" is effectively represented by converting an internal value to *new Date(this.getFullYear(),0).getTime()*.

### Properties

*.time* - The number of milliseconds since January 1, 1970 used as a basis for computing *.valueOf()* at *.precision*.

*.precision* - one of "Y","M","D","h","m","s","ms". 

### Methods

Time supports all the methods supported by Date.

*.lt(time[,precision="ms"])* - Returns true if instance is less than *value* at the specified *precision*, "Y","M","D","h","m","s","ms". Value must be another time instance, or something that can be coerced into a Time instance. Comparisons are done at the specified precision, or the precision set for the instance. Unlike Duration, Time does not yet support precision at the (Q)uarter or (W)eek level.

Time also supports *.lte, .eq, .neq .gte, .gt*.

*.in(timespan[,precision="ms"])* - returns true if the Time is within the  *timespan* provided at the specified *precision*, "Y","M","D","h","m","s","ms". The *timespan* argument will be coerced into a TimeSpan if possible.

*.toPrecision(precision[,modify=true])* - makes future comparison of the Time sensitive to the provided *precision*, "Y","M","D","h","m","s","ms". If modify is true, the same instance is returned, otherwise a new instance is returned.

*.valueOf()* - returns *.milliseconds* modified to the current *.precision*.

*.withPrecision(precision)* - returns the instance after setting the precision.


## Duration

Duration assumes there are 31557600 seconds in a year. Internal calculations have durations accurate to the millisecond.

Duration instances can be manipulated using arithmetic operators. Here are a few unit tests that provide examples:

```
 it('+ ',function() {
		var d1 = new Duration(1,"Y"), d2 = new Duration(1,"Y");
		var result = new Duration(d1 + d2);
		expect(result.years).to.be.equal(2);
		expect(result.months).to.be.equal(24);
	 });
 it('- ',function() {
		var d1 = new Duration(1,"Y"), d2 = new Duration(1,"Y");
		var result = new Duration(d1 - d2);
		expect(result.years).to.be.equal(0);
		expect(result.months).to.be.equal(0);
 });
 it('/ ',function() {
		var d1 = new Duration(1,"Y"), d2 = new Duration(6,"M");
		var result = d1 / d2;
		expect(result).to.be.equal(2);
 });
```

### Constructor

*new Duration((count|Duration)=Infinity[,period="ms"])* - Creates a Duration of the given *count* or based on Duration of type *period*. The default duration is an Infinite number of milliseconds.

### Properties

*.count* - Number of periods in the Duration.

*.length* - The number of milliseconds in the Duration. "Q" and "M" are psuedo-quarters and psuedo-months respectively since quarters and months are not always the same number of milliseconds. Q = (31557600 * 1000)/4, M = (31557600 * 1000)/12

*.period* - Type of Duration, one of "Y","Q","M","W","D","h","m","s","ms".

*.range* - Reserved for future support of at least and at most comparisons. Legal values are Duration.ATLEAST, Duration.EXACT, Duration.ATMOST

These properties are READONLY and may be fractions: *.years, .quarters, .months, .weeks, .days, .hours, .minutes, .seconds, .milliseconds.*. An error will be thrown if there is an attempt to modify the property. They are not added to JSON representations of an instance.


### Methods

*.lt(time[,precision="ms"])* - Returns true if instance is less than *value* at the specified *precision*, "Y","Q","M","W","D","h","m","s","ms". Value must be another time instance, or something that can be coerced into a Time instance. Comparisons are done at the specified precision.

Duration also supports *.lte, .eq, .neq .gte, .gt*.

*.toJSON* - returns {count: this.count, period: this.period, range: this.range}


## TimeSpan


### Constructor

*new TimeSpan([(milliseconds|Date|TimeSpan|datestring|Time)=-Infinity[,(milliseconds|Date|TimeSpan|datestring|Time)=Infinity)* - Creates a TimeSpan with *.starts* = milliseconds from January 1st, 1970 equal to the first argument and *.ends* = milliseconds from January 1st, 1970 equal to the second argument. Unless the arguments are TimeSpans, in which case it takes the first TimeSpan's start and the second's end in order to create a merged TimeSpan.

### Properties

*.ends* - Milliseconds since January 1st, 1970 at which the TimeSpan ends. May be *Infinity*.

*.starts* - Milliseconds since January 1st, 1970 at which the TimeSpan starts.  May be *-Infinity*.

The following properties are READONLY:

*.duration* - Milliseconds between *.starts* and *.ends*. READONLY. Computed dynamically.

### Methods

*.adjacent(milliseconds|Date|TimeSpan|datestring|Time[,precision="ms"])* - The argument is within precision of the start or end of the TimeSpan. Returns -1 if argument is adjacent before, 1 if adjacent after and 0 if not adjacent.

*.adjacentAfter(milliseconds|Date|TimeSpan|datestring|Time[,precision="ms"])* - The argument is immediately after the end of the TimeSpan at the specified precision.

*.adjacentBefore(milliseconds|Date|TimeSpan|datestring|Time[,precision="ms"])* - The argument is immediately before the start of the TimeSpan at the specified precision.

*.after(milliseconds|Date|TimeSpan|datestring|Time[,precision="ms"])*  - The argument is after the end of the TimeSpan at the specified precision.

*.before(milliseconds|Date|TimeSpan|datestring|Time[,precision="ms"])*  - The argument is before the start of the TimeSpan at the specified precision.

*.coincident(milliseconds|Date|TimeSpan|datestring|Time[,precision="ms"])* - The start and end are the same for the TimeSpan and argument at the specified precision. If the argument is a point in time, then by definition the start and end of the TimeSpan are the same at the specified precision.

*.contains(milliseconds|Date|TimeSpan|datestring|Time[,precision="ms"])* - Returns *true* if TimeSpan contains the first argument at the given precision.

*.disjoint(milliseconds|Date|TimeSpan|datestring|Time[,precision="ms"])* - The negation of *.intersects*.

*.intersects(milliseconds|Date|TimeSpan|datestring|Time[,precision="ms"])* - Returns *true* if TimeSpan intersects the first argument at the given precision. For points in time arguments, the response will be the same as *.contains*. For TimeSpan arguments, the result will be true if either end is contained.


# Updates (reverse chronological order)

2016-01-09 v0.1.3 Added extensive unit tests. Corrected error with Time.prototype.in when testing against TimeSpan. Enhanced documentation.

2016-01-03 v0.1.2 Clarified and made consistent semantics of Time precision. Renamed *.milliseconds* property to *.time* so comparisons can be done at the millisecond level.

2015-12-31 v0.1.1 Removed Date object extensions that are not dependent on Time, Duration, TimeSpan. Moved Date object extensions from joex to this file where such extensions depend on Time, Duration, or TimeSpan

2015-12-31 v0.1.0 Added toJSON, documentation and more unit tests. The behavior of Time changed substantially. The property *.milliseconds* is no longer modified when precision is changed. Instead, *.precision* is stored on the instance and *.valueOf()* returns the appropriate milliseconds. The behavior of Duration changed substantially. The properties *.period* and .*count* are now exposed and *.length* is computed dynamically. And, *.years, .quarters, .months, .weeks, .days, .hours, .minutes, .seconds, .milliseconds.* are READONLY.The TimeSpan objects eliminated the methods adjacentOrBefore and adjacentOrAfter and fixed bugs related to intersection and leap years.

2015-12-29 v0.0.6 Added more unit tests

2015-12-29 v0.0.5 Added revivers and unit tests

2015-12-12 v0.0.4 Codacy driven improvements

2015-11-29 v0.0.3 Initial public commit

# License

This software is provided as-is under the [MIT license](http://opensource.org/licenses/MIT).
