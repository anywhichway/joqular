# joqular

JavaScript Object Query Language Representation - Funny it's mostly JSON.

JOQULAR is a query language specification. Although there is a reference implementation with this site, others are free to write their own drivers.

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

All 97 predicates and functions or their aliases could actually be defined in-line; however, functions that are difficult to implement or used frequently are defined as part of JOQULAR. Additionally, by not using in-line functions, most JOQULAR patterns can be transmitted over the wire.

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

$and - `{<property>:{$and: Array [<pattern>,...]||<logical pattern>}}`

Returns `true` and matching continues if the value of the target `<property>` satisfies all of the JOQULAR patterns in the `Array` or a nested logical pattern, e.g. `{$or: {$and: ...}`; otherwise, matching fails.

$as - `{<property>:{$as: string as}}` 

* Adds a property `as` on the target with the value of `<property>` on the target.

$avg - `{<property>: {$avg: null||string as}}`

* Assumes the current value of the `<property>` on the target is an iterable. Average's the numbers and either replaces the property value with the average if `as` equals `null`. Or, it adds a property with the name `as` and sets it to the average.

$avga - `{<property>: {$avg: null||string as}}`

* Same as `$avg`, except `true` and `false` are treated like 1 and 0 respectively and an attempt is made to parse string values as numbers.

$between - `{<property>: {$between: [number hi,number lo,boolean inclusive]}}`

* Returns `true` and mathcing continues if the value of `<property>` on the target is between `hi` and `lo`, optionally inclusive of the boundaries; otherwise, matching fails. The value of the target `<property>` can be a Date in addition to a `number` or a `string`. The function is polymorphic. The function is polymorphic. If the method `between` is available on the value of the target `<property>`, it is called with `hi` and `lo` as arguments. Hence, it can be used for geometric objects, 3D space, or other custom classes.

$compute - `{<property>: {$compute (value,key,object) => ... || Array [function f,string as]}}`

* Computes a value for `<property` using the provided function and either replaces the property value if `as` is null or undefined. Or, it adds a property with the name `as` and sets it to the computed value.

$count - `{<property>: {$count: number count}}`

* Returns `true` if the value of `<property>` equals `count` based on a full evaluation of the underlying iterable on the target ignoring `undefined`.

$counta - `{<property>: {$counta: number count}}`

* Similar to `$count` except that is trusts the `.length` or method calls for `count()` on the underlying iterable if available.

$date - `{<property>: {$date: number dayOfMonth}}`

* If the target `<property>` has a Date value where `getDate() === dayOfMonth`, matching continues; otherwise, matching fails.

$day - `{<property>: {$day: number dayOfWeek}}`

* If the target `<property>` has a Date value where `getDay() === dayOfWeek`, matching continues; otherwise, matching fails.

$default - `{<property>: {$default: any value}}`

* Sets value of target `<property>` to `value` if it is undefined.

$define - `{<property>: {$define: {enumerable,configurable,writable[,value]}}`

* Defines the `<property>` on the target object using the descriptor provided and sets the value to that of the value already on the target. If the optional `value` is provided on the descriptor, uses that instead of the current value on the target and creates the property if it does not exist.

$descendant - `{<property>: {$descendant: <pattern>}}`

* Returns `true` and matching continues if any descendant of the property on the target matches the `<pattern>`; otherwise, matching fails.

$disjoint - `{<property>: {$disjoint: Array array}}`

* Returns `true` and matching continues if the array on the target `<property>` is disjoint (has no values in common) with `array`; otherwise, matching fails.

$disjunction - `{<property>: {$disjunction: Array array}}`

* Sets the `<property>` on the target to the disjunction of the array on the target with `array`. If the property does not contain an array, matching fails. If `array` has an `as` and additional property, it is added to hold the disjunction. To set the `as` property on an array, pass in this self evaluating function: `((array, as) => { array.as = as; return array; })()`.

$echoes - `{<property>: {$echoes: string value}}`

* If `soundex(<targetPropertyValue>)===soundex(value)`, matching continues; otherwise, matching fails.

$eeq - `{<property>: {$eeq: string||number||boolean||object value}}`

* If `<targetPropertyValue> === value`, matching continues; otherwise, matching fails.

$eq - `{<property>: {$eq: string||number||boolean||object value}}`

* If `<targetPropertyValue> == value` or in the case of `object`, is deep equal to, matching continues; otherwise, matching fails.

$every - `{<property>: {$every: (any item,any key,iterable) =>}}`

