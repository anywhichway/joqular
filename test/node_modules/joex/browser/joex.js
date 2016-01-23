(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//     joex
//
//     Copyright (c) 2015, 2016 Simon Y. Blackwell, AnyWhichWay
//     MIT License - http://opensource.org/licenses/mit-license.php
(function() {
	"use strict";

	function eq(a,b) {
		return a==b;
	}
	/*
	 * https://github.com/Benvie
	 * improvements 2015 by AnyWhichWay
	 */
	function intersection(array) {
			var arrays = arguments.length;
			// fast path when we have nothing to intersect
			if (arrays === 0) {
				return [];
			}
			if (arrays === 1) {
				return array.slice();
			}
			 
			var arg   = 0, // current arg index
					bits  = 0, // bits to compare at the end
					count = 0, // unique item count
					items = [], // unique items
					match = [], // item bits
					seen  = new Map(); // item -> index map
			 
			do {
				var arr = arguments[arg],
						len = arr.length,
						bit = 1 << arg, // each array is assigned a bit
						i   = 0;
			 
				if (!len) {
					return []; // bail out if empty array
				}
			 
				bits |= bit; // add the bit to the collected bits
				do {
					var value = arr[i],
							index = seen.get(value); // find existing item index
			 
					if (index === undefined) { // new item
						count++;
						index = match.length;
						seen.set(value, index);
						items[index] = value;
						match[index] = bit;
					} else { // update existing item
						match[index] |= bit;
					}
				} while (++i < len);
			} while (++arg < arrays);
			 
				var result = [],
				i = 0;
			 
			do { // filter out items that don't have the full bitfield
				if (match[i] === bits) {
					result[result.length] = items[i];
				}
			} while (++i < count);
			 
				return result;
	}
	
	function crossproduct(array,test) {
	  var end  = array.length - 1;
	  var result = []
	  function addTo(curr, start) {
	    var first = array[start], last  = (start === end)
	    for (var i = 0; i < first.length; ++i) {
	      var copy = curr.slice();
	      copy.push(first[i])
	      if (last) {
	    	  if(!test || test(copy,result.length)) {
	        	result.push(copy);
	    	  }
	      } else {
	        addTo(copy, start + 1)
	      }
	    }
	  }
	  if (array.length) {
	    addTo([], 0)
	  } else {
	    result.push([])
	  }
	  return result
	}
	Array.extend = function() {
		var ExtendedArray = Array;
		ExtendedArray.prototype.intersection = function() {
			if(arguments.length>0) {
				var args = [].concat([this].concat(Array.prototype.slice.call(arguments)));
				return intersection.apply(null,args);
			}
			return intersection(this);
		}
		ExtendedArray.prototype.intersects = function() {
			if(arguments.length>0) {
				var args = [].concat([this].concat(Array.prototype.slice.call(arguments)));
				return intersection.apply(null,args).length>0;
			}
			return intersection(this).length>0;
		}
		ExtendedArray.prototype.disjoint = function() {
			if(arguments.length>0) {
				var args = [].concat([this].concat(Array.prototype.slice.call(arguments)));
				return intersection.apply(null,args).length===0;
			}
			return intersection(this).length===0;
		}
		ExtendedArray.prototype.coincident = function() {
			if(arguments.length>0) {
				var args = [].concat([this].concat(Array.prototype.slice.call(arguments)));
				return intersection.apply(null,args).length===this.length;
			}
			return intersection(this).length===this.length;
		}
		ExtendedArray.prototype.crossproduct = function(test) {
			return crossproduct(this,test);
		}
		if(!ExtendedArray.prototype.includes) {
			ExtendedArray.prototype.includes = function(item) { return this.indexOf(item)>=0; }
		}
		ExtendedArray.prototype.excludes = function(item) {
			return !this.includes(item);
		}
		ExtendedArray.prototype.eq = function(array) {
			return array instanceof Array && this.length===array.length && this.every(function(item,i) { return eq(item,array[i]);});
		}
		ExtendedArray.prototype.neq = function(array) {
			return !(array instanceof Array) || this.length!==array.length && this.some(function(item,i) { return !eq(item,array[i]);});
		}
		ExtendedArray.prototype.min = function() {
			var min;
			this.forEach(function(item) {
				if(min===undefined) {
					min = item;
				} else if(item < min) {
					min = item;
				}
			});
			return min;
		}
		ExtendedArray.prototype.max = function() {
			var max;
			this.forEach(function(item) {
				if(max===undefined) {
					max = item;
				} else if(item > max) {
					max = item;
				}
			});
			return max;
		}
		ExtendedArray.prototype.sum = function(filter) {
			var sum;
			filter = (filter ? filter : function(item) { return (item!=null ? item.valueOf() : undefined); });
			this.forEach(function(item) {
				var value = filter(item)
				if(typeof(value)==="number") {
					if(sum===undefined) {
						sum = value;
					} else {
						sum += value;
					}
				}
			});
			return (sum===undefined ? NaN : sum);
		}
		ExtendedArray.prototype.avg = function(all) {
			var sum, count = 0, f = (all ? (typeof(all)==="function" ? all : all) : function(item) { return (item!=null ? item.valueOf() : undefined); } )
			this.forEach(function(item) {
				var value = (typeof(f)==="function" ? f(item) : (item!=null ? item.valueOf() : undefined));
				if(typeof(value)==="number") {
					count ++;
					if(sum===undefined) {
						sum = value;
					} else {
						sum += value;
					}
				} else if(all===true) {
					count++;
				}
			});
			return (sum===undefined ? NaN : sum / count);
		}
		Object.defineProperty(ExtendedArray.prototype,"count",{enumerable:true,configurable:true,get:function() { return this.length; },set:function() {}});
		return ExtendedArray;
	}
	function toArray(object) {
		var array = [], values = object.values(), data = values.next();
		while (!data.done) {
			array.push(data.value);
			data = values.next();
		} 
		return array;
	}

	Set.extend = function() {
		var ExtendedSet = Set;
		ExtendedSet.prototype.every = function(f,thisarg) {
			var me = (thisarg ? thisarg : this), i = 0, items = me.values(), item;
			while((item=items.next()) && item && !item.done) {
				if(!f(item.value,i)) {
					return false;
				}
				i++;
			}
			return true;
		}
		ExtendedSet.prototype.some = function(f,thisarg) {
			var me = (thisarg ? thisarg : this), i = 0, items = me.values(), item;
			while((item=items.next()) && item && !item.done) {
				if(f(item.value,i)) {
					return true;
				}
				i++;
			}
			return false;
		}
		ExtendedSet.prototype.intersection = function(iterable) {
			var array = (iterable instanceof Array ? iterable : toArray(iterable));
			return intersection(toArray(this),array);
		}
		ExtendedSet.prototype.intersects = function(iterable) {
			var array = (iterable instanceof Array ? iterable : toArray(iterable));
			return intersection(toArray(this),array).length>0;
		}
		ExtendedSet.prototype.disjoint = function(iterable) {
			var array = (iterable instanceof Array ? iterable : toArray(iterable));
			return intersection(toArray(this),array).length===0;
		}
		ExtendedSet.prototype.coincident = function(iterable) {
			var array = (iterable instanceof Array ? iterable : toArray(iterable));
			return array.length===this.size && intersection(toArray(this),array).length===this.size;
		}
		ExtendedSet.prototype.crossproduct = function(iterable,test) {
			return crossproduct(toArray(this),test);
		}
		ExtendedSet.prototype.eq = function(set) {
			return set instanceof Set && this.size===set.size && this.coincident(set);
		}
		ExtendedSet.prototype.neq = function(set) {
			return !(set instanceof Set) || this.size!==set.size || !this.coincident(set);
		}
		ExtendedSet.prototype.min = function() {
			return toArray(this).min();
		}
		ExtendedSet.prototype.max = function() {
			return toArray(this).max();
		}
		ExtendedSet.prototype.sum = function() {
			return toArray(this).sum();
		}
		ExtendedSet.prototype.avg= function() {
			return toArray(this).avg();
		}
		ExtendedSet.prototype.toJSON = function() {
			return toArray(this);
		}
		Object.defineProperty(ExtendedSet.prototype,"count",{configurable:true,enumerable:true,get:function() { return this.size; },set:function() { }});
		return ExtendedSet;
	}
	
	Boolean.extend = function() {
		var ExtendedBoolean = Boolean;
		ExtendedBoolean.prototype.lt = function(value) {
			return this.valueOf() < value;
		};
		ExtendedBoolean.prototype.lte = function(value) {
			return this.valueOf() <= value;
		};
		ExtendedBoolean.prototype.eq = function(value) {
			return eq(this.valueOf(),value);
		};
		ExtendedBoolean.prototype.eeq = function(value) {
			return this === value;
		};
		ExtendedBoolean.prototype.neq = function(value) {
			return !eq(this.valueOf(),value);
		};
		ExtendedBoolean.prototype.neeq = function(value) {
			return this !== value;
		};
		ExtendedBoolean.prototype.gte = function(value) {
			return this.valueOf() >= value;
		};
		ExtendedBoolean.prototype.gt = function(value) {
			return this.valueOf() > value;
		};
		return ExtendedBoolean;
	}
	
	
	// soundex from https://gist.github.com/shawndumas/1262659
	function soundex(s) {
	    var a = s.toLowerCase().split(''),
	    f = a.shift(),
	    r = '',
	    codes = {
	        a: '', e: '', i: '', o: '', u: '',
	        b: 1, f: 1, p: 1, v: 1,
	        c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2,
	        d: 3, t: 3,
	        l: 4,
	        m: 5, n: 5,
	        r: 6
	    };
	
		r = f +
		    a
		    .map(function (v) { return codes[v] })
		    .filter(function (v, i, a) {
		        return ((i === 0) ? v !== codes[f] : v !== a[i - 1]);
		    })
		    .join('');
		
		return (r + '000').slice(0, 4).toUpperCase();
	}
	
	String.extend = function() {
		var ExtendedString = String;
		ExtendedString.prototype.soundex = function() {
			return soundex(this.valueOf());
		};
		ExtendedString.prototype.echoes = function(string) {
			return soundex(this.valueOf())===soundex(string);
		};
		ExtendedString.prototype.lt = function(value) {
			return this.valueOf() < value;
		};
		ExtendedString.prototype.lte = function(value) {
			return this.valueOf() <= value;
		};
		ExtendedString.prototype.eq = function(value) {
			return eq(this.valueOf(),value);
		};
		ExtendedString.prototype.eeq = function(value) {
			return this === value;
		};
		ExtendedString.prototype.neq = function(value) {
			return !eq(this.valueOf(),value);
		};
		ExtendedString.prototype.neeq = function(value) {
			return this.valueOf() !== value;
		};
		ExtendedString.prototype.gte = function(value) {
			return this.valueOf() >= value;
		};
		ExtendedString.prototype.gt = function(value) {
			return this.valueOf() > value;
		};
		ExtendedString.prototype.between = function(a,b) {
			var value = this.valueOf();
			return (value >= a && value <= b) || (value >= b && value <= a);
		};
		ExtendedString.prototype.outside = function(a,b) {
			return !this.between(a,b);
		};
		return ExtendedString;
	}
	
	Number.extend = function() {
		var ExtendedNumber = Number;
		ExtendedNumber.prototype.lt = function(value) {
			return this.valueOf() < value;
		};
		ExtendedNumber.prototype.lte = function(value) {
			return this.valueOf() <= value;
		};
		ExtendedNumber.prototype.eq = function(value) {
			return eq(this.valueOf(),value);
		};
		ExtendedNumber.prototype.eeq = function(value) {
			return this === value;
		};
		ExtendedNumber.prototype.neq = function(value) {
			return !eq(this.valueOf(),value);
		};
		ExtendedNumber.prototype.neeq = function(value) {
			return this !== value;
		};
		ExtendedNumber.prototype.gte = function(value) {
			return this.valueOf() >= value;
		};
		ExtendedNumber.prototype.gt = function(value) {
			return this.valueOf() > value;
		};
		ExtendedNumber.prototype.between = function(a,b) {
			var value = this.valueOf();
			return (value >= a && value <= b) || (value >= b && value <= a);
		};
		ExtendedNumber.prototype.outside = function(a,b) {
			return !this.between(a,b);
		};
		return ExtendedNumber;
	}
	
	function toPrecision(milliseconds,precision) {
		var dt = new Date(milliseconds), yr = dt.getFullYear();
		var M1, D1, h1, m1, s1, ms1;
		M1 = (["M","D","h","m","s","ms"].indexOf(precision)>=0 ? dt.getMonth() : 0);
		D1 = (["D","h","m","s","ms"].indexOf(precision)>=0 ? dt.getDate() : 1);
		h1 = (["h","m","s","ms"].indexOf(precision)>=0 ? dt.getHours() : 0);
		m1 = (["m","s","ms"].indexOf(precision)>=0 ? dt.getMinutes() : 0);
		s1 = (["s","ms"].indexOf(precision)>=0 ? dt.getSeconds() : 0);
		ms1 = (["ms"].indexOf(precision)>=0 ? dt.getMilliseconds() : 0);
		dt = new Date(yr,0);
		dt.setMonth(M1);
		dt.setDate(D1);
		dt.setHours(h1);
		dt.setMinutes(m1);
		dt.setSeconds(s1);
		dt.setMilliseconds(ms1);
		return dt.getTime();
	}
	Date.extend = function() {
		var ExtendedDate = Date;
		Object.defineProperty(ExtendedDate.prototype,"time",{enumerable:true,configurable:true,set:function(value) {  this.setTime(value);},get:function() { return this.getTime(); }});
		Object.defineProperty(ExtendedDate.prototype,"year",{enumerable:true,configurable:true,set:function(value) {  return this.setFullYear(value);},get:function() { return this.getFullYear(); }});
		Object.defineProperty(ExtendedDate.prototype,"fullYear",{enumerable:true,configurable:true,set:function(value) {  return this.setFullYear(value);},get:function() { return this.getFullYear(); }});
		Object.defineProperty(ExtendedDate.prototype,"month",{enumerable:true,configurable:true,set:function(value) {  this.setMonth(value);},get:function() { return this.getMonth(); }});
		Object.defineProperty(ExtendedDate.prototype,"dayOfMonth",{enumerable:true,configurable:true,set:function(value) {  this.setDate(value);},get:function() { return this.getDate(); }});
		Object.defineProperty(ExtendedDate.prototype,"hours",{enumerable:true,configurable:true,set:function(value) {  this.setHours(value);},get:function() { return this.getHours(); }});
		Object.defineProperty(ExtendedDate.prototype,"minutes",{enumerable:true,configurable:true,set:function(value) {  this.setMinutes(value);},get:function() { return this.getMinutes(); }});
		Object.defineProperty(ExtendedDate.prototype,"seconds",{enumerable:true,configurable:true,set:function(value) {  this.setSeconds(value);},get:function() { return this.getSeconds(); }});
		Object.defineProperty(ExtendedDate.prototype,"milliseconds",{enumerable:true,configurable:true,set:function(value) {  this.setMilliseconds(value);},get:function() { return this.getMilliseconds(); }});
		ExtendedDate.prototype.lt = function(value,precision) {
			return toPrecision(this.getTime(),precision) < toPrecision(value,precision);
		};
		ExtendedDate.prototype.lte = function(value,precision) {
			return toPrecision(this.getTime(),precision) <= toPrecision(value,precision);
		};
		ExtendedDate.prototype.eq = function(value,precision) {
			return toPrecision(this.getTime(),precision) === toPrecision(value,precision);
		};
		ExtendedDate.prototype.eeq = function(value) {
			return this===value;
		};
		ExtendedDate.prototype.neq = function(value,precision) {
			return toPrecision(this.getTime(),precision) !== toPrecision(value,precision);
		};
		ExtendedDate.prototype.neeq = function(value) {
			return this!==value;
		};
		ExtendedDate.prototype.gte = function(value,precision) {
			return toPrecision(this.getTime(),precision) >= toPrecision(value,precision);
		};
		ExtendedDate.prototype.gt = function(value,precision) {
			return toPrecision(this.getTime(),precision) > toPrecision(value,precision);
		};
		// http://www.pilcrow.nl/2012/09/javascript-date-isleapyear-and-getlastdayofmonth
		//ExtendedDate functions. (Caveat: months start at 0!)
		ExtendedDate.isLeapYear = function (iYear)
		{
			return new ExtendedDate(iYear, 1, 29).getDate() === 29;
		};
		ExtendedDate.prototype.isLeapYear = function ()
		{
			return ExtendedDate.isLeapYear(this.getFullYear());
		};
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
		};
		return ExtendedDate;
	}
	
}).call((typeof(window)!=='undefined' ? window : (typeof(module)!=='undefined' ? module : null)));
},{}]},{},[1]);
