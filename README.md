# joqular

**NOTE**: JOQULAR has now been replaced by ReasonDB: https://github.com/anywhichway/

JavaScript Object Query Language Representation - Funny, it's mostly JSON.

- Serializable pattern and SQL like object matching for JavaScript, including joins!

- Use Insert, Update, Delete to modify objects and indexes, or configure indexes to update automatically with zero configuration indexing.

- More built-in predicates/operators than most other other data query mechanisms. Includes built in random and statistical sampling capability.

- Extensible with just one line of code per predicate/query operator. Puts the intelligence in your data, not the database engine.

- Just-in-time, fully indexed in-memory database

- Indexes represent the live state of JavaScript objects. Query results are also live objects or POJO projections, your choice. POJO key value formatting using a built-in or developer specified format function.

- Client and server side persistence.

- A Node Express starter framework

This is version 2.0.1 of JOQULAR. This is an ALPHA release. Changes from version 1.0 include: 

1) A far cleaner code-base.

2) A more modular code-base.

3) Movement of temporal code into its own library https://github.com/anywhichway/about-time.

4) All predicates and key words now start with $.

5) Path references now use the key word $self, e.g. {"/": "name"} becomes {$self:"/name"}.

6) Native object polyfills are now optional, although not using them will limit database predicate tests against these objects.

7) The calling interface is now almost exclusively Promise based.

8) Schema based validation on a continuous basis per property change or a per Object invocation has been added using https://github.com/anywhichway/jovial.

9) Both client and server storage have been added. Transfer of data to the server id accomplished using Faye

10) A Node Express starter framework is provided.

11) All documentation is temporarily moved into this README.

Remaining activities to get to beta include:

1) More functional testing

2) Cross browser testing. The only testing so far is in Chrome.

3) More performance testing to verify the code, like v1, is still 2x to 10x faster than linear search, and faster than Forerunner, IndexedDB and PouchDB for insert and search.

4) Proper packaging and bundling. Currently the most viable way to start development with JOQULAR is to base an application on the sample provided in the test directory. There is no one file or module that can be loaded.

5) Further work on client/server data synchronization.

6) More documentation

Issues log: https://github.com/anywhichway/joqular/issues


# contents

installation

getting started

examples

pattern matching

selections, joins and projections

persistence

extending JOQULAR

internals

updates

# installation

Fork the github repository https://github.com/anywhichway/joqular/tree/v2

# getting started

Use the sample Node Express application in the test directory. If you start the application by running test/bin/www you should be able to access http://localhost:3000/index.html. If you have your browser developer tools open this will display the results of unit testing. It will also create data in the browser local storage and a directory under /test/public called clientserver.db with JSON files containing the same data as found in the browser local storage. Repeatedly loading the index.html page will add more data to the data stores.

# examples

// everyone named Joe

{name: {$eq: 'Joe'}} 

// everyone born in January

{birthday: {month: 1}}

// events longer than 1 hour

{event: {hours: {$gt: 1}}}

// all adult women

{age: {$gte: 18}, gender: 'female'}} 

// adult women Bainbridge Island and downtown Seattle

{age: {$gte: 18}, gender: 'female', address: {zipcode: {$in: [98110,98101]}}}} 

// all grandsons named the same as their grandfather

{father: {father: {name: {$self: '/name'}}}} 

// all partners who are partnered with the same gender

{partner1: {gender: {$self: '..partner2/gender'}}}

// all partners who are not partnered with the same gender

{partner1: {gender: {$neq: {$self: '..partner2/gender'}}}} 

// Joe's children, if any are sick

{name: 'Joe', {children: {$some: function(child) { return child.isSick; }}}} 

// Joe's children, if all are sick

{name: 'Joe', {children: {$every: function(child) { return child.isSick; }}}} 

// [], unless all females are named Jo

{gender: 'female', {$forall: function(object) { return object.name==='Jo'; }}} 

