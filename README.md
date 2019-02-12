# joqular

JavaScript Object Query Language Representation - Funny it's mostly JSON.

JOQULAR is a query language specification. Although there is a reference implementation with this site others are free to write their own drivers.

Like SQL, JOQULAR allows you to mutate the returned records to meet you needs.

Mutation options include property aliasing and redaction, value substitution (including array summaries, sorting, filtering, etc.), adding event handlers, freezing objects and properties.

Matching options include functional testing of both property names and values as well as over 30 built-in predicates.

You can also use JOQULAR to validate objects.

# Installation Of Reference Implementation

npm install joqular

# Usage

```javascript
const [<matched>,...] = await JOQULAR.query(<pattern>,<object>,...);
```

```javascript
const pattern = {name:{$eq:"joe"}},
	[matched1] = await JOQULAR.match(pattern,{name:"joe",age:27}), // will resolve to the object with name "joe"
	[matched2] = await JOQULAR.match(pattern,{name:"jane",age:27}); // will resolve to undefined
```

JOQULAR queries can cause mutations. If an object is mutated during a query, a copy is returned. If no mutations occur, the original is returned. If you always want a copy, then do something to force a slight mutation, e.g. add a hidden property with
`$define`.

For now see the [Medium article](https://medium.com/@anywhichway/joqular-high-powered-javascript-pattern-matching-273a0d77eab5) for more information.

# API

## Predicates and Functions

All 92 predicates and functions or their aliases could actually be defined inline; however, functiona that are difficult to implement or used frequently are defined as part of JOQULAR.

New functions can be added in as little as one line of code, e.g.

```javascript
JOQULAR.function((value,key,object) => ...,"$myfunction");
```

or 

```javascript
JOQULAR.function(function $myfunction(value,key) { ...} );
```

In the second form you can use a third `object` argument if you wish, but the `this` context is also set to the object being tested. In the first form the `this` context can't be used effectively because it is the context from the point at which the function was defined.

Below is an alphabetical list with minimal documentation. Future documentation will have far more detail and group functions by type. In the meantime, see the `index.js` in the test directory and review the unit tests.

$ - `{<property>:{$: (value,property,object) => ...}` 

* Calls a function with the property value, name, and object. The function can change the object. Matching continues if the function returns `true`.

$and - `{$and: <pattern>}`

$as - `{<property>:{$as: string as}}` 

* Adds a property `as` on the target with the value of `<property>` on the target.

$avg - `{<property>: {$avg: null||string as}}`

* Assumes the current value of the `<property>` on the target is an iterable. Average's the numbers and either replaces the property value with the average if `as` equals `null`. Or, it adds a property with the name `as` and sets it to the average.

$avga - `{<property>: {$avg: null||string as}}`

* Same as `$avg`, except `true` and `false` are treated like 1 and 0 respectively and an attempt is made to parse string values as numbers.

$between - `{<property>: {$between: [number hi,number lo,boolean inclusive]}}`

* Returns `true` in the value of `<property>` on the target is between `hi` and `lo`, optionally inclusive of the boundaries.

$compute - `{<property>: {$compute (value,key,object) => ... || Array [function f,string as]}}`

* Computes a value for `<property` using the provided function and either replaces the property value if `as` is null or undefined. Or, it adds a property with the name `as` and sets it to the computed value.

$count - `{<property>: {$count: number count}}`

* Returns true if the value of `<property>` equals `count` based on a full evaluation of the underlying iterable on the target ignoring `undefined`.

$counta - `{<property>: {$counta: number count}}`

* Similar to `$count` except that is trusts the `.length` or method calls for `count()` on the underlying iterable if available.

$date - `{<property>: {$date: number dayOfMonth}}`

* Returns true if the target `<property>` has a Date value where `getDate() === dayOfMonth`.

$day - `{<property>: {$day: number dayOfWeek}}`

* Returns true if the target `<property>` has a Date value where `getDay() === dayOfWeek`.

$default - `{<property>: {$default: any value}}`

* Sets value of target `<property>` to `value` if it is undefined.

$define - `{<property>: {$define: {enumerable,configurable,writable[,value]}}`

* Defines the `<property>` on the target object using the descriptor provided and sets the value to that of the value already on the target. If the optional `value` is provided on the descriptor, uses that instead of the current value on the target and creates the property if it does not exist.

$descendant - `{<property>: {$descendant: <pattern>}}`

* Returns true if any descendant of the property on the target matches the `<pattern>`.

$disjoint - `{<property>: {$disjoint: Array array}}`

* Returns true if the array on the target `<property>` is disjoint (has no values in common) with `array`.

$echoes - `{<property>: {$echoes: string value}}`

* Returns the result of `soundex(<targetPropertyValue>)===soundex(value)`.

$eeq - `{<property>: {$eeq: string||number||boolean||object value}}`

* Returns the result of `<targetPropertyValue> === value`.

$eq - `{<property>: {$eq: string||number||boolean||object value}}`

* Returns the result of `<targetPropertyValue> == value` or in the case of `object`, is deep equal to.

$every -

$excludes -

$extract - `{<property>: {$extract: <pattern>}}`

Replaces the value of the `<property>` on the target with only the portions of its children explicity referenced in `<pattern>`.

$false -

$filter -

$forDescendant - `{<property>: {$forDescendant: {pattern,f,depth=Infinity}}`

Walks the descendant tree of the `<property` on the target, if any. Calls `f` for every node that matches `pattern`. Will stop descending at `depth` or the end of the tree. Automatcially avoids circular structures.

$freeze - 

$fullYear - `{<property>: {$fullYear: number fullYear}}`

* Returns true if the target `<property>` has a Date value where `getFullYear() === fullYear`.

$gt - `{<property>: {$gte: string||number||boolean value}}`

* Returns the result of `<targetPropertyValue> > value`.

$gte - `{<property>: {$gte: string||number||boolean value}}`

* Returns the result of `<targetPropertyValue> >= value`.

$hours - `{<property>: {$hours: number hours}}`

* Returns true if the target `<property>` has a Date value where `getHours() === hours`.

$in -

$includes -

$instanceof -

$intersection - `{<property>: {$intersection: Array array}}`

* Sets the `<property>` on the target to the intersection of the array on the target with `array`. If the property does not contain an array, the result is an emtpy array since there can be no intersection. If `array` has an `as` and additional property is added to hold the intersection.

$intersects - `{<property>: {$intersects: Array array}}`

* Returns true if the array on the target `<property>` intersects with `array`.

$isAny - `{<property>: {$isAny: types=["boolean","function","number","object","string"]}}`

* Returns the result of `types.includes(<targetPropertyValue>)`. By default this is all types except "undefined".

$isArray - `{<property>: {$isArray: null}}`

* Returns the result of `Array.isArray(<targetPropertyValue>)`.

$isCreditCard - `{<property>: {$isCreditCard: string||number||boolean value}}`

* Returns true if the value of the target `<property>` satifies the Luhn algorithm.

$isEmail -

$isEven - `{<property>: {$isEven: null}}`

* Returns the result of `<targetPropertyValue> % 2 === 0`.

$isFrozen - `{<property>: {$isFrozen: null}}`

* Returns the result of `Object.isFrozen(<targetPropertyValue>)`.

$isIPAddress `{<property>: {$isIPAddress: null}}`

* Returns `true` is the target `<property>` satifies the regular expression:

* (/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/m).

$isNaN - `{<property>: {$isNan: null}}`

* Returns true if the value of the target `<property>` `satisfies isNaN(value)`. 

$isOdd - `{<property>: {$isOdd: null}}`

* Returns the result of `<targetPropertyValue> % 2 !== 0` 

$isSSN - `{<property>: {$isSSN: null}}`

* Returns `true` if the target `<property>` value satisfies the regular expression:

* /^\d{3}-?\d{2}-?\d{4}$/.

$length - `{<property>: {$length: value}}`

* Returns the result of `<targetPropertyValue>.length === value`.

$lt - `{<property>: {$lt: string||number||boolean value}}`

* Returns the result of  `<targetPropertyValue> < value`.

$lte - `{<property>: {$lte: string||number||boolean value}}`

* Returns the result of `<targetPropertyValue> <= value`.

$map -

$matches -

$max - `{<property>: {$max: string||number||boolean value}}`

* Assumes the current value of the `<property>` on the target is an iterable. Get's the max  and either replaces the property value with the max if `as` equals `null`. Or, it adds a property with the name `as` and sets it to the max.

$maxa - `{<property>: {$max: string||number||boolean value}}`

* Same as `$max`, except `true` and `false` are treated like 1 and 0 respectively and an attempt is made to parse string values as numbers.

$milliseconds - `{<property>: {$milliseconds: number milliseconds}}`

* Returns true if the target `<property>` has a Date value where `getMilliseconds() === milliseconds`.

$min - `{<property>: {$min: string||number||boolean value}}`

* Assumes the current value of the `<property>` on the target is an iterable. Get's the min  and either replaces the property value with the min if `as` equals `null`. Or, it adds a property with the name `as` and sets it to the min.

$mina - `{<property>: {$min: string||number||boolean value}}`

* Same as `$min`, except `true` and `false` are treated like 1 and 0 respectively and an attempt is made to parse string values as numbers.

$minutes - `{<property>: {$minutes: number minutes}}`

* Returns true if the target `<property>` has a Date value where `getMinutes() === minutes`.

$month - `{<property>: {$month: number month}}`

* Returns true if the target `<property>` has a Date value where `getMonth() === month`. 

$ne - Alias for `$neq`.

$neeq - `{<property>: {$neeq: string||number||boolean||object value}}`

* Returns true if the value of the target `<property>` `!== value`.

$neq - `{<property>: {$neq: string||number||boolean||object value}}`

* Returns true if the value of the target `<property>` `!= value` or in the case of an object are not deep equal.

$nin 

$not 

$on - `{<property>:{$on:{get,set,delete,onError}}}`

Adds handlers to the target `<property>` that are invoked for `get`, `set`, and `delete`. The handlers take the standard form `(object,key,value[,oldvalue]) => ...` with only `set` getting `oldvalue`. If a handler returns a `Promise` it is NOT awaited.

If `onError` is provided it should have the signature `(error,object,key,value[,oldvalue]) => ...`. The `onError` function can chose to swallow the error or re-throw it. Note, if the error is critical and the desrie is to abort the attempted action, the `onError` handler must be synchronus, i.e. not return a `Promise` or throw from a timeout.

$or -

$outside -

$readonly - `{<property>: {$readonly: null}}`

Returns true if the `<property>` exists on the target and is read-only.

$redact - `{<property>: {$redact null||(key,value,object) => ...}}`

Deletes the `<property>` from the target if argument is `null` or the provided function returns true.

$reduce -

$regexp -

$return - `{<property>: {$return: any value}}`

Sets the value on the target `<property>` to `value`.

$sample - `{<property>: {$sample: number 0.percentage||[pct,max=Infinity,as]}}`

Assumes the target `<property>` is an `Iterable` and computes a random sample of `max` size or `percentage * size`. The sample is stored in the target property unless `as` is specified to add a property. The `percentage` is a decimal between zero and one. The chance of any given item being picked is independenty equal to the `percentage`. This is because for some iterables the size is not known until the entire iterable has been processed. Be careful not to try and sample an infinitely yielding `Iterator` without providing a length.

$search -

$seconds - `{<property>: {$seconds: number seconds}}`

* Returns true if the target `<property>` has a Date value where `getSeconds() === seconds`.  

$some -

$sort -

$sum - `{<property>: {$sum: null||string as}}`

* Assumes the current value of the `<property>` on the target is an iterable. Average's the numbers and either replaces the property value with the average if `as` equals `null`. Or, it adds a property with the name `as` and sets it to the average.

$suma - `{<property>: {$sum: null||string as}}`

* Same as `$sum`, except `true` and `false` are treated like 1 and 0 respectively and an attempt is made to parse string values as numbers.

$text -

$time - `{<property>: {$time: number time}}`

* Returns true if the target `<property>` has a Date value where `getTime() === time`.   

$true -

$type - Alias for `$typeof`.

$typeof - `{<property>: {$typeof: string type}}`

* Returns true if the value of the target `<property>` `== type`.

$UTCDate

$UTCDay

$UTCFullYear 

$UTCHours 

$UTCMilliseconds 

$UTCMinutes 

$UTCMonth 

$UTCSeconds     

$valid 

$value 

$where 

$xor 

$year - `{<property>: {$year: number year}}`

* Returns true if the target `<property>` has a Date value where `getYear() === year`.


## Updates

2019-02-11 v2.02b - Lots of documentation. Started deprecation on method name `.match` in favor of `.query`, but both will work for now through aliasing.

2019-02-10 v2.0.1b - `.match` now returns an array and can take multiple objects to match against. Added event handlers via
`$on`. Now returns source object if no-mutations have occured.

2019-02-10 v2.0.0b - Initial public reference implementation subsequent to deprecation of JOQULAR as an in memory datastore.









