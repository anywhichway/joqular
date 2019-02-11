# joqular

JavaScript Object Query Language Representation - Funny it's mostly JSON.

JOQULAR is a query language specification. Although there is a reference implementation with this site others are free to write their own drivers.

Like SQL, JOQULAR allows you to mutate the returned records to meet you needs; however, if you do not perform any mutations you will get the matched object back rather than a copy.

Mutation options include property aliasing and redaction, value substitution (including array summaries, sorting, filtering, etc.), adding event handlers, freezing objects and properties.

Matching options include functional testing of both property names and values as well as over 30 built-in predicates.

You can also use JOQULAR to validate objects.

# Installation Of Reference Implementation

npm install joqular

# Usage

```
const <matched> = await JOQULAR.match(<pattern>,<object>);
```

```
const pattern = {name:{$eq:"joe"}},
	[matched1] = await JOQULAR.match(pattern,{name:"joe",age:27}), // will resolve to the object with name "joe"
	[matched2] = await JOQULAR.match(pattern,{name:"jane",age:27}); // will resolve to undefined
```

For now see the [Medium article](https://medium.com/@anywhichway/joqular-high-powered-javascript-pattern-matching-273a0d77eab5) for more information.

# API

## Predicates and Functions

All 92 predicates and functions or their aliases could actually be defined inline; however, functiona that are difficult to implement or used frequently are defined as part of JOQULAR.

Below is an alphabetical list with minimal documentation. Future documentation will have far more detail and group functions by type. In the meantime, see the the `index.js` in the test directory and review the unit tests.

$

$and 

$as

$avg 

$avga 

$between

$compute

$count

$counta

$date 

$day

$default

$define 

$descendant

$disjoint 

$echoes 

$eeq 

$eq 

$every 

$excludes 

$extract

$false 

$filter 

$forDescendant 

$freeze 

$fullYear

$gt 

$gte 

$hours 

$in 

$includes 

$instanceof 

$intersects 

$isAny 

$isArray 

$isCreditCard 

$isEmail 

$isEven 

$isFrozen 

$isIPAddress 

$isNaN 

$isOdd 

$isSSN 

$length 

$lt 

$lte 

$map 

$matches 

$max 

$maxa 

$milliseconds 

$min 

$mina 

$minutes 

$month 

$ne 

$neeq 

$neq 

$nin 

$not 

$on

$or 

$outside 

$readonly 

$redact 

$reduce 

$regexp 

$return 

$sample 

$search 

$seconds 

$some 

$sort 

$sum 

$suma 

$text 

$time 

$true 

$type 

$typeof 

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

$year


## Updates

2019-02-10 v2.0.1b - `.match` now returns an array and can take multiple objects to match against. Added event handlers via $on. Now returns source object if no-mutations have occured.

2019-02-10 v2.0.0b - Initial public reference implementation subsequent to deprecation of JOQULAR as an in memory datastore.









