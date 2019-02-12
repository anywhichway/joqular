var chai,
	expect,
	JOQULAR;
if(typeof(window)==="undefined") {
	chai = require("chai");
	expect = chai.expect;
	JOQULAR = require("../index.js");
}

const now = new Date(),
	notnow = new Date();
	testobject = {
		name:"joe",
		age:27,
		size: 10,
		ip: "127.0.0.0",
		ssn: "555-55-5555",
		race:"caucasian",
		favoriteNumbers:[1,7,13],
		mixedArray:[1,1,true,undefined],
		email:"someone@somewhere.com",
		data: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
		unneeded: "redact me",
		now: now
	},
	testvalidator = (object) => {
		chai.expect(object.name).equal("joe"); 
		chai.expect(object.age).equal(27);
		chai.expect(object.race).equal("caucasian");
	};
	
const ms = now.getMilliseconds();
notnow.setMilliseconds(ms===999 ? 0 : ms+1);
const seconds = now.getUTCSeconds();
notnow.setUTCSeconds(seconds===59 ? 0 : seconds+1);
const minutes = now.getUTCMinutes();
notnow.setUTCMinutes(minutes===59 ? 0 : minutes+1);
const hours = now.getUTCHours();
notnow.setUTCHours(hours===23 ? 0 : hours+1);
const mo = now.getUTCMonth();
notnow.setUTCMonth(mo===11 ? 0 : mo+1);
const date = now.getUTCDate();
notnow.setUTCDate(date>28 ? 0 : date+1);
const yr = now.getUTCFullYear();
notnow.setUTCFullYear(yr+1);


