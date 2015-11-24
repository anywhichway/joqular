function Time(value,precision) {
	if(value==null) {
		value = new Date().getTime()
	} else if(value.constructor===Time || value instanceof Time) {
		value = value.valueOf();
	} else if(value instanceof Date) {
		value = value.getTime();
	} else if(value instanceof TimeSpan) {
		value = value.starts.valueOf();
	} else if(typeof(value)==="string") {
		value = Date.parse(value);
	}
	this.milliseconds = value;
	if(precision) {
		this.toPrecision(precision,true);
	}
}
Time.prototype.valueOf = function() {
	return this.milliseconds;
}
Time.prototype.withPrecision = function(precision) {
	return this.toPrecision(precision,false);
}
Time.prototype.toPrecision = function(precision,modify) {
	modify = (modify || modify==null ? true : false);
	if(!precision || this.milliseconds===Infinity || this.milliseconds===-Infinity || isNaN(this.milliseconds)) {
		if(modify) {
			return this;
		}
		return new Time(this.milliseconds);
	}
	var Y1 = this.getFullYear();
	var M1 = (["M","D","h","m","s","ms"].indexOf(precision)>=0 ? this.getMonth() : null);
	var D1 = (["D","h","m","s","ms"].indexOf(precision)>=0 ? this.getDate() : null);
	var h1 = (["h","m","s","ms"].indexOf(precision)>=0 ? this.getHours() : null);
	var m1 = (["m","s","ms"].indexOf(precision)>=0 ? this.getMinutes() : null);
	var s1 = (["s","ms"].indexOf(precision)>=0 ? this.getSeconds() : null);
	var ms1 = (["ms"].indexOf(precision)>=0 ? this.getMilliseconds() : null);
	var date = new Date(Y1,M1,D1,h1,m1,s1,ms1);
	if(modify) {
		this.setTime(date.getTime());
		return this;
	}
	return new Time(date);
}
Time.prototype.lt = function(value,precision) {
	return new Time(this,precision).valueOf() < new Time(value,precision).valueOf();
}
Time.prototype.lte = function(value,precision) {
	if(value===this) {
		return true;
	}
	return new Time(this,precision).valueOf() <= new Time(value,precision).valueOf();
}
Time.prototype.eq = function(value,precision) {
	if(value===this) {
		return true;
	}
	return new Time(this,precision).valueOf() === new Time(value,precision).valueOf();
}
Time.prototype.neq = function(value,precision) {
	return new Time(this,precision).valueOf() !== new Time(value,precision).valueOf();
}
Time.prototype.gte = function(value,precision) {
	if(value===this) {
		return true;
	}
	return new Time(this,precision).valueOf() >= new Time(value,precision).valueOf();
}
Time.prototype.gt = function(value,precision) {
	return new Time(this,precision).valueOf() > new Time(value,precision).valueOf();
}
Time.prototype["in"] = function(value,precision) {
	if(value instanceof TimeSpan) {
		return value.contains(this);
	}
	return new Time(this,precision).valueOf() === new Time(value,precision).valueOf();
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
				var dt = new Date(this.milliseconds);
				var result = dt[key].apply(dt,arguments);
				this.milliseconds = dt.getTime();
				return result;
		}
	}
});
function Duration(value,period) {
	period || (period = "ms");
	if(value.constructor===Duration || value instanceof Duration) {
		period = "ms";
		value = value.valueOf();
	}
	this.length = value * Duration.factors[period];
	this.range = 0;
}
Duration.factors = {
	Y: 31557600*1000,
	M: (31557600*1000)/12, // psuedo-month
	W: 7 * 24 * 60 * 60 * 1000,
	D: 24 * 60 * 60 * 1000,
	h: 60 * 60 * 1000,
	m: 60 * 1000,
	s: 1000,
	ms: 1
}
Object.defineProperty(Duration.prototype,"years",{enumerable:true,configurable:false,set:function() { return;},get:function() { return this.length/Duration.factors.Y; }});
Object.defineProperty(Duration.prototype,"months",{enumerable:true,configurable:false,set:function() { return;},get:function() { return this.length/Duration.factors.M; }});
Object.defineProperty(Duration.prototype,"weeks",{enumerable:true,configurable:false,set:function() { return;},get:function() { return this.length/Duration.factors.W; }});
Object.defineProperty(Duration.prototype,"days",{enumerable:true,configurable:false,set:function() { return;},get:function() { return this.length/Duration.factors.D; }});
Object.defineProperty(Duration.prototype,"hours",{enumerable:true,configurable:false,set:function() { return;},get:function() { return this.length/Duration.factors.h; }});
Object.defineProperty(Duration.prototype,"minutes",{enumerable:true,configurable:false,set:function() { return;},get:function() { return this.length/Duration.factors.m; }});
Object.defineProperty(Duration.prototype,"seconds",{enumerable:true,configurable:false,set:function() { return;},get:function() { return this.length/Duration.factors.s; }});
Object.defineProperty(Duration.prototype,"milliseconds",{enumerable:true,configurable:false,set:function() { return;},get:function() { return this.length; }});
Duration.prototype.valueOf = function() {
	return this.length;
}
Duration.prototype.lt = function(value,period) {
	if(value instanceof Duration && this.length < value.length) {
		return true;
	}
	period || (period = "s");
	return this.valueOf() / Duration.factors[period] < new Duration(value).valueOf()  / Duration.factors[period];
}
Duration.prototype.lte = function(value,period) {
	if(value===this || (value instanceof Duration && this.length <= value.length)) {
		return true;
	}
	period || (period = "s");
	return this.valueOf() / Duration.factors[period] <= new Duration(value).valueOf()  / Duration.factors[period];
}
Duration.prototype.eq = function(value,period) {
	if(value===this || (value instanceof Duration && this.length == value.length)) {
		return true;
	}
	period || (period = "s");
	return this.valueOf() / Duration.factors[period] === new Duration(value).valueOf()  / Duration.factors[period];
}
Duration.prototype.neq = function(value,period) {
	if(value instanceof Duration && this.length !== value.length) {
		return true;
	}
	period || (period = "s");
	return this.valueOf() / Duration.factors[period] !== new Duration(value).valueOf()  / Duration.factors[period];
}
Duration.prototype.gte = function(value,period) {
	if(value===this || (value instanceof Duration && this.length >= value.length)) {
		return true;
	}
	period || (period = "s");
	return this.valueOf() / Duration.factors[period] >= new Duration(value).valueOf()  / Duration.factors[period];
}
Duration.prototype.gt = function(value,period) {
	if(value instanceof Duration && this.length > value.length) {
		return true;
	}
	period || (period = "s");
	return this.valueOf() / Duration.factors[period] > new Duration(value).valueOf()  / Duration.factors[period];
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
	if((starts && starts.constructor===TimeSpan) || starts instanceof TimeSpan) {
		return new TimeSpan(starts.starts,starts.ends);
	}
	this.starts = (starts!=null ? new Time(starts).valueOf() : new Time(-Infinity).valueOf());
	this.ends = (ends!=null ? new Time(ends).valueOf() : new Time(Infinity).valueOf());
	Object.defineProperty(this,"duration",{enumerable:false,configurable:false,get:function() { return this.ends - this.starts}, set: function() {}});
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
	if(this.ends<=value.ends && this.ends>=starts) {
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
		starts = ends = new Time(value.valueOf(),precision);
	}
	return this.starts==starts && this.ends==ends;
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
TimeSpan.prototype.adjacentOrBefore = function(value,precision) {
	return new Time(this.ends+new Duration(1,precision),precision).valueOf() <= new Time(value,precision).valueOf();
}
TimeSpan.prototype.before = function(value,precision) {
	return new Time(this.ends+new Duration(1,precision),precision).valueOf() < new Time(value,precision).valueOf();
}
TimeSpan.prototype.adjacentBefore = function(value,precision) {
	return new Time(this.ends+new Duration(1,precision),precision).valueOf() === new Time(value,precision).valueOf();
}
TimeSpan.prototype.adjacentOrAfter = function(value,precision) {
	var ends;
	if(value.constructor===TimeSpan || value instanceof TimeSpan) {
		ends = new Time(value.ends,precision);
	} else {
		ends = new Time(value,precision);
	}
	return new Time(this.starts-new Duration(1,precision),precision).valueOf() >= ends.valueOf();
}
TimeSpan.prototype.after = function(value,precision) {
	var ends;
	if(value.constructor===TimeSpan || value instanceof TimeSpan) {
		ends = new Time(value.ends,precision);
	} else {
		ends = new Time(value,precision);
	}
	return new Time(this.starts-new Duration(1,precision),precision).valueOf() > ends.valueOf();
}
TimeSpan.prototype.adjacentAfter = function(value,precision) {
	var ends;
	if(value.constructor===TimeSpan || value instanceof TimeSpan) {
		ends = new Time(value.ends,precision);
	} else {
		ends = new Time(value,precision);
	}
	return new Time(this.starts-new Duration(1,precision),precision).valueOf() == ends.valueOf();
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