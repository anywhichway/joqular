/*
 * GNU GENERAL PUBLIC LICENSE
 * Version 3, 29 June 2007
 * Copyright 2015 (and left) AnyWhichWay, LLC and Simon Y. Blackwell
 * 
 * The software is provided as is without any guarantee of quality or applicability for any specific use.
 * 
 * Attribution for the work of others is in the source code, although none came with a license stipulation.
 */
(function(exports) {
	"use strict";
	
var JOQULAR = {};

// test object to see if it supports and interface
// items can be an array of strings or Objects
// if string, then object must have a method by the same name
// if Object, then object must have all the methods of Object
function supports(object,items) {
	if(object==null) {
		return false;
	}
	items = (items instanceof Array ? items : [items]);
	return items.every(function(item) {
		if(item instanceof Object) {
			var keys = Object.keys(item);
			return keys.every(function(key) {
				if(typeof(item[key])!=="function") {
					return true;
				}
				return typeof(object[key])==="function";
			});
		}
		if(typeof(object[item])==="function") {
			return true;
		}
	});
}

function equal(value) {
	if(value==this || (supports(this,"valueOf") && this.valueOf()==value)) {
		return true;
	}
	if(this instanceof Object && value instanceof Object) {
		if(this._id === value._id) {
			return true;
		}
		var me = this;
		var objectkeys = Object.keys(me);
		var testkeys = Object.keys(value).filter(function(item) { return objectkeys.indexOf(item)===-1; });
		return objectkeys.every(function(key) {	return key==="_id" || objectkeys[key]===testkeys[key] || (objectkeys[key] instanceof Object && equal.call(objectkeys[key],testkeys[key])); }) &&
			testkeys.every(function(key) {	return key==="_id" || objectkeys[key]===testkeys[key] || (objectkeys[key] instanceof Object && equal.call(objectkeys[key],testkeys[key])); }) 
	}
	return false;
}

function getKind(value) {
	if(value.__kind__) return value.__kind__;
	if(value.constructor && value.constructor.name && value.constructor.name.length>0) return value.constructor.name;
	if(value instanceof Array) return "Array";
	if(value instanceof Date) return "Date";
	if(value instanceof Set) return "Set";
	if(value instanceof Map) return "Map";
	if(value instanceof Function) return "Function";
	if(value instanceof Object) return "Object";
	return "undefined";
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
function crossproduct(args,test) {
  var end  = args.length - 1, abort;
  var result = []
  function addTo(curr, start) {
    var first = args[start]
      , last  = (start === end)
    for (var i = 0; i < first.length; ++i) {
      var copy = curr.slice();
      copy.push(first[i])
      if (last) {
    	  if(!test || (abort = test(copy,result.length))) {
        	result.push(copy);
    	  }
      } else if(!test || (abort = test(copy,result.length))) {
    	  addTo(copy, start + 1)
      }
	  if(abort==null) {
		  return;
	  }
    }
  }
  if (args.length) {
    addTo([], 0)
  } else {
    result.push([])
  }
  return result
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
//Shanti R Rao and Potluri M Rao, "Sample Size Calculator", 
//Raosoft Inc., 2009, http://www.raosoft.com/samplesize.html
//probCriticalNormal function is adapted from an algorithm published
//in Numerical Recipes in Fortran.
function probCriticalNormal(P)
{
//      input p is confidence level convert it to
//      cumulative probability before computing critical

	var   Y, Pr,	Real1, Real2, HOLD;
	var  I;
	var PN = [0,    // ARRAY[1..5] OF REAL
			-0.322232431088  ,
			 -1.0             ,
			 -0.342242088547  ,
			 -0.0204231210245 ,
			 -0.453642210148E-4 ];

	var QN = [0,   //  ARRAY[1..5] OF REAL
			0.0993484626060 ,
			 0.588581570495  ,
			 0.531103462366  ,
			 0.103537752850  ,
			 0.38560700634E-2 ];

	 Pr = 0.5 - P/2; // one side significance


  if ( Pr <=1.0E-8) HOLD = 6;
	else {
			if (Pr == 0.5) HOLD = 0;
			else{
					Y = Math.sqrt ( Math.log( 1.0 / (Pr * Pr) ) );
					Real1 = PN[5];  Real2 = QN[5];

					for ( I=4; I >= 1; I--)
					{
					  Real1 = Real1 * Y + PN[I];
					  Real2 = Real2 * Y + QN[I];
					}

					HOLD = Y + Real1/Real2;
			} // end of else pr = 0.5
		} // end of else Pr <= 1.0E-8

  return HOLD;
}  // end of CriticalNormal
function sampleSize(confidence, margin, population)
{
	var response = 50, pcn = probCriticalNormal(confidence / 100.0),
     d1 = pcn * pcn * response * (100.0 - response),
     d2 = (population - 1.0) * (margin * margin) + d1;
    if (d2 > 0.0)
     return Math.ceil(population * d1 / d2);
    return 0.0;
}
function Sorter() {
    this.sorts = [];
}
Sorter.prototype.by = function(path,direction) {
	this.sorts.push({path:path.split("."),direction:direction});
}
Sorter.prototype.sort = function(rows) {
	var me = this;
	rows.sort(function(rowa,rowb) {
		var result;
		me.sorts.some(function(spec) {
			var alias = spec.path[0];
			var valuea = rowa[alias];
			var valueb = rowb[alias];
			for(var i = 1;i < spec.path.length; i++) {
				valuea = (valuea ? valuea[spec.path[i]] : valuea);
				valueb = (valueb ? valueb[spec.path[i]] : valueb);
			}
			if(valuea===valueb) return result = 0;
			if(spec.direction==="asc") {
				if(valuea < valueb) return result = -1;
				return result = 1;
			}
			if(valuea < valueb) return result = 1;
			return result = -1;
		});
		return result;
	});
}
function Null(){
	
}
Null.prototype.valueOf = function() {
	return null;
}
Null.prototype.eq = function(value) {
	return null==value;
}
Null.prototype.eeq = function(value) {
	return null===value;
}
Null.prototype.neq = function(value) {
	return null!=value;
}
Null.prototype.neeq = function(value) {
	return null!==value;
}
var NULL = new Null();

function toObject(value) {
	var types = {string:String,number:Number,boolean:Boolean};
	if(value===null) {
		return NULL;
	}
	if(types[typeof(value)]) {
		return new types[typeof(value)](value);
	}
	return value;
}
function isPrimitive(value) {
	return value!=null && (!(value instanceof Object) || value instanceof Number || value instanceof String || value instanceof Boolean);
}
function isPrivate(key) {
	return key.indexOf("__")===0 && key.lastIndexOf("__")===key.length-2;
}
function isUUID(value) {
	var parts = value.split("-");
	return typeof(value)==="string" && value.length===36 && parts.length===5 && parts[0].length===8 && parts[1].length===4 && parts[2].length===4 && parts[3].length===4 && parts[4].length===12;
}
function isDataType(type) {
	return type==="string" || type==="number" || type==="boolean" || type==="undefined" || (exports[type] && exports[type].prototype); 
}
function loadFromIndex(objects,keymap,results) {
	Object.keys(objects).forEach(function(uuid) { // populate the objects with data from the index
		Object.keys(keymap).forEach(function(key) { 
			if(key!=="_id" && !isUUID(uuid)) {
				Object.keys(keymap[key]).forEach(function(value) {
					Object.keys(keymap[key][value]).forEach(function(type) {
							if(isDataType(type) && keymap[key][value][type][uuid]) {
								if(objects[uuid] instanceof Array) {
									objects[uuid].push(entity.coerce(value,type));
								} else if(objects[uuid] instanceof Set) {
									objects[uuid].add(entity.coerce(value,type));
								} else {
									objects[uuid][key] = entity.coerce(value,type);
								}
							}
					});
				});
			}
		});
	});
	Object.keys(objects).forEach(function(uuid) { // push objects into objectvalues list
		results.push(objects[uuid]);
	});
}
//move to entity! rename entity JOQULAREntity
//change this file to isomorph
function Query() {
	this.compiled = {entities:{},unjoined:{},joined:{},trees:{}}
}
Query.prototype.compile = function() {
	var me = this;
	Object.keys(me.from).forEach(function(alias) {
		me.compiled.entities[alias] = (me.from[alias] instanceof Function ? me.from[alias] : JOQULAR.constructors[me.from[alias]]);
	});
	if(me.where instanceof Object) {
		Object.keys(me.where).forEach(function(alias) {
			var where = me.where[alias];
			Object.keys(where).forEach(function(property) {
				var value = where[property];
				if(value instanceof Object) {
					var firstkey = Object.keys(value)[0];
					if(me.compiled.entities[firstkey]) {
						if(typeof(me.compiled.entities[firstkey])==="function") {
							if(value[firstkey] instanceof Object) {
								var nextkey = Object.keys(value[firstkey])[0];
								if(me.compiled.entities[nextkey]) {
									me.compiled.joined[alias] = (me.compiled.joined[alias] ? me.compiled.joined[alias] : {});
									me.compiled.joined[alias][property] = value;
									return;
								}
							}
						} else {
							me.compiled.joined[alias] = (me.compiled.joined[alias] ? me.compiled.joined[alias] : {});
							me.compiled.joined[alias][property] = value;
							return;
						}
					}
				}
				me.compiled.unjoined[alias] = (me.compiled.unjoined[alias] ? me.compiled.unjoined[alias] : {});
				me.compiled.unjoined[alias][property] = value;
			});
		});
	}
}
Query.prototype.exec = function(num) {
	var me = this, promises = [], sets = {};
	return new Promise(function(resolve,reject) {
		var aliases = Object.keys(me.compiled.entities);
		aliases.forEach(function(alias) {
			var entity = me.compiled.entities[alias], promise;
			if(me.compiled.unjoined[alias]) {
				promise = entity.find(me.compiled.unjoined[alias]);
				promise.then(function(results) {
					sets[alias] = results;
				});
				promises.push(promise);
			} else {
				promise = entity.find({});
				promise.then(function(results) {
					sets[alias] = results;
				});
				promises.push(promise);
			}
		});
		var data = [];
		Promise.all(promises).then(function() {
			aliases.forEach(function(alias) {
				data.push(sets[alias]);
			});
			var results = crossproduct(data,function(row,count) {
				// make sure each object in the row satisfies join conditions
				var result = true;
				row.every(function(object,i) {
					var alias = aliases[i];
					row[alias] = object;
					if(typeof(me.first)==="number" && count>me.first && me.first>=1 && !(me.last>0) && !me.ordering) { // first is a whole number, not a %, this is just an optimization
						return result = null; // allows crossproduct to abort early
					}
					var entity = me.compiled.entities[alias];
					var pattern = me.compiled.joined[alias];
					if(pattern) {
						pattern = JSON5.parse(JSON5.stringify(pattern)); // copy the pattern containing the join
						Object.keys(pattern).forEach(function(key) { // replace join references with literal values
							var value = pattern[key];
							if(value instanceof Object) {
								var firstkey = Object.keys(value)[0];
								if(me.compiled.entities[firstkey]) {
									// e.g. {name: {$eq: {p1: 'name'}}}
									if(firstkey.indexOf("$")===0) { // firstkey is a predicate
										if(value[firstkey] instanceof Object) { // what about $this?
											var nextkey = Object.keys(value[firstkey])[0];
											if(me.compiled.entities[nextkey]) { // nextkey refers to an entity
												value[firstkey] = row[aliases.indexOf(nextkey)][value[firstkey][nextkey]]; // substitute actual value
											}
										}
									// e.g. {name: {p1: 'name'}}
									} else if(me.compiled.entities[firstkey]) { // firstkey refers to an entity
										pattern[key] = row[aliases.indexOf(firstkey)][value[firstkey]]; // substitute actual value
									}
								}
							}
						});
						return result = entity.match(object,pattern);
					} else {
						return result = true; // no join reference to this object
					}
				});
				return result;
			});
			if(results.length===0) {
				resolve(results);
				return;
			}
			if(me.randomize) {
				results.sort(function(a,b) {
					return getRandomInt(-1,1);
				});
			}
			if(me.sampleSize!=null || (me.confidenceLevel!=null && me.marginOfError!=null)) {
				var size, samples = [];
				if(me.confidenceLevel!=null && me.marginOfError!=null) {
					size = sampleSize(me.confidenceLevel, me.marginOfError, results.length)
				} else if(me.sampleSize>=1) {
					size = me.sampleSize;
				} else {
					size = Math.max(1,Math.round(me.sampleSize * results.length));
				}
				if(size<results.length) {
					while(samples.length < size) {
						var offset = getRandomInt(0,results.length-1);
						samples.push(results[offset]);
						results.splice(offset,1);
					}
					results = samples;
				}
			}
			if(me.ordering) {
				var sorter = new Sorter(), pathkeys = Object.keys(me.ordering);
				pathkeys.forEach(function(pathkey) {
					sorter.by(pathkey,me.ordering[pathkey]);
				});
				sorter.sort(results);
			}
			var paths = Object.keys(me.projection);
			if(paths.length>0) {
				results.forEach(function(row,i) {
					var projection = {};
					paths.forEach(function(path) {
						var column = me.projection[path].as, format =  me.projection[path].format;
						path = path.split(".");
						var alias = path[0];
						if(me.compiled.entities[alias]) {
							var value = row[alias];
							for(var i=1;i<path.length;i++) {
								value = value[path[i]];
								if(value===undefined) return;
							}
							if(typeof(format)==="function") {
								value = format(value);
							}
							projection[column] = value;
							return true;
						}
						return false;
					});
					results[i] = projection;
				});
			}
			// convert from % to whole numbers for first and last
			var first = (typeof(me.first)==="number" ? (me.first < 1 ? me.first * results.length : me.first) : null);
			var last = (typeof(me.last)==="number" ? (me.last < 1 ? me.last * results.length : me.last) : null);
			// eliminate overlap between first and last
			last = (typeof(first)==="number" && typeof(last)==="number" && first+last > results.length ? Math.max(0,last-first) : last)
			// assemble first and last if that is all that are requested
			var fresult = (typeof(first)==="number" && results.length>first ? results.slice(0,first) : (typeof(last)!=="number" ? results : [])); //
			var lresult = (typeof(last)==="number" ? results.slice(-last) : null); 
			results = (lresult ? fresult.concat(lresult) : fresult);
			resolve(results);
		});
	});	
}
function Select(projection) {
	this.query = new Query();
	projection = (projection ? projection : {});
	this.query.projection = projection;
}
Select.prototype.first = function(count) {
	this.query.first = count;
	return this;
}
Select.prototype.last = function(count) {
	this.query.last = count;
	return this;
}
Select.prototype.sample = function(sizeOrConfidenceLevel,marginOfError) {
	this.query.randomize = true;
	if(arguments.length==2) {
		this.query.confidenceLevel = sizeOrConfidenceLevel;
		this.query.marginOfError = marginOfError;
	} else {
		this.query.sampleSize = sizeOrConfidenceLevel;
	}
	return this;
}
Select.prototype.radomize = function() {
	this.query.randomize = true;
	return this;
}
Select.prototype.from = function(collections) {
	return new From(this.query,collections);
}
function From(query,collections) {
	this.query = query;
	this.query.from = collections;
}
From.prototype.orderBy = function(ordering) {
	this.query.ordering = ordering;
	return this;
}
From.prototype.where = function(pattern) {
	return new Where(this.query,pattern);
}
From.prototype.exec = function() {
	this.query.compile();
	return this.query.exec();
}
function Where(query,pattern) {
	this.query = query;
	this.query.where = pattern;
}
Where.prototype.orderBy = function(ordering) {
	this.query.ordering = ordering;
	return this;
}
Where.prototype.exec = function() {
	this.query.compile();
	return this.query.exec();
}
function updateMetadata(object) {
	object.blockReactions(true);
	object._metadata = (object._metadata ? object._metadata : {createdAt: new Date(), createdBy:null, kind:object.__kind__});
	object._metadata.updatedAt = new Date();
	object._metadata.updatedBy = null;
	object.indexObject();
	object.blockReactions(false);
}
function Collection(name,config) {
	var me = this;
	me.entity = JOQULAR.constructors[name];
	me.name = name;
	me.entity.getItem = function(uuid) { 
		return me.storage.getItem(uuid+".json");
	};
	if(config) {
		var keys = Object.keys(config);
		keys.forEach(function(key) {
			me[key] = config[key];
			if(key==="schema") {
				me[key].bind(me.entity,name);
			}
		});
	}
}
Collection.prototype.save = function(validationErrorCallback) {
	var me = this, valid, promises = [], errors = [];
	var index = {instanceMap:{},keyMaps:me.entity.index.keyMaps};
	Object.keys(me.entity.index.instanceMap).forEach(function(uuid) { 
		if(!me.streaming) {
			var object = me.entity.index.instanceMap[uuid];
			if(typeof(object.validate)!=="function" || (valid=object.validate())===true) {
				index.instanceMap[uuid] = false; // just save the uuids on index for instance to save space and time, instances loaded on-demand by queries
				updateMetadata(object);
				promises.push(me.storage.setItem(uuid+".json",JSON.stringify(object)));
			} else {
				errors.push(valid);
			}
		} else {
			index.instanceMap[uuid] = false; // just save the uuids on index for instance to save space and time, instances loaded on-demand by queries
		}
	});
	promises.push(me.storage.setItem(me.name+".json",JSON.stringify(index)));
	return new Promise(function(resolve,reject) {
		Promise.all(promises).then(resolve((errors.length>0 ? errors : null)));
	});
}
Collection.prototype.load = function() {
	var me = this;
	var promise = me.storage.getItem(me.name+".json");
	promise.then(function(data) {
		if(data) {
			data = JSON.parse(data);
			me.entity.index.instanceMap = data.instanceMap;
			me.entity.index.keyMaps = data.keyMaps; // replace by part, not whole object since object is "shared" with prototype, doing whole object will disconnect from prototype
		}
	});
	return promise;
}
Collection.prototype.clear = function() {
	var me = this;
	var promises = [];
	Object.keys(me.entity.index.instanceMap).forEach(function(uuid) {
		promises.push(me.storage.removeItem(uuid+".json"));
	});
	me.entity.index.instanceMap = {};
	me.entity.index.keyMaps = {};
	promises.push(me.save());
	return Promise.all(promises);
}
Collection.prototype.find = function(query,cached,loaded) {
	var me = this;
	return me.entity.find(query);
}
Collection.prototype.flush = function(uuids) {
	var me = this;
	if(!uuids) {
		Object.keys(me.entity.index.instanceMap).forEach(function(uuid) {
			me.entity.index.instanceMap[uuid] = false;
		});
	} else {
		uuids = Array.prototype.slice.call(arguments);
		uuids = (uuids[0] instanceof Array ? uuids[0] : uuids);
		uuids.forEach(function(uuid) {
			me.entity.index.instanceMap[uuid] = false;
		});
	}
}
Collection.prototype.remove = function(uuidsOrPatterns) {
	var me = this, promises = [];
	uuidsOrPatterns = Array.prototype.slice.call(arguments);
	uuidsOrPatterns = (uuidsOrPatterns[0] instanceof Array ? uuidsOrPatterns[0] : uuidsOrPatterns);
	uuidsOrPatterns.forEach(function(uuidOrPattern) {
		if(typeof(uuidOrPattern)==="string") {
			delete me.entity.index.instanceMap[uuidOrPattern];
			promises.push(me.storage.removeItem(uuidOrPattern+".json"));
			// need to remove from instanceMaps!!
		} else if(uuidOrPattern instanceof Object) {
			var results = me.find(uuidOrPattern);
			results.forEach(function(object) {
				delete me.entity.index.instanceMap[object._id];
				promises.push(me.storage.removeItem(object._id+".json"));
				// need to remove from instanceMaps!!
			});
		}
	});
}
Collection.prototype.stream = function(boolean) {
	var me = this;
	if(!me._streamingCallback) { // define streaming callback on first invocation
		me._streamingCallback = function(changeset) {
			var objects = {};
			changeset.forEach(function(change) {
				objects[change.object._id] = change.object;
			});
			Object.keys(objects).forEach(function(uuid) {
				var object = objects[uuid];
				updateMetadata(object);
				me.storage.setItem(uuid+".json",JSON.stringify(object));
			});
			me.save();
		}
	}
	boolean = (boolean===undefined ? true : boolean);
	if(boolean) {
		me.streaming = true;
		me.entity.subscribe(me._streamingCallback);
		me.save();
	} else {
		me.streaming = false;
		me.entity.unsubscribe(me._streamingCallback);
	}
}
Collection.Error = function() {
	this.name = null;
}
Collection.Error.prototype = Object.create(Error.prototype);
Collection.Error.prototype.constructor = Collection.Error;

function Database(name,location) { // directory = localStorage | indexedDB | path
	this.name = name;
	this.location = (location ? location : new JOQULARStorage());
	this.collections = {};
}
Database.prototype.collection = function(name,config) {
	var conf = {storage: this.location};
	if(config) {
		var keys = Object.keys(config);
		keys.forEach(function(key) {
			conf[key] = config[key];
		});
	}
	var collection = (this.collections[name] ? this.collections[name] : new Collection(name,conf));
	collection.load();
	collection.stream();
	return collection;
}
//setItem, getItem, removeItem
function JOQULARStorage(location) {
	this.location = (location ? location : window.localStorage);
}
JOQULARStorage.prototype.setItem = function(key,value) {
	var location = this.location;
	return new Promise(function(resolve,reject) {
		try {
			location.setItem(key,value);
			resolve();
		} catch(e) {
			reject(e);
		}
	});
}
JOQULARStorage.prototype.getItem = function(key) {
	var location = this.location;
	return new Promise(function(resolve,reject) {
		try {
			var data = location.getItem(key);
			if(data) {
				resolve(JSON.parse(data));
			}
			resolve();
		} catch(e) {
			reject(e);
		}
	});
}
JOQULARStorage.prototype.removeItem = function(key) {
	var location = this.location;
	return new Promise(function(resolve,reject) {
		try {
			location.removeItem(key);
			resolve();
		} catch(e) {
			reject(e);
		}
	});
}
JOQULARStorage.prototype.clear = function() {
	var location = this.location;
	return new Promise(function(resolve,reject) {
		try {
			location.clear();
			resolve();
		} catch(e) {
			reject(e);
		}
	});
}
JOQULAR.Entity = function Entity(constructor,name) {
	name = (name ? name : constructor.name);
	if(JOQULAR.constructors[name]) {
		return JOQULAR.constructors[name];
	}
	var entity = this;
	var cons = Function("cons","return function " + name + "() { if(arguments.length>0) { cons.apply(this,arguments); return this.init(true); } else { return this.init(); };  }")(constructor);
	cons.prototype = Object.create(constructor.prototype);
	cons.prototype.__kind__ = name;
	cons.prototype.constructor = cons;
	cons.prototype.init = function(index) {
		var instance = this;
		if(index) {
			if(!instance._id) {
				instance._id = uuid.v4();
			}
			cons.index.instanceMap[instance._id] = instance;
			cons.indexObject(instance);
		}
		instance = NOM.enable(instance,function(key) { return key.indexOf("_")===-1; });
		instance.addNOMEventListener("add",function(ev) {
			var parts = ev.path.split("/"), root = ev.change.object.index.keyMaps, path = "", type, newvalue, oldvalue;
			if(ev.path.indexOf("/")>=0) {
				parts.forEach(function(part) {
					path += "/" + part;
					root[part] = (root[part] ? root[part] : {})
					Object.defineProperty(root[part],"__parentPath__",{enumerable:false,configurable:true,value:path});
					root = root[part];
				});
			}
			root[ev.change.name] = (root[ev.change.name] ? root[ev.change.name] : {});
			root = root[ev.change.name];
			newvalue = ev.change.object[ev.change.name];
			type = (newvalue instanceof Object ? "object" : (newvalue===null ? "undefined" : typeof(newvalue)));
			if(newvalue instanceof Object && !newvalue._id) {
				newvalue._id = uuid.v4();
			}
			if(newvalue!==undefined) {
				newvalue = (newvalue instanceof Object ? newvalue._id : (newvalue ? newvalue.valueOf() : newvalue));
				root[newvalue] = (root[newvalue]  ? root[newvalue]  : {});
				root[newvalue][type] = (root[newvalue][type] ? root[newvalue][type] : {});
				delete root[newvalue][type].keys;
				if(ev.change.object._id) { // won't this always be true??
					root[newvalue][type][ev.change.object._id] = true;
				}
			}
		});
		instance.addNOMEventListener("update",function(ev) {
			var parts = ev.path.split("/"), root = ev.change.object.index.keyMaps, path = "", type, newvalue, oldvalue;
			if(ev.path.indexOf("/")>=0) {
				parts.forEach(function(part) {
					path += "/" + part;
					root[part] = (root[part] ? root[part] : {})
					Object.defineProperty(root[part],"__parentPath__",{enumerable:false,configurable:true,value:path});
					root = root[part];
				});
			}
			root = root[ev.change.name];
			oldvalue = ev.change.oldValue;
			type = (oldvalue instanceof Object ? "object" : (oldvalue===null ? "undefined" : typeof(oldvalue)));
			if(oldvalue!==undefined) {
				oldvalue = (oldvalue instanceof Object ? oldvalue._id : (oldvalue ? oldvalue.valueOf() : oldvalue));
				if(root[oldvalue]) {
					if(root[oldvalue][type]) {
						delete root[oldvalue][type][ev.change.object._id];
						if(Object.keys(root[oldvalue][type]).length===0) {
							delete root[oldvalue][type]
						}
					}
					if(Object.keys(root[oldvalue]).length===0) {
						delete root[oldvalue]
					}
				}
			}
			newvalue = ev.change.object[ev.change.name];
			type = (newvalue instanceof Object ? "object" : (newvalue===null ? "undefined" : typeof(newvalue)));
			if(newvalue instanceof Object && !newvalue._id) {
				newvalue._id = uuid.v4();
			}
			if(newvalue!==undefined) {
				newvalue = (newvalue instanceof Object ? newvalue._id : (newvalue ? newvalue.valueOf() : newvalue));
				root[newvalue] = (root[newvalue]  ? root[newvalue]  : {});
				root[newvalue][type] = (root[newvalue][type] ? root[newvalue][type] : {});
				delete root[newvalue][type].keys;
				if(ev.change.object._id) { // won't this always be true??
					root[newvalue][type][ev.change.object._id] = true;
				}
			}
		});
		instance.addNOMEventListener("delete",function(ev) {
			var parts = ev.path.split("/"), root = ev.change.object.index.keyMaps, path = "", type, oldvalue;
			if(ev.path.indexOf("/")>=0) {
				parts.forEach(function(part) {
					path += "/" + part;
					root[part] = (root[part] ? root[part] : {})
					Object.defineProperty(root[part],"__parentPath__",{enumerable:false,configurable:true,value:path});
					root = root[part];
				});
			}
			root = root[ev.change.name];
			var oldvalue = ev.change.oldValue;
			type = (oldvalue instanceof Object ? "object" : (oldvalue===null ? "undefined" : typeof(oldvalue)));
			if(oldvalue!==undefined) {
				oldvalue = (oldvalue instanceof Object ? oldvalue._id : (oldvalue ? oldvalue.valueOf() : oldvalue));
				if(root[oldvalue]) {
					if(root[oldvalue][type]) {
						delete root[oldvalue][type][ev.change.object._id];
						if(Object.keys(root[oldvalue][type]).length===0) {
							delete root[oldvalue][type]
						}
					}
					if(Object.keys(root[oldvalue]).length===0) {
						delete root[oldvalue]
					}
				}
			}
		});
		//return proxy;
		return instance;
	}
	cons.prototype.setData = function(data) {
		var me = this, keys = Object.keys(data);
		NOM.unobserve(me);
		if(!me._id) {
			me._id = (data._id ? data._id : uuid.v4());
		}
		keys.forEach(function(key) {
			if(me[key]!==data[key]) {
				me[key] = data[key];
			}
		});
		cons.index.instanceMap[me._id] = me;
		cons.indexObject(me);
		NOM.observe(me);
		return me;
	}
	cons.entity = entity;
	cons.index = {instanceMap:{}, keyMaps:{}};
	Object.defineProperty(cons.index.keyMaps,"__parentPath__",{enumerable:false,configurable:true,value:""});
	Object.defineProperty(cons.prototype,"entity",{enumerable:false,value:cons.entity});
	//cons.prototype.entity = cons.entity;
	Object.defineProperty(cons.prototype,"index",{enumerable:false,value:cons.index});
	//cons.prototype.index = cons.index;
	cons.subscriptions = [];
	Object.defineProperty(cons.prototype,"subscriptions",{enumerable:false,value:cons.subscriptions});
	//cons.prototype.subscriptions = cons.subscriptions;
	cons.prototype.joqularMatch = function(pattern) {
		return JOQULAR.match(this,pattern)
	}
	cons.prototype.indexObject = function() {
		cons.indexObject(this);
	}
	cons.indexObject = function(object,root,path,id) {
		var me = this, id;
		root = (root ? root : root = me.index.keyMaps);
		path = (path ? path : "");
		if(!object._id) {
			object._id = uuid.v4();
		}
		id = (id ? id : object._id);
		for(var key in object) {
			var value = object[key], type = typeof(value);
			if(type==="function" || isPrivate(key) || value===undefined) {
				continue;
			}
			root[key] = (root[key] ? root[key] : {});
			Object.defineProperty(root[key],"__parentPath__",{enumerable:false,configurable:true,value:path + "/" + key});
			if(value instanceof Object) {
				if(!value._id) {
					value._id = uuid.v4();
				}
				var kind = getKind(value);
				root[key][value._id] = (root[key][value._id] ? root[key][value._id] : {});
				root[key][value._id][kind] = (root[key][value._id][kind] ? root[key][value._id][kind] : {});
				root[key][value._id][kind][id] = (root[key][value._id][kind][id] ? root[key][value._id][kind][id] : true);
				delete root[key][value._id][kind].keys; // invalidate key list, will regen on query for efficiency
				me.indexObject(value,root[key],path + "/" + key,id); //value._id id
			} else {
				if(value===null) {
					type = "undefined";
				}
				root[key][value] = (root[key][value] ? root[key][value] : {});
				root[key][value][type] = (root[key][value][type] ? root[key][value][type] : {});
				root[key][value][type][id] = (root[key][value][id] ? root[key][value][id] : true);
				delete root[key][value][type].keys; // invalidate key list, will regen on query for efficiency
			}
		}
		if(object instanceof Array) {
			root.length = (root.length ? root.length : {});
			root.length[object.length] = (root.length[object.length] ? root.length[object.length] : {});
			root.length[object.length].number = (root.length[object.length].number ? root.length[object.length].number : {});
			root.length[object.length].number[id] = (root.length[object.length].number[id] ? root.length[object.length].number[id] : true);
			delete root.length[object.length].number.keys; // invalidate key list, will regen on query for efficiency
		} else if(object instanceof Set) {
			root.size = (root.size ? root.size : {});
			root.size[object.size] = (root.size[object.size] ? root.size[object.size] : {});
			root.size[object.size].number = (root.size[object.size].number ? root.size[object.size].number : {});
			root.size[object.size].number[id] = (root.size[object.size].number[id] ? root.size[object.size].number[id] : true);
			delete root.size[object.size].number.keys; // invalidate key list, will regen on query for efficiency
		}
	}
	cons.prototype.blockReactions = function(bool) {
		bool = (bool===undefined ? true : bool);
		Object.defineProperty(this,"__blockReactions__",{enumerable:false,configurable:true,writable:true,value:bool});
	}
	cons.observer = function(changeset) {
		var me = this, subscriptioncallbacks = [], subscriptionchangesets = [];
		changeset.forEach(function(change) {
			if(change.object!==me || change.object.__blockReactions__) {
				return;
			}
			change.object.subscriptions.forEach(function(subscription) {
				if(!subscription.acceptList || subscription.acceptList.indexOf(change.type)>=0) {
					var i = subscriptioncallbacks.indexOf(subscription.callback);
					if(i===-1) {
						subscriptioncallbacks.push(subscription.callback);
						subscriptionchangesets.push([change]);
					} else {
						subscriptionchangesets[i].push(change);
					}
				}
			});
		});
		subscriptioncallbacks.forEach(function(callback,i) {
			callback(subscriptionchangesets[i]);
		});
	}
	// resolves values for a path reference by using index
	cons.self = function(path,keymap,types) {
		var me = this, instancemap = me.index.instanceMap, objectvalues = [], parts = path.split("/"), keymap, thekey;
		if(parts[0]==="") { // goto root, path started with /
			keymap = me.index.keyMaps;
		} else if(parts[0]==="..") { // goto parent
			var p = keymap.__parentPath__.split("/").filter(function(part) { return part!==""; });
			keymap = me.index.keyMaps; // first goto root
			p.every(function(part,i) { // navigate down
				if(i===p.length-1) {
					return false;
				}
				return keymap = keymap[part];
			});
		} else if(parts[0]===".") { // start at kemap handed in
			// keymap stays the same
		}
		parts.shift();
		parts.every(function(part) {
			thekey = part;
			return keymap = keymap[part];
		});
		if(keymap) {
			var objects = {};
			Object.keys(keymap).forEach(function(value) {
				types.forEach(function(type) {
					if(keymap[value][type]) {
						if(exports[type] && exports[type].prototype) { // an object needs to be created
							var id = Object.keys(keymap[value][type])[0];
							instancemap[id] = (instancemap[id] ? instancemap[id] : Object.create(exports[type].prototype));
							if(instancemap[id]._id) { // object already existed
								objectvalues.push(instancemap[id][thekey]);
							} else { // add id, constructor, flag for population
								instancemap[id]._id = id;
								instancemap[id].constructor = exports[type];
								objects[value] = instancemap[id];
							}
						} else {
							objectvalues.push(toObject(entity.coerce(value,type)));
						}
					}
				});
			});
			loadFromIndex(objects,keymap,objectvalues);
		}
		return objectvalues;
	}
	// adds callback to list of subscribers for changes, additions, deletions to objects of type cons
	cons.subscribe = function(callback,acceptList) {
		var subscriptions = this.subscriptions.filter(function(subscription) { return subscription.callback===callback; });
		if(subscriptions.length===0) {
			this.subscriptions.push({callback:callback,acceptList:acceptList})
		} else {
			subscriptions.forEach(function(subscription) {
				subscription.acceptList = acceptList;
			});
		}
	}
	cons.unsubscribe = function(callback) {
		var index;
		if(this.subscriptions.some(function(subscription,i) {
			index = i;
			return subscription.callback===callback;
		})) {
			this.subscriptions.splice(index,1);
		}
	}
	cons.load = function(uuid) {
		if(cons.getItem) { // getItem defined by wrapping persistence engine
			return cons.getItem(uuid).then(function(data) {
				var instance = new cons();
				if(data) {
					instance.setData(data);
				}
			});
		}
		return Promise.resolve();
	}
	cons.find = function(pattern,cached,loaded) {
		var me = this, promises = [], keys = Object.keys(pattern), cachedresults = [];
		var results = (keys.length===0 ?  Object.keys(me.index.instanceMap) : me.findIds(pattern));
		results.forEach(function(uuid,i) { // convert uuids to objects
			if(!me.index.instanceMap[uuid]) { // load if not loaded
				promises.push(cons.load(uuid).then(function(result) {
					me.index.instanceMap[uuid] = result;
					results[i] = me.index.instanceMap[uuid];
					if(typeof(loaded)==="function") {
						loaded(null,result);
					}
				}));
			} else {
				cachedresults.push(me.index.instanceMap[uuid]);
				results[i] = me.index.instanceMap[uuid];
			}
		});
		if(typeof(cached)==="function") {
			cached(null,cachedresults);
		}
		return new Promise(function(resolve,reject) {
			Promise.all(promises).then(function() {
				resolve(results);
			});
		});
	}
	function resolve(f,testvalue,objectvalue) {
		if(testvalue instanceof Object) {
			var key = Object.keys(testvalue)[0];
			if(key && key.indexOf("$")===0) {
				return resolve(JOQULAR.predicates[key],testvalue[key],toObject(f.call(objectvalue)));
			} else {
				return f.call(objectvalue,testvalue);
			}
		}
		return f.call(objectvalue,testvalue);
	}
	cons.findIds = function(pattern,objectKeys,results) {
		var me = this, instancemap = me.index.instanceMap, basekeymap = me.index.keyMaps, thekey;
		if(!basekeymap) {
			return [];
		}
		objectKeys = (objectKeys ? objectKeys : []);
		if(!objectKeys.every(function(key) { // walk down the keyMap to the proper location
			if(key.indexOf("$")!==0) {
				thekey = key;
				return basekeymap = basekeymap[key];
			}
			return true;
		})) {
			return [];
		}
		Object.keys(pattern).every(function(patternkey) { // walk the pattern to collect all data
			if(patternkey==="_id") {
				return true;
			}
			var keymap = basekeymap, testvalues = [pattern[patternkey]], objects = {}, objectvalues = [], type = (testvalues[0]==null ? "undefined" : typeof(testvalues[0])), types = [], objectkey, values, path;
			objectKeys.push(patternkey);
			// handle values that require recursion, e.g. {name: {$eq: {$self '/child/name'}}}
			var hasself = (pattern[patternkey] && pattern[patternkey].$self ? true : false);
			if(patternkey!=="$self" && testvalues[0] instanceof Object && !(testvalues[0] instanceof Function) && (hasself || !(patternkey.indexOf("$")===0 && JOQULAR.predicates[patternkey]))){
				results = (results ? intersection(results,cons.findIds(pattern[patternkey],objectKeys,results)) : cons.findIds(pattern[patternkey],objectKeys,results));	
			} else { // else, if recursion not required, assemble data and do tests
				if(patternkey.indexOf("$")===-1) {
					keymap = keymap[patternkey];
				}
				Object.keys(keymap).forEach(function(value) {
					Object.keys(keymap[value]).forEach(function(type) {
						if(isDataType(type) && keymap[value][type]) {
							types.push(type);
							if(exports[type] && exports[type].prototype) { // an object needs to be created
								var nestedid = value, uuid = Object.keys(keymap[value][type])[0];
								instancemap[uuid] = (instancemap[uuid] ? instancemap[uuid] : Object.create(exports[type].prototype));
								if(instancemap[uuid]._id) { // object already existed
									objectvalues.push(instancemap[uuid][thekey]);
								} else { // add uuid, constructor, flag for population
									instancemap[uuid]._uuid = uuid;
									instancemap[uuid].constructor = exports[type];
									objects[nestedid] = instancemap[uuid];
								}
							} else {
								objectvalues.push(toObject(entity.coerce(value,type)));
							}
						}
					});
				});
				if(type==="function") {
					if(patternkey==="$exists" || patternkey==="$forall" || patternkey==="$$") {
						if(keymap._id) {
							Object.keys(keymap._id).forEach(function(uuid) {
								instancemap[uuid] = (instancemap[uuid] ? instancemap[uuid] : Object.create(me.prototype));
								if(instancemap[uuid]._id) { // object already existed
									objectvalues.push(instancemap[uuid]);
								} else { // add id, constructor, flag for population
									instancemap[uuid]._id = id;
									instancemap[uuid].constructor = me;
									objects[uuid] = instancemap[uuid];
								}
							});
						}
					}
				}
				loadFromIndex(objects,keymap,objectvalues);

				if(patternkey==="$self") {
					testvalues = cons.self(pattern[patternkey],keymap,types); // should we actually be limiting types?
					patternkey = objectKeys[objectKeys.length-2];
				}
				var tmpresults = [];
				objectvalues.every(function(objectvalue) { // test the values assembled
					passed = false;
					objectvalue = (isPrimitive(objectvalue) ? objectvalue.valueOf() : objectvalue);
					type = (objectvalue===null || objectvalue.valueOf()===null ? "undefined" : typeof(objectvalue));
					if(patternkey==="$forall") {
						objectvalue = (objectvalue ? objectvalue.valueOf() : objectvalue); /// resolves instances of Null to null
						if(testvalues[0](objectvalue)) {
							passed = true;
						} else {
							tmpresults = [];
						}
					} else if(patternkey==="$exists") {
						if(tmpresults.length===0) {
							objectvalue = (objectvalue ? objectvalue.valueOf() : objectvalue); /// resolves instances of Null to null
							if(testvalues[0](objectvalue)) {
								passed = true;
							}
						} else {
							passed = true;
						}
					} else if(patternkey==="$" || (patternkey==="$$" && objectvalue instanceof Object)) {
						objectvalue = (objectvalue ? objectvalue.valueOf() : objectvalue); /// resolves instances of Null to null
						if(testvalues.some(function(testvalue) { return (patternkey==="$" ? testvalue(objectvalue) : testvalue.call(objectvalue)); })) {
							passed = true;
						}
					} else if(JOQULAR.predicates[patternkey] instanceof Function) {
						if(testvalues.some(function(testvalue) { return resolve(JOQULAR.predicates[patternkey],testvalue,objectvalue); /*JOQULAR.predicates[patternkey].call(objectvalue,testvalue);*/ })) {
							passed = true;
						}
					} else if(testvalues.some(function(testvalue) { return (objectvalue ? objectvalue.valueOf() : objectvalue)===(testvalue ? testvalue.valueOf() : testvalue)})) { // exact match test, dereferences primitves as Objects
						objectvalue = (objectvalue ? objectvalue.valueOf() : objectvalue); // resolves instances of Null to null
						passed = true;
					}
					if(passed) {
						if(objectvalue instanceof Object) {
							tmpresults.push(objectvalue._id);
						} else if(keymap[objectvalue] && keymap[objectvalue][type]) { // when arrays are loaded, objects of wrong type can be added to object list, this skips them
							if(!keymap[objectvalue][type].keys) {
								Object.defineProperty(keymap[objectvalue][type],"keys",{enumerable:false,writable:false,value:Object.keys(keymap[objectvalue][type])});
							}
							tmpresults = tmpresults.concat(keymap[objectvalue][type].keys);
						}
						return true;
					}
					return false;
				});
				results = (results ? (tmpresults.length>0 ? intersection(results,tmpresults) : []) : tmpresults);
			}
			objectKeys.pop();
			return results && results.length>0 // if there are no results at this point, then abort every
		});
		return (results ? intersection(results,results) : []);
	}
	JOQULAR.constructors[name] = cons;
	return cons;
}
JOQULAR.Entity.prototype.coerce = function(value,type) {
	var conversions = {
		string: {number: parseFloat, boolean: function(value) { return value==="true"; }},
		boolean: {number: function(value) { return (value ? 1 : 0); }},
		number: {boolean: function(value) { return (value ? true : false); }},
	};
	if(typeof(value)===type) {
		return value;
	}
	if(type==="string") {
		return JSON5.stringify(value);
	}
	if(conversions[typeof(value)] && conversions[typeof(value)][type]) {
		return conversions[typeof(value)][type](value);
	}
	if(value==="null" && type==="undefined") {
		return null;
	}
	return value;
}
	
JOQULAR.constructors = {};
JOQULAR.predicates = {
	$lt: generic(function(arg) { return this.valueOf() < arg; })
		.method(function(arg) { return supports(this,"lt"); },function(arg) { return this.lt(arg); })
		.method(function(arg) { return supports(this,"lt") && this.lt.length>=2 && arg instanceof Array; },function(arg) { return this.lt(arg[0],arg[1]); }),
	$lte: generic(function(arg) { return this.valueOf() <= arg; })
		.method(function(arg) { return supports(this,"lte"); },function(arg) { return this.lte(arg); })
		.method(function(arg) { return supports(this,"lte") &&  this.lte.length>=2 && arg instanceof Array; },function(arg) { return this.lte(arg[0],arg[1]); }),
	$eq: generic(function(arg) { return equal.call(this,arg); })
		.method(function(arg) { return supports(this,"eq"); },function(arg) { return this.eq(arg);  })
		.method(function(arg) { return supports(this,"neq") && this.neq.length>=2 && arg instanceof Array; },function(arg) { return !this.neq(arg[0],arg[1]);  })
		.method(function(arg) { return supports(this,"eq") && this.eq.length>=2 && arg instanceof Array; },function(arg) { return this.eq(arg[0],arg[1]);  }),
	$neq: generic(function(arg) { return !equal.call(this,arg); })
		.method(function(arg) { return supports(arg,"eq"); }, function(arg) { return !arg.eq(this); })
		.method(function(arg) { return supports(this,"eq") && this.eq.length>=2 && arg instanceof Array; },function(arg) { return !this.eq(arg[0],arg[1]);  })
		.method(function(arg) { return supports(this,"neq") && this.neq.length>=2 && arg instanceof Array; },function(arg) { return this.neq(arg[0],arg[1]);  }),
	$eeq: generic(function(arg) { return this.valueOf() === arg || (arg instanceof Object && this._id===arg._id); })
		.method(function(arg) { return supports(this,"eeq"); },function(arg) { return this.eeq(arg);  }),
	$neeq: generic(function(arg) { return this!==arg && (this==null || this.valueOf() !== arg); })
		.method(function(arg) { return supports(arg,"eeq"); }, function(arg) { return !arg.eeq(this); }),
	$gte: generic(function(arg) { return this.valueOf() >= arg; })
		.method(function() { return supports(this,"gte"); },function(arg) { return this.gte(arg); })
		.method(function(arg) { return supports(this,"gte") && this.gte.length>=2 && arg instanceof Array; },function(arg) { return this.gte(arg[0],arg[1]); }),
	$gt: generic(function(arg) { return this.valueOf() > arg; })
		.method(function(arg) { return supports(this,"gt"); },function(arg) { return this.gt(arg); })
		.method(function(arg) { return supports(this,"gt") && this.gt.length>=2 && arg instanceof Array; },function(arg) { return this.gt(arg[0],arg[1]); }),
	$in: generic()
		.method(function(arg) { return arg instanceof Array },function(arg) { return arg.indexOf(this.valueOf())>=0; })
		.method(function(arg) { return supports(arg,"has"); },function(arg) { return arg.has(this.valueOf()); })
		.method(function(arg) { return supports(arg,"contains"); },function(arg) { return arg.contains(this.valueOf()); })
		.method(function(arg) { return supports(arg,"includes"); },function(arg) { return arg.includes(this.valueOf()); }),
	$nin: generic()
		.method(function(arg) { return arg instanceof Array },function(arg) { return arg.indexOf(this.valueOf())===-1; })
		.method(function(arg) { return supports(this,"nin"); },function(arg) { return this.nin(arg); })
		.method(function(arg) { return supports(arg,"has"); },function(arg) { return !arg.has(this.valueOf()); })
		.method(function(arg) { return supports(arg,"contains"); },function(arg) { return !arg.contains(this.valueOf()); })
		.method(function(arg) { return supports(arg,"includes"); },function(arg) { return !arg.includes(this.valueOf()); }),
	$between: generic()
		.method(function(arg) { return supports(this,"between") && arg instanceof Array; },function(arg) { return this.between(arg[0],arg[1]); }),
	$outside: generic()
		.method(function(arg) { return supports(this,"outside") && arg instanceof Array; },function(arg) { return this.outside(arg[0],arg[1]); }),
	$echoes: generic()
		.method(function(arg) { return this instanceof String && supports(this,"echoes") && arg && typeof(arg.valueOf())==="string"; },function(arg) { return this.echoes(arg); }),
	$match: generic()
		.method(function(arg) { return this instanceof String && arg instanceof RegExp; },function(arg) { return this.match(arg); }),
	$every: generic()
		.method(function(arg) { return typeof(this.every)==="function" && typeof(arg)==="function"; },function(arg) { return this.every(arg); }),
	$some: generic()
		.method(function(arg) { return typeof(this.some)==="function" && typeof(arg)==="function"; },function(arg) { return this.some(arg); }),
	$intersects: generic()
		.method(function(arg) { return supports(this,"intersects") && supports(arg,"intersects"); },function(arg) { return this.intersects(arg); }),
	$disjoint: generic()
		.method(function(arg) { return supports(this,"disjoint") && supports(arg,"disjoint"); },function(arg) { return this.disjoint(arg); }),
	$coincident: generic()
		.method(function(arg) { return supports(this,"coincident") && supports(arg,"coincident"); },function(arg) { return this.coincident(arg); }),
	$includes: generic()
		.method(function(arg) { return supports(this,"includes"); },function(arg) { return this.includes(arg); })
		.method(function(arg) { return this instanceof Set },function(arg) { return this.has(arg); }),
	$has: generic()
		.method(function(arg) { return supports(this,"includes"); },function(arg) { return this.includes(arg); })
		.method(function(arg) { return supports(this,"has"); },function(arg) { return this.has(arg); }),
	$contains: generic()
		.method(function(arg) { return supports(this,"contains"); },function(arg) { return this.contains(arg); })
		.method(function(arg) { return this instanceof Array; },function(arg) { return this.includes(arg); })
		.method(function(arg) { return this instanceof Set; },function(arg) { return this.has(arg); }),
	$excludes: generic()
		.method(function(arg) { return supports(this,"excludes"); },function(arg) { return this.excludes(arg); })
		.method(function(arg) { return this instanceof Set },function(arg) { return !this.has(arg); }),
	$length: generic()
		.method(function(arg) { return this instanceof Array; },function(arg) { return this.length===arg; })
		.method(function(arg) { return supports(this,"count"); },function(arg) { return this.count()===arg; }),
	$count: generic()
		.method(function(arg) { return this instanceof Array; },function(arg) { return this.length===arg; })
		.method(function(arg) { return supports(this,"count"); },function(arg) { return this.count()===arg; }),
	$min: generic()
		.method(function() { return supports(this,"min"); },function() { return this.min(); })
		.method(function(arg) { return supports(this,"min"); },function(arg) { return this.min()===arg; }),
	$max: generic()
		.method(function() { return supports(this,"max"); },function() { return this.max(); })
		.method(function(arg) { return supports(this,"max"); },function(arg) { return this.max()===arg; }),
	$sum: generic()
		.method(function() { return supports(this,"sum"); },function() { return this.sum(); })
		.method(function(arg) { return supports(this,"sum"); },function(arg) { return this.sum()===arg; }),
	$avg: generic()
		.method(function() { return supports(this,"avg"); },function() { return this.avg(); })
		.method(function(arg) { return supports(this,"avg"); },function(arg) { return this.avg()===arg; }),
	$before: generic()
		.method(function(arg) { return this instanceof TimeSpan && !(arg instanceof Array); },function(arg) { return this.before(arg); })
		.method(function(arg) { return this instanceof TimeSpan && arg instanceof Array; },function(arg) { return this.before(arg[0],arg[1]); }),
	$adjacentOrBefore: generic()
		.method(function(arg) { return this instanceof TimeSpan && !(arg instanceof Array); },function(arg) { return this.adjacentOrBefore(arg); })
		.method(function(arg) { return this instanceof TimeSpan && arg instanceof Array; },function(arg) { return this.adjacentOrBefore(arg[0],arg[1]); }),
	$adjacentBefore: generic()
		.method(function(arg) { return this instanceof TimeSpan && !(arg instanceof Array); },function(arg) { return this.adjacentBefore(arg); })
		.method(function(arg) { return this instanceof TimeSpan && arg instanceof Array; },function(arg) { return this.adjacentBefore(arg[0],arg[1]); }),
	$adjacent: generic()
		.method(function(arg) { return this instanceof TimeSpan && !(arg instanceof Array); },function(arg) { return this.adjacent(arg); })
		.method(function(arg) { return this instanceof TimeSpan && arg instanceof Array; },function(arg) { return this.adjacent(arg[0],arg[1]); }),
	$adjacentAfter: generic()
		.method(function(arg) { return this instanceof TimeSpan && !(arg instanceof Array); },function(arg) { return this.adjacentAfter(arg); })
		.method(function(arg) { return this instanceof TimeSpan && arg instanceof Array; },function(arg) { return this.adjacentAfter(arg[0],arg[1]); }),
	$adjacentOrAfter: generic()
		.method(function(arg) { return this instanceof TimeSpan && !(arg instanceof Array); },function(arg) { return this.adjacentOrAfter(arg); })
		.method(function(arg) { return this instanceof TimeSpan && arg instanceof Array; },function(arg) { return this.adjacentOrAfter(arg[0],arg[1]); }),
	$after: generic()
		.method(function(arg) { return this instanceof TimeSpan && !(arg instanceof Array); },function(arg) { return this.after(arg); })
		.method(function(arg) { return this instanceof TimeSpan && arg instanceof Array; },function(arg) { return this.after(arg[0],arg[1]); }),
}
JOQULAR.match = function(object,pattern,callback) {
	var data = object;
	new AnonymousEntity().setData(data);
	var promise = AnonymousEntity.find(pattern,callback);
	AnonymousEntity.index.instanceMap = {};
	AnonymousEntity.index.keyMaps = {};
	return promise;
}
JOQULAR.select = function(projection) {
	return new Select(projection);
}
JOQULAR.db = function(name,location) {
	return new Database(name,location);
}
JOQULAR.clear = function() {
	window.localStorage.clear();
}

function AnonymousEntity() {
	
}
AnonymousEntity = new JOQULAR.Entity(AnonymousEntity,"AnonymousEntity");

exports.JOQULAR = JOQULAR;

})("undefined"!=typeof exports&&"undefined"!=typeof global?global:window);