* Returns `true` if the provided function returns `truthy` for every value in the `Iterable` stored in the target `<property>` and matching continues; otherwise, matching fails. Fails if the value of the target `<property>` is not an `Iterable`. Unlike its JavaScript counterpart, the target `<property>` value can be any type of `Iterable`, not just an `Array` and if the function returns a `Promise`, it will be awaited.

$excludes - `{<property>: {$excludes: any value}}`

* Converse of `$in` and `$includes`.

$extract - `{<property>: {$extract: <pattern>}}`

Replaces the value of the `<property>` on the target with only the portions of its children explicity referenced in `<pattern>`.

$false - `{<property>: {$false: null}}`

* Returns false and matching fails; otherwise, matching continues. To compare a value to `false`, use `$eq` or `$eeq`.

$filter - `{<property>: {$filter: function (any value) => ...}}`

* Sets `<property>` on target to an `Array` after filtering the `Iterable` value of the property using `f`. Since `f` is an in place operation, no `as` alias is available, use `$map` for this purpose. Unlike its JavaScript counterpart, general `Iterable` values are supported, not just `Array` values. If no target `<property>` exists or it is not an `Iterable`, returns `false` and matching fails.

$forDescendant - `{<property>: {$forDescendant: {<pattern>,function f,number depth=Infinity}}`

Walks the descendant tree of the `<property` on the target, if any. Calls `f` for every node that matches `pattern`. Will stop descending at `depth` or the end of the tree. Automatcially avoids circular structures.

$forEach - `{<property>: {$forEach: (value,key,iterable) => ...}}`

* Sets `<property>` on target to an `Array` after applying the supplied function to the `Iterable` value of the property. Unlike its JavaScript counterpart, general `Iterable` values are supported, not just `Array` values and if the function returns a `Promise`, it will be awaited. If no target `<property>` exists, `false` is returned and matching fails.

$freeze - `{<property>: {$freeze: deep}}`

* Sets `<property>` on target to frozen version of itself. If `deep` is true, applies to child objects also. If value is `null` or `undefined`, sets to `Object.freeze({})`.

$fullYear - `{<property>: {$fullYear: number fullYear}}`

* If the target `<property>` has a Date value where `getFullYear() === fullYear`, matching continues; otherwise, matching fails.

$gt - `{<property>: {$gte: string||number||boolean value}}`

* If `<targetPropertyValue> > value`, matching continues; otherwise, matching fails.

$gte - `{<property>: {$gte: string||number||boolean value}}`

* If `<targetPropertyValue> >= value`, matching continues; otherwise, matching fails.

$hours - `{<property>: {$hours: number hours}}`

* If the target `<property>` has a Date value where `getHours() === hours`, matching continues; otherwise, matching fails.

$in -  `{<property>: {$in: object container}}`

* If the target `<property>` value is contained in the `container`, returns `true` and matching continues; otherwise, matching fails. The function is polymorphic, it will work if the `container` is  an `Iterable` or supports the method `in` or `container` supports the method `includes` or `contains`.

$includes - `{<property>: {$includes: object container}}`

* The same as `$in`, except the order is swapped.

$instanceof - `{<property>: {$instanceof: string className||function ctor}}`

* If  a `className` is provided, it is used to look-up `ctor` in the JOQULAR contructor registry maitained by using `JOQULAR.register(ctor[,name)` and `JOQULAR.unregister(ctor[,name)`. If `<targetPropertyValue> instanceof ctor` returns `true` and matching continues; otherwise, matching fails.

$intersection - `{<property>: {$intersection: Array array}}`

* Sets the `<property>` on the target to the intersection of the array on the target with `array`. If the property does not contain an array, the matching fails. If `array` has an `as` and additional property, it is added to hold the intersection. To set the `as` property on an array, pass in this self evaluating function: `((array, as) => { array.as = as; return array; })()`.

$intersects - `{<property>: {$intersects: Array array}}`

* If the array on the target `<property>` intersects with `array`, matching continues; otherwise, matching fails.

$isAny - `{<property>: {$isAny: types=["boolean","function","number","object","string"]}}`

* If `types.includes(<targetPropertyValue>)` is `true`, matching continues; otherwise, matching fails. By default this is all types except "undefined".

$isArray - `{<property>: {$isArray: null}}`

* If `Array.isArray(<targetPropertyValue>)` is `true`, matching continues; otherwise, matching fails.

$isCreditCard - `{<property>: {$isCreditCard: null}}`

* If the value of the target `<property>` looks like a credit card number and satifies the Luhn algorithm, matching continues; otherwise, matching fails.

