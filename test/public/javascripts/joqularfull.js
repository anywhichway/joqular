/*
 * GNU GENERAL PUBLIC LICENSE
 * Version 3, 29 June 2007
 * Copyright 2015, 2016 AnyWhichWay, LLC and Simon Y. Blackwell
 * 
 * The software is provided as is without any guarantee of quality or applicability for any specific use.
 * 
 * Attribution for the work of others is in the source code, although none came with a license stipulation.
 */

// written.then - 1,000+ second
// indexed.then - 10,000+ second
// indexWritten.then - 30 second
(function() {
	//"use strict"; DO NOT ENABLE, it will break matching	

	var _global = this;
	var generic = require('js-generics');
	var uuid = require('node-uuid');
	require("proxy-observe");
	var NOM =  require('nested-object-model');
	var sessionStorage = require('sessionstorage');
	
	var levelup;
	if(typeof(window)!=="undefined") {
		levelup = require("level-js");
	} else {
		levelup = require("levelup");
	}
	
	var JOQULAR = {};

	var Faye = require('../javascripts/faye.js');
	var JSON5 = require('../javascripts/json5-ex.js');
	
	require("bluebird");
	//require('../javascripts/es6-promise.min.js');
	require('../javascripts/es6-collections.min.js');
	
	// test object to see if it supports an interface
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
				return intersection(array,array);
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
	function crossproduct(arrays,test) {
		  var result = [],
		      indices = Array(arrays.length);
		  (function backtracking(index) {
		    if(index === arrays.length) {
		    	var row = arrays.map(function(array,index) {
		            return array[indices[index]];
		        });
		    	if(!test) {
		    		return result.push(row);
		    	} else if(test(row)) {
		    		result.push(row);
		    	}
		    	return result.length;
		    }
		    for(var i=0; i<arrays[index].length; ++i) {
		      indices[index] = i;
		      backtracking(index+1);
		    }
		  })(0);
		  return result;
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
		return type==="string" || type==="number" || type==="boolean" || type==="undefined" || JOQULAR.constructors[type]; 
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
		//object.blockReactions(true);
		if(!object._metadata) {
			object._metadata = {createdAt: new Date(), createdBy:null, kind:object.__kind__}; // , kind:object.__kind__
			object.indexObject();
		}
		//object._metadata = (object._metadata ? object._metadata : );
		object._metadata.updatedAt = new Date();
		object._metadata.updatedBy = null;
		//object.blockReactions(false);
	}
	function Collection(name,config) {
		var me = this;
		me.entity = JOQULAR.constructors[name];
		me.name = name;
		me.entity.get = function(uuid) { 
			return me.storage.get(uuid+".json");
		};
		if(config) {
			var keys = Object.keys(config);
			keys.forEach(function(key) {
				me[key] = config[key];
				if(key==="schema") {
					me[key].bind(me.entity,undefined,name);
				}
			});
		}
	}
	//var savecount = 0;
	Collection.prototype.save = function(validationErrorCallback) {
		var me = this, valid, promises = [], errors = [];
		var index = new Index();
		index.keyMaps = me.entity.index.keyMaps;
		Object.keys(me.entity.index.instanceMap).forEach(function(uuid) { 
			if(!me.streaming) {
				var object = me.entity.index.instanceMap[uuid];
				if(typeof(object.validate)!=="function" || (valid=object.validate())===true) {
					index.instanceMap[uuid] = false; // just save the uuids on index for instance to save space and time, instances loaded on-demand by queries
					updateMetadata(object);
					promises.push(me.storage.put(uuid+".json",object));
				} else {
					errors.push(valid);
				}
			} else {
				index.instanceMap[uuid] = false; // just save the uuids on index for instance to save space and time, instances loaded on-demand by queries
			}
		});
		me.indexToSave = index;
		// only save the most recent index
		return new Promise(function(resolve,reject) {
			Promise.all(promises).then(function() {
				if(me.indexToSave) { // for efficiency, only save most recent index update
					//savecount++;
					//console.log(savecount);
					me.storage.put(me.name+".json",me.indexToSave);
					delete me.indexToSave;
				}
				resolve((errors.length>0 ? errors : null));
			}).catch(function(err) {
				reject(err);
			});
		});
	}
	Collection.prototype.load = function() {
		var me = this;
		var promise = me.storage.get(me.name+".json");
		if(promise instanceof Promise) {
			promise.then(function(data) { 
				if(data) {
					data = (typeof(data)==="string" ? JSON.parse(data) : data);
					me.entity.index.instanceMap = data.instanceMap;
					me.entity.index.keyMaps = data.keyMaps; // replace by part, not whole object since object is "shared" with prototype, doing whole object will disconnect from prototype
				}
			});
			return promise;
		} 
		var data = promise;
		if(data) {
			data = (typeof(data)==="string" ? JSON.parse(data) : data);
			me.entity.index.instanceMap = data.instanceMap;
			me.entity.index.keyMaps = data.keyMaps; // replace by part, not whole object since object is "shared" with prototype, doing whole object will disconnect from prototype
		}
		return Promise.resolve(data);
	}
	Collection.prototype.clear = function() {
		var me = this;
		var promises = [];
		Object.keys(me.entity.index.instanceMap).forEach(function(uuid) {
			var result = me.storage.del(uuid+".json");
			if(result instanceof Promise) {
				promises.push(result);
			}
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
				var result = me.storage.del(uuidOrPattern+".json");
				if(result instanceof Promise) {
					promises.push(result);
				}
			} else if(uuidOrPattern instanceof Object) {
				var results = me.find(uuidOrPattern);
				results.forEach(function(object) {
					delete me.entity.index.instanceMap[object._id];
					var result = me.storage.del(object._id+".json");
					if(result instanceof Promise) {
						promises.push(result);
					}
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
					me.storage.put(uuid+".json",JSON5.stringify(object));
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
	
	function Database(name,config) { // directory = localStorage | indexedDB | path
		var me = this;
		this.name = name;
		if(config) {
			var keys = Object.keys(config);
			keys.forEach(function(key) {
				me[key] = config[key];
			});
		}
		if(!me.storage) { me.storage = new Storage(); };
		if(!me.storage.primary) { 
			if(typeof(window)==="undefined") {
				//var LocalStorage = require('node-localstorage').LocalStorage;
				//me.storage.primary = new LocalStorage('./localStorage.db',50 * 1024 * 1024);
				me.storage.primary = levelup('./localStorage.db');
			} else {
				me.storage.primary = window.localStorage;
			}
		}
		this.collections = {};
	}
	Database.prototype.collection = function(name,config) {
		var conf = {storage: this.storage, streaming: false, preload: false};
		if(config) {
			var keys = Object.keys(config);
			keys.forEach(function(key) {
				conf[key] = config[key];
			});
		}
		this.collections[name] = (this.collections[name] ? this.collections[name] : new Collection(name,conf));
		if(config.preload) {
			this.collections[name].load();
		}
		if(config.streaming) {
			this.collections[name].stream();
		}
		return this.collections[name];
	}
	//put, get, del
	function Storage(primary,replicant) {
		this.primary = primary;
		this.replicant = replicant;
	}
	Storage.prototype.put = function(key,value) {
		var me = this;
		return new Promise(function(resolve,reject) {
			try {
				var data;
				if(value instanceof Index) {
					data = JSON.stringify(value); // using JSON rather than JSON5 makes indexes easy to format for debugging
				} else {
					data = JSON5.stringify(value); // hand in stringifier to deal with nested objects
				}
				var result = me.primary.put(key,data);
				if(me.replicant && !(value instanceof Index)) {
					if(result instanceof Promise) {
						result.then(function() {
							 {
								me.replicant.put(key,data);
							}
						});
					} else {
						me.replicant.put(key,data);
					}
				}
				if(result instanceof Promise) {
					result.then(function() {
						resolve();
					})
				} else {
					resolve();
				}
			} catch(e) {
				reject(e);
			}
		});
	}
	Storage.prototype.get = function(key) {
		var me = this;
		return new Promise(function(resolve,reject) {
			try {
				var result = me.primary.get(key);
				if(result instanceof Promise) {
					result.then(function(data) {
						if(data) {
							resolve(JSON5.parse(data));
						}
					})
				} else if(result) {
					resolve(JSON5.parse(result)); // hand in reviver to deal with nested objects
				} else if(me.replicant) {
					result = me.replicant.get(key);
					if(result instanceof Promise) {
						result.then(function(data) {
							if(data) {
								resolve(JSON5.parse(data));
							} else {
								resolve();
							}
						})
					} else if(result) {
						resolve(JSON5.parse(result));// hand in reviver to deal with nested objects
					} else {
						resolve();
					}
				}
			} catch(e) {
				reject(e);
			}
		});
	}
	Storage.prototype.del = function(key) {
		var primary = this.primary;
		return new Promise(function(resolve,reject) {
			try {
				primary.del(key);
				resolve();
			} catch(e) {
				reject(e);
			}
		});
	}
	Storage.prototype.clear = function() {
		var primary = this.primary;
		return new Promise(function(resolve,reject) {
			try {
				primary.clear();
				resolve();
			} catch(e) {
				reject(e);
			}
		});
	}
	JOQULAR.Storage = Storage;
	var IndexedDBStore = {
			create: function(version) {
				return new Promise(function(resolve,reject) {
					var request = indexedDB.open("JOQULAR",(version ? version : 1));
					request.onsuccess = function(event) {
						  var db = event.target.result;
						  db.put = function(key,value) {
							  return new Promise(function(resolve,reject) {
								  var store = db.transaction("json","readwrite").objectStore("json");
								  var request = store.add({key:key,value:value});
								  request.onsuccess = function(event) {
									  resolve();
								  }
								  request.onerror = function(event) {
									  console.log(event);
									  reject(event);
								  }
							  });
						  }
						  db.get = function(key) {
							  return new Promise(function(resolve,reject) {
								  var store = db.transaction("json").objectStore("json");
								  var request = store.get(key);
								  request.onsuccess = function(event) {
									  resolve(request.result);
								  }
								  request.onerror = function(event) {
									  console.log(event);
									  reject(event);
								  }
 							  });
						  }
						 // var store = db.transaction("json","readwrite").objectStore("json");
						 // var request = store.add({key:"testid",value:"test"});
						 // request.onsuccess = function(event) {
						//	  resolve(db);
						 // }
						 // request.onerror = function(event) {
						//	  reject(event);
						 // }
						  resolve(db);
					}
					request.onupgradeneeded = function(event) {
						  var db = event.target.result;
						  var objectstore = db.createObjectStore("json",{keyPath: "key"});
						  objectstore.transaction.oncomplete = function(event) {
							 // var store = db.transaction("json","readwrite").objectStore("json");
							 // var request = store.add({key:"testid",value:"test"});
							 // request.onsuccess = function(event) {
							//	  resolve(db);
							 // }
							//  request.onerror = function(event) {
							//	  reject(event);
							//  }
							  resolve(db);
						  }
						  db.put = function(key,value) {
							  return new Promise(function(resolve,reject) {
								  var store = db.transaction("json","readwrite").objectStore("json");
								  var request = store.add({key:key,value:value});
								  request.onsuccess = function(event) {
									  resolve();
								  }
								  request.onerror = function(event) {
									  console.log(event);
									  reject(event);
								  }
							  });
						  }
						  db.get = function(key) {
							  return new Promise(function(resolve,reject) {
								  var store = db.transaction("json").objectStore("json");
								  var request = store.get(key);
								  request.onsuccess = function(event) {
									  resolve(request.result);
								  }
								  request.onerror = function(event) {
									  console.log(event);
									  reject(event);
								  }
							  });
						  }
					}
					request.onerror = function(event) {
						  console.log(event);
						  reject(event);
					}
				});
			}
	}
	function Server(url) {
		var me = this;
		try {
			me.client = new Faye.Client(url); //3000 ,{timeout:10}
			me.client.disable('websocket');
			me.client.subscribe("/joqular",function(message) {
				console.log(message);
			});
			// establish a unique communication channel id
			if(!sessionStorage.getItem("channel")) {
				sessionStorage.setItem("channel",uuid.v4());
			}
			me.channel = "/joqular/" + sessionStorage.getItem("channel");
			me.client.subscribe(me.channel,function(message) {
				if(message.source!==me.channel) {
					console.log(message.data)
					console.log("-->",me.channel,message);
				}
			});
		} catch(e) {
			console.log(e);
			console.log("Unable to connect to remote database. Data will be synched at a later time.");
		} 
	}
	Server.prototype.put = function(key,value) {
		var me = this;
		return me.client.publish(me.channel,(typeof(value)==="string" ? value : JSON5.stringify(value))); 	// as stringifier so that kinds of nested objects are transmitted
	}
	Server.prototype.get = function(key) {
		console.log("not yet implemented");
	}
	JOQULAR.Server = Server;
	function Index() {
		this.instanceMap = {};
		this.keyMaps = {};
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
				//if(!instance._id) {
				//	instance._id = name + "@" + uuid.v4();
				//}
				cons.indexObject(instance);
				cons.index.instanceMap[instance._id] = instance;
			}
			instance = NOM.enable(instance,function(key) { return key.indexOf("_")===-1; });
			instance.addNOMEventListener("add",function(ev) {
				var parts = ev.path.split("/"), root = ev.change.object.index.keyMaps, path = "", type, newvalue, oldvalue;
				if(isPrivate(ev.change.name)) {
					return;
				}
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
				type = (newvalue instanceof Object ? getKind(newvalue) : (newvalue===null ? "undefined" : typeof(newvalue)));
				if(newvalue instanceof Object && !newvalue._id) {
					newvalue._id = getKind(newvalue) + "@" + uuid.v4();
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
				if(isPrivate(ev.change.name)) {
					return;
				}
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
				type = (oldvalue instanceof Object ? getKind(oldvalue) : (oldvalue===null ? "undefined" : typeof(oldvalue)));
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
				type = (newvalue instanceof Object ? getKind(newvalue) : (newvalue===null ? "undefined" : typeof(newvalue)));
				if(newvalue instanceof Object && !newvalue._id) {
					newvalue._id = getKind(newvalue) + "@" + uuid.v4();
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
				if(isPrivate(ev.change.name)) {
					return;
				}
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
				type = (oldvalue instanceof Object ? getKind(oldvalue) : (oldvalue===null ? "undefined" : typeof(oldvalue)));
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
			//if(!me._id) {
			//	me._id = (data._id ? data._id : name + "@" + uuid.v4());
			//}
			keys.forEach(function(key) {
				if(me[key]!==data[key]) { // do we need this test?
					me[key] = data[key];
				}
			});
			cons.index.instanceMap[me._id] = me;
			cons.indexObject(me);
			NOM.observe(me);
			return me;
		}
		cons.entity = entity;
		cons.index = new Index();
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
				object._id = getKind(object) + "@" + uuid.v4();
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
						value._id = getKind(value) + "@" + uuid.v4();
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
		cons.prototype.unindexObject = function() {
			cons.unindexObject(this);
		}
		cons.unindexObject = function(object,root,path,id) {
			var me = this;
			root = (root ? root : root = me.index.keyMaps);
			path = (path ? path : "");
			id = (id ? id : object._id);
			if(!id) {
				return;
			}
			for(var key in object) {
				var value = object[key], type = typeof(value);
				if(type==="function" || isPrivate(key) || value===undefined) {
					continue;
				}
				root[key] = (root[key] ? root[key] : {});
				Object.defineProperty(root[key],"__parentPath__",{enumerable:false,configurable:true,value:path + "/" + key});
				if(value instanceof Object) {
					if(!value._id) {
						continue;
					}
					var kind = getKind(value);
					delete root[key][value._id][kind][id];
					delete root[key][value._id][kind].keys; // invalidate key list, will regen on query for efficiency
					me.unindexObject(value,root[key],path + "/" + key,id); //value._id id
				} else {
					if(value===null) {
						type = "undefined";
					}
					delete root[key][value][type][id];
					delete root[key][value][type].keys; // invalidate key list, will regen on query for efficiency
				}
			}
			if(object instanceof Array) {
				delete root.length[object.length].number[id];
				delete root.length[object.length].number.keys; // invalidate key list, will regen on query for efficiency
			} else if(object instanceof Set) {
				delete root.size[object.size].number[id];
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
							if(JOQULAR.constructors[type]) { // an object needs to be created
								var id = Object.keys(keymap[value][type])[0];
								instancemap[id] = (instancemap[id] ? instancemap[id] : Object.create(JOQULAR.constructors[type].prototype));
								if(instancemap[id]._id) { // object already existed
									objectvalues.push(instancemap[id][thekey]);
								} else { // add id, constructor, flag for population
									instancemap[id]._id = id;
									instancemap[id].constructor = JOQULAR.constructors[type];
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
			if(cons.get) { // get defined by wrapping persistence engine
				return cons.get(uuid).then(function(data) {
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
			Object.keys(pattern).every(function(patternkey) { // walk the pattern to collect literal matches and load indexes if required
				if(patternkey==="_id" || patternkey.indexOf("$")===0) {
					return true;
				}
				var keymap = basekeymap, testvalue = pattern[patternkey], type = (testvalue==null ? "undefined" : typeof(testvalue));
				objectKeys.push(patternkey);
				if(testvalue instanceof Object){
					results = (results ? intersection(results,cons.findIds(testvalue,objectKeys,results)) : cons.findIds(testvalue,objectKeys,results));	
				} else { // else, if recursion not required, assemble data and do tests
					keymap = keymap[patternkey];
					if(!keymap || !keymap[testvalue] || !keymap[testvalue][type]) {
						return false;
					}
					if(!keymap[testvalue][type].keys) { // if not cached, lookup and cache
						Object.defineProperty(keymap[testvalue][type],"keys",{enumerable:false,writable:false,value:Object.keys(keymap[testvalue][type])});
					}
					results = (results ? intersection(results,keymap[testvalue][type].keys) : keymap[testvalue][type].keys);
				}
				objectKeys.pop();
				return results && results.length>0 // if there are no results at this point, then abort every
			});
			Object.keys(pattern).every(function(patternkey) { // walk the pattern to collect non literal matches
				if(patternkey==="_id" || patternkey.indexOf("$")!==0) {
					return true;
				}
				var keymap = basekeymap, testvalues = [pattern[patternkey]], objects = {}, objectvalues = [], type = (testvalues[0]==null ? "undefined" : typeof(testvalues[0])), types = [];
				objectKeys.push(patternkey);
				// handle values that require recursion, e.g. {name: {$eq: {$self '/child/name'}}}
				var hasself = (pattern[patternkey] && pattern[patternkey].$self ? true : false);
				if(patternkey!=="$self" && testvalues[0] instanceof Object && !(testvalues[0] instanceof Function) && (hasself || !(patternkey.indexOf("$")===0 && JOQULAR.predicates[patternkey]))){
					results = (results ? intersection(results,cons.findIds(pattern[patternkey],objectKeys,results)) : cons.findIds(pattern[patternkey],objectKeys,results));	
				} else { // else, if recursion not required, assemble data and do tests
					Object.keys(keymap).forEach(function(value) {
						Object.keys(keymap[value]).forEach(function(type) {
							if(isDataType(type) && keymap[value][type]) {
								types.push(type);
								if(JOQULAR.constructors[type]) { // an object needs to be created
									var nestedid = value, uuid = Object.keys(keymap[value][type])[0];
									instancemap[uuid] = (instancemap[uuid] ? instancemap[uuid] : Object.create(JOQULAR.constructors[type].prototype));
									if(instancemap[uuid]._id) { // object already existed
										objectvalues.push(instancemap[uuid][thekey]);
									} else { // add uuid, constructor, flag for population
										instancemap[uuid]._uuid = uuid;
										instancemap[uuid].constructor = JOQULAR.constructors[type];
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
					//loadFromIndex(objects,keymap,objectvalues);
	
					if(patternkey==="$self") {
						testvalues = cons.self(pattern[patternkey],keymap,types); // should we actually be limiting types?
						patternkey = objectKeys[objectKeys.length-2];
					}
					var tmpresults = [];
					objectvalues.every(function(objectvalue) { // test the values assembled
						passed = false;
						//objectvalue = (isPrimitive(objectvalue) ? objectvalue.valueOf() : objectvalue);
						//type = (objectvalue===null || objectvalue.valueOf()===null ? "undefined" : typeof(objectvalue));
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
							objectvalue = (isPrimitive(objectvalue) ? objectvalue.valueOf() : objectvalue);
							type = (objectvalue===null || objectvalue.valueOf()===null ? "undefined" : typeof(objectvalue));
							if(objectvalue instanceof Object) {
								tmpresults.push(objectvalue._id);
							} else if(keymap[objectvalue] && keymap[objectvalue][type]) { // when arrays are loaded, objects of wrong type can be added to object list, this skips them
								if(!keymap[objectvalue][type].keys) { // if not cached, lookup and cache
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
		
	JOQULAR.constructors = {Array:Array,Set:Set,Map:Map,Date:Date};
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
			.method(function(arg) { 
				return supports(this,"between") && arg instanceof Array; },
				function(arg) { return this.between(arg[0],arg[1]); }),
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
			.method(function(arg) { return supports(this,"before") && !(arg instanceof Array); },function(arg) { return this.before(arg); })
			.method(function(arg) { return supports(this,"before") && arg instanceof Array; },function(arg) { return this.before(arg[0],arg[1]); }),
		$adjacentOrBefore: generic()
			.method(function(arg) { return supports(this,"adjacentOrBefore") && !(arg instanceof Array); },function(arg) { return this.adjacentOrBefore(arg); })
			.method(function(arg) { return supports(this,"adjacentOrBefore") && arg instanceof Array; },function(arg) { return this.adjacentOrBefore(arg[0],arg[1]); }),
		$adjacentBefore: generic()
			.method(function(arg) { return supports(this,"adjacentBefore") && !(arg instanceof Array); },function(arg) { return this.adjacentBefore(arg); })
			.method(function(arg) { return supports(this,"adjacentBefore") && arg instanceof Array; },function(arg) { return this.adjacentBefore(arg[0],arg[1]); }),
		$adjacent: generic()
			.method(function(arg) { return supports(this,"adjacent") && !(arg instanceof Array); },function(arg) { return this.adjacent(arg); })
			.method(function(arg) { return supports(this,"adjacent") && arg instanceof Array; },function(arg) { return this.adjacent(arg[0],arg[1]); }),
		$adjacentAfter: generic()
			.method(function(arg) { return supports(this,"adjacentAfter") && !(arg instanceof Array); },function(arg) { return this.adjacentAfter(arg); })
			.method(function(arg) { return supports(this,"adjacentAfter") && arg instanceof Array; },function(arg) { return this.adjacentAfter(arg[0],arg[1]); }),
		$adjacentOrAfter: generic()
			.method(function(arg) { return supports(this,"adjacentOrAfter") && !(arg instanceof Array); },function(arg) { return this.adjacentOrAfter(arg); })
			.method(function(arg) { return supports(this,"adjacentOrAfter") && arg instanceof Array; },function(arg) { return this.adjacentOrAfter(arg[0],arg[1]); }),
		$after: generic()
			.method(function(arg) { return supports(this,"after") && !(arg instanceof Array); },function(arg) { return this.after(arg); })
			.method(function(arg) { return supports(this,"after") && arg instanceof Array; },function(arg) { return this.after(arg[0],arg[1]); }),
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
	JOQULAR.createIndexedDBStore = IndexedDBStore.create;
	JOQULAR.db = function(name,location) {
		return new Database(name,location);
	}
	JOQULAR.clear = function() {
		if(typeof(window)==="object") {
			window.localStorage.clear();
		}
	}
	
	function AnonymousEntity() {
		
	}
	AnonymousEntity = new JOQULAR.Entity(AnonymousEntity,"AnonymousEntity");
	module.exports = JOQULAR;
//	if (typeof(module) != 'undefined' && module.exports) {
//		module.exports = JOQULAR;
//	} else if (typeof define === 'function' && define.amd) {
//		// Publish as AMD module
//		define(function() {return JOQULAR;});
//	} else {
//		// Publish as global (in browsers)
//		var _previousRoot = _global.JOQULAR;
//		// **`noConflict()` - (browser only) to reset global 'uuid' var**
//		JOQULAR.noConflict = function() {
//			_global.JOQULAR = _previousRoot;
//			return JOQULAR;
//		};
//		_global.JOQULAR = JOQULAR;
//	}
}).call(this);