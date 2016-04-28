(function() {

	var _global = this;
	
	function test(runtest,logsuccess,db) {
		var JSON = require('./javascripts/json5-ex.js');
		require('joex');
		Array = Array.extend();
		Set = Set.extend();
		Boolean = Boolean.extend();
		Number = Number.extend();
		String = String.extend();
		Date = Date.extend();
		var Time = require('about-time').Time;
		var Duration =  require('about-time').Duration;
		var TimeSpan = require('about-time').TimeSpan;
		var JOQULAR = require('./javascripts/joqular.js');
		
		var uuid = require('node-uuid');
		
		JOQULAR.constructors.Time = Time;
		JOQULAR.constructors.Duration = Duration;
		JOQULAR.constructors.TimeSpan = TimeSpan;
		
		var performance;
		if(typeof(window)==="object") {
			performance= window.performance;
		} else {
			performance = {now: require("performance-now")};
		} 
	
		function test$$() {
			return this.aString==="astring";
		}
		function test$$Negative() {
			return this.aString===null;
		}
		
		function Entity(config) {
			for(var key in config) {
				this[key] = config[key];
			}
		}
		Entity = new JOQULAR.Entity(Entity,"Entity");
		var EntityValidator = new Validator({testId:{required:true,type:"number"}});
		
		var to1 = new Entity({
			name: "to1",
			anUndefined: undefined,
			aNull: null,
			aTrue: true,
			aFalse: false,
			aOne: 1,
			aTwo: 2,
			aNaN: NaN,
			aString: "astring",
			anObject: {
				anotherString: "astring",
				aChildObject: {
					anotherString: "astring",
					aGrandChildObject: {
						anotherString: "astring",
						anotherNaN: NaN
					}
				}
			},
			anArray1: [1,2,3,4],
			anArray2: [5,6,7,8],
			anArray3: [2,3],
			anArray4: [1,1,1],
			aSet1: new Set([1,2,3,4]),
			aSet2: new Set([5,6,7,8]),
			aSet3: new Set([2,3]),
			aSet4: new Set([1,1,1]),
			aDate1: new Date(2014,0,15,12,30,30,500),
			aDate2: new Date(2015,0,15,12,30,30,500),
			aDate3: new Date(2015,0,16,12,30,30,500),
			aDate4: new Date(2015,1,15,12,30,30,500),
			aTimeYear: new Time(new Date(2014,1,15,12,30,30,500)).withPrecision("Y"),
			aTimeMonth: new Time(new Date(2014,1,15,12,30,30,500)).withPrecision("M"),
			aTimeDay: new Time(new Date(2014,1,15,12,30,30,500)).withPrecision("D"),
			aTimeHour: new Time(new Date(2014,1,15,12,30,30,500)).withPrecision("h"),
			aTimeMinute: new Time(new Date(2014,1,15,12,30,30,500)).withPrecision("m"),
			aTimeSecond: new Time(new Date(2014,1,15,12,30,30,500)).withPrecision("s"),
			aTimeMillisecond: new Time(new Date(2014,1,15,12,30,30,500)).withPrecision("ms"),
			aYear: new Duration(1,"Y"),
			aMonth: new Duration(1,"M"),
			aWeek: new Duration(1,"W"),
			aDay: new Duration(1,"D"),
			anHour: new Duration(1,"h"),
			aMinute: new Duration(1,"m"),
			aSecond: new Duration(1,"s"),
			aMillisecond: new Duration(1,"ms"),
			aTimeSpan1: new TimeSpan(new Date(2013,1,15,12,30,30,500),new Date(2015,1,15,12,30,30,500)),
			aTimeSpan2: new TimeSpan(new Date(2012,1,15,12,30,30,500)),
			aTimeSpan3: new TimeSpan(null,new Date(2014,1,15,12,30,30,500)),
			aTimeSpan4: new TimeSpan(new Date(2013,1,15,12,30,30,500),new Date(2014,1,15,12,30,30,500)),
			aTimeSpan5: new TimeSpan(new Date(2014,1,15,12,30,30,500),new Date(2015,1,15,12,30,30,500)),
		});
		var to2 = new Entity({
			name: "to2",
			aOne: 1});
		var to3 = new Entity({
			name: "to3",
			aOne: 1});
		
		var positivetests = [
			{aNull: null},
			{aNull: {$eq: null}},
			{aNull: {$neq: 1}},
			{aTrue: {$lte: true}},
			{aTrue: true},
			{aTrue: {$eq: true}},
			{aTrue: {$neq: false}},
			{aTrue: {$neeq: "true"}},
			{aTrue: {$gte: false}},
			{aTrue: {$gt: false}},
			{aFalse: {$lt: true}},
			{aFalse: {$lte: true}},
			{aFalse: {$lte: false}},
			{aFalse: false},
			{aFalse: {$eq: false}},
			{aFalse: {$neq: true}},
			{aFalse: {$neq: "false"}},
			{aFalse: {$gte: false}},
			{aOne: 1, name:"to1"},
			{aOne: {$lte: 1}, name:"to1"},
			{aOne: {$eq: 1}, name:"to1"},
			{aOne: {$neq: 2}, name:"to1"},
			{aOne: {$neeq: "1"}, name:"to1"},
			{aOne: {$gte: 1}, name:"to1"},
			{aOne: {$in: [1,2,3]}, name:"to1"},
			{aOne: {$in: new Set([1,2,3])}, name:"to1"},
			{aOne: {$nin: [4,5,6]}, name:"to1"},
			{aOne: {$nin: new Set([4,5,6])}, name:"to1"},
			{aOne: {$between: [0,2]}, name:"to1"},
			{aOne: {$outside: [3,4]}, name:"to1"},
			{aNaN: {$: isNaN}},
			{aString: "astring"},
			{aString: {$match: /as*/g}},
			{aString: "astring", $$: test$$},
			{aString: {$echoes: "astring"}},
			{aString: {$echoes: "astrng"}},
			{aString: {$lte: "astring"}},
			{aString: {$eq: "astring"}},
			{aString: {$neq: "anotherstring"}},
			{aString: {$neq: 1}},
			{aString: {$gte: "astring"}},
			{anObject: {anotherString: "astring"}},
			{anObject: {anotherString: {$self: '/anObject/anotherString'}}},
			{anObject: {anotherString: {$eq: {$self: '/anObject/anotherString'}}}},
			{anObject: {aChildObject: {anotherString: "astring"}}},
			{anObject: {aChildObject: {aGrandChildObject: {anotherString: "astring"}}}},
			{anObject: {aChildObject: {aGrandChildObject: {anotherString: "astring", anotherNaN: {$: isNaN}}}}},
			{anObject: {aChildObject: {aGrandChildObject: {anotherString: {$eq: {$self: '/aString'}}}}}},
			{anObject: {aChildObject: {aGrandChildObject: {anotherString: {$eq: {$self: '/anObject/anotherString'}}}}}}, 
			{anObject: {aChildObject: {aGrandChildObject: {anotherString: {$eq: {$self: '/anObject/aChildObject/anotherString'}}}}}},
			{anObject: {aChildObject: {aGrandChildObject: {anotherString: {$eq: {$self: '../anotherString'}}}}}},
			{anArray1: [1,2,3,4]},
			{anArray1: {length: 4}},
			{anArray1: {length: {$eq: 4}}},
			{anArray1: {count: 4}},
			{anArray1: {$min: 1}},
			{anArray1: {$max: 4}},
			{anArray1: {count: {$lt: 5}}},
			{anArray1: {count: {$lte: 4}}},
			{anArray1: {count: {$eq: 4}}},
			{anArray1: {count: {$neq: 5}}},
			{anArray1: {count: {$gte: 4}}},
			{anArray1: {count: {$gt: 3}}},
			{anArray1: {$avg: 2.5}},
			{anArray1: {$avg: {$lt: 3}}},
			{anArray1: {$avg: {$eq: 2.5}}},
			{anArray1: {$avg: {$gt: 2}}},
			{anArray1: {$eq: [1,2,3,4]}},
			{anArray1: {$neq: [1,2,3]}},
			{anArray1: {$contains: 1}},
			{anArray1: {$includes: 1}},
			{anArray1: {$excludes: 5}},
			{anArray1: {$intersects: [2,3]}},
			{anArray1: {$disjoint: [5,6,7,8]}},
			{anArray1: {$coincident: [1,3,4,2]}},
			{anArray4: {$every: function(i) { return i===1}}},
			{anArray1: {$some: function(i) { return i===4}}},
			{aSet1: {$eq: new Set([1,2,3,4])}},
			{aSet1: {$neq: [1,2,3]}},
			{aSet1: {size: 4}},
			{aSet1: {size: {$eq: 4}}},
			{aSet1: {count: 4}},
			{aSet1: {$min: 1}},
			{aSet1: {$max: 4}},
			{aSet1: {count: {$lt: 5}}},
			{aSet1: {count: {$lte: 4}}},
			{aSet1: {count: {$eq: 4}}},
			{aSet1: {count: {$neq: 5}}},
			{aSet1: {count: {$gte: 4}}},
			{aSet1: {count: {$gt: 3}}},
			{aSet1: {$avg: 2.5}},
			{aSet1: {$avg: {$lt: 3}}},
			{aSet1: {$avg: {$eq: 2.5}}},
			{aSet1: {$avg: {$gt: 2}}},
			{aSet1: {$contains: 1}},
			{aSet1: {$includes: 1}},
			{aSet1: {$excludes: 5}},
			{aSet1: {$intersects: [2,3]}},
			{aSet1: {$disjoint: [5,6,7,8]}},
			{aSet1: {$coincident: [1,3,4,2]}},
			{aSet4: {$every: function(i) { return i===1}}},
			{aSet1: {$some: function(i) { return i===4}}},
			{aSet1: {$coincident: {$self: '../aSet1'}}},
			{aSet1: {$intersects: {$self: '../aSet1'}}},
			{aSet1: {$disjoint: {$self: '../aSet2'}}},
			{aDate1: {time: new Date(2014,0,15,12,30,30,500).getTime()}},
			{aDate1: {year: 2014}},
			{aDate1: {year: 2014, month:0}},
			{aDate1: {year: 2014, month:0, dayOfMonth:15}},
			{aDate1: {year: 2014, month:0, dayOfMonth:15, hours:12}},
			{aDate1: {year: 2014, month:0, dayOfMonth:15, hours:12, minutes:30}},
			{aDate1: {year: 2014, month:0, dayOfMonth:15, hours:12, minutes:30, seconds:30}},
			{aDate1: {year: 2014, month:0, dayOfMonth:15, hours:12, minutes:30, seconds:30, milliseconds:500}},
			{aDate1: {dayOfMonth: {$lt: {$self: '/aDate3/dayOfMonth'}}}},
			{aDate1: {dayOfMonth: {$lte: {$self: '../dayOfMonth'}}}},
			{aDate1: {dayOfMonth: 15}},
			{aDate1: {$lt: new Date(2015,0,15,12,30,30,500)}},
			{aDate1: {$lte: new Date(2014,0,15,12,30,30,500)}},
			{aDate1: {$eq: new Date(2014,0,15,12,30,30,500)}},
			{aDate1: {$gte: new Date(2014,0,15,12,30,30,500)}},
			{aDate1: {$gt: new Date(2013,0,15,12,30,30,500)}},
			{aDate1: {$eq: [new Date(2014,1,16,12,30,30,500),"Y"]}},
			{aDate1: {$eq: [new Date(2014,0,16,12,30,30,500),"M"]}},
			{aDate1: {$eq: [new Date(2014,0,15,13,30,30,500),"D"]}},
			{aDate1: {$eq: [new Date(2014,0,15,12,0,30,500),"h"]}},
			{aDate1: {$eq: [new Date(2014,0,15,12,30,0,500),"m"]}},
			{aDate1: {$eq: [new Date(2014,0,15,12,30,30,250),"s"]}},
			{aDate1: {$eq: [new Date(2014,0,15,12,30,30,500),"ms"]}},
			{aDate1: {$neq: [new Date(2015,1,16,12,30,30,500),"Y"]}},
			{aDate1: {$neq: [new Date(2014,1,16,12,30,30,500),"M"]}},
			{aDate1: {$neq: [new Date(2014,0,16,13,30,30,500),"D"]}},
			{aDate1: {$neq: [new Date(2014,0,15,13,0,30,500),"h"]}},
			{aDate1: {$neq: [new Date(2014,0,15,12,35,0,500),"m"]}},
			{aDate1: {$neq: [new Date(2014,0,15,12,30,35,250),"s"]}},
			{aDate1: {$neq: [new Date(2014,0,15,12,30,30,250),"ms"]}},
			{aTimeYear: new Time(new Date(2014,1,15,12,30,30,500)).withPrecision("Y")},
			{aTimeMonth: new Time(new Date(2014,1,15,12,30,30,500)).withPrecision("M")},
			{aTimeDay: new Time(new Date(2014,1,15,12,30,30,500)).withPrecision("D")},
			{aTimeHour: new Time(new Date(2014,1,15,12,30,30,500)).withPrecision("h")},
			{aTimeSecond: new Time(new Date(2014,1,15,12,30,30,500)).withPrecision("s")},
			{aTimeMillisecond: new Time(new Date(2014,1,15,12,30,30,500)).withPrecision("ms")},
			{aTimeYear: {$eq: {$self: '../aTimeYear'}}},
			{aTimeYear: {time: {$eq: {$self: '../time'}}}},
			{aTimeYear: {$lt: {$self: '/aTimeMonth'}}},
			{aTimeMonth: {$lt: {$self: '../aTimeDay'}}},
			{aTimeDay: {$lt: {$self: '../aTimeHour'}}},
			{aTimeHour: {$lt: {$self: '../aTimeMinute'}}},
			{aTimeMinute: {$lt: {$self: '../aTimeSecond'}}},
			{aTimeSecond: {$lt: {$self: '../aTimeMillisecond'}}},
			{aYear: {length: {$eq: 31557600*1000}}}, 
			{aMonth: {length: (31557600*1000)/12}}, // a psuedo month
			{aDay: {length: 24*60*60*1000}},
			{anHour: {length: 60*60*1000}},
			{aMinute: {length: 60*1000}},
			{aSecond: {length: 1000}},
			{aMillisecond: {length: 1}},
			{aYear: {years: 1}},
			{aMonth: {months: 1}},
			{aMonth: {years: {$lt: 1}}},
			{aMonth: {$lt: {$self: '/aYear'}}},
			{aWeek: {weeks: 1}},
			{aWeek: {months: {$lt: 1}}},
			{aWeek: {$lt: {$self: '/aMonth'}}},
			{aDay: {days: 1}},
			{aDay: {months: {$lt: 1}}},
			{aDay: {$lt: {$self: '/aWeek'}}},
			{anHour: {hours: 1}},
			{anHour: {minutes: 60}},
			{anHour: {days: {$lt: 1}}},
			{anHour: {$lt: {$self: '/aDay'}}},
			{aMinute: {minutes: 1}},
			{aMinute: {hours: {$lt: 1}}},
			{aMinute: {seconds: 60}},
			{aMinute: {$lt: {$self: '/anHour'}}},
			{aSecond: {seconds: 1}},
			{aSecond: {minutes: {$lt: 1}}},
			{aSecond: {milliseconds: 1000}},
			{aSecond: {$lt: {$self: '/aMinute'}}},
			{aMillisecond: {milliseconds: 1}},
			{aMillisecond: {seconds: {$lt: 1}}},
			{aMillisecond: {milliseconds: 1}},
			{aMillisecond: {$lt: {$self: '/aSecond'}}},
			{aYear: {$lt: [new Duration(2,"Y"),"Y"]}},
			{aYear: {$lte: [new Duration(1,"Y"),"Y"]}},
			{aYear: {$eq: [new Duration(1,"Y"),"Y"]}},
			{aYear: {$eq: [new Duration(1,"Y"),"M"]}},
			{aYear: {$neq: [new Duration(2,"Y"),"Y"]}},
			{aYear: {$gte: [new Duration(1,"Y"),"Y"]}},
			{aYear: {$gt: [new Duration(11,"M"),"Y"]}},
			{aMonth: {$lt: [new Duration(1,"Y"),"Y"]}},
			{aMonth: {$lt: [new Duration(2,"M"),"M"]}},
			{aMonth: {$lte: [new Duration(1,"M"),"M"]}},
			{aMonth: {$eq: [new Duration(1,"M"),"M"]}},
			{aMonth: {$eq: [new Duration(1,"M"),"M"]}},
			{aMonth: {$neq: [new Duration(2,"M"),"M"]}},
			{aMonth: {$gte: [new Duration(1,"M"),"M"]}},
			{aMonth: {$gt: [new Duration(28,"D"),"M"]}},
			{aDay: {$lt: [new Duration(1,"Y"),"Y"]}},
			{aDay: {$lt: [new Duration(1,"M"),"D"]}},
			{aDay: {$lt: [new Duration(2,"D"),"D"]}},
			{aDay: {$lte: [new Duration(1,"D"),"D"]}},
			{aDay: {$eq: [new Duration(1,"D"),"D"]}},
			{aDay: {$eq: [new Duration(1,"D"),"D"]}},
			{aDay: {$neq: [new Duration(2,"D"),"D"]}},
			{aDay: {$gte: [new Duration(1,"D"),"D"]}},
			{aDay: {$gt: [new Duration(23,"h"),"D"]}},
			{anHour: {$lt: [new Duration(1,"Y"),"Y"]}},
			{anHour: {$lt: [new Duration(1,"M"),"h"]}},
			{anHour: {$lt: [new Duration(1,"D"),"h"]}},
			{anHour: {$lt: [new Duration(2,"h"),"h"]}},
			{anHour: {$lte: [new Duration(1,"h"),"h"]}},
			{anHour: {$eq: [new Duration(1,"h"),"h"]}},
			{anHour: {$eq: [new Duration(1,"h"),"h"]}},
			{anHour: {$neq: [new Duration(2,"h"),"h"]}},
			{anHour: {$gte: [new Duration(1,"h"),"h"]}},
			{anHour: {$gt: [new Duration(59,"m"),"h"]}},
			//aTimeSpan1 =  new JOQULAR.TimeSpan(new Date(2013,1,15,12,30,30,500),new Date(2015,1,15,12,30,30,500))
			{aTimeSpan1: {starts: new Date(2013,1,15,12,30,30,500).valueOf(), ends: new Date(2015,1,15,12,30,30,500).valueOf()}},
			{aTimeSpan1: {$coincident: {$self: '../aTimeSpan1'}}},
			{aTimeSpan1: {$intersects: {$self: '../aTimeSpan2'}}},
			{aTimeSpan1: {$intersects: {$self: '../aTimeSpan3'}}},
			{aTimeSpan1: {$contains: {$self: '../aTimeSpan4'}}},
			{aTimeSpan2: {ends: Infinity}},
			{aTimeSpan3: {starts: -Infinity}},
			{aTimeSpan1: {$before: new Date(2016,1,15,12,30,30,500)}},
			//{aTimeSpan1: {$adjacentOrBefore: [new Date(2016,1,15,12,30,30,500),"Y"]}},
			//{aTimeSpan1: {$adjacentBefore: [new Date(2016,1,15,12,30,30,500),"Y"]}},
			{aTimeSpan1: {$after: new Date(2012,1,15,12,30,30,500)}},
			{aTimeSpan1: {$before: new Time(Infinity)}},
			{aTimeSpan1: {$after: new Time(-Infinity)}},
			{aTimeSpan1: {$adjacent: [new Date(2016,1,15,12,30,30,500),"Y"]}},
			{aOne: 1, $exists: function(object) { return object.aString!==null; }},
			{aOne: 1, $forall: function(object) { return object.__proto__!==null; }},
			{aString: "astring", $exists: function(object) { return object.aString!==null; }},
			{aString: "astring", $forall: function(object) { return object.__proto_!==null; }}
		];
		positivetests.run = [];
		
		
		var negativetests = [
			{aNull: 1},
			{aNull: {$eq: 1}},
			{aNull: {$neq: null}},
			{aTrue: {$lt: true}},
			{aTrue: {$lte: false}},
			{aTrue: false},
			{aTrue: {$eq: false}},
			{aTrue: {$neq: true}},
			{aTrue: {$gt: true}},
			{aFalse: {$lt: false}},
			{aFalse: true},
			{aFalse: {$eq: true}},
			{aFalse: {$neq: false}},
			{aFalse: {$gte: true}},
			{aFalse: {$gt: true}},
			{aOne: 2},
			{aOne: {$lte: 0}},
			{aOne: {$eq: 2}},
			{aOne: {$neq: 1}},
			{aOne: {$gte: 3}},
			{aOne: {$in: [4,5,6]}},
			{aOne: {$in: new Set([4,5,6])}},
			{aOne: {$nin: [1,2,3]}},
			{aOne: {$nin: new Set([1,2,3])}},
			{aOne: {$between: [3,4]}},
			{aOne: {$outside: [0,2]}},
			{aNaN: {$: function(value) { return !isNaN(value); }}},
			{aString: "anotherstring"},
			{aString: {$match: /bs*/g}},
			{aString: {$echoes: "anotherstring"}},
			{aString: {$eq: "anotherstring"}},
			{aString: {$neq: "astring"}},
			{aString: {$eq: 1}},
			{aString: {$gte: "zzzzzz"}},
			{aString: "astring", $$: test$$Negative},
			{anObject: {anotherString: "anotherstring"}},
			{anObject: {aChildObject: {anotherString: "anotherstring"}}},
			{anObject: {aChildObject: {aGrandChildObject: {anotherString: "anotherstring"}}}},
			{anObject: {aChildObject: {aGrandChildObject: {anotherString: "anotherstring", aNaN: {$: isNaN}}}}},
			{anObject: {aChildObject: {aGrandChildObject: {anotherString: {$neq: {$self: '/aString'}}}}}},
			{anObject: {aChildObject: {aGrandChildObject: {anotherString: {$neq: {$self: '/anObject/anotherString'}}}}}}, 
			{anObject: {aChildObject: {aGrandChildObject: {anotherString: {$neq: {$self: '/anObject/aChildObject/anotherString'}}}}}},
			{anObject: {aChildObject: {aGrandChildObject: {anotherString: {$neq: {$self: '../anotherString'}}}}}},
			{anArray1: [5,6,7,8]},
			{anArray1: {count: 3}},
			{anArray1: {$min: 0}},
			{anArray1: {$avg: 10}},
			{anArray1: {$eq: [5,6,7,8]}},
			{anArray1: {$neq: [1,2,3,4]}},
			{anArray1: {$contains: 10}},
			{anArray1: {$includes: 10}},
			{anArray1: {$excludes: 1}},
			{anArray1: {$intersects: [6,7]}},
			{anArray1: {$disjoint: [1,2,3,4]}},
			{anArray1: {$coincident: [5,6,7,8]}},
			{anArray4: {$every: function(i) { return i===2}}},
			{anArray1: {$some: function(i) { return i===10}}},
			{aSet1: {$eq: new Set([5,6,7,8])}},
			{aSet1: {$neq: new Set([1,2,3,4])}},
			{aSet1: {$contains: 10}},
			{aSet1: {$includes: 10}},
			{aSet1: {$excludes: 1}},
			{aSet1: {$intersects: [6,7]}},
			{aSet1: {$disjoint: [1,2,3,4]}},
			{aSet1: {$coincident: [5,6,7,8]}},
			{aSet4: {$every: function(i) { return i===2}}},
			{aSet1: {$some: function(i) { return i===10}}},
			{aSet1: {$coincident: {$self: '../anArray2'}}},
			{aSet1: {$intersects: {$self: '../anArray2'}}},
			{aSet1: {$disjoint: {$self: '../anArray1'}}},
			{aDate1: {year:2016}},
			{aDate1: {dayOfMonth: {$gt: {'/aDate3': 'dayOfMonth'}}}},
			{aDate1: {$lt: new Date(2013,0,15,12,30,30,500)}},
			{aDate1: {$lte: new Date(2013,0,15,12,30,30,500)}},
			{aDate1: {$eq: new Date(2013,0,15,12,30,30,500)}},
			{aDate1: {$gte: new Date(2015,0,15,12,30,30,500)}},
			{aDate1: {$gt: new Date(2015,0,15,12,30,30,500)}},
			{aDate1: {$neq: [new Date(2014,0,15,12,30,30,500),"Y"]}},
			{aDate1: {$neq: [new Date(2014,0,15,12,30,30,500),"M"]}},
			{aDate1: {$neq: [new Date(2014,0,15,13,30,30,500),"D"]}},
			{aDate1: {$neq: [new Date(2014,0,15,12,0,30,500),"h"]}},
			{aDate1: {$neq: [new Date(2014,0,15,12,30,0,500),"m"]}},
			{aDate1: {$neq: [new Date(2014,0,15,12,30,30,250),"s"]}},
			{aDate1: {$neq: [new Date(2014,0,15,12,30,30,500),"ms"]}},
			{aDate1: {$eq: [new Date(2015,1,16,12,30,30,500),"Y"]}},
			{aDate1: {$eq: [new Date(2014,1,16,12,30,30,500),"M"]}},
			{aDate1: {$eq: [new Date(2014,0,16,13,30,30,500),"D"]}},
			{aDate1: {$eq: [new Date(2014,0,15,13,0,30,500),"h"]}},
			{aDate1: {$eq: [new Date(2014,0,15,12,35,0,500),"m"]}},
			{aDate1: {$eq: [new Date(2014,0,15,12,30,35,250),"s"]}},
			{aDate1: {$eq: [new Date(2014,0,15,12,30,30,250),"ms"]}},
			{aTimeYear: new Time(new Date(2013,1,15,12,30,30,500)).withPrecision("Y")},
			{aTimeMonth: new Time(new Date(2013,1,15,12,30,30,500)).withPrecision("M")},
			{aTimeDay: new Time(new Date(2013,1,15,12,30,30,500)).withPrecision("D")},
			{aTimeHour: new Time(new Date(2013,1,15,12,30,30,500)).withPrecision("h")},
			{aTimeSecond: new Time(new Date(2013,1,15,12,30,30,500)).withPrecision("s")},
			{aTimeMillisecond: new Time(new Date(2013,1,15,12,30,30,500)).withPrecision("ms")},
			{aTimeYear: {$neq: {$self: '../aTimeYear'}}},
			{aTimeYear: {$gt: {$self: '../aTimeMonth'}}},
			{aTimeMonth: {$gt: {$self: '../aTimeDay'}}},
			{aTimeDay: {$gt: {$self: '../aTimeHour'}}},
			{aTimeHour: {$gt: {$self: '../aTimeMinute'}}},
			{aTimeMinute: {$gt: {$self: '../aTimeSecond'}}},
			{aTimeSecond: {$gt: {$self: '../aTimeMillisecond'}}},
			{aYear: {length: {$neq: Math.floor(365.25*24*60*60*1000)}}}, 
			{aMonth: {length: Math.floor(365.25/12*24*60*60*2000)}}, // a psuedo month
			{aDay: {length: 24*60*60*2000}},
			{anHour: {length: 60*60*2000}},
			{aMinute: {length: 60*2000}},
			{aSecond: {length: 2000}},
			{aMillisecond: {length: 2}},
			{aYear: {$gt: [new Duration(2,"Y"),"Y"]}},
			{aYear: {$neq: [new Duration(1,"Y"),"Y"]}},
			{aYear: {$neq: [new Duration(1,"Y"),"M"]}},
			{aYear: {$eq: [new Duration(2,"Y"),"Y"]}},
			{aYear: {$lt: [new Duration(11,"M"),"Y"]}},
			{aMonth: {$gt: [new Duration(1,"Y"),"Y"]}},
			{aMonth: {$gt: [new Duration(2,"M"),"M"]}},
			{aMonth: {$gt: [new Duration(1,"M"),"M"]}},
			{aMonth: {$neq: [new Duration(1,"M"),"M"]}},
			{aMonth: {$eq: [new Duration(2,"M"),"M"]}},
			{aMonth: {$lt: [new Duration(1,"M"),"M"]}},
			{aMonth: {$lt: [new Duration(28,"D"),"M"]}},
			{aDay: {$gt: [new Duration(1,"Y"),"Y"]}},
			{aDay: {$gt: [new Duration(1,"M"),"D"]}},
			{aDay: {$gt: [new Duration(2,"D"),"D"]}},
			{aDay: {$gt: [new Duration(1,"D"),"D"]}},
			{aDay: {$neq: [new Duration(1,"D"),"D"]}},
			{aDay: {$neq: [new Duration(1,"D"),"D"]}},
			{aDay: {$eq: [new Duration(2,"D"),"D"]}},
			{aDay: {$lt: [new Duration(1,"D"),"D"]}},
			{aDay: {$lt: [new Duration(23,"h"),"D"]}},
			{anHour: {$gt: [new Duration(1,"Y"),"Y"]}},
			{anHour: {$gt: [new Duration(1,"M"),"h"]}},
			{anHour: {$gt: [new Duration(1,"D"),"h"]}},
			{anHour: {$gt: [new Duration(2,"h"),"h"]}},
			{anHour: {$gt: [new Duration(1,"h"),"h"]}},
			{anHour: {$neq: [new Duration(1,"h"),"h"]}},
			{anHour: {$neq: [new Duration(1,"h"),"h"]}},
			{anHour: {$eq: [new Duration(2,"h"),"h"]}},
			{anHour: {$lt: [new Duration(1,"h"),"h"]}},
			{anHour: {$lt: [new Duration(59,"m"),"h"]}},
			{aTimeSpan1: {$disjoint: {$self: '../aTimeSpan2'}}},
			{aTimeSpan1: {$disjoint: {$self: '../aTimeSpan3'}}},
			{aTimeSpan1: {$disjoint: {$self: '../aTimeSpan4'}}},
			{aTimeSpan2: {ends: -Infinity}},
			{aTimeSpan3: {starts: Infinity}},
			{aString: "astring", $exists: function(object) { return object.aString===null; }},
			{aString: "astring", $forall: function(object) { return object.__proto_===null; }}
		];
		negativetests.run = [];
		
		var querytests = [
			[JOQULAR.select().from({e1: Entity}),3],
			[JOQULAR.select().first(1).from({e1: Entity}),1],
			[JOQULAR.select().last(1).from({e1: Entity}),1],
			[JOQULAR.select().first(1).last(1).from({e1: Entity}),2],
			[JOQULAR.select().first(.34).from({e1: Entity}),1],
			[JOQULAR.select().last(.34).from({e1: Entity}),1],
			[JOQULAR.select().first(.34).last(.34).from({e1: Entity}),2],
			[JOQULAR.select().last(2).sample(1).from({e1: Entity}),1],
			[JOQULAR.select().last(2).sample(2).from({e1: Entity}),2],
			[JOQULAR.select().sample(.66).from({e1: Entity}),2],
			[JOQULAR.select().from({e1: Entity}).orderBy({'e1.name':'desc'}),function(results) { return results.length===3 && results[0][0].name==="to3"}],
			[JOQULAR.select({'e1.name': {as: 'Name'}}).from({e1: Entity}),function(results) { return results.length===3 && results[0].Name==="to1"}],
			[JOQULAR.select({'e1.name': {as: 'Name', format:function(value) { return value.toUpperCase(); }}}).from({e1: Entity}),function(results) { return results.length===3 && results[0].Name==="TO1"}]
		];
		querytests.run = [];
		

		var promises = [];
		console.time("test");
		var passed = 0, failed = 0;
		positivetests.forEach(function(pattern,i) {
			if(runtest==null || runtest===i) {
				if(positivetests.run.length === 0 || positivetests.run.indexOf(i)>=0) {
					var promise = to1.joqularMatch(pattern);
					promises.push(promise);
					promise.then(function(result) {
						if(result.length===1) {
							passed++;
							if(logsuccess) console.log("Passed Positive Match Test: " + i + " " + JSON.stringify(pattern));
						} else {
							failed++;
							console.log("Failed Positive Match Test: " + i + " " + JSON.stringify(pattern));
						}
					}).catch(function(err) {
						console.log(err);
					});
				}
			}
		});
		negativetests.forEach(function(pattern,i) {
			if(runtest==null || runtest===i) {
				if(negativetests.run.length === 0 || negativetests.run.indexOf(i)>=0) {
					var promise = to1.joqularMatch(pattern);
					promises.push(promise);
					promise.then(function(result) {
						if(result.length===0) {
							passed++;
							if(logsuccess) console.log("Passed Negative Match Test: " + i + " " + JSON.stringify(pattern));
						} else {
							failed++;
							console.log("Failed Negative Match Test: " + i + " " + JSON.stringify(pattern));
						}
					}).catch(function(err) {
						console.log(err);
					});
				}
			}
		});
	
		positivetests.forEach(function(pattern,i) {
			if(runtest==null || runtest===i) {
				if(positivetests.run.length === 0 || positivetests.run.indexOf(i)>=0) {
					var promise = Entity.find(pattern);
					promises.push(promise);
					promise.then(function(result) {
						if(result.length>0) {
							passed++;
							if(logsuccess) console.log("Passed Positive Find Test: " + i + " " + JSON.stringify(pattern));
						} else {
							failed++;
							console.log("Failed Positive Find Test: " + i + " " + JSON.stringify(pattern));
						}
					}).catch(function(err) {
						console.log(err);
					});
				}
			}
		});
	
		negativetests.forEach(function(pattern,i) {
			if(runtest==null || runtest===i) {
				if(negativetests.run.length === 0 || negativetests.run.indexOf(i)>=0) {
					var promise = Entity.find(pattern);
					promises.push(promise);
					promise.then(function(result) {
						if(result.length===0) {
							passed++;
							if(logsuccess) console.log("Passed Negative Find Test: " + i + " " + JSON.stringify(pattern));
						} else {
							failed++;
							console.log("Failed Negative Find Test: " + i + " " + JSON.stringify(pattern) + " " + JSON.stringify(result));
						}
					}).catch(function(err) {
						console.log(err);
					});
				}
			}
		});
	
		positivetests.forEach(function(test,i) {
			if(runtest==null || runtest===i) {
				if(positivetests.run.length === 0 || positivetests.run.indexOf(i)>=0) {
					var query = JOQULAR.select().from({e1: Entity}).where({e1: test});
					var promise = query.exec();
					promise.then(function(result) {
						if(result.length>=1) {
							passed++;
							if(logsuccess) console.log("Passed Positive Pattern Query Test: " + i + " " + JSON.stringify(query));
						} else {
							failed++;
							console.log("Failed Positive Pattern Query Test: " + i + " " + JSON.stringify(query) + " Expected: 1 Found: " + result.length + " " + JSON.stringify(result));
						}
					}).catch(function(err) {
						console.log(err);
					});
				}
			}
		});
	
		negativetests.forEach(function(test,i) {
			if(runtest==null || runtest===i) {
				if(negativetests.run.length === 0 || negativetests.run.indexOf(i)>=0) {
					var query = JOQULAR.select().from({e1: Entity}).where({e1: test});
					var promise = query.exec();
					promise.then(function(result) {
						if(result.length===0) {
							passed++;
							if(logsuccess) console.log("Passed Negative Pattern Query Test: " + i + " " + JSON.stringify(query));
						} else {
							failed++;
							console.log("Failed Negative Pattern Query Test: " + i + " " + JSON.stringify(query) + " Expected: 1 Found: " + result.length + " " + JSON.stringify(result));
						}
					}).catch(function(err) {
						console.log(err);
					});
				}
			}
		});
	
		querytests.forEach(function(test,i) {
			if(runtest==null || runtest===i) {
				if(querytests.run.length === 0 || querytests.run.indexOf(i)>=0) {
					var promise = test[0].exec();
					var expected = test[1];
					promise.then(function(result) {
						if(result.length===expected || (typeof(expected)==="function" && expected(result))) {
							passed++;
							if(logsuccess) console.log("Passed Query Test Test: " + i + " " + JSON.stringify(test[0]));
						} else {
							failed++;
							console.log("Failed Query Test: " + i + " " + JSON.stringify(test[0]) + " Expected: " + expected + " Found: " + result.length + " " + JSON.stringify(result));
						}
					}).catch(function(err) {
						console.log(err);
					});
				}
			}
		});
	
		/*
		var i1 = JOQULAR.insert().into(Person).keys(['name','age']).values(['Zane',24]).exec();
		if(i1 instanceof Person && i1.name=='Zane' && i1.age==24) {
			passed++;
			if(logsuccess) console.log("Passed Values Insert Test");
		} else {
			failed++;
			console.log("Failed Values Insert Test " + JSON.stringify(i1));
		}
		var i2 = JOQULAR.insert().into(Person).object([{name:'Tyler',age:22}]).exec();
		if(i2[0] instanceof Person && i2[0].name==='Tyler' && i2[0].age==22) {
			passed++;
			if(logsuccess) console.log("Passed Object Insert Test");
		} else {
			failed++;
			console.log("Failed Values Insert Test " + JSON.stringify(i2));
		}
	
	
		var ostring1 = JSON.stringify(Object.index.keys.joqularIdMap[0]);
		Object.index.flush(0);
		var ostring2 = JSON.stringify(Object.index.keys.joqularIdMap[0]);
		Object.index.restore(0);
		var ostring3 = JSON.stringify(Object.index.keys.joqularIdMap[0]);
		if(ostring2=="1" && ostring1==ostring3) {
			passed++;
			if(logsuccess) console.log("Passed Flush Test");
		} else {
			failed++;
			console.log("Failed Flush Test " + ostring1 + " != " + ostring3);
		}
	
		*/
	
		Promise.all(promises).then(function() {
			console.log("Completed " + (passed+failed) + " synchronous tests. Passed: " + passed + " Failed: " + failed + " " + (logsuccess ?  "To show only failures, set logsuccess = false" : "To see all results including asynchronous tests, set logsuccess = true") + " at top of file.");
			console.timeEnd("test");
		}).catch(function(err) {
			console.log(err);
		});;
		
		
		JOQULAR.clear();
		var start =  performance.now();
		var testobjects = db.collection("Entity",{schema:EntityValidator});
		var loaded =  performance.now();
		console.log("Load Time:",loaded-start);
		var i = 100000; //5000; //10000;
		new Entity({testId:0});
		var find = 0; //Math.floor((Math.random() * i) + 1);
		var start =  performance.now();
		for(var j=0;j<i;j++) {
			var e = new Entity({testId:Math.floor((Math.random() * i) + 1)});//.setData({testId:Math.floor((Math.random() * 100) + 1)});
		}
		var created =  performance.now();
		console.log("Create Time:",created-start,1000/((created-start)/i));
		var startselect = performance.now();
		var select = JOQULAR.select().from({p1: 'Entity'}).where({p1: {testId: find}}).exec();
		select.then(function(results) {
			var selected =  performance.now();
			console.log("Select Time:",selected-startselect,(selected-startselect)/i,results.length);
			var startreselect = performance.now();
			var reselect = JOQULAR.select().from({p1: 'Entity'}).where({p1: {testId: find}}).exec();
			reselect.then(function(results) {
				var reselected =  performance.now();
				console.log("Reselect Time:",reselected-startreselect,(reselected-startreselect)/i,results.length);
			});
		});
		var startidfind = performance.now();
		var ids = Entity.findIds({testId: find});
		var idsfound = performance.now();;
		console.log("Id Find Time:",idsfound-startidfind,1000/((idsfound-startidfind)/ids.length),ids.length);
		var startfind = performance.now();
		var os = Entity.find({testId: find},function(err,cached) { console.log("Cached Find Time:",performance.now()-startfind,cached.length) });
		os.then(function(results) {
			var found = performance.now();;
			console.log("Object Find Time:",found-startfind,1000/((found-startfind)/results.length),results.length);
		});
		var startsave =  performance.now();
		var save = testobjects.save();
		save.then(function(err) {
			if(err) {
				console.log(err);
			}
			var saved =  performance.now();
			console.log("Save Time:",saved-startsave,1000/((saved-startsave)/i));
			testobjects.flush();
			var flushed =  performance.now();
			console.log("Flush Time:",flushed-saved,1000/((flushed-saved)/i));
			var ros = Entity.find({testId: find},function(err,cached) { console.log("Uncached Refind Time:",performance.now()-startfind,cached.length) });
			ros.then(function(results) {
				var refound = performance.now();;
				console.log("Refind Time:",refound-flushed,(refound-flushed)/i,results.length);
			});
			testobjects.flush();
			var startload =  performance.now();
			var load = JOQULAR.select().from({p1: 'Entity'}).where({p1: {testId: find}}).exec();
			load.then(function(results) {
				var loaded =  performance.now();
				console.log("Load From Search Time:",loaded-startload,1000/((loaded-startload)/results.length),results.length);
				testobjects.load().then(function() {
					var cloaded =  performance.now();
					console.log("Load From Search Time:",loaded-startload,1000/((cloaded-loaded)/1));
				});
			});
		});
	}
	if (typeof(module) != 'undefined' && module.exports) {
		module.exports  = test;
	} else if (typeof define === 'function' && define.amd) {
		// Publish as AMD module
		define(function() {return test;});
	} else {
		// Publish as global (in browsers)
		var _previousRoot = _global.test;
		// **`noConflict()` - (browser only) to reset global 
		test.noConflict = function() {
			_global.test = _previousRoot;
			return test;
		};
		_global.test = test;
	}

}).call(this);