$isEmail - `{<property>: {$isEmail: null}}`

* If the value of the target `<property>` looks like an e-mail address, matching continues; otherwise, matching fails.

$isEven - `{<property>: {$isEven: null}}`

* If `<targetPropertyValue> % 2 === 0`, matching continues; otherwise, matching fails.

$isFrozen - `{<property>: {$isFrozen: null}}`

* If `Object.isFrozen(<targetPropertyValue>)` is `true`, matching continues; otherwise, matching fails.

$isIPAddress `{<property>: {$isIPAddress: null}}`

* If the target `<property>` satisfies the regular expression is `true`, matching continues; otherwise, matching fails.

* (/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/m).

$isNaN - `{<property>: {$isNan: null}}`

* If the value of the target `<property>` satisfies `isNaN(value)` is `true`, matching continues; otherwise, matching fails. 

$isOdd - `{<property>: {$isOdd: null}}`

* If `<targetPropertyValue> % 2 !== 0`, matching continues; otherwise, matching fails. 

$isSSN - `{<property>: {$isSSN: null}}`

* If the target `<property>` value satisfies the regular expression, matching continues; otherwise, matching fails.

* /^\d{3}-?\d{2}-?\d{4}$/.

$length - `{<property>: {$length: value}}`

* If `<targetPropertyValue>.length === value`, matching continues; otherwise, matching fails.

$lt - `{<property>: {$lt: string||number||boolean value}}`

* If  `<targetPropertyValue> < value`, matching continues; otherwise, matching fails.

$lte - `{<property>: {$lte: string||number||boolean value}}`

* If `<targetPropertyValue> <= value`, matching continues; otherwise, matching fails.

$lock - `{<property>: {$lock: null}}`

* Modifies the `<property>` on the target to be non-configurable and non-writable.

$map - `{<property>: {$map: function f||Array [function f,string as]}}`

* Sets `<property>` on target to an `Array` resulting from mapping the `Iterable` value of the property using the provided function `f`. If `as` is provided an additional property is added instead of setting `<property>`. Unlike its JavaScript counterpart, general `Iterable` values are supported, not just `Array` values. If no target `<property>` exists, `false` is returned and matching fails. The function `f` should take the form `(value,index,iterable) => ...`.

$match - `{<property>: {$match: any value}}`

* If the target `<property>` value is `undefined` or `null` fails and matching stops. `$match` is polymorphic. If the target `<property>` value is a `boolean`, `number`, or `string`, the `value` is assumed to be a `RegExp` or a string delimited with `/`s convertable into a `RegExp`; otherwise, the value of the `target` property must support the method `match` or `matches`. If the `RegExp` has matches or the method returns `true` matching continues; otherwise matching fails. 

$matches - `{<property>: {$matches: any value||Array [any value,string as]}}`

* If the target `<property>` value is `undefined` or `null` fails and matching stops. `$matches` is polymorphic. If the target `<property>` value is a `boolean`, `number`, or `string`, the `value` is assumed to be a `RegExp` or a string delimited with `/`s convertable into a `RegExp`; otherwise, the value of the `target` property must support the method `match` or `matches`.  Sets `<property>` on target to the the result of calling `matches(value)` or `match(value)`. 

$max - `{<property>: {$max: string||number||boolean value}}`

* Assumes the current value of the `<property>` on the target is an iterable. Get's the max  and either replaces the property value with the max if `as` equals `null`. Or, it adds a property with the name `as` and sets it to the max.

$maxa - `{<property>: {$max: string||number||boolean value}}`

* Same as `$max`, except `true` and `false` are treated like 1 and 0 respectively and an attempt is made to parse string values as numbers.

$milliseconds - `{<property>: {$milliseconds: number milliseconds}}`

* If the target `<property>` has a Date value where `getMilliseconds() === milliseconds` matching continues; otherwise, matching fails.

$min - `{<property>: {$min: string||number||boolean value}}`

* Assumes the current value of the `<property>` on the target is an `Iterable`. Get's the min  and either replaces the property value with the min if `as` equals `null`. Or, it adds a property with the name `as` and sets it to the min. If the value is not an `Iterable`, matching fails.

$mina - `{<property>: {$min: string||number||boolean value}}`

* Same as `$min`, except `true` and `false` are treated like 1 and 0 respectively and an attempt is made to parse string values as numbers.

$minutes - `{<property>: {$minutes: number minutes}}`

* If the target `<property>` has a Date value where `getMinutes() === minutes` matching continues; otherwise, matching fails.

$month - `{<property>: {$month: number month}}`

