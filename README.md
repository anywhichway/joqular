# joqular
JavaScript Object Query Language Representation - Funny, it's just JSON.

- Serializable pattern and predicate based object matching for JavaScript.
- More built-in predicates/operators than most other other data query mechanisms, currently 30.
- Extensible with just one line of code per predicate/query operator.
- Just-in-time, fully indexed in-memory database, 2x to 10x faster than linear search, faster than IndexedDB and PouchDB for insert and search.
- Data and indexes represent the live state of JavaScript objects.
- Extensive Date and Time comparisons with precision at the year, month, day, hour, second, millisecond
- Automatic index configuration and optional persistence.
- 3 Way Single Function You Choose API ... callbacks, Promises, synchronous return values.

See the Wiki for detailed documentation: https://github.com/anywhichway/joqular/wiki

Issues log and milestones when available: https://github.com/anywhichway/joqular/issues

Let us know what features you would like us to work on by Starring any enhancement issues. (Obviously, we will work on bugs.)

npm install joqular

# example query patterns

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

// anyone who is female and authorized based on the value, i.e. 21 or over 

function authorized(value) { return value>=21; }.predicate=true;

{gender: 'female', {age: {$: authorized}}} 

// anyone who is female and authorized based on the object, i.e. a volunteer
 
function authorized() { return this.volunteer }.predicate=true;

{gender: 'female', $$: authorized}

# updates

2015-04-25 v0.0.92 Initial public release (626 Unit tests and growing ...)

2015-04-25 v0.0.93 corrected typos in npm package  (626 Unit tests and growing ...)

2015-04-26 v0.0.94 Added patterns example, fixed recursion matching issue, added the $$ operator (628 Unit tests and growing ...)

2015-04-26 v0.0.95 Added missing predicate declaration for String.prototype.match (632 Unit tests and growing ...)