// all females if any are named Jo

{gender: 'female', {$exists: function(object) { return object.name==='Jo'; }}} 

// anyone named Joe or Jo

{name: {$soundex: 'Joe'}} 

// anyone with a name starting in Jo

{name: {$match: /Jo*/}}

// anyone who is female and authorized based on the value, i.e. 21 or over 

function authorized(value) { return value>=21; }.predicate=true;
{gender: 'female', {age: {$: authorized}}} 

// anyone who is female and authorized based on the object, i.e. a volunteer 

function authorized() { return this.volunteer }.predicate=true;
{gender: 'female', $$: authorized}

// general query

select().from({p1: Person}).where(\<any of the above patterns\>\);

// all Person's ordered by zipcode, then name

select().from({p1: Person}).orderBy({'p1.address.zipcode': 'asc', 'p1.name':'asc'});

 // all combinations of people
 
select().from({p1: Person,p2: Person}).where({p2: {$neq: p1}});

// first 10 Person's matching a query

select().first(10).from({p1: Person}).where(\<any of the above patterns\>);

// last 10 Person's matching a query

select().last(10).from({p1: Person}).where(\<any of the above patterns\>);

// random sample at 95% confidence +/- 3

select().sample(.95,.03).from({p1: Person});

# pattern matching

Classes are made available to JOQULAR for pattern matching by invoking `<constructor> = JOQULAR.Entity(<constructor>,"<name>")`. This subclasses the provided constructor and returns the constructor for the new class, which should be used in place of the original constructor. The `<name>` argument is optional expect unless the name property is not available from the constructor, i.e. when they were created anonymously or in certain Javascript engines, e.g. Internet Explorer.

Once a class is made available to JOQULAR all new instances are automatically indexed as first class objects and become available for pattern matching using `<constructor>>.find(<pattern>)` which will return a Promise resolving to an Array of matching instances. As part of the indexing process an enumerable `_id` field will be added to all Entities. You can think of them almost like records in MongoDB collections.

`<pattern>` is a Javascript object which may use keys and values to literally match instances or may have predicates in place of property keys. The value `null` is indexed and literally matchable, the psuedo-value `unknown` is not indexed. By convention, these predicates start with $. The list of predicates generally includes `$lt, $lte, $eq, $new, $gte, $gt`. Strings also make available `$echoes, $match`. A complete list of built-in predicates is available in the API section. However, predicates can be added with just one line of code to leverage any custom objects you may wish to store in JOQULAR format. See the section on extending JOQULAR.

Here is a simple example:

```
function Person(name,age) {
	this.name = name;
	this.age = age;
}
Person = JOQULAR.Entity(Person);
var p1 = New Person("Joe",20);
var p2 = new Person("Bill",19);
var p3 = new Person(null",19);
Person.find({name: "Joe"}).then(function(results) {
	console.log(results); }); // prints [{name:"Joe", age: 20}]
Person.find({name: {$neq: null},age: {$gt: 18}}).then(function(results) {
	console.log(results); }); // prints [{name:"Joe", age: 20},{name:"Bill", age: 19}]
```

Actually, an _id field containing a uuid4 id will also be present in each of the above but has been dropped for clarity in the example.

# selections, joins and projections

JOQULAR has a query language with key words and clause sequencing similar to SQL. Once a class has been made available to JOQULAR using the JOQULAR.Entity class method, it can be accessed and manipulated using this query language.

Unless a projection is needed to limit the properties returned, a query just starts with `JOQULAR.select()`.

The from portion of a query is used to specify the classes from which to select instances an the aliases to use fro the classes. Unlike SQL and alias must be provided, e.g. `JOQULAR.select().from({p1: Person})` selects Person instances and makes the alias `p1` available to patterns in the where clause.

The where clause uses the same pattern matching syntax as `<class>.find(pattern)`, except that the top level of each pattern has as keys the aliases created in the from clause, e.g. `JOQULAR.select().from({p1: Person}).where({p1: {name: null, age: 19}})`.