* If the target `<property>` has a Date value where `getMonth() === month` matching continues; otherwise, matching fails. 

$ne - Alias for `$neq`.

$neeq - `{<property>: {$neeq: string||number||boolean||object value}}`

* If `<targetPropertyValue>!== value` matching continues; otherwise, matching fails.

$neq - `{<property>: {$neq: string||number||boolean||object value}}`

* If `<targetPropertyValue> != value` or in the case of an object are not deep equal matching continues; otherwise, matching fails.

$nin - `{<property>:{$nin: object value}}`

* Converse of `$in`.

$not - `{<property>:{$not: <pattern>}}`

Returns `true` and matching continues is the value of the target `<property` does not satisfy the JOQULAR pattern; otherwise, matching fails.

$on - `{<property>:{$on:{get,set,delete,onError}}}`

Adds handlers to the target `<property>` that are invoked for `get`, `set`, and `delete`. The handlers take the standard form `(object,key,value[,oldvalue]) => ...` with only `set` getting `oldvalue`. If a handler returns a `Promise` it is NOT awaited.

If `onError` is provided it should have the signature `(error,object,key,value[,oldvalue]) => ...`. The `onError` function can chose to swallow the error or re-throw it. Note, if the error is critical and the desrie is to abort the attempted action, the `onError` handler must be synchronus, i.e. not return a `Promise` or throw from a timeout.

$or - `{<property>:{$or: Array [<pattern>,...]||<logical pattern>}}`

Returns `true` and matching continues if the value of the target `<property>` satisfies one of the JOQULAR patterns in the `Array` or a nested logical pattern, e.g. `{$or: {$and: ...}`; otherwise, matching fails.

$outside - `{<property>: {$outside: [number hi,number lo]}}`

* Returns `true` and matching continues if the value of `<property>` on the target is outside `hi` and `lo`. The value of the target `<property>` can be a Date in addition to a `number` or a `string`. The function is polymorphic. If the method `outside` is available on the value of the target `<property>`, it is called with `hi` and `lo` as arguments. Hence, it can be used for geometric objects, 3D space, or other custom classes.

$readonly - `{<property>: {$readonly: null}}`

Returns `true` and continue matching if the `<property>` exists on the target and is read-only; otherwise, matching fails.

$redact - `{<property>: {$redact null||(key,value,object) => ...}}`

Deletes the `<property>` from the target if argument is `null` or the provided function returns `true`.

$reduce - `{<property>: {$reduce: function f||Array [function f,accum,as]}}`

* Sets `<property>` on target to an `Array` resulting from reducing the `Iterable` value of the property using the provided function `f`. If `accum` is not provided, the first value of the `Iterable` is used. If `as` is provided an additional property is added instead of setting `<property>`. Unlike its JavaScript counterpart, general `Iterable` values are supported, not just `Array` values. If no target `<property>` exists, `false` is returned and matching fails. The function `f` should take the form `(accum,value,index,iterable) => ...`.

$regexp - `{<property>: {$regexp: RegExp regexp}}`

Alias for `$match`.

$return - `{<property>: {$return: any value}}`

Sets the value on the target `<property>` to `value`.

$sample - `{<property>: {$sample: number 0.pct||[0.pct,number max=Infinity,string as]}}`

Assumes the target `<property>` is an `Iterable` and computes a random sample of `max` size or `percentage * size`. The sample is stored in the target property unless `as` is specified to add a property. The `pct` is a decimal between zero and one. The chance of any given item being picked is independenty equal to the `pct`. This is because for some iterables the size is not known until the entire iterable has been processed. Be careful not to try and sample an infinitely yielding `Iterator` without providing a length. If the value of the target `<property>` is not an iterable, matching fails.

$search - `{<property>: {$search: string searchPhrase||[string searchPhrase,number stems,number trigrams=0.8,string language]}`

* Returns `true` and matching continues if `searchPhrase` is found in the value of the target `<property>`. The search is conducted using stemmed tokens and trigrams. The stem matching is uses `or` unless `stems` is set to a number between zero and 1 to use as a percentage stem match . If stem matching fails, trigram matching is attempted must equal or exceed 80%. To turn off trigram matching, explicitly pass `trigrams=1.0`. `$search` is polymorphic. If the target `<property>` value supports the method `search` then it is called with `searchPhrase` as the first argument and `{language,stems,trigrams}` as the second. The only language currently supported is "en", English.

$seconds - `{<property>: {$seconds: number seconds}}`

* Returns `true` if the target `<property>` has a Date value where `getSeconds() === seconds`.  

