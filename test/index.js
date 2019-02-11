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
		return JOQULAR.match({name:"joe",age:27},testobject)
			.then(([object]) => testvalidator(object))
	});
	it("inline property",function() {
		return JOQULAR.match({[key => key==="age"]:{$lt:28}},testobject)
			.then(([object]) => testvalidator(object))
	});
	it("inline value true",function() {
		return JOQULAR.match({age:value => value < 28},testobject)
			.then(([object]) => testvalidator(object))
	});
	it("inline value false",function() {
		return JOQULAR.match({age:value => value < 27},testobject)
			.then(([object]) => testvalidator(object)).catch(() => true);
	});
	it("functional key",function() {
		return JOQULAR.match({[key => key==="name"]:{$typeof:"string"}},testobject)
			.then(([object]) => testvalidator(object))
	});
	it("RegExp key",function() {
		return JOQULAR.match({[/.*name/]:{$eq: "joe"}},{name:"joe",age:27,race:"caucasian"})
			.then(([object]) => testvalidator(object))
	});
	xit("$",function() {
		return JOQULAR.match({name:{$:value=>value==="joe"}},testobject).then(([object]) => { testvalidator(object); })
	});
	it("$lt",function() {
		return JOQULAR.match({age:{$lt:28}},testobject).then(([object]) => testvalidator(object))
	});
	it("$lt fail",function(done) {
		JOQULAR.match({age:{$lt:27}},testobject).then(([object]) => testvalidator(object)).catch(()=>done())
	});
	it("$lte",function() {
		return JOQULAR.match({age:{$lte:27}},testobject).then(([object]) => testvalidator(object))
	});
	it("$lte fail",function(done) {
		JOQULAR.match({age:{$lte:26}},testobject).then(([object]) => testvalidator(object)).catch(()=>done())
	});
	it("$eq",function() {
		return JOQULAR.match({age:{$eq:27}},testobject).then(([object]) => testvalidator(object))	
	});
	it("$eq fail",function(done) {
		JOQULAR.match({age:{$eq:26}},testobject).then(([object]) => testvalidator(object)).catch(()=>done())
	});
	it("$eq string",function() {
		return JOQULAR.match({age:{$eq:"27"}},testobject).then(([object]) => testvalidator(object))
	});
	it("$eq string fail",function(done) {
		JOQULAR.match({age:{$eq:"26"}},testobject).then(([object]) => testvalidator(object)).catch(()=>done())
	});
	it("$eeq",function() {
		return JOQULAR.match({age:{$eeq:27}},testobject).then(([object]) => testvalidator(object))
	});
	it("$eeq fail",function(done) {
		JOQULAR.match({age:{$eeq:28}},testobject).then(([object]) => testvalidator(object)).catch(()=>done())
	});
	it("$neq string",function() {
		return JOQULAR.match({age:{$neq:"5"}},testobject).then(([object]) => testvalidator(object))
	});
	it("$neq string fail",function(done) {
		JOQULAR.match({age:{$neq:"27"}},testobject).then(([object]) => testvalidator(object)).catch(()=>done())
	});
	it("$neeq",function() {
		return JOQULAR.match({age:{$neeq:5}},testobject).then(([object]) => testvalidator(object))
	});
	it("$neeq fail",function(done) {
		JOQULAR.match({age:{$neeq:27}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())
	});
	it("$between",function() {
		return JOQULAR.match({age:{$between:[26,28]}},testobject).then(([object]) => testvalidator(object))
	});
	it("$between fail",function(done) {
			JOQULAR.match({age:{$between:[30,31]}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())
	});
	it("$between inclusive",function() {
		return JOQULAR.match({age:{$between:[27,28,true]}},testobject).then(([object]) => testvalidator(object))
	});
	it("$between inclusive fail",function(done) {
		JOQULAR.match({age:{$between:[30,318,true]}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())
	});
	it("$outside higher",function() {
		return JOQULAR.match({age:{$outside:[25,26]}},testobject).then(([object]) => testvalidator(object))
	});
	it("$outside higher fail",function(done) {
		JOQULAR.match({age:{$outside:[25,28]}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())
	});
	it("$outside lower",function() {
		return JOQULAR.match({age:{$outside:[28,29]}},testobject).then(([object]) => testvalidator(object))
	});
	it("$outside lower fail",function(done) {
		JOQULAR.match({age:{$outside:[26,29]}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())
	});
	it("$gte",function() {
		return JOQULAR.match({age:{$gte:27}},testobject).then(([object]) => testvalidator(object))
	});
	it("$gte fail",function(done) {
		JOQULAR.match({age:{$gte:28}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())
	});
	it("$gt",function() {
		return JOQULAR.match({age:{$gt:26}},testobject).then(([object]) => testvalidator(object))
	});
	it("$gt fail",function(done) {
			JOQULAR.match({age:{$gt:28}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())
	});
	it("$instanceof by string",function() {
		return JOQULAR.match({favoriteNumbers:{$instanceof:"Array"}},testobject).then(([object]) => testvalidator(object))
	});
	it("$instanceof by string fail",function(done) {
		JOQULAR.match({favoriteNumbers:{$instanceof:"Function"}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())
	});
	it("$instanceof by constructor",function() {
		return JOQULAR.match({favoriteNumbers:{$instanceof:Array}},testobject).then(([object]) => testvalidator(object))
	});
	it("$instanceof by constructor fail",function(done) {
		JOQULAR.match({favoriteNumbers:{$instanceof:Function}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())
	});
	it("$isArray",function() {
		return JOQULAR.match({favoriteNumbers:{$isArray:null}},testobject).then(([object]) => testvalidator(object))
	});
	it("$isArray fail",function(done) {
		JOQULAR.match({age:{$isArray:null}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())
	});
	it("$isEmail",function() {
		return JOQULAR.match({email:{$isEmail:null}},testobject).then(([object]) => testvalidator(object))	
	});
	it("$isEmail fail",function(done) {
			JOQULAR.match({name:{$isEmail:null}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())
	});
	it("$isEven",function() {
		return JOQULAR.match({size:{$isEven:null}},testobject).then(([object]) => testvalidator(object))
	});
	it("$isEven fail",function(done) {
			JOQULAR.match({age:{$isEven:null}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())
	});
	it("$isIPAddress",function() {
		return JOQULAR.match({ip:{$isIPAddress:null}},testobject).then(([object]) => testvalidator(object))	
	});
	it("$isIPAddress fail",function(done) {
		JOQULAR.match({age:{$isIPAddress:null}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())	
	});
	it("$isOdd",function() {
		return JOQULAR.match({age:{$isOdd:null}},testobject).then(([object]) => testvalidator(object))
	});
	it("$isOdd fail",function(done) {
		JOQULAR.match({size:{$isOdd:null}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())	
	});
	it("$isSSN",function() {
		return JOQULAR.match({ssn:{$isSSN:null}},testobject).then(([object]) => testvalidator(object))
	});
	it("$isSSN fail",function(done) {
		JOQULAR.match({name:{$isSSN:null}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())	
	});
	for(const key of ["date","day","fullYear","hours","milliseconds","minutes","month","seconds","time","UTCDate","UTCDay","UTCFullYear","UTCHours","UTCSeconds","UTCMilliseconds","UTCMinutes","UTCMonth","year"]) {
		it(`\$${key}`,function() {
			return JOQULAR.match({now:{["$"+key]:now}},testobject).then(([object]) => testvalidator(object))
		});
		if(key.startsWith("UTC")) {
			it(`\$${key} fail`,function(done) {
				JOQULAR.match({now:{["$"+key]:notnow}},testobject).then(([object]) => testvalidator(object)).catch(() =>done())	
			});
		}
	}
	it("$min",function() {
		return JOQULAR.match({favoriteNumbers:{$min:"minFavorite"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.minFavorite).equal(1); })
	});
	it("$min fail",function(done) {
		JOQULAR.match({favoriteNumbers:{$min:"minFavorite"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.minFavorite).equal(2); }).catch(() =>done())
	});
	it("$avg",function() {
		return JOQULAR.match({favoriteNumbers:{$avg:"avgFavorite"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.avgFavorite).equal(7); })
	});
	it("$avg fail",function(done) {
		JOQULAR.match({favoriteNumbers:{$avg:"avgFavorite"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.avgFavorite).equal(6); }).catch(() =>done())
	});
	it("$max",function() {
		return JOQULAR.match({favoriteNumbers:{$max:"maxFavorite"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.maxFavorite).equal(13); })
	});
	it("$max fail",function(done) {
		JOQULAR.match({favoriteNumbers:{$max:"maxFavorite"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.maxFavorite).equal(7); }).catch(() =>done())
	});
	it("$count",function() {
		return JOQULAR.match({favoriteNumbers:{$count:"countFavorite"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.countFavorite).equal(3); })
	});
	it("$count fail",function(done) {
		JOQULAR.match({favoriteNumbers:{$count:"countFavorite"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.countFavorite).equal(4); }).catch(() =>done())
	});
	it("$mina",function() {
		return JOQULAR.match({mixedArray:{$min:"minFavorite"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.minFavorite).equal(1); })
	});
	it("$mina fail",function(done) {
		JOQULAR.match({mixedArray:{$min:"minFavorite"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.minFavorite).equal(2); }).catch(() =>done())
	});
	it("$avga",function() {
		return JOQULAR.match({mixedArray:{$avga:"avg"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.avg).equal(1); })
	});
	it("$avga fail",function(done) {
		JOQULAR.match({mixedArray:{$avga:"avg"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.avg).equal(2); }).catch(() =>done())
	});
	it("$maxa",function() {
		return JOQULAR.match({mixedArray:{$maxa:"max"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.max).equal(1); })
	});
	it("$maxa fail",function(done) {
		JOQULAR.match({mixedArray:{$maxa:"max"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.max).equal(2); }).catch(() =>done())
	});
	it("$counta",function() {
		return JOQULAR.match({mixedArray:{$counta:"count"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.count).equal(4); })
	});
	it("$counta fail",function(done) {
		JOQULAR.match({mixedArray:{$counta:"count"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.count).equal(5); }).catch(() =>done())
	});
	it("$count mixed",function() {
		return JOQULAR.match({mixedArray:{$count:"count"}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.count).equal(3); })
	});
	it("$as",function() {
		return JOQULAR.match({size:{$as:"Size"}},testobject)
			.then(([object]) => { chai.expect(object.Size).equal(10); })
	});
	it("$compute",function() {
		return JOQULAR.match({computed:{$compute:()=>1}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.computed).equal(1); })
	});
	it("$filter",function() {
		return JOQULAR.match({mixedArray:{$filter:(item)=>item!==undefined}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.mixedArray.length).equal(3); })
	});
	it("$sort",function() {
		return JOQULAR.match({favoriteNumbers:{$sort:(a,b)=> b - a}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.favoriteNumbers[0]).equal(13); })
	});
	it("$sample",function() {
		return JOQULAR.match({data:{$sample:[.5,5]}},testobject)
			.then(([object]) => { 
				testvalidator(object); 
				chai.expect(object.data.length).equal(5); 
			})
	});
	it("$echoes",function() {
		return JOQULAR.match({name:{$echoes:"jo"}},testobject)
			.then(([object]) => { testvalidator(object); })
	});
	it("$echoes fail",function(done) {
		JOQULAR.match({name:{$echoes:"bill"}},testobject)
			.then(([object]) => { testvalidator(object); }).catch(() =>done())
	});
	it("$typeof",function() {
		return JOQULAR.match({name:{$typeof:"string"}},testobject)
			.then(([object]) => { testvalidator(object); })
	});
	it("$typeof fail",function(done) {
		JOQULAR.match({name:{$typeof:"number"}},testobject)
			.then(([object]) => { testvalidator(object); }).catch(() =>done())
	});
	it("$and",function() {
		return JOQULAR.match({name:{$and:{$typeof:"string",$:(value) => value.length===3}}},testobject)
			.then(([object]) => { testvalidator(object); })
	});
	it("$or",function() {
		return JOQULAR.match({name:{$or:{$typeof:"string",$:(value) => value.length===3}}},testobject)
			.then(([object]) => { testvalidator(object); })
	});
	it("$xor",function(done) {
		JOQULAR.match({name:{$xor:{$typeof:"string",$and:{$typeof:"number"}}}},testobject)
			.then(([object]) => { testvalidator(object); })
			.catch(() =>done())
	});
	it("$xor fail direct",function(done) {
		JOQULAR.match({name:{$xor:{$typeof:"string",$:(value) => value.length===3}}},testobject)
			.then(([object]) => { testvalidator(object); })
			.catch(() =>done())
	});
	it("$xor fail indirect",function(done) {
		JOQULAR.match({name:{$xor:{$typeof:"string",$and:{$typeof:"string"}}}},testobject)
			.then(([object]) => { testvalidator(object); })
			.catch(() =>done())
	});
	it("$redact",function() {
		return JOQULAR.match({unneeded:{$redact:null}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.unneeded).equal(undefined); })
	});
	it("$some",function() {
		return JOQULAR.match({favoriteNumbers:{$some:(value) => value===13}},testobject)
			.then(([object]) => { testvalidator(object); })
	});
	it("$some fail",function(done) {
		JOQULAR.match({favoriteNumbers:{$some:(value) => value===20}},testobject)
			.then(([object]) => { testvalidator(object); })
			.catch(() =>done())
	});
	it("$every",function() {
		return JOQULAR.match({favoriteNumbers:{$every:(value) => value>0}},testobject)
			.then(([object]) => { testvalidator(object); })
	});
	it("$every fail",function(done) {
		JOQULAR.match({favoriteNumbers:{$every:(value) => value>13}},testobject)
			.then(([object]) => { testvalidator(object); })
			.catch(() =>done())
	});
	it("$reduce",function() {
		return JOQULAR.match({favoriteNumbers:{$reduce:[(accum,value) => accum += value,0,"sum"]}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.sum).equal(21); })
	});
	it("$map",function() {
		return JOQULAR.match({favoriteNumbers:{$map:[(value) => value,"mapped"]}},testobject)
			.then(([object]) => { testvalidator(object); chai.expect(object.mapped.length).equal(3); })
	});
	it("$on set",function() {
		let event;
		return JOQULAR.match({monitored:{$on:{set:(...args) => event=args}}},testobject)
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
		return JOQULAR.match({monitored:{$on:{get:(...args) => event=args}}},testobject)
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
		return JOQULAR.match({monitored:{$on:{delete:(...args) => event=args}}},testobject)
			.then(([object]) => { 
				testvalidator(object);
				delete object.monitored;
				chai.expect(event.length).equal(3);
				chai.expect(event[0]).equal(object);
				chai.expect(event[1]).equal("monitored");
				chai.expect(event[2]).equal(undefined);
			})
	});
});