A from clause can be prefixed with `.first(count), .last(count), .sample(sizeOrConfidenceLevel[,marginOfError])`, e.g. `JOQULAR.select().first(1).from({p1: Person})`. If marginOfError is not provided to `.sample`, it is assumed `sizeOrConfidenceLevel` is a count. Optionally `.randomize()` can be inserted before or after the count constraints to impact the actual values selected. If inserted alone, it will simply impact the order of the results, e.g. `JOQULAR.select().first(1).randomize().from({p1: Person})`. Additionally, `.first` and `.last` can be used to select from a sample, e.g. `JOQULAR.select().first(1).sample(2).randomize().from({p1: Person})`

An ordering clause can be added at the end using dot notation to access properties and an order specification, e.g. `JOQULAR.select().from({p1: Person}).orderBy({'p1.age': 'desc'})`. The dot notation may be used to access nested objects.

The select portion of a query is used to specify a projection. The properties to select are specified as keys using dot notation and the aliases are specified as sub-objects with the key `as`, e.g. `JOQULAR.select({'p1.name' {as: 'fullname'}}).from({p1: Person})`. The dot notation may be used to access nested objects. Optionally, a format function may be specified, e.g.  `JOQULAR.select({'p1.name' {as: 'fullname', format:function(value) { return value.toUpperCase(); }}}).from({p1: Person})`. If no projection is specified, then the elements in a result set are actual instances of the classes they are selected from; otherwise they are POJOs.


Continuing with the person example above, the following are possible:

```
JOQULAR.select().from({p1: Person}).exec().then(function(results) { 
	console.log(results); }); // prints [{name:"Joe", age: 20},{name:"Bill", age: 19},{name:null, age: 19}] and the array elements are actual instances of Person
JOQULAR.select().from({p1: Person}).where({p1: {name: "Joe"}}).exec().then(function(results) {
	console.log(results); }); // prints [{name:"Joe", age: 20}]
JOQULAR.select().first(1).sample(2).randomize().from({p1: Person}).exec().then(function(results) { 
	console.log(results); }); // prints [{name:"Joe", age: 20}] or [{name:"Bill", age: 19}] or [{name:null, age: 19}] 
JOQULAR.select().from({p1: Person}).orderBy({"p1.age": "asc"}).exec().then(function(results) { 
	console.log(results); }); // prints [{name:"Bill", age: 19},{name:null, age: 19},{name:"Joe", age: 20}]
JOQULAR.select({'p1.name' {as: 'fullname', format:function(value) { return (value+"").toUpperCase(); }}}).from({p1: Person}).exec().then(function(results) { 
	console.log(results); }); // prints [{fullname:"JOE"},{fullname:"BILL"},{fullname:"NULL}] and the array elements are POJOs.
```

# persistence

A JOQULAR persistence store is created by calling:

```
var db = JOQULAR.db("Test", {storage:new JOQULAR.Storage(undefined,new JOQULAR.Server(window.location.origin + '/joqular'))});
```

`JOQULAR.Storage(primary,replicant)` creates a storage driver. Typically `primary` will be local storage in the browser and can be left as undefined. If replaced it should support  `.getItem(key), .setItem(key,data), .removeItem(key)`.
`JOQULAR.Server(location)` creates a connection to a Faye server providing back-end persistence services. This can be replaced with any service around which a wrapper supporting `.getItem(key), .setItem(key,data), .removeItem(key)`.

Collections are created using the call `var coll = db.collection(<JOQULAR Entity Name>[,options])`. This binds the collection to the index for the class so that all future queries, instance creations, etc. are automatically bound to the collection. There is no need to interact directly with collections for queries, inserts, updates, and deletions. To save the collection to disk, just call `<collection>.save()`.

Once again, continuing with the Person example:

