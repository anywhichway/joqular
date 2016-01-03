//     about-time.js
//
//     Copyright (c) 2015 Simon Y. Blackwell, AnyWhichWay
//     MIT License - http://opensource.org/licenses/mit-license.php

if(typeof(ReadOnlyError)==="undefined") {
	function AccessError(type,message) {
		this.name = "AccessError";
		this.message = type + (message ? message : "");
		this.stack = (new Error()).stack;
	}
	AccessError.prototype = Object.create(Error.prototype);
	AccessError.prototype.constructor = AccessError;
}
(function() {
	"use strict";
	var _global = this;
	
	function Time(value,precision) {
		if(value==null) {
			value = new Date().getTime()
		} else if(value.constructor===Time || value instanceof Time) {
			precision = (precision ? precision : value.precision);
			value = value.time;
		} else if(value instanceof Date) {
			value = value.getTime();
		} else if(value instanceof TimeSpan) {
			value = value.starts.valueOf();
		} else if(typeof(value)==="string") {
			value = Date.parse(value);
		} else {
			value = value.valueOf();
		}
		precision = (precision ? precision : "ms");
		Object.defineProperty(this,"__time__",{enumerable:false,configurable:true,writable:true,value:undefined});
		Object.defineProperty(this,"time",{enumerable:true,configurable:true,get:function() { return this.__time__; },set:function(milliseconds) {
			if(isNaN(milliseconds)) {
				throw new TypeError("time must be real number.");
			}
			this.__time__ = milliseconds;
		}});
		this.time = value;
		Object.defineProperty(this,"__precision__",{enumerable:false,configurable:true,writable:true,value:undefined});
		Object.defineProperty(this,"precision",{enumerable:true,configurable:true,get:function() { return this.__precision__; },set:function(value) {
			if(["Y","M","D","h","m","s","ms"].indexOf(value)===-1) {
				throw new RangeError('Time precision must be one of "Y","M","D","h","m","s","ms" not ' + value);
			}
			this.__precision__ = value;
		}});
		this.precision = precision;
	}
	Object.defineProperty(Time.prototype,"year",{enumerable:true,configurable:true,set:function(value) {  return this.setFullYear(value);},get:function() { return (new Date(this.valueOf())).getFullYear(); }});
	Object.defineProperty(Time.prototype,"fullYear",{enumerable:true,configurable:true,set:function(value) {  return this.setFullYear(value);},get:function() { return (new Date(this.valueOf())).getFullYear(); }});
	Object.defineProperty(Time.prototype,"month",{enumerable:true,configurable:true,set:function(value) {  this.setMonth(value);},get:function() { return (new Date(this.valueOf())).getMonth(); }});
	Object.defineProperty(Time.prototype,"dayOfMonth",{enumerable:true,configurable:true,set:function(value) {  this.setDate(value);},get:function() { return (new Date(this.valueOf())).getDate(); }});
	Object.defineProperty(Time.prototype,"hours",{enumerable:true,configurable:true,set:function(value) {  this.setHours(value);},get:function() { return (new Date(this.valueOf())).getHours(); }});
	Object.defineProperty(Time.prototype,"minutes",{enumerable:true,configurable:true,set:function(value) {  this.setMinutes(value);},get:function() { return (new Date(this.valueOf())).getMinutes(); }});
	Object.defineProperty(Time.prototype,"seconds",{enumerable:true,configurable:true,set:function(value) {  this.setSeconds(value);},get:function() { return (new Date(this.valueOf())).getSeconds(); }});
	Object.defineProperty(Time.prototype,"milliseconds",{enumerable:true,configurable:true,set:function(value) {  this.setMilliseconds(value);},get:function() { return (new Date(this.valueOf())).getMilliseconds(); }});
	Time.revive = function(data) {
		if(!(data instanceof Object)) {
			throw new TypeError("argument to Time.revive must be an instanceof Object");
		}
		var instance = new Time(data.time,data.precision);
		for(var key in data) {
			if(["time","precision"].indexOf(key)===-1) {
				instance[key] = data[key];
			}
		}
		return instance;
	}
	Time.prototype.toJSON = function() {
		return {time: this.time, precision:this.__precision__};
	}
	Time.prototype.valueOf = function() {
		if(this.time===Infinity || this.time===-Infinity || isNaN(this.time)) {
			return this.time;
		}
		var dt = new Date(this.time), yr = dt.getFullYear();
		var M1, D1, h1, m1, s1, ms1;
		M1 = (["M","D","h","m","s","ms"].indexOf(this.precision)>=0 ? dt.getMonth() : 0);
		D1 = (["D","h","m","s","ms"].indexOf(this.precision)>=0 ? dt.getDate() : 1);
		h1 = (["h","m","s","ms"].indexOf(this.precision)>=0 ? dt.getHours() : 0);
		m1 = (["m","s","ms"].indexOf(this.precision)>=0 ? dt.getMinutes() : 0);
		s1 = (["s","ms"].indexOf(this.precision)>=0 ? dt.getSeconds() : 0);
		ms1 = (["ms"].indexOf(this.precision)>=0 ? dt.getMilliseconds() : 0);
		dt = new Date(yr,0);
		dt.setMonth(M1);
		dt.setDate(D1);
		dt.setHours(h1);
		dt.setMinutes(m1);
		dt.setSeconds(s1);
		dt.setMilliseconds(ms1);
		return dt.getTime();
	}
	Time.prototype.withPrecision = function(precision) {
		this.precision = precision;
		return this;
	}
	Time.prototype.toPrecision = function(precision,modify) {
		modify = (modify || modify==null ? true : false);
		if(modify) {
			return this.withPrecision(precision);
		} else {
			return new Time(this.time,this.precision);
		}
	}
	Time.prototype.lt = function(time,precision) {
		return new Time(this,precision).valueOf() < new Time(time.valueOf(),precision).valueOf();
	}
	Time.prototype.lte = function(time,precision) {
		if(time===this) {
			return true;
		}
		return new Time(this,precision).valueOf() <= new Time(time.valueOf(),precision).valueOf();
	}
	Time.prototype.eq = function(time,precision) {
		if(time===this) {
			return true;
		}
		return new Time(this,precision).valueOf() === new Time(time.valueOf(),precision).valueOf();
	}
	Time.prototype.neq = function(time,precision) {
		return new Time(this,precision).valueOf() !== new Time(time.valueOf(),precision).valueOf();
	}
	Time.prototype.gte = function(time,precision) {
		if(time===this) {
			return true;
		}
		return new Time(this,precision).valueOf() >= new Time(time.valueOf(),precision).valueOf();
	}
	Time.prototype.gt = function(time,precision) {
		return new Time(this,precision).valueOf() > new Time(time.valueOf(),precision).valueOf();
	}
	Time.prototype["in"] = function(timespan,precision) {
		if(timespan instanceof TimeSpan) {
			return value.contains(this);
		}
		return new Time(this,precision).valueOf() === new Time(timespan,precision).valueOf();
	}
	var dateProperties = {
		getDate: null,
		getDay: null,
		getFullYear: null,
		getHours: null,
		getMilliseconds: null,
		getMinutes: null,
		getMonth: null,
		getSeconds: null,
		getTime: null,
		getTimezoneOffset: null,
		getUTCDate: null,
		getUTCDay: null,
		getUTCFullYear: null,
		getUTCHours: null,
		getUTCMilliseconds: null,
		getUTCMinutes: null,
		getUTCMonth: null,
		getUTCSeconds: null,
		getYear: null,
		parse: null,
		setDate: null,
		setFullYear: null,
		setHours: null,
		setMilliseconds: null,
		setMinutes: null,
		setMonth: null,
		setSeconds: null,
		setTime: null,
		setUTCDate: null,
		setUTCFullYear: null,
		setUTCHours: null,
		setUTCMilliseconds: null,
		setUTCMinutes: null,
		setUTCMonth: null,
		setUTCSeconds: null,
		setYear: null,
		toDateString: null,
		toGMTString: null,
		toISOString: null,
		toLocaleDateString: null,
		toLocaleTimeString: null,
		toLocaleString: null,
		toString: null,
		toTimeString: null,
		toUTCString: null,
		UTC: null
	}
	Object.keys(dateProperties).forEach(function(key) {
		if(!Time.prototype[key]) {
			Time.prototype[key] = function() {
					var dt = new Date(this.valueOf());
					var result = dt[key].apply(dt,arguments);
					if(key.indexOf("set")===0) {
						this.time = dt.getTime();
					}
					return result;
			}
		}
	});
	function Duration(count,period,leapyear,range) {
		count = (count==null ? Infinity : count);
		period = (period ? period : "ms");
		range = (range==null ? 0 : range);
		if(count.constructor===Duration || count instanceof Duration) {
			period = (period ? period : count.period);
			count = count.count;
		}
		if(isNaN(count)) {
			throw new TypeError("Duration(" + count + "," + period + ") is not a valid call");
		}
		Object.defineProperty(this,"__period__",{enumerable:false,configurable:true,writable:true,value:undefined});
		Object.defineProperty(this,"period",{enumerable:true,configurable:true,get:function() { return this.__period__; },set:function(period) {
			if(!Duration.factors[period]) {
				throw new RangeError('Duration period must be one of "Y","Q","M","W","D","h","m","s","ms" not ' + period);
			};
			this.__period__ = period;
		}});
		Object.defineProperty(this,"__range__",{enumerable:false,configurable:true,writable:true,value:undefined});
		Object.defineProperty(this,"range",{enumerable:true,configurable:true,get:function() { return this.__range__; },set:function(range) {
			if([Duration.ATLEAST, Duration.EXACT, Duration.ATMOST].indexOf(range)===-1) {
				throw new RangeError('Duration range must be one of Duration.ATLEAST, Duration.EXACT, Duration.ATMOST');
			};
			this.__range__ = range;
		}})
		Object.defineProperty(this,"length",{enumerable:true,configurable:true,get:function() { return Duration.factors[this.period] * this.count; },set:function(milliseconds) {
			this.count = milliseconds / Duration.factors[this.peridod];
		}})
		this.count = count;
		this.period = period;
		this.leapyear = leapyear;
		this.range = range;
	}
	Duration.factors = {
		Y: 31557600*1000,
		Q: (31557600*1000)/4, // psuedo-quarter
		M: (31557600*1000)/12, // psuedo-month
		W: 7 * 24 * 60 * 60 * 1000,
		D: 24 * 60 * 60 * 1000,
		h: 60 * 60 * 1000,
		m: 60 * 1000,
		s: 1000,
		ms: 1
	}
	Duration.ATLEAST = -1;
	Duration.EXACT = 0;
	Duration.ATMOST = 1;
	Duration.revive = function(data) {
		if(!(data instanceof Object)) {
			throw new TypeError("argument to Duration.revive must be an instanceof Object");
		}
		var instance = new Duration(data.count,data.period,data.range);
		for(var key in data) {
			if(["count","period","range"].indexOf(key)===-1) {
				instance[key] = data[key];
			}
		}
		return instance;
	}
	Duration.prototype.toJSON = function() {
		return {count: this.count, period: this.period, range: this.range};
	}
	Object.defineProperty(Duration.prototype,"years",{enumerable:true,configurable:false,set:function() { throw new AccessError("w","years");},get:function() { return this.length/Duration.factors.Y; }});
	Object.defineProperty(Duration.prototype,"quarters",{enumerable:true,configurable:false,set:function() {  throw new AccessError("w","quarters");},get:function() { return this.length/Duration.factors.Q; }});
	Object.defineProperty(Duration.prototype,"months",{enumerable:true,configurable:false,set:function() {  throw new AccessError("w","months");},get:function() { return this.length/Duration.factors.M; }});
	Object.defineProperty(Duration.prototype,"weeks",{enumerable:true,configurable:false,set:function() {  throw new AccessError("w","weeks");},get:function() { return this.length/Duration.factors.W; }});
	Object.defineProperty(Duration.prototype,"days",{enumerable:true,configurable:false,set:function() {  throw new AccessError("w","days");},get:function() { return this.length/Duration.factors.D; }});
	Object.defineProperty(Duration.prototype,"hours",{enumerable:true,configurable:false,set:function() {  throw new AccessError("w","hours");},get:function() { return this.length/Duration.factors.h; }});
	Object.defineProperty(Duration.prototype,"minutes",{enumerable:true,configurable:false,set:function() {  throw new AccessError("w","minutes");},get:function() { return this.length/Duration.factors.m; }});
	Object.defineProperty(Duration.prototype,"seconds",{enumerable:true,configurable:false,set:function() {  throw new AccessError("w","seconds");},get:function() { return this.length/Duration.factors.s; }});
	Object.defineProperty(Duration.prototype,"milliseconds",{enumerable:true,configurable:false,set:function() {  throw new AccessError("w","milliseconds");},get:function() { return this.length; }});
	Duration.prototype.valueOf = function() {
		return this.length;
	}
	Duration.prototype.lt = function(value,period) {
		period = (period ? period : "ms");
		return this.valueOf() / Duration.factors[period] < new Duration(value.valueOf()).valueOf()  / Duration.factors[period];
	}
	Duration.prototype.lte = function(value,period) {
		if(value===this) {
			return true;
		}
		period = (period ? period : "ms");
		return this.valueOf() / Duration.factors[period] <= new Duration(value.valueOf()).valueOf()  / Duration.factors[period];
	}
	Duration.prototype.eq = function(value,period) {
		if(value===this) {
			return true;
		}
		period = (period ? period : "ms");
		return this.valueOf() / Duration.factors[period] === new Duration(value.valueOf()).valueOf()  / Duration.factors[period];
	}
	Duration.prototype.neq = function(value,period) {
		period = (period ? period : "ms");
		return this.valueOf() / Duration.factors[period] !== new Duration(value.valueOf()).valueOf()  / Duration.factors[period];
	}
	Duration.prototype.gte = function(value,period) {
		if(value===this) {
			return true;
		}
		period = (period ? period : "ms");
		return this.valueOf() / Duration.factors[period] >= new Duration(value.valueOf()).valueOf()  / Duration.factors[period];
	}
	Duration.prototype.gt = function(value,period) {
		period = (period ? period : "ms");
		return this.valueOf() / Duration.factors[period] > new Duration(value.valueOf()).valueOf()  / Duration.factors[period];
	}
	Duration.prototype.atLeast = function() {
		this.range = -1;
	}
	Duration.prototype.atMost = function() {
		this.range = 1;
	}
	Duration.prototype.exact = function() {
		this.range = 0;
	}
	function TimeSpan(starts,ends) {
		if((ends && ends.constructor===TimeSpan) || ends instanceof TimeSpan) {
			ends = ends.ends;
		}
		if((starts && starts.constructor===TimeSpan) || starts instanceof TimeSpan) {
			return new TimeSpan(starts.starts,ends);
		}
		this.starts = (starts!=null ? new Time(starts).valueOf() : new Time(-Infinity).valueOf());
		this.ends = (ends!=null ? new Time(ends).valueOf() : new Time(Infinity).valueOf());
		Object.defineProperty(this,"duration",{enumerable:true,configurable:false,get:function() { return this.ends - this.starts}, set: function() { throw new AccessError("w","duration");}});
	}
	TimeSpan.revive = function(data) {
		var instance = new TimeSpan(data.starts,data.ends);
		for(var key in data) {
			if(["starts","ends"].indexOf(key)===-1) {
				instance[key] = data[key];
			}
		}
		return instance;
	}
	TimeSpan.prototype.toJSON = function() {
		return {starts: this.starts, ends:this.ends};
	}
	TimeSpan.prototype.contains = function(value,precision) {
		var starts, ends, time;
		if(value instanceof TimeSpan) {
			starts = time = new Time(value.starts,precision).valueOf();
			ends = new Time(value.ends,precision).valueOf();
		} else {
			starts = time = ends = new Time(value.valueOf(),precision);
		}
		return this.starts <= starts <= time <= ends <= this.ends;
	}
	TimeSpan.prototype.intersects = function(value,precision) {
		var starts, ends;
		if(value instanceof TimeSpan) {
			starts = new Time(value.starts,precision).valueOf();
			ends = new Time(value.ends,precision).valueOf();
		} else {
			starts = ends = new Time(value.valueOf(),precision);
		}
		if(this.starts>=starts && this.starts<=ends) {
			return true;
		}
		if(this.ends<=ends && this.ends>=starts) {
			return true;
		}
		return false;
	}
	TimeSpan.prototype.disjoint = function(value,precision) {
		return !this.intersects(value,precision);
	}
	TimeSpan.prototype.coincident = function(value,precision) {
		var starts, ends;
		if(value instanceof TimeSpan) {
			starts = new Time(value.starts,precision).valueOf();
			ends = new Time(value.ends,precision).valueOf();
		} else {
			starts = ends = new Time(value.valueOf(),precision).valueOf();
		}
		return this.starts===starts && this.ends===ends;
	}
	TimeSpan.prototype.eq = function(value,precision) {
		if(this===value) {
			return true;
		}
		if(!(value instanceof TimeSpan)) {
			return false;
		}
		return new Time(this.starts,precision).valueOf() === new Time(value.starts,precision).valueOf() &&
			new Time(this.ends,precision).valueOf() === new Time(value.ends,precision).valueOf();
	}
	TimeSpan.prototype.before = function(value,precision) {
		var after = (value instanceof TimeSpan ? value.starts : value);
		return new Time(this.ends).lt(after,precision);
	}
	TimeSpan.prototype.adjacentBefore = function(value,precision) {
		var starts, ends = new Time(this.ends);
		if(value.constructor===TimeSpan || value instanceof TimeSpan) {
			starts = new Time(value.starts);
			if(value.intersects(this,precision)) {
				return false;
			}
		} else {
			starts = new Time(value);
		}
		if(precision==="Y") {
			return starts.getFullYear() === ends.getFullYear() + 1; // avoids leap year issues
		}
		starts = new Time(starts - new Duration(1,precision));
		return  starts.eq(ends,precision);
	}
	TimeSpan.prototype.after = function(value,precision) {
		var before = (value instanceof TimeSpan ? value.ends : value);
		return new Time(this.starts).gt(before,precision);
	}
	TimeSpan.prototype.adjacentAfter = function(value,precision) {
		var starts = new Time(this.starts), ends;
		if(value.constructor===TimeSpan || value instanceof TimeSpan) {
			ends = new Time(value.ends);
			if(value.intersects(this,precision)) {
				return false;
			}
		} else {
			ends = new Time(value);
		}
		if(precision==="Y") {
			return starts.getFullYear()-1 === ends.getFullYear(); // avoids leap year issues
		}
		ends = new Time(ends + new Duration(1,precision));
		return  starts.eq(ends,precision);
	}
	TimeSpan.prototype.adjacent = function(value,precision) {
		if(this.adjacentBefore(value,precision)) {
			return -1;
		}
		if(this.adjacentAfter(value,precision)) {
			return 1;
		}
		return 0;
	}
	
	var ExtendedDate = Date;
	// http://www.pilcrow.nl/2012/09/javascript-date-isleapyear-and-getlastdayofmonth
	//ExtendedDate functions. (Caveat: months start at 0!)
	ExtendedDate.isLeapYear = function (iYear)
	{
		return new ExtendedDate(iYear, 1, 29).getDate() === 29;
	}
	ExtendedDate.prototype.isLeapYear = function ()
	{
		return ExtendedDate.isLeapYear(this.getFullYear());
	}
	ExtendedDate.getLastDayOfMonth = function (iMonth, iYear)
	{
		if (/^([024679]|11)$/.test(iMonth)) {
			return 31;
		}
		if (/^[358]$/.test(iMonth)) {
			return 30;
		}
		return ExtendedDate.isLeapYear(iYear) ? 29 : 28;
	};
	ExtendedDate.prototype.getLastDayOfMonth = function ()
	{
		return ExtendedDate.getLastDayOfMonth(this.getMonth(), this.getFullYear());
	}
	ExtendedDate.prototype.coincident = function(value,precision) {
		if(value instanceof TimeSpan) {
			var d = new TimeSpan(this,this);
			return d.coincident(value,precision);
		}
		return this.eq(value,precision);
	}
	ExtendedDate.prototype.disjoint = function(value,precision) {
		if(value instanceof TimeSpan) {
			var d = new TimeSpan(this,this);
			return d.disjoint(value,precision);
		}
		return this.neq(value,precision);
	}
	ExtendedDate.prototype.intersects = function(value,precision) {
		if(value instanceof TimeSpan) {
			var d = new TimeSpan(this,this);
			return d.intersects(value,precision);
		}
		return this.eq(value,precision);
	}
	
	if (typeof(module) !== 'undefined' && module.exports) {
		module.exports.Time = Time;
		module.exports.Duration = Duration;
		module.exports.TimeSpan = TimeSpan;
	} else if (typeof define === 'function' && define.amd) {
		// Publish as AMD module
		define(function() {return {Time:Time,Duration:Duration,TimeSpan:TimeSpan};});
	} else {
		_global.Time = Time;
		_global.Duration = Duration;
		_global.TimeSpan = TimeSpan;
	}
}).call(this);