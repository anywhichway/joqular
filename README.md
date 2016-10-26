# joqular

NOTE: 

2016-10-25: JOQULAR has now been replaced by ReasonDB: https://github.com/anywhichway/reasondb. There were extensive delays due to differences in behavior of Promises in the broweser and  nodejs. Many of these were resolved by moving to asycn/await programming and the use of Babel. Although the pattern matching language is not fully implemented, SQL like functionality and joins are now supported as is persistence in both the browser and on the server. Some of the other feratures in the ALPHA have also be dropped for now. The code base is half the size.

2016-04-28: With the release of Node v6.0 on April 26th, 2016 we are able to re-start development of JOQULAR 2.0 and move from Alpha to Beta in the next month or so.


An ALPHA of Version 2 of JOQULAR was released on January 10th, 2016. It is available at this branch https://github.com/anywhichway/joqular/tree/v2.  It is recommended you not start using Version 1 for anything other than exploratory investigation and you may simply be better off with the ALPHA. The new version of JOQULAR has the following:

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


JavaScript Object Query Language Representation - Funny, it's mostly JSON.

- Serializable pattern and SQL like object matching for JavaScript, including joins!
- Use Insert, Update, Delete to modify objects and indexes, or configure indexes to update automatically with zero configuration indexing.
- More built-in predicates/operators than most other other data query mechanisms, currently 44. Includes built in random and statistical sampling capability.
- Extensible with just one line of code per predicate/query operator. Puts the intelligence in your data, not the database engine.
- Just-in-time, fully indexed in-memory database, 2x to 10x faster than linear search, faster than Forerunner, IndexedDB and PouchDB for insert and search.
- Indexes represent the live state of JavaScript objects. Query results are also live objects or POJO projections, your choice. POJO key value formatting using a built-in or developer specified format function.
- Extensive Date and Time comparisons with precision at the year, month, day, hour, second, millisecond
- 3-Way Single Function You Choose API ... callbacks, Promises, return values.

See the Wiki for detailed documentation: https://github.com/anywhichway/joqular/wiki

Issues log and milestones when available: https://github.com/anywhichway/joqular/issues

Let us know what features you would like us to work on by commenting on any enhancement issues. (Obviously, we will work on bugs.) https://github.com/anywhichway/joqular/issues?utf8=%E2%9C%93&q=label%3Aenhancement+

npm install joqular

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

{father: {father: {name: {'/': 'name'}}}} 

// all partners who are partnered with the same gender

{partner1: {gender: {'..partner2': 'gender'}}}

// all partners who are not partnered with the same gender

{partner1: {gender: {$neq: {'..partner2': 'gender'}}}} 

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

select().from({p1: Person}).where(`<any of the above patterns>`);

// all Person's ordered by zipcode, then name

select().from({p1: Person}).orderBy({'p1.address.zipcode': 'asc', 'p1.name':'asc'});

 // all combinations of people
 
select().from({p1: Person,p2: Person}).where({p2: {$neq: p1}});

// first 10 Person's matching a query

select().first(10).from({p1: Person}).where(`<any of the above patterns>`);

// last 10 Person's matching a query

select().last(10).from({p1: Person}).where(`<any of the above patterns>`);

// random sample at 95% confidence +/- 3

select().sample(.95,.03).from({p1: Person});

# updates

2015-06-01 v1.02.01 Added SQL like Insert, Update, Delete. Further optimized indexing and search. Formatting capability added for POJO projections using Select. Dates fully indexed by year, month, dayofMonth, hours, seconds, milliseconds. Durations fully indexed by years, months, weeks, days,  hours, minutes, seconds, milliseconds. Added weeks (W) to Duration. Three "breaking" changes. 1) Index format changed in a manner that is not compatible with current persisted indexes. No automated migration currently available. 2) Modified syntax to require a $ sign before any function references in patterns and queries in order to provide hints to query optimizer. Simple global replace on an existing function references to address the change. 3) Modified Date, Time, Duration match behavior such they they will no longer match just a number. Dates must be matched using the entire object or their subfields, 'year', 'month', 'dayofMonth', 'hours', 'minutes', 'seconds', 'milliseconds'. Times must be matched using the entire object or their subfield 'milliseconds'. Durations must be matched using the entire object or their subfields 'length' (which is expressed in milliseconds), 'years', 'months', 'weeks', 'days', 'hours', 'seconds', 'milliseconds'. The function 'valueOf()' continues to return a number of milliseconds for all these objects. 

2015-05-11 v1.01.02 Extended ability to reference data across patterns when using providers. Reversed ordering of update info and reformatted examples in README. (1,193 Unit tests and growing ...)

2015-05-04 v1.01.01 Added 'between' and 'outside' for primitive types, added SQL like queries with joins, adopted NPM semantic versioning, no breaking changes going from v0.x.xx to v1.xx.xx (1,163 Unit tests and growing ...)

2015-04-26 v0.0.95 Added missing predicate declaration for String.prototype.match (632 Unit tests and growing ...)

2015-04-26 v0.0.94 Added patterns example, fixed recursion matching issue, added the $$ operator (628 Unit tests and growing ...)

2015-04-25 v0.0.93 corrected typos in npm package  (626 Unit tests and growing ...)

2015-04-25 v0.0.92 Initial public release (626 Unit tests and growing ...)