```
var pcollecton = new db.collection("Person");
pcollection.save(); // will persist p1, p2, p3 from the earlier portion of the example
```

If you desire to have all new objects automatically persisted, just call `<collection>.stream(bool=true)`.

```
pcollection.stream();
var p4 = new Person("Mary",35); // will persist p4 without having to call .save
```

# extending JOQULAR

JOQULAR predicates can be extended by adding members to `JOQULAR.predicates`. Member keys represent the predicate name, e.g. `$echoes`. Member values should be generic functions defined using https://github.com/anywhichway/js-generics. This allows predicates to be polymorphic. Hence, you can add entirely new classes to JOQULAR that use the same predicate names and semantics specific to the class. For example:

```
JOQULAR.predicates.$in = generic()
			.method(function(arg) { return arg instanceof Array },function(arg) { return arg.indexOf(this.valueOf())>=0; })
			.method(function(arg) { return typeof(arg.has)==="function"; },function(arg) { return arg.has(this.valueOf()); })
			.method(function(arg) { return typeof(arg.contains)==="function"; },function(arg) { return arg.contains(this.valueOf()); })
			.method(function(arg) { return typeof(arg.includes)==="function"; },function(arg) { return arg.includes(this.valueOf()); }),
```

As you may be able to tell from the above, predicates are always called with `arg` being the object providing the predicate test and `this` being the value tested. In the case of the example above:

```
Person.find({name: {$in: ["Bill"]}).then(function(results) {
		console.log(results); // invokes function(arg) { return arg.indexOf(this.valueOf())>=0; }, 
							  // i.e. ["Bill"].indexOf("Joe"), ["Bill"].indexOf("Bill"), ["Bill"].indexOf(null), ["Bill"].indexOf("Mary")
							  // prints [{name: Bill, age: 19}]
	}); 
```

# internals

to be written

# updates

2016-01-10 v2.0.1 Comprehensive re-write and modularization.

2015-06-01 v1.02.01 Added SQL like Insert, Update, Delete. Further optimized indexing and search. Formatting capability added for POJO projections using Select. Dates fully indexed by year, month, dayofMonth, hours, seconds, milliseconds. Durations fully indexed by years, months, weeks, days,  hours, minutes, seconds, milliseconds. Added weeks (W) to Duration. Three "breaking" changes. 1) Index format changed in a manner that is not compatible with current persisted indexes. No automated migration currently available. 2) Modified syntax to require a $ sign before any function references in patterns and queries in order to provide hints to query optimizer. Simple global replace on an existing function references to address the change. 3) Modified Date, Time, Duration match behavior such they they will no longer match just a number. Dates must be matched using the entire object or their subfields, 'year', 'month', 'dayofMonth', 'hours', 'minutes', 'seconds', 'milliseconds'. Times must be matched using the entire object or their subfield 'milliseconds'. Durations must be matched using the entire object or their subfields 'length' (which is expressed in milliseconds), 'years', 'months', 'weeks', 'days', 'hours', 'seconds', 'milliseconds'. The function 'valueOf()' continues to return a number of milliseconds for all these objects. 

2015-05-11 v1.01.02 Extended ability to reference data across patterns when using providers. Reversed ordering of update info and reformatted examples in README. (1,193 Unit tests and growing ...)

2015-05-04 v1.01.01 Added 'between' and 'outside' for primitive types, added SQL like queries with joins, adopted NPM semantic versioning, no breaking changes going from v0.x.xx to v1.xx.xx (1,163 Unit tests and growing ...)

2015-04-26 v0.0.95 Added missing predicate declaration for String.prototype.match (632 Unit tests and growing ...)

2015-04-26 v0.0.94 Added patterns example, fixed recursion matching issue, added the $$ operator (628 Unit tests and growing ...)

2015-04-25 v0.0.93 corrected typos in npm package  (626 Unit tests and growing ...)

2015-04-25 v0.0.92 Initial public release (626 Unit tests and growing ...)








