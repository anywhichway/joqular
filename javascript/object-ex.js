(function(exports) {
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
	Array.prototype.intersects = function(array) {
		return intersection(this,array).length>0;
	}
	Array.prototype.disjoint = function(array) {
		return intersection(this,array).length===0;
	}
	Array.prototype.coincident = function(array) {
		return intersection(this,array).length===this.length;
	}
	Array.prototype.crossproduct = function(test) {
		return crossproduct(this,test);
	}
	if(!Array.prototype.includes) {
		Array.prototype.includes = function(item) { return this.indexOf(item)>=0; }
	}
	Array.prototype.excludes = function(item) {
		return !this.includes(item);
	}
	Array.prototype.eq = function(array) {
		return array instanceof Array && this.length===array.length && this.every(function(item,i) { return item==array[i];});
	}
	Array.prototype.neq = function(array) {
		return !(array instanceof Array) || this.length!==array.length && this.some(function(item,i) { return item!=array[i];});
	}
	Array.prototype.min = function() {
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
	Array.prototype.max = function() {
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
	Array.prototype.sum = function() {
		var sum;
		this.forEach(function(item) {
			if(typeof(item)==="number") {
				if(sum===undefined) {
					sum = item;
				} else {
					sum += item;
				}
			}
		});
		return (sum===undefined ? NaN : sum);
	}
	Array.prototype.avg = function() {
		var sum, count = 0;
		this.forEach(function(item) {
			if(typeof(item)==="number") {
				count ++;
				if(sum===undefined) {
					sum = item;
				} else {
					sum += item;
				}
			}
		});
		return (sum===undefined ? NaN : sum / count);
	}
	Object.defineProperty(Array.prototype,"count",{enumerable:true,get:function() { return this.length; },set:function() {}});
	
	function toArray(object) {
		var array = [], values = object.values(), data = values.next();
		while (!data.done) {
			array.push(data.value);
			data = values.next();
		} 
		return array;
	}
	Set.prototype.every = function(f,thisarg) {
		var me = (thisarg ? thisarg : this), i = 0;
		for(var item of me) {
			if(!f(item,i)) {
				return false;
			}
			i++;
		}
		return true;
	}
	Set.prototype.some = function(f,thisarg) {
		var me = (thisarg ? thisarg : this), i = 0;
		for(var item of me) {
			if(f(item,i)) {
				return true;
			}
			i++;
		}
		return false;
	}
	Set.prototype.intersects = function(iterable) {
		var array = (iterable instanceof Array ? iterable : toArray(iterable));
		return intersection(toArray(this),array).length>0;
	}
	Set.prototype.disjoint = function(iterable) {
		var array = (iterable instanceof Array ? iterable : toArray(iterable));
		return intersection(toArray(this),array).length===0;
	}
	Set.prototype.coincident = function(iterable) {
		var array = (iterable instanceof Array ? iterable : toArray(iterable));
		return array.length===this.size && intersection(toArray(this),array).length===this.size;
	}
	Set.prototype.crossproduct = function(iterable,test) {
		var array = (iterable instanceof Array ? iterable : toArray(iterable));
		return crossproduct(toArray(this),test);
	}
	Set.prototype.eq = function(set) {
		return set instanceof Set && this.size===set.size && this.coincident(set);
	}
	Set.prototype.neq = function(set) {
		return !(set instanceof Set) || this.size!==set.size || !this.coincident(set);
	}
	Set.prototype.min = function() {
		return toArray(this).min();
	}
	Set.prototype.max = function() {
		return toArray(this).max();
	}
	Set.prototype.sum = function() {
		return toArray(this).sum();
	}
	Set.prototype.avg= function() {
		return toArray(this).avg();
	}
	Set.prototype.toJSON = function() {
		return toArray(this);
	}
	Object.defineProperty(Set.prototype,"count",{enumerable:true,get:function() { return this.size; },set:function() { }});
	
	Boolean.prototype.lt = function(value) {
		return this.valueOf() < value;
	}
	Boolean.prototype.lte = function(value) {
		return this.valueOf() <= value;
	}
	Boolean.prototype.eq = function(value) {
		return this.valueOf() == value;
	}
	Boolean.prototype.eeq = function(value) {
		return this.valueOf() == value;
	}
	Boolean.prototype.neq = function(value) {
		return this.valueOf() != value;
	}
	Boolean.prototype.neeq = function(value) {
		return this.valueOf() !== value;
	}
	Boolean.prototype.gte = function(value) {
		return this.valueOf() >= value;
	}
	Boolean.prototype.gt = function(value) {
		return this.valueOf() > value;
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
		    .map(function (v, i, a) { return codes[v] })
		    .filter(function (v, i, a) {
		        return ((i === 0) ? v !== codes[f] : v !== a[i - 1]);
		    })
		    .join('');
		
		return (r + '000').slice(0, 4).toUpperCase();
	}
	String.prototype.soundex = function() {
		return soundex(this.valueOf());
	}
	String.prototype.echoes = function(string) {
		return soundex(this.valueOf())===soundex(string);
	}
	String.prototype.lt = function(value) {
		return this.valueOf() < value;
	}
	String.prototype.lte = function(value) {
		return this.valueOf() <= value;
	}
	String.prototype.eq = function(value) {
		return this.valueOf() == value;
	}
	String.prototype.eeq = function(value) {
		return this.valueOf() === value;
	}
	String.prototype.neq = function(value) {
		return this.valueOf() != value;
	}
	String.prototype.neeq = function(value) {
		return this.valueOf() !== value;
	}
	String.prototype.gte = function(value) {
		return this.valueOf() >= value;
	}
	String.prototype.gt = function(value) {
		return this.valueOf() > value;
	}
	String.prototype.between = function(a,b) {
		var value = this.valueOf();
		return (value >= a && value <= b) || (value >= b && value <= a);
	}
	String.prototype.outside = function(a,b) {
		return !this.between(a,b);
	}
	
	Number.prototype.lt = function(value) {
		return this.valueOf() < value;
	}
	Number.prototype.lte = function(value) {
		return this.valueOf() <= value;
	}
	Number.prototype.eq = function(value) {
		return this.valueOf() == value;
	}
	Number.prototype.eeq = function(value) {
		return this.valueOf() === value;
	}
	Number.prototype.neq = function(value) {
		return this.valueOf() != value;
	}
	Number.prototype.neeq = function(value) {
		return this.valueOf() !== value;
	}
	Number.prototype.gte = function(value) {
		return this.valueOf() >= value;
	}
	Number.prototype.gt = function(value) {
		return this.valueOf() > value;
	}
	Number.prototype.between = function(a,b) {
		var value = this.valueOf();
		return (value >= a && value <= b) || (value >= b && value <= a);
	}
	Number.prototype.outside = function(a,b) {
		return !this.between(a,b);
	}
	
	
	Object.defineProperty(Date.prototype,"time",{enumerable:true,configurable:false,set:function(time) { this.setTime(time); },get:function() { return this.getTime(); }});
	Object.defineProperty(Date.prototype,"year",{enumerable:true,configurable:false,set:function() { return;},get:function() { return this.getFullYear(); }});
	Object.defineProperty(Date.prototype,"month",{enumerable:true,configurable:false,set:function() { return;},get:function() { return this.getMonth()+1; }});
	Object.defineProperty(Date.prototype,"dayOfMonth",{enumerable:true,configurable:false,set:function() { return;},get:function() { return this.getDate(); }});
	Object.defineProperty(Date.prototype,"hours",{enumerable:true,configurable:false,set:function() { return;},get:function() { return this.getHours(); }});
	Object.defineProperty(Date.prototype,"minutes",{enumerable:true,configurable:false,set:function() { return;},get:function() { return this.getMinutes(); }});
	Object.defineProperty(Date.prototype,"seconds",{enumerable:true,configurable:false,set:function() { return;},get:function() { return this.getSeconds(); }});
	Object.defineProperty(Date.prototype,"milliseconds",{enumerable:true,configurable:false,set:function() { return;},get:function() { return this.getMilliseconds(); }});
	Object.defineProperty(Date.prototype,"dayOfWeek",{enumerable:true,configurable:false,set:function() { return;},get:function() { return this.getDay()+1; }});
	
	Date.prototype.lt = function(value,precision) {
		if(value instanceof TimeSpan) {
			return value.after(this,precision);
		}
		return new Time(this,precision) < new Time(value,precision);
	}
	Date.prototype.lte = function(value,precision) {
		if(value instanceof TimeSpan) {
			return value.adjacentOrAfter(this,precision);
		}
		return new Time(this,precision) <= new Time(value,precision);
	}
	Date.prototype.eq = function(value,precision) {
		if(value===this) {
			return true;
		}
		if(value instanceof Date && this.time===value.time) {
			return true;
		}
		if(value instanceof TimeSpan) {
			return value.coincident(this,precision);
		}
		return new Time(this,precision).valueOf() == new Time(value,precision).valueOf();
	}
	Date.prototype.neq = function(value,precision) {
		return new Time(this,precision).valueOf() !== new Time(value,precision).valueOf();
	}
	Date.prototype.gte = function(value,precision) {
		if(value instanceof TimeSpan) {
			return value.adjacentOrBefore(this,precision);
		}
		return new Time(this,precision).valueOf() >= new Time(value,precision).valueOf();
	}
	Date.prototype.gt = function(value,precision) {
		if(value instanceof TimeSpan) {
			return value.adjacentOrBefore(this,precision);
		}
		return new Time(this,precision).valueOf() >= new Time(value,precision).valueOf();
	}
	Date.prototype.before = Date.prototype.lt;
	Date.prototype.adjacentOrBefore = Date.prototype.lte;
	Date.prototype.after = Date.prototype.gt;
	Date.prototype.adjacentOrAfter = Date.prototype.gte;
	Date.prototype.coincident = function(value,precision) {
		if(value instanceof TimeSpan) {
			var d = new TimeSpan(this,this);
			return d.coincident(value,precision);
		}
		return this.eq(value,precision);
	}
	Date.prototype.disjoint = function(value,precision) {
		if(value instanceof TimeSpan) {
			var d = new TimeSpan(this,this);
			return d.disjoint(value,precision);
		}
		return this.neq(value,precision);
	}
	Date.prototype.intersects = function(value,precision) {
		if(value instanceof TimeSpan) {
			var d = new TimeSpan(this,this);
			return d.intersects(value,precision);
		}
		return this.eq(value,precision);
	}
})("undefined"!=typeof exports&&"undefined"!=typeof global?global:window);