$some - `{<property>: {$some: (any item,any key,Iterable iterable) =>}}`

* Returns `true` if the provided function returns `truthy` for some value in the `Iterable` stored in the target `<property>` and matching continues; otherwise, matching fails. Fails if the value of the target `<property>` is not an `Iterable`. Unlike its JavaScript counterpart, the target `<property>` value can be any type of `Iterable`, not just an `Array` and if the function returns a `Promise`, it will be awaited.

$sort - `{<property>: {$sort: (any a, any b) => ... || [(any a,any b) => ...,as]}}`

* Assumes the current value of the `<property>` on the target is an iterable. Sorts the values using the normal JavaScript sort approach and replaces the property value with the sorted value i `as` equals `null`. Or, it adds a property with the name `as` and sets it to the average.  If the value of the target `<property>` is not an iterable, matching fails.

$sum - `{<property>: {$sum: null||string as}}`

* Assumes the current value of the `<property>` on the target is an iterable. Averages the numbers and either replaces the property value with the average if `as` equals `null`. Or, it adds a property with the name `as` and sets it to the average.  If the value of the target `<property>` is not an iterable, matching fails.

$suma - `{<property>: {$sum: null||string as}}`

* Same as `$sum`, except `true` and `false` are treated like 1 and 0 respectively and an attempt is made to parse string values as numbers.

$text - `{<property>: {$text: string searchPhrase||[string searchPhrase,string language]}`

Aliased to `$search`. Unlike MongoDB, case sensisitivity is not supported and the search uses stems and trigrams.

$time - `{<property>: {$time: number time}}`

* Returns `true` and matching continues if the target `<property>` has a Date value where `getTime() === time`; otherwise, matching fails. 

$true - `{<property>: {$true: null}}`

* Returns `true` and matching continues; otherwise, matching fails. To compare a value to `true`, use `$eq` or `$eeq`.

$type - Alias for `$typeof`.

$typeof - `{<property>: {$typeof: string type}}`

* Returns `true` if the value of the target `<property>` `== type`.

$UTCDate - `{<property>: {$UTCDate: number date}}`

* Same as $date, except for UTC value.

$UTCDay -`{<property>: {$UTCDay: number day}}`

* Same as $day, except for UTC value.

$UTCFullYear - `{<property>: {$UTCFullYear: number fullYear}}`

* Same as $fullYear, except for UTC value.

$UTCHours -`{<property>: {$UTCHours number hours}}`

* Same as $hours, except for UTC value.

$UTCMilliseconds -`{<property>: {$UTCMilliseconds: number milliseconds}}`

* Same as $milliseconds, except for UTC value.

$UTCMinutes -`{<property>: {$UTCMinutes: number minutes}}`

* Same as $minutes, except for UTC value.

$UTCMonth -`{<property>: {$UTCMonth: number month}}`

* Same as $month, except for UTC value.

$UTCSeconds  -`{<property>: {$UTCSeconds: number seconds}}`

* Same as $seconds, except for UTC value. 

$valid - `{<property>: {$valid: (value,key,object) => ... || <pattern>}}`

If a function is passed in and returns `true` matching continues. If a pattern is passed in, JOQULAR confirms the `<property>` value on the target conforms with the `<pattern>`. If it does not conform and the pattern contains `onError` with a function value the function is called with `(error,value,key,object)`. If no `onError` is provided or its value is not a function, an error is thrown.

$value - `{<property>: {$value: (value,key,object)=>...}}`

Alias for `$compute`.

$where - `{<property>: {$where: (value,key,object)=>...}}`

Alias for `$`.

$xor - `{<property>:{$xor: Array [<pattern>,...]||<logical pattern>}}`

Returns `true` and matching continues if the value of the target `<property>` satisfies at most one of the JOQULAR patterns in the `Array` or a nested logical pattern, e.g. `{$or: {$and: ...}`; otherwise, matching fails.

$year - `{<property>: {$year: number year}}`

* Returns `true` if the target `<property>` has a Date value where `getYear() === year`.


## Updates

2019-02-12 v2.03b - All functions now have basic documentation.

2019-02-11 v2.02b - Lots of documentation. Started deprecation on method name `.match` in favor of `.query`, but both will work for now through aliasing.

2019-02-10 v2.0.1b - `.match` now returns an array and can take multiple objects to match against. Added event handlers via
`$on`. Now returns source object if no-mutations have occured.

2019-02-10 v2.0.0b - Initial public reference implementation subsequent to deprecation of JOQULAR as an in memory datastore.









