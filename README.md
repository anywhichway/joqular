# joqular
JavaScript Object Query Language Representation - Funny, it's mostly JSON.

- Serializable pattern and SQL like object matching for JavaScript, including joins!
- More built-in predicates/operators than most other other data query mechanisms, currently 34. Includes built in random sampling capability.
- Extensible with just one line of code per predicate/query operator. Puts the intelligence in your data, not the database engine.
- Just-in-time, fully indexed in-memory database, 2x to 10x faster than linear search, faster than IndexedDB and PouchDB for insert and search.
- Indexes represent the live state of JavaScript objects. Query results are also live objects or POJO projections, your choice.
- Extensive Date and Time comparisons with precision at the year, month, day, hour, second, millisecond
- Optional zero configuration indexing and persistence.
- 3-Way Single Function You Choose API ... callbacks, Promises, return values.

See the Wiki for detailed documentation: https://github.com/anywhichway/joqular/wiki

Issues log and milestones when available: https://github.com/anywhichway/joqular/issues

Let us know what features you would like us to work on by commenting on any enhancement issues. (Obviously, we will work on bugs.) https://github.com/anywhichway/joqular/issues?utf8=%E2%9C%93&q=label%3Aenhancement+

npm install joqular

# exampless

// everyone named Joe
{name: {eq: 'Joe'}} 

// all adult women
{age: {gte: 18}, gender: 'female'}} 

// adult women Bainbridge Island and downtown Seattle
{age: {gte: 18}, gender: 'female', address: {zipcode: {in: [98110,98101]}}}} 

// all grandsons named the same as their grandfather
{father: {father: {name: {'/': 'name'}}}} 

// all partners who are partnered with the same gender
{partner1: {gender: {'..partner2': 'gender'}}}

// all partners who are not partnered with the same gender
{partner1: {gender: {neq: {'..partner2': 'gender'}}}} 

// Joe's children, if any are sick
{name: 'Joe', {children: {some: function(child) { return child.isSick; }}}} 

// Joe's children, if all are sick
{name: 'Joe', {children: {every: function(child) { return child.isSick; }}}} 

// [], unless all females are named Jo
{gender: 'female', {forall: function(object) { return object.name==='Jo'; }}} 

// all females if any are named Jo
{gender: 'female', {exists: function(object) { return object.name==='Jo'; }}} 

// anyone named Joe or Jo
{name: {soundex: 'Joe'}} 

// anyone with a name starting in Jo
{name: {match: /Jo*/}}

// anyone who is female and authorized based on the value, i.e. 21 or over 
function authorized(value) { return value>=21; }.predicate=true;
{gender: 'female', {age: {$: authorized}}} 

// anyone who is female and authorized based on the object, i.e. a volunteer 
function authorized() { return this.volunteer }.predicate=true;
{gender: 'female', $$: authorized}

// general query
select().from({p1: Person}).where(<any of the above patterns>);

// all Person's ordered by zipcode, then name
select().from({p1: Person}).orderBy({'p1.address.zipcode': 'asc', 'p1.name':'asc'});

 // all combinations of people
select().from({p1: Person,p2: Person}).where({p2: {neq: p1}});

// first 10 Person's matching a query
select().first(10).from({p1: Person}).where(<any of the above patterns>);

// last 10 Person's matching a query
select().last(10).from({p1: Person}).where(<any of the above patterns>);

// random sample at 95% confidence +/- 3
select().sample(.95,.03).from({p1: Person});

# updates

2015-04-25 v0.0.92 Initial public release (626 Unit tests and growing ...)

2015-04-25 v0.0.93 corrected typos in npm package  (626 Unit tests and growing ...)

2015-04-26 v0.0.94 Added patterns example, fixed recursion matching issue, added the $$ operator (628 Unit tests and growing ...)

2015-04-26 v0.0.95 Added missing predicate declaration for String.prototype.match (632 Unit tests and growing ...)

2015-05-04 v1.01.01 Added 'between' and 'outside' for primitive types, added SQL like queries with joins, adopted NPM semantic versioning, no breaking changes going from v0.x.xx to v1.xx.xx (1,163 Unit tests and growing ...)