describe("Test",function() {
	it("double property",function() {
		return JOQULAR.query({name:"joe",age:27},testobject)
			.then(([object]) => testvalidator(object))
	});
	it("inline property",function() {
		return JOQULAR.query({[key => key==="age"]:{$lt:28}},testobject)
			.then(([object]) => testvalidator(object))
	});
	it("inline value true",function() {
		return JOQULAR.query({age:value => value < 28},testobject)
			.then(([object]) => testvalidator(object))
	});
	it("inline value false",function() {
		return JOQULAR.query({age:value => value < 27},testobject)
			.then(([object]) => testvalidator(object)).catch(() => true);
	});
	it("functional key",function() {
		return JOQULAR.query({[key => key==="name"]:{$typeof:"string"}},testobject)
			.then(([object]) => testvalidator(object))
	});
	it("RegExp key",function() {
		return JOQULAR.query({[/.*name/]:{$eq: "joe"}},{name:"joe",age:27,race:"caucasian"})
			.then(([object]) => testvalidator(object))
	});
	xit("$",function() {
		return JOQULAR.query({name:{$:value=>value==="joe"}},testobject).then(([object]) => { testvalidator(object); })
	});
	it("$lt",function() {
		return JOQULAR.query({age:{$lt:28}},testobject).then(([object]) => testvalidator(object))
	});
	it("$lt fail",function(done) {
		JOQULAR.query({age:{$lt:27}},testobject).then(([object]) => testvalidator(object)).catch(()=>done())
	});
	it("$lte",function() {
		return JOQULAR.query({age:{$lte:27}},testobject).then(([object]) => testvalidator(object))
	});
	it("$lte fail",function(done) {
		JOQULAR.query({age:{$lte:26}},testobject).then(([object]) => testvalidator(object)).catch(()=>done())
	});
	it("$eq",function() {
		return JOQULAR.query({age:{$eq:27}},testobject).then(([object]) => testvalidator(object))	
	});
	it("$eq fail",function(done) {
		JOQULAR.query({age:{$eq:26}},testobject).then(([object]) => testvalidator(object)).catch(()=>done())
	});
	it("$eq string",function() {
		return JOQULAR.query({age:{$eq:"27"}},testobject).then(([object]) => testvalidator(object))
	});
	it("$eq string fail",function(done) {
		JOQULAR.query({age:{$eq:"26"}},testobject).then(([object]) => testvalidator(object)).catch(()=>done())
	});
	it("$eeq",function() {
		return JOQULAR.query({age:{$eeq:27}},testobject).then(([object]) => testvalidator(object))
	});
	it("$eeq fail",function(done) {
		JOQULAR.query({age:{$eeq:28}},testobject).then(([object]) => testvalidator(object)).catch(()=>done())
	});
	it("$neq string",function() {
		return JOQULAR.query({age:{$neq:"5"}},testobject).then(([object]) => testvalidator(object))
	});
	it("$neq string fail",function(done) {
		JOQULAR.query({age:{$neq:"27"}},testobject).then(([object]) => testvalidator(object)).catch(()=>done())
	});
	it("$neeq",function() {
		return JOQULAR.query({age:{$neeq:5}},testobject).then(([object]) => testvalidator(object))
	});
	it("$neeq fail",function(done) {
		JOQULAR.query({age:{$neeq:27}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())
	});
	it("$between",function() {
		return JOQULAR.query({age:{$between:[26,28]}},testobject).then(([object]) => testvalidator(object))
	});
	it("$between fail",function(done) {
			JOQULAR.query({age:{$between:[30,31]}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())
	});
	it("$between inclusive",function() {
		return JOQULAR.query({age:{$between:[27,28,true]}},testobject).then(([object]) => testvalidator(object))
	});
	it("$between inclusive fail",function(done) {
		JOQULAR.query({age:{$between:[30,318,true]}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())
	});
	it("$outside higher",function() {
		return JOQULAR.query({age:{$outside:[25,26]}},testobject).then(([object]) => testvalidator(object))
	});
	it("$outside higher fail",function(done) {
		JOQULAR.query({age:{$outside:[25,28]}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())
	});
	it("$outside lower",function() {
		return JOQULAR.query({age:{$outside:[28,29]}},testobject).then(([object]) => testvalidator(object))
	});
	it("$outside lower fail",function(done) {
		JOQULAR.query({age:{$outside:[26,29]}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())
	});
	it("$gte",function() {
		return JOQULAR.query({age:{$gte:27}},testobject).then(([object]) => testvalidator(object))
	});
	it("$gte fail",function(done) {
		JOQULAR.query({age:{$gte:28}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())
	});
	it("$gt",function() {
		return JOQULAR.query({age:{$gt:26}},testobject).then(([object]) => testvalidator(object))
	});
	it("$gt fail",function(done) {
			JOQULAR.query({age:{$gt:28}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())
	});
	it("$instanceof by string",function() {
		return JOQULAR.query({favoriteNumbers:{$instanceof:"Array"}},testobject).then(([object]) => testvalidator(object))
	});
	it("$instanceof by string fail",function(done) {
		JOQULAR.query({favoriteNumbers:{$instanceof:"Function"}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())
	});
	it("$instanceof by constructor",function() {
		return JOQULAR.query({favoriteNumbers:{$instanceof:Array}},testobject).then(([object]) => testvalidator(object))
	});
	it("$instanceof by constructor fail",function(done) {
		JOQULAR.query({favoriteNumbers:{$instanceof:Function}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())
	});
	it("$isArray",function() {
		return JOQULAR.query({favoriteNumbers:{$isArray:null}},testobject).then(([object]) => testvalidator(object))
	});
	it("$isArray fail",function(done) {
		JOQULAR.query({age:{$isArray:null}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())
	});
	it("$isEmail",function() {
		return JOQULAR.query({email:{$isEmail:null}},testobject).then(([object]) => testvalidator(object))	
	});
	it("$isEmail fail",function(done) {
			JOQULAR.query({name:{$isEmail:null}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())
	});
	it("$isEven",function() {
		return JOQULAR.query({size:{$isEven:null}},testobject).then(([object]) => testvalidator(object))
	});
	it("$isEven fail",function(done) {
			JOQULAR.query({age:{$isEven:null}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())
	});
	it("$isIPAddress",function() {
		return JOQULAR.query({ip:{$isIPAddress:null}},testobject).then(([object]) => testvalidator(object))	
	});
	it("$isIPAddress fail",function(done) {
		JOQULAR.query({age:{$isIPAddress:null}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())	
	});
	it("$isOdd",function() {
		return JOQULAR.query({age:{$isOdd:null}},testobject).then(([object]) => testvalidator(object))
	});
	it("$isOdd fail",function(done) {
		JOQULAR.query({size:{$isOdd:null}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())	
	});
	it("$isSSN",function() {
		return JOQULAR.query({ssn:{$isSSN:null}},testobject).then(([object]) => testvalidator(object))
	});
	it("$isSSN fail",function(done) {
		JOQULAR.query({name:{$isSSN:null}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())	
	});
	for(const key of ["date","day","fullYear","hours","milliseconds","minutes","month","seconds","time","UTCDate","UTCDay","UTCFullYear","UTCHours","UTCSeconds","UTCMilliseconds","UTCMinutes","UTCMonth","year"]) {
		it(`\$${key}`,function() {
			return JOQULAR.query({now:{["$"+key]:now}},testobject).then(([object]) => testvalidator(object))
		});
		if(key.startsWith("UTC")) {
			it(`\$${key} fail`,function(done) {
				JOQULAR.query({now:{["$"+key]:notnow}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())	
			});
		}
	}
	it("$min",function() {
		return JOQULAR.query({favoriteNumbers:{$min:"minFavorite"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.minFavorite).equal(1); })
	});
	it("$min fail",function(done) {
		JOQULAR.query({favoriteNumbers:{$min:"minFavorite"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.minFavorite).equal(2); }).catch(() =>done())
	});
	it("$avg",function() {
		return JOQULAR.query({favoriteNumbers:{$avg:"avgFavorite"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.avgFavorite).equal(7); })
	});
	it("$avg fail",function(done) {
		JOQULAR.query({favoriteNumbers:{$avg:"avgFavorite"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.avgFavorite).equal(6); }).catch(() =>done())
	});
	it("$max",function() {
		return JOQULAR.query({favoriteNumbers:{$max:"maxFavorite"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.maxFavorite).equal(13); })
	});
	it("$max fail",function(done) {
		JOQULAR.query({favoriteNumbers:{$max:"maxFavorite"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.maxFavorite).equal(7); }).catch(() =>done())
	});
	it("$count",function() {
		return JOQULAR.query({favoriteNumbers:{$count:"countFavorite"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.countFavorite).equal(3); })
	});
	it("$count fail",function(done) {
		JOQULAR.query({favoriteNumbers:{$count:"countFavorite"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.countFavorite).equal(4); }).catch(() =>done())
	});
	it("$mina",function() {
		return JOQULAR.query({mixedArray:{$min:"minFavorite"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.minFavorite).equal(1); })
	});
	it("$mina fail",function(done) {
		JOQULAR.query({mixedArray:{$min:"minFavorite"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.minFavorite).equal(2); }).catch(() =>done())
	});
	it("$avga",function() {
		return JOQULAR.query({mixedArray:{$avga:"avg"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.avg).equal(1); })
	});
	it("$avga fail",function(done) {
		JOQULAR.query({mixedArray:{$avga:"avg"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.avg).equal(2); }).catch(() =>done())
	});
	it("$maxa",function() {
		return JOQULAR.query({mixedArray:{$maxa:"max"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.max).equal(1); })
	});
	it("$maxa fail",function(done) {
		JOQULAR.query({mixedArray:{$maxa:"max"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.max).equal(2); }).catch(() =>done())
	});
	it("$counta",function() {
		return JOQULAR.query({mixedArray:{$counta:"count"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.count).equal(4); })
	});
	it("$counta fail",function(done) {
		JOQULAR.query({mixedArray:{$counta:"count"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.count).equal(5); }).catch(() =>done())
	});
	it("$count mixed",function() {
		return JOQULAR.query({mixedArray:{$count:"count"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.count).equal(3); })
	});
	it("$as",function() {
		return JOQULAR.query({size:{$as:"Size"}},testobject)
			.then(([object]) => { chai.expect(object.Size).equal(10); })
	});
	it("$compute $as",function() {
		return JOQULAR.query({none:{$compute:()=>1, $as:"computed"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.computed).equal(1); })
	});
	it("$filter",function() {
		return JOQULAR.query({mixedArray:{$filter:(item)=>item!==undefined}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.mixedArray.length).equal(3); })
	});
	it("$sort",function() {
		return JOQULAR.query({favoriteNumbers:{$sort:(a,b)=> b - a}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.favoriteNumbers[0]).equal(13); })
	});
	it("$sample",function() {
		return JOQULAR.query({data:{$sample:[.5,5]}},testobject)
			.then(([object]) => { 
				testvalidator(object); 
				chai.expect(object.data.length==4||object.data.length==5).equal(true); 
			})
	});
	it("$echoes",function() {
		return JOQULAR.query({name:{$echoes:"jo"}},testobject)
			.then(([object]) => { testvalidator(object); })
	});
	it("$echoes fail",function(done) {
		JOQULAR.query({name:{$echoes:"bill"}},testobject)
			.then(([object]) => { testvalidator(object); }).catch(() =>done())
	});
	it("$typeof",function() {
		return JOQULAR.query({name:{$typeof:"string"}},testobject)
			.then(([object]) => { testvalidator(object); })
	});
	it("$typeof fail",function(done) {
		JOQULAR.query({name:{$typeof:"number"}},testobject)
			.then(([object]) => { testvalidator(object); }).catch(() =>done())
	});
	it("$and",function() {
		return JOQULAR.query({name:{$and:{$typeof:"string",$:(value) => value.length===3}}},testobject)
			.then(([object]) => { testvalidator(object); })
	});
	it("$or",function() {
		return JOQULAR.query({name:{$or:{$typeof:"string",$:(value) => value.length===3}}},testobject)
			.then(([object]) => { testvalidator(object); })
	});
	it("$xor",function(done) {
		JOQULAR.query({name:{$xor:{$typeof:"string",$and:{$typeof:"number"}}}},testobject)
			.then(([object]) => { testvalidator(object); })
			.catch(() =>done())
	});
	it("$xor fail direct",function(done) {
		JOQULAR.query({name:{$xor:{$typeof:"string",$:(value) => value.length===3}}},testobject)
			.then(([object]) => { testvalidator(object); })
			.catch(() =>done())
	});
	it("$xor fail indirect",function(done) {
		JOQULAR.query({name:{$xor:{$typeof:"string",$and:{$typeof:"string"}}}},testobject)
			.then(([object]) => { testvalidator(object); })
			.catch(() =>done())
	});
	it("$redact",function() {
		return JOQULAR.query({unneeded:{$redact:null}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.unneeded).equal(undefined); })
	});
	it("$some",function() {
		return JOQULAR.query({favoriteNumbers:{$some:(value) => value===13}},testobject)
			.then(([object]) => { testvalidator(object); })
	});
	it("$some fail",function(done) {
		JOQULAR.query({favoriteNumbers:{$some:(value) => value===20}},testobject)
			.then(([object]) => { testvalidator(object); })
			.catch(() =>done())
	});
	it("$every",function() {
		return JOQULAR.query({favoriteNumbers:{$every:(value) => value>0}},testobject)
			.then(([object]) => { testvalidator(object); })
	});
	it("$every fail",function(done) {
		JOQULAR.query({favoriteNumbers:{$every:(value) => value>13}},testobject)
			.then(([object]) => { testvalidator(object); })
			.catch(() =>done())
	});
	it("$reduce",function() {
		return JOQULAR.query({favoriteNumbers:{$reduce:[(accum,value) => accum += value,0,"sum"]}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.sum).equal(21); })
	});
	it("$map",function() {
		return JOQULAR.query({favoriteNumbers:{$map:[(value) => value,"mapped"]}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.mapped.length).equal(3); })
	});
	it("$on set",function() {
		let event;
		return JOQULAR.query({monitored:{$on:{set:(...args) => event=args}}},testobject)
			.then(([object]) => { 
				testvalidator(object);
				object.monitored = true;
				chai.expect(object.monitored).equal(true);
				chai.expect(event.length).equal(4);
				chai.expect(event[0]).equal(object);
				chai.expect(event[1]).equal("monitored");
				chai.expect(event[2]).equal(true);
				chai.expect(event[3]).equal(undefined);
			})
	});
	it("$on get",function() {
		let event;
		return JOQULAR.query({monitored:{$on:{get:(...args) => event=args}}},testobject)
			.then(([object]) => { 
				testvalidator(object);
				const monitored = object.monitored;
				chai.expect(event.length).equal(3);
				chai.expect(event[0]).equal(object);
				chai.expect(event[1]).equal("monitored");
			})
	});
	it("$on delete",function() {
		let event;
		return JOQULAR.query({monitored:{$on:{delete:(...args) => event=args}}},testobject)
			.then(([object]) => { 
				testvalidator(object);
				delete object.monitored;
				chai.expect(event.length).equal(3);
				chai.expect(event[0]).equal(object);
				chai.expect(event[1]).equal("monitored");
				chai.expect(event[2]).equal(undefined);
			})
	});
	it("$search",function() {
		return JOQULAR.query({email:{$search:"someone"}},testobject)
		.then(([object]) => { 
			testvalidator(object);
		}) 
	});
	it("$search pct",function() {
		return JOQULAR.query({email:{$search:["someone",.5]}},testobject)
		.then(([object]) => { 
			testvalidator(object);
		}) 
	});
	it("$search trigram",function() {
		return JOQULAR.query({email:{$search:["someone",1.0]}},testobject)
		.then(([object]) => { 
			testvalidator(object);
		}) 
	})
});