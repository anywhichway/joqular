# JOVIAL
Javascript Object Validation Interception Augmentation Library.

A light weight, easily extensible validation mechanism for Javascript objects that supports both batch and real-time per property validation. Here is an example Validator:

```new Validator({name: {type: 'string', length: 25, required: true}, 
                  age: {type: 'number', min:0, max: 110},
                  gender: {in: ['male','female']},
                  ssn: {type: 'SSN'},
                  location: {type: 'latlon'}})```
                
Also supported are RegExp matching, soundex testing, range testing, developer supplied functions.

[![Build Status](https://travis-ci.org/anywhichway/jovial.svg)](https://travis-ci.org/anywhichway/jovial)
[![Codacy Badge](https://api.codacy.com/project/badge/grade/42cd44eee8794c22aa7a4f780abd2d0b)](https://www.codacy.com/app/syblackwell/jovial)
[![Code Climate](https://codeclimate.com/github/anywhichway/jovial/badges/gpa.svg)](https://codeclimate.com/github/anywhichway/jovial)
[![Test Coverage](https://codeclimate.com/github/anywhichway/jovial/badges/coverage.svg)](https://codeclimate.com/github/anywhichway/jovial/coverage)
[![Issue Count](https://codeclimate.com/github/anywhichway/jovial/badges/issue_count.svg)](https://codeclimate.com/github/anywhichway/jovial)

[![NPM](https://nodei.co/npm/jovial.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/<jovial>/)

# Install

npm install jovial

The index.js and package.json files are compatible with https://github.com/anywhichway/node-require so that joex can be served directly to the browser from the node-modules/joex directory when using node Express.

Browser code can also be found in the browser directory at https://github.com/anywhichway/jovial.


# Usage

The core of JOVIAL is the Validator class. The constructor for Validator takes a configuration object consisting of properties with the same names as those to be validated on a target object. These properties contain configuration data restricting types, lengths, etc. or provide for value transformation prior to validation and final setting on a property.

The below will constrain 'name' to be a string and 'age' to be a number with a minimum value of 0 once the validator is bound to something:

```var validator = new Validator({name: {type: 'string'}, age: {type: 'number', min:0}})``` 

*\<validator\>.bind(constructorOrInstance,onError[,name])*

Validators are bound to either constructors or object instances using the *.bind* instance method. If an *onError* callback is not provided, then attempts to set invalid property values on the bound object will throw errors. The *onError* callback takes one argument, the error that would otherwise have been thrown. 

The *name* argument is optional except in IE when binding a constructor because IE does not make available the *.name* property for Function objects. The names of bound constructors are used internal to the JOVIAL library for look-ups and must be available. 

The *.bind* method returns either a new instrumented constructor or a proxy for the bound object. The new instrumented constructor should be used in place of the original constructor.

## Validation Methods

Note, with the exception of *.required*, validation checks are ignored if a value is *unknown*; otherwise, all checks would behave as if a value were required. However, if a value is *null*, validation checks are conducted, i.e. *null* is treated as a value whereas *unknown* is treated as the absence of a value that could theoretically pass any validation test.

*\<bound object\>.validate(trap)*

Once bound, an object or instance returned from a bound constructor will have a *.validate* method. Invoking *.validate()* will attempt to validate all properties. 

If *trap* is true, then a consolidated *Validator.ValidationError* or *undefined* will be returned. If *trap* is false, then either the *onError* provided during binding will be called with the consolidated error, or, if *onError* is undefined, the consolidated error will be thrown.

For example, the following will throw errors:

```
function Person() { p1.name = null, p1.age = null }

var validator = new Validator({name: {type: 'string'}, age: {type: 'number'}});

var p1 = new Person();
p1.name = 2; // intentionally incorrect type for example
p1.age = "20"; 
p1 = validator.bind(p1); // binds validator to object so it will have validation
p1.validate(); // performs batch validation, an error will be thrown here

Person = validator.bind(Person); // binds validator to constructor so all instances have validation
var instance = new Person();
instance.name = 1; // real-time per property validation will be invoked, so an type error will be thrown here

```

Since JOVIAL supports both real-time per property validation and batch validation,the *Validator.ValidationError* thrown by JOVIAL is actually a container for other errors and details regarding the causes, e.g.:

```{object: {name:null, age:null},errors:{name: {value: 2, validation: {type: {constraint: "string", error: [TypeError]}},{age: {value: -1, min: {constraint: 0, error: [RangeError]}}}}}```

The *.object* key points to the target object.

The *.errors* key points to an object for which there will be one key for every property that failed validation. The form is a follows:

```{<property>:
     {value: <invalid value>,
     {validation: {<failed constraint name 1>: {constraint: <constraint value 1>, error: <Error 1>},
     	{<failed constraint name 2>: {constraint: <constraint value 2>, error: <Error 2>},
        ...
     }
    }````

*.echoes* = string 

Tests to see is the target value has the same soundex as a constraint

*.min*, *.max*, and *.between* = number | string | Array

Ensures the value is greater than the provided min or max or between the values in what is assumed to be a 2 value array. The array constraint is ascending sorted prior to testing the target value and its first and last members are used as the min and max respectively.

*.matches* = RegExp

Ensures a value matches the provided regular expression.

*.required* = true | false

Throws an error is a property is missing or there is an attempt to delete it. Note, the deletion attempt must be done in a context that allows the error to bubble, so it may fail to work in some asych code situations. For example chrome-proxy uses Object.observe to manage property deletion. Objects proxied through chrome-proxy will not get proper validation for this constraint.

*.in* = Array 

Verifies the target value is a member of the provide array

*.length* = number |  Array

Supports length checking on values with a length or count property, typically strings, Arrays and Sets. If *.length itself is an array, then its min and a max are used for testing the min and max length of the target value.

*.satisfies* = function(any)

The developer supplied function should take a single argument and return *true* if the argument is a valid value and *false* if not.

*.type* = "string" | "boolean" | "function" | "object" | "SSN" | "tel" | "latlon" | function

If a function is provided as a type, then the function is assumed to be a constructor and an *instanceof* check is done. If a target value is *unknown* then the type is assumed to match, otherwise type checking would behave like *.required*.

####SSN 

Matches ###-##-##. Note, a value that looks like an SSN but is not actually a legal government issued number will pass.

####tel 

Matches paretheses, dash, and dot separated US telephone numbers. Note, a value that looks like an telephone number but is not actually an active telephone company number will pass.

####latlon
	
Latitude and Longitude in Degrees Minutes Seconds (DMS) zero padded, separated by spaces or : or (d, m, s) or (°, ', ") or run together and followed by cardinal direction initial (N,S,E,W) Longitude Degree range: -180 to 180 Latitude Degree range: -90 to 90 Minute range: 0 to 60 Second range: 0.00 to 60.00 Note: Only seconds can have decimals places. A decimal point with no trailing digits is invalid.

Matches	

40:26:46N,079:56:55W | 40°26'47"N 079°58'36"W | 40d 26m 47s N 079d 58' 36" W | 90 00 00.0, 180 00 00.0 | 89 59 50.4141 S 090 29 20.4 E | 00 00 00.0, 000 00 00.0

Non-Matches	

90 00 00.001 N 180 00 00.001 E | 9 00 00.00 N 79 00 00.00 E | 9 00 00.00, -79 00 00.00 | 90 61 50.4121 S 090 29 20.4 E | -90 48 50. N -090 29 20.4 E | 90 00 00. N, 180 00 00. E | 00 00 00., 000 00 00.

If you would like additional validation methods, then post an issue to GitHub with the code based on the instructions in **Extending JOVIAL** below.

## Augmentation Methods

*.transform* = function(any)

The developer supplied function takes the target value to transform and returns a replacement prior to setting it on the underlying object. The below will ensure all names are strings:

```{name: {transform: function(v) { return v+"";}}```

The transformation occurs before any validation.

# Extending JOVIAL

Extending JOVIAL is as simple as adding methods to the Validator class by the same name as the constraint desired and providing an optional error type. For example, the constraints 'between' and 'min' and 'max' are implemented as:

```
Validator.validation.between = function(between,value) {
		between.sort(function(a,b) { return a - b; });
		var min = between[0];
		var max = between[between.length-1];
		return value>=min && value<=max;
}
Validator.validation.between.onError = RangeError;

Validator.validation.min = function(min,value) {
		return value>=min;
}
Validator.validation.min.onError = RangeError;

Validator.validation.max = function(max,value) {
		return value<=max;
}
Validator.validation.max.onError = RangeError;
```

Using the above, we can extend the Person example as follows:

```
function Person() { }
var validator = new Validator({name: {type: 'string'}, age:{type: 'number', min: 0, max: 110}}});
Person = validator.bind(Person);
var instance = new Person();
instance.age = 120; // throws a RangeError {object: {},errors:{age: {value: 120, max: {constraint: 110, error: [RangeError]}}}}
```

or

```
function Person() { }
var validator = new Validator({name: {type: 'string'}, age:{type: 'number', between: [0,110]}});
Person = validator.bind(Person);
var instance = new Person();
instance.age = 120; // throws a RangeError {object: {},errors:{age: {value: 120, between: {constraint: [0,110], error: [RangeError]}}}}
```

# Implementation

JOVIAL is implemented using a Proxy. As attempts are made to modify the properties of target objects at runtime, the validation routines are called with the constraint established by the Validator and the new values being set by the application code. The validators are selected based on the names of constraint attributes. 

For versions of Chrome not supporting a Proxy the browser code includes the shim https://github.com/anywhichway/chrome-proxy while the server code has a dependency and does a conditional require.

# Building & Testing

Building & testing is conducted using Travis, Mocha, Chai, and Istanbul.

# Notes

Due to an unavoidable shortcoming in chrome-proxy, the unit test for testing the prevention of deleting required properties fails. All tests should pass in Edge and Firefox.

# Updates (reverse chronological order)

2016-01-23 v0.0.19 Corrected length check on Set when value is actually unknown. Clarified the meaning of *unknown* in the documentation.

2016-01-23 v0.0.18 Modified type checking to ignore unknown values.

2016-01-23 v0.0.17 Addressed issue where Proxy sometimes did not get loaded and lifted to global scope by Browserify.

2016-01-23 v0.0.16 Cleaned-up Proxy bundling for Chrome. Corrected documentation regarding structure of ValidationError. Add non-null test for length validation.

2016-01-22 v0.0.15 Added *.echoes*, *.satisfies* and *.validate* and latlon type. Corrected bug where *.type* did not work as documented with functions. Added more unit tests. Updated documentation.

2016-01-21 v0.0.14 Updated dependency on chrome-proxy to > 0.0.8. 

2016-01-21 v0.0.13 Reworked module closure wrapper so it would work regardless of whether *browserify* is used. 

2016-01-18 v0.0.12 Corrected issue where underlying values did not get set after validation. Added more unit tests. Added *.length, .in, .transform*. Added support for property delete and define.

2016-01-13 v0.0.11 Added browserified and minified version.

2015-12-13 v0.0.10 Corrected README format

2015-12-13 v0.0.9 Added more unit tests and documentation

2015-12-13 v0.0.8 Added unit tests and missing error handlers for min, max, matches

2015-12-12 v0.0.7 Codacy driven improvements

2015-11-29 v0.0.6 Original public commit

# License

This software is provided as-is under the [MIT license](http://opensource.org/licenses/MIT).