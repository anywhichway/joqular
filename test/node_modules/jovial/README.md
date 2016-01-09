# JOVIAL
Javascript Object Validation Interception Augmentation Library.

[![Codacy Badge](https://api.codacy.com/project/badge/grade/42cd44eee8794c22aa7a4f780abd2d0b)](https://www.codacy.com/app/syblackwell/jovial)

# Install

npm install jovial

# Philosophy

Provide a light weight, easily extensible validation mechanism for Javascript objects.

# Usage

The core of JOVIAL is the Validator class. The constructor for Validator takes a configuration object consisting of properties with the same names as those to be validated on a target object. The property values for the configuration object control the validation of the same named properties on a target object. For example:

```{name : {type: 'string'}}``` will constrain 'name' to be a string.

Validators are bound to either constructors or object instances using the instance method bind(constructorOrInstance,onError,name). If an 'onError' callback is not provided, then attempts to set invalid property values on the bound object with throw errors. The onError callback takes one argument, the error that would otherwise have been thrown. The 'name' argument is optional except in IE where the .name property is unavailable for Function objects. The names of bound constructors are used internal to the code. The bind method returns either a new instrumented constructor or a proxy for the bound object. The new instrumented constructor should be used in place of the original constructor. For example, the following will throw an error:

```
function Person() { }
var validator = new Validator({name: {type: 'string'}});
Person = validator.bind(Person);
var instance = new Person();
instance.name = 1;
```

There are plans to fully support both real-time per property validation and batch validation. Hence, the errors thrown by JOVIAL are actually containers for other errors and details regarding the causes:

```{object: {name:'Bill'},errors:{age: {value: -1, min: {constraint: 0, error: [RangeError]}}}}```

Currently JOVIAL supports:

primitive Javascript type checking, type = 'SSN', type = 'tel'; min, max, and between for numbers and strings; match = RegExp, required = true | false.

The following are in development:

type coercion, length tests, soundex.

If you would like others, then post an issue to GitHub with the code based on the extension instructions below.

# Extending JOVIAL

Extending JOVIAL is as simple as adding methods to the Validator class by the same name as the constraint desired on properties and providing an optional error type. For example, the constraints 'between' and 'min' are implemented as:

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
```


# Implementation

JOVIAL is implemented using a Proxy. For Chrome, where the Proxy object is not yet available, the shim chrome-proxy is used.

As attempts are made to modify the properties of target objects at runtime the validation routines are called with the constraint established by the Validator and the new values being set by the application code. The validators are selected based on the names of constraint attributes. For example the following will throw an error because the method Validator.validation.min exists to match the Validator constraint:

```
function Person() { }
var validator = new Validator({name: {type: 'string'}, age: {type: 'number', min: 0}});
Person = validator.bind(Person);
var instance = new Person();
instance.age = -1;
```

# Testing

Testing is conducted using Mocha, Chai, and Istanbul. 

# Updates (reverse chronological order)

2015-12-13 v0.0.9 Added more unit tests and documentation

2015-12-13 v0.0.8 Added unit tests and missing error handlers for min, max, matches

2015-12-12 v0.0.7 Codacy driven improvements

2015-11-29 v0.0.6 Original public commit

# License

This software is provided as-is under the [MIT license](http://opensource.org/licenses/MIT).