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
	function toPredicate(f) {
		var predicate = function() {
			if(arguments[0] instanceof Array && f.length>1) {
				return f.apply(this,arguments[0]);
			}
			return f.apply(this,arguments);
		};
		predicate.predicate = true;
		return predicate;
	}
	function toProvider(f) {
		f.provider = true;
		return f;
	}
	function Null() {
		
	}
	(Null.prototype.eq = function(value) { return value===null; }).predicate = true;
	(Null.prototype.neq = function(value) { return value!==null; }).predicate = true;
	(Null.prototype["in"] = function(value) {
		return value && value.contains && value.contains(this);
	}).predicate=true;
	(Null.prototype.nin = function(value) {
		return !value || !value.contains || !value.contains(this);
	}).predicate=true;
	Null.prototype.valueOf = function() { return null; }
	var NULL = new Null();
	
	function toObject(value) {
		if(value===undefined) {
			return undefined;
		}
		if(value===null) {
			return NULL;
		}
		if(typeof(value)==="object" || typeof(value)==="function") {
			return value;
		}
		var type = typeof(value);
		switch(type) {
		case "string": return new String(value);
		case "number": return new Number(value);
		case "boolean": return new Boolean(value);
		}
		return undefined; // should this actually throw an error?
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
	/*
	* http://www.anujgakhar.com/2014/03/01/binary-search-in-javascript/
	* Improvements 2015 by AnyWhichWay
	*/
	function binarySearch(array, key) {
	    var lo = 0,
	        hi = array.length - 1,
	        mid,
	        element,
	        results = [];
	    while (lo <= hi) {
	        mid = ((lo + hi) >> 1);
	        element = array[mid];
	        if (element < key) {
	            lo = mid + 1;
	        } else if (element > key) {
	            hi = mid - 1;
	        } else {
	            if(array[mid]===key || (key && array[mid]===key.valueOf())) {
	            	results.push(mid);
	            	while(array[mid]===key || (key && array[mid]===key.valueOf())) {
		            	mid++;
					}
	            	results.push(mid-1);
	            }
	            return results;
	        }
	    }
	    return results;
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
	function joqularMatch(pattern,scope) {
		scope || (scope = [this]);
		var me = this;
		if(pattern===undefined || pattern.valueOf()===undefined) {
			return null;
		}
		if(pattern===me || pattern===me.valueOf() || (pattern!=null && pattern.valueOf()===me.valueOf())) {
			return me;
		}
		if(typeof(pattern)==="function" && pattern.deferred) {
			pattern = pattern.call(this,this.valueOf());
		}
		if(pattern!=null && typeof(pattern)==="object") {
			if(pattern.$$ && typeof(pattern.$$)==="function") {
				if(pattern.$$.call(scope[0])) {
					return me;
				}
				return null;
			}
			if(pattern.$ && typeof(pattern.$)==="function") {
				if(pattern.$(me.valueOf())) {
					return me;
				}
				return null;
			}
			scope.push(me);
			if(Object.keys(pattern).every(function(key) {
				if(key==="forall" || key==="exists") {
					return pattern[key](me);
				}
				var value1 = toObject(me[key]), value2 = pattern[key], type = typeof(value2);
				if(value1!==undefined) {
					if(value2!=null &&  (type==="object" || type==="function")) {
						if(type==="function" && value2.deferred) {
							value2 = value2(value1);
							type = typeof(value2);
						} else {
							var path;
							var possiblepath = Object.keys(value2)[0];
							if(possiblepath) {
								var anchor = null;
								if(possiblepath.indexOf("/")===0) {
									anchor = scope[0];
									path = possiblepath.substring(1).split(".");
									if(path[0]==="") {
										path.shift();
									}
								} else if(possiblepath.indexOf("..")===0) {
									if(scope.length-3<0) { return false; }
									anchor = scope[scope.length-3];
									path = possiblepath.substring(2).split(".");
									if(path[0]==="") {
										path.shift();
									}
								} else if(possiblepath.indexOf(".")===0) {
									if(scope.length-2<0) { return false; }
									anchor = scope[scope.length-2];
									path = possiblepath.substring(1).split(".");
									if(path[0]==="") {
										path.shift();
									}
								}
								if(anchor) {
									path.push(value2[possiblepath]);
									for(var i=0;i<path.length;i++) {
										anchor = anchor[path[i]];
										if(anchor===undefined) {
											return false;
										}
									}
									value2 = anchor;
								}
							}
						}
					}
					//if(key==="@" && value1 instanceof Object) {
					//	if(value1.history instanceof History) {
					//		return value1.history.joqularMatch(value2);
					//	}
					//	return false;
					//}
					return (value1===value2 || 
						(value1!=null && value1.valueOf()===value2) ||
						(value2!=null && value1===value2.valueOf()) || 
						(value1!=null && value2!=null && value1.valueOf()===value2.valueOf()) ||
						(typeof(value1)==="function" && value1.predicate && value1.call(me,value2)) ||
						(typeof(value1)==="function" && value1.provider && value1.call(me)===value2) ||
						(typeof(value1)!=="function" && value1.joqularMatch && value1.joqularMatch(value2,scope)));
				}
				return false;
			})) {
				scope.pop();
				return this;
			}
			scope.pop();
			return null;
		}
		return null;
	};
	function joqularValues(scope,type) {
		if(!scope || !scope[type]) {
			return [];
		}
		if(!scope[type].joqularValues) {
			var values = Object.keys(scope[type]);
			switch(type) {
			case "number": values.forEach(function(value,i) { if(value!=="joqularValues") { values[i] = parseFloat(value); }}); values.sort(function(a,b) { return a - b; }); break;
			case "boolean": values.forEach(function(value,i) { if(value!=="joqularValues") { values[i] = (value==="true"); }}); values.sort(); break;
			case "string": values.sort(); break;
			case "undefined": values = [null]; break;
			}
			Object.defineProperty(scope[type],"joqularValues",{enumerable:false,configurable:true,writable:true,value:values});
		}
		return scope[type].joqularValues;
	}
	function joqularIndexValue(id,value,index,key,type) {
		index[key] || (index[key] = {});
		index[key][type] || (index[key][type] = {});
		index[key][type][value] || (index[key][type][value] = {});
		index[key][type][value][id] = 1;
		delete index[key][type].joqularValues; // remove cached values, they will be regenerated by first query
	}
	function joqularIndexFunction(id,func,index,key) {
		if(func.predicate || func.provider) {
			index["function"] || (index["function"] = {});
			(index["function"][key] && typeof(index["function"][key])!=="function") || (index["function"][key] = {}); // index is a dumb object, so if there is a function, ok to overwrite
			index["function"][key][id] = 1;
		}
	}
	function joqularIndex(id,instance,index,blockObserve) {
		blockObserve = (blockObserve===undefined ? false : blockObserve);
		var constructor = this;
		if(instance==null || typeof(instance)==="function") {
			return;
		}
		if(!blockObserve) {
			Object.observe(instance,function(changes) { 
				joqularUpdate.call(constructor,id,changes,index);
			});
		}
		var instancetype = typeof(instance.valueOf());
		var keys = Object.getOwnPropertyNames(instance);
		keys = keys.concat(Object.getOwnPropertyNames(Object.getPrototypeOf(instance)));
		keys = keys.filter(function(key) {
			if(key==="__proto__") {
				return false;
			}
			var value = instance[key], type = typeof(value);
			if(type==="function") {
				return value.predicate || value.provider;
			}
			if(instancetype==="string") {
				return isNaN(parseInt(key));
			}
			return true;
		});
		keys.forEach(function(key) {
			var value = instance[key], type;
			if(value!==undefined) {
				if(value===null) {
					type = "undefined";
				} else {
					value = value.valueOf();
					type = typeof(value);
				}
				if(type==="function") {
					joqularIndexFunction.call(constructor,id,value,index,key);
				} else if(value!=null && type==="object" && instance===instance.valueOf()){ // instance!==instance.valueOf() for primitive types, need this to stop recursion
					index[key] || (index[key] = {});
					joqularIndex.call(constructor,id,value,index[key]);
				} else if(value===null || type!=="object") {
					index[key] || (index[key] = {});
					joqularIndex.call(constructor,id,toObject(value),index[key],true);
				}
				if(value===null) {
					type = "undefined";
				}
				if(["number","boolean","string","undefined"].indexOf(type)>=0) {
					joqularIndexValue.call(constructor,id,value,index,key,type);
				}
			}
		});
	}
	function joqularUpdate(id,changes,index) {
		var constructor = this;
		changes.forEach(function(change) {
			var key = change.name, value = change.object[key];
			if(change.type==="update" || change.type==="delete") {
				var type = typeof(change.oldValue);
				if(change.oldValue instanceof Object) {
					joqularDelete.call(constructor,id,change.oldValue,index[key]);
				} else if(index[key][type][change.oldValue]) {
					delete index[key][type][change.oldValue][id];
				}
			}
			if(change.type==="add") {
				index[key]={};
			}
			if(change.type==="update" || change.type==="add") {
				var value = change.object[key],type = typeof(value);
				if(value instanceof Object) {
					if(type==="function") {
						joqularIndexFunction.call(constructor,value,index,key);
					} else {
						joqularIndex.call(constructor,id,value,index[key]);
					}
				} else {
					joqularIndexValue.call(constructor,id,value,index,key,type)
				}
			}
			return;
		});
	}
	function joqularDelete(id,instance,index) {
		var constructor = this;
		if(index) {
			var keys = Object.keys(instance);
			keys.forEach(function(key) {
				if(index[key]) {
					var value = instance[key], type = typeof(value);
					if(value instanceof Object) {
						joqularDelete.call(constructor,value,index[key]);
					} else if(index[key][type] && index[key][type][value]){
						delete index[key][type][value][id];
					}
				}
			});
		}
	}
	function joqularFind(pattern,index,rootpattern,results,scopes,scopekeys,out) {
		if(pattern==null || index==null) return [];
		rootpattern || (rootpattern = pattern);
		out || (out = {});
		var constructor = this, keys = Object.keys(pattern), scope = (scopes ? scopes[0] : this);
		if(pattern instanceof Date) keys.push("time");
		keys.every(function(key) {
			var value = pattern[key], type, matches = [], firstsubkey, subisref = false, scopekey = (scopekeys ? scopekeys[0] : key);
			if(value === null) {
				type = "undefined";
			} else {
				value = value.valueOf();
				type = typeof(value);
			}
			if(index[key] && index[key][type] && index[key][type][value]) {
				var ids = Object.keys(index[key][type][value]);
				ids.forEach(function(id) {
					if(out[id]) return;
					if(constructor.ids[id]) {
						if(constructor.ids[id].joqularMatch(rootpattern)) {
							matches.push(constructor.ids[id]);
							return;
						}
						out[id] = true;
					} else {
						delete index[key][type][value][id];
					}
				});
				results = (results ? intersection(results,matches) : matches);
				return results.length > 0;
			}
			if(type==="object") {
				firstsubkey = Object.keys(value)[0];
				subisref = (firstsubkey && (firstsubkey.indexOf("/")===0 || firstsubkey.indexOf(".")===0));
			}
			if(type!=="object" && type!=="function" && ["lt","lte","eq","neq","gte","gt"].indexOf(key)>=0) {
				var test = key;
				// ugh, table scan because there are no records selected yet and there might be a null value in the database
				if(test==="neq" && !results) {
					results = [];
					var ids = Object.keys(constructor.ids);
					ids.forEach(function(id) {
						if(id!="nextId" && !out[id]) {
							if(constructor.ids[id].joqularMatch(rootpattern)) {
								results.push(constructor.ids[id]);
								return;
							}
							out[id] = true;
						}
					});
					return results.length > 1;
				}
				var types = (type==="undefined" ? ["string","number","boolean","undefined"] : [type]);
				types.forEach(function(type) {
					var values = joqularValues(scope[scopekey],type), ids = [];
					if(values.length===0) return;
					// instance values are in ascending order so we can do some optimizations
					if(test==="eq") {
						var i = values.bsearch(value)[0];
						if(i>=0) {
							var instancevalue = values[i];
							ids = Object.keys(scope[scopekey][type][instancevalue]);
						}
					} else if(["lt","lte","neq"].indexOf(test)>=0) {
						for(var i=0;i<values.length;i++) {
							var instancevalue = values[i];
							if(test==="lt") {
								if(instancevalue < value) {
									ids = ids.concat(Object.keys(scope[scopekey][type][instancevalue]));
									continue;
								}
								break;
							} else if(test==="lte") {
								if(instancevalue <= value) {
									ids = ids.concat(Object.keys(scope[scopekey][type][instancevalue]));
									continue;
								}
								break;
							} else { //neq
								if(instancevalue !== value) {
									ids = ids.concat(Object.keys(scope[scopekey][type][instancevalue]));
								}
								continue;
							}
						}
					} else { // gte, gt}
						for(var i=values.length-1;i>=0;i--) {
							var instancevalue = values[i];
							if(test==="gte") {
								if(instancevalue >= value) {
									ids = ids.concat(Object.keys(scope[scopekey][type][instancevalue]));
									continue;
								}
								break;
							} else if(test==="gt") {
								if(instancevalue > value) {
									ids = ids.concat(Object.keys(scope[scopekey][type][instancevalue]));
									continue;
								}
								break;
							}
						}
					}
					ids.forEach(function(id) {
						if(out[id]) return;
						if(constructor.ids[id]) {
							if(constructor.ids[id].joqularMatch(rootpattern)) {
								matches.push(constructor.ids[id]);
								return;
							}
							out[id] = true;
						} else {
							delete scope[scopekey][type][instancevalue][id];
						}
					});
				});
				results = (results ? intersection(results,matches) : matches);
				return results.length > 0;
			}
			if(key==="forall" && type=="function") {
				if(results) {
					if(results.every(function(object) {
						if(value(object)) {
							matches.push(object);
							return true;
						}
						return false;
					})) {
						results = (results ? intersection(results,matches) : matches);
						return results.length > 0;
					}
					matches = [];
					results = [];
					return false;
				} else {
					var ids = Object.keys(constructor.ids);
					if(ids.every(function(id) {
						if(id==="nextId" || out[id]) return true;
						if(value(constructor.ids[id])) {
							matches.push(constructor.ids[id]);
							return true;
						}
						out[id] = true;
						return false;
					})) {
						results = matches;
						return results.length > 0;
					}
					matches = [];
					results = [];
					return false;
				}
			}
			if(key==="exists" && type=="function") {
				if(results) {
					if(results.some(function(object) {
						if(value(object)) {
							return true;
						}
						return false;
					})) {
						return results.length > 0;
					}
					matches = [];
					results = [];
					return false;
				} else {
					var ids = Object.keys(constructor.ids);
					if(ids.some(function(id) {
						if(id==="nextId" || out[id]) return false;
						if(value(constructor.ids[id])) {
							return true;
						}
						return false;
					})) {
						results = [];
						ids.forEach(function(id) {
								results.push(constructor.ids[id]);
						});
						return results.length > 0;
					}
					matches = [];
					results = [];
					return false;
				}
			}
			if(key==="$$" && type==="function") {
				var f = value;
				if(results) {
					results = results.filter(function(object) { return value.call(object); })
					return results.length > 0;
				} else {
					["string","number","boolean","undefined"].forEach(function(type) {
						var values =  joqularValues(scope[scopekey],type);
						values.forEach(function(value) {
							var ids = Object.keys(scope[scopekey][type][value]);
							ids.forEach(function(id) {
								if(id!="nextId" && !out[id]) {
									if(constructor.ids[id]) {
										if(f.call(constructor.ids[id]) && constructor.ids[id].joqularMatch(rootpattern)) {
											matches.push(constructor.ids[id]);
											return;
										}
										out[id] = true;
									} else {
										delete scope[scopekey][type][value][id];
									}
								}
							});
						});
					});
					results = (results ? intersection(results,matches) : matches);
					return results.length > 0;
				}
			}
			if(key==="$" && type==="function") {
				var f = value;
				["string","number","boolean","undefined"].forEach(function(type) {
					var values =  joqularValues(scope[scopekey],type);
					values.forEach(function(value) {
						if(f(value)) {
							var ids = Object.keys(scope[scopekey][type][value]);
							ids.forEach(function(id) {
								if(id!="nextId" && !out[id]) {
									if(constructor.ids[id]) {
										if(constructor.ids[id].joqularMatch(rootpattern)) {
											matches.push(constructor.ids[id]);
											return;
										}
										out[id] = true;
									} else {
										delete scope[scopekey][type][value][id];
									}
								}
							});
						}
					});
				});
				results = (results ? intersection(results,matches) : matches);
				return results.length > 0;
			}
			if((subisref || key.indexOf("/")===0 || key.indexOf(".")===0)) {
				if(!results) {
					results = [];
					var ids = Object.keys(constructor.ids);
					ids.forEach(function(id) {
						if(id!="nextId") {
							if(constructor.ids[id].joqularMatch(rootpattern)) {
								results.push(constructor.ids[id]);
								return;
							}
							out[id] = true;
						}
					});
				} else {
					results = results.filter(function(object) {
					return object.joqularMatch(rootpattern);
					});
				}
				return results.length > 0;
			}
			if(scope[scopekey] && scope[scopekey]["function"] && scope[scopekey]["function"][key]) {
				var ids = Object.keys(scope[scopekey]["function"][key]);
				ids.forEach(function(id) {
					if(!out[id] && constructor.ids[id]) {
						var i = scopekeys.length-1, object = constructor.ids[id];
						while(i>0) {
							object = object[scopekeys[i]];
							if(!object) return;
							i--;
						}
						var instancevalue = object[scopekeys[i]];
						if(instancevalue && typeof(instancevalue[key])==="function") {
							if(instancevalue[key].provider) {
								if(instancevalue[key]()===value) {
									if(constructor.ids[id].joqularMatch(rootpattern)) {
										matches.push(constructor.ids[id]);
										return;
									}
									out[id] = true;
								}
							} else if(instancevalue[key](value)) { // otherwise we know it is a predicate
								if(constructor.ids[id].joqularMatch(rootpattern)) {
									matches.push(constructor.ids[id]);
									return;
								}
								out[id] = true;
							}
						}
					} else {
						delete scope[scopekey]["function"][key][id];
					}
				});
				// not finalizing results here is intentional, there may be non-function oriented but same named matches
			}
			if(type==="object") {
				scopes || (scopes = []);
				scopes.unshift(index);
				scopekeys || (scopekeys = []);
				scopekeys.unshift(key);
				var submatches = joqularFind.call(constructor,pattern[key],index[key],rootpattern,results,scopes,scopekeys,out);
				scopes.shift();
				scopekeys.shift();
				matches = matches.concat(submatches);
			}
			results = (results ? intersection(results,matches) : matches);
			return results.length > 0;
		});
		return (results || []);
	}
	var JOQULAR = {
			enhance: function(constructor,config) {
				function createIndex(cons,auto,async,name) {
					auto = (auto===undefined ? true : auto);
					name || (name = cons.name);
					var newcons = Function("root","cons","auto","async","return function " + name + "() {var me = this;if(!(me instanceof " + name + ")) { me = new " + name + "(); } cons.apply(me,arguments); Object.defineProperty(me,'constructor',{enumerable:false,value:" + name + "}); return (auto ? " + name + ".joqularIndex(me,async) : me); }")(constructor,cons,auto,async);
					var keys = Object.getOwnPropertyNames(constructor);
					keys.forEach(function(key) {
						try {
							newcons[key] = constructor[key];
						} catch(e) {
							
						}
					});
					keys = Object.getOwnPropertyNames(cons);
					keys.forEach(function(key) {
						try {
							newcons[key] = cons[key];
						} catch(e) {
							
						}
					});
					newcons.ids = {};
					newcons.ids.nextId = 0;
					newcons.index = {};
					newcons.indexing = {};
					newcons.joqularClear = function(indexOnly,asynch) {
						var count = Object.keys(newcons.ids).length-1;
						newcons.ids = {};
						newcons.ids.nextId = 0;
						newcons.index = {};
						var promise;
						if(!indexOnly && newcons.joqularSave) {
							promise = newcons.joqularSave();
						} else {
							promise = new Promise(function(resolve,reject) { resolve(); });
						}
						if(typeof(asynch)==="function") {
							promise.then(function(count) {
								asynch(null,count);
							})["catch"](function(e) {
								asynch(e);
							});
							return null;
						}
						return promise;
					};
					newcons.prototype = Object.create(cons.prototype);
					if(config.datastore && config.datastore.name && config.datastore.type==="IndexedDB") {
						newcons.joqularSave = function(aysnch) {
							var me = this, tid;
							var promise = new Promise(function(resolve,reject) {
								me.dbVersion || (me.dbVersion = 1);
								var dbrequest = indexedDB.open(config.datastore.name,me.dbVersion);
								dbrequest.onupgradeneeded = function(event) {
									var db = event.target.result;
									if(!db.objectStoreNames.contains(name)) {
										db.createObjectStore(name, {  autoIncrement : true });
									}
								};
								dbrequest.onblocked = function(event) {
									reject(event);
								};
								dbrequest.onerror = function(event) {
									if(event.target.error.name==="VersionError" && event.target.error.message.indexOf(" less ")>=0) {
										event.cancelBubble = true;
										me.dbVersion++;
										me.joqularSave();
									} else {
										reject(event);
									}
								};
								dbrequest.onsuccess = function(event) {
									var db = event.target.result, objectstore;
									if(!db.objectStoreNames.contains(name)) {
										db.close();
										me.dbVersion++;
										me.joqularSave();
									} else {
										objectstore = db.transaction(name, "readwrite").objectStore(name);
										var request = objectstore.get("root");
										request.onsuccess = function(event) {
											var object = request.result;
											if(!object) {
												objectstore.add({ids:me.ids,index:me.index},"root");
											} else {
												object.ids = me.ids;
												object.index = me.index;
												objectstore.put(object,"root");
											}
											db.close();
											var count = Object.keys(me.ids).length - 1; // -1 for nextId key
											resolve(count);
										};
										request.onerror = function(event) {
											reject(event);
										}
									}
								};
							});
							if(typeof(asynch)==="function") {
								promise.then(function(count) {
									asynch(null,count);
								})["catch"](function(e) {
									asynch(e);
								});
								return null;
							} 
							/*else if(typeof(asynch)==="number") {
								tid = setTimeout(function() { tid = null; });
								
							}*/
							return promise;
						}
						newcons.joqularLoad = function(aysnch) {
							var me = this;
							var promise = new Promise(function(resolve,reject) {
								me.dbVersion || (me.dbVersion = 1);
								var dbrequest = indexedDB.open(config.datastore.name,me.dbVersion);
								dbrequest.onupgradeneeded = function(event) {
									var db = event.target.result;
									if(!db.objectStoreNames.contains(name)) {
										db.createObjectStore(name, {  autoIncrement : true });
									}
								};
								dbrequest.onblocked = function(event) {
									console.log(event);
									reject(event)
								};
								dbrequest.onerror = function(event) {
									if(event.target.error.name==="VersionError" && event.target.error.message.indexOf(" less ")>=0) {
										event.cancelBubble = true;
										me.dbVersion++;
										me.joqularLoad();
									} else {
										reject(event)
									}
								};
								dbrequest.onsuccess = function(event) {
									var db = event.target.result, objectstore;
									if(!db.objectStoreNames.contains(name)) {
										db.close();
										me.dbVersion++;
										me.joqularLoad();
									} else {
										objectstore = db.transaction(name).objectStore(name);
										var request = objectstore.get("root");
										request.onsuccess = function(event) {
											var object = request.result;
											if(object) {
												me.ids = {};
												var keys = Object.keys(object.ids);
												keys.forEach(function(id) {
													if(id!=="nextId") {
														me.ids[id] = Object.create(me.prototype);
														for(var property in object.ids[id]) {
															me.ids[id][property] = object.ids[id][property];
														}
														Object.defineProperty(me.ids[id],"constructor",{enumerable:false,value:me});
														me.ids.nextId = parseInt(id)+1;
													}
												});
												me.index = object.index;
											} else {
												me.ids = {};
												me.ids.nextId = 0;
												me.index = {};
											}
											db.close();
											var count = Object.keys(me.ids).length - 1; // -1 for nextId key
											resolve(count);
										};
									}
								};
							});
							if(typeof(asynch)==="function") {
								promise.then(function(count) {
									asynch(null,count);
								})["catch"](function(e) {
									asynch(e);
								});
								return null;
							}
							return promise;
						};
					}
					return newcons;
				}
				if(config.index===true) {
					config.enhancePrimitives = true;
					config.enhanceArray = true;
					config.ehhanceDate = true;
					constructor.joqularFind = function(pattern,wait) {
						function dowait(f) {
							if(Object.keys(me.indexing).length===0) {
								f();
							} else {
								setTimeout(function() { dowait(f) },100);
							}
						}
						var me = this;
						if(wait) {
							if(typeof(wait)==="function") {
								dowait(function() { wait(null,joqularFind.call(me,pattern,me.index)); });
							} else {
								return new Promise(function(resolve,reject) {
									dowait(function() { resolve(joqularFind.call(me,pattern,me.index)); });
								});
							}
						}
						return joqularFind.call(me,pattern,me.index);
					};
					constructor.joqularIndex = function(instance,async) {
						var me = this;
						var id = me.ids.nextId;
						me.ids.nextId++;
						me.ids[id] = instance;
						if(async) {
							var tid;
							if(typeof(async)==="function") {
								tid = setTimeout(function() { joqularIndex.call(me,id,instance,me.index); delete me.indexing[tid]; async(instance); },0);
								me.indexing[tid] = true;
								return tid;
							} else {
								var promise = new Promise(function(resolve,reject) {
									tid = setTimeout(function() { joqularIndex.call(me,id,instance,me.index); delete me.indexing[tid]; resolve(instance); },0);
								});
								me.indexing[tid] = promise;
								return promise;
							}
						}
						joqularIndex.call(me,id,instance,me.index);
						return instance;
					};
				};
				function Time(value,precision) {
					if(value==null) {
						value = new Date.getTime()
					} else if(value instanceof Time) {
						value = value.value;
					} else if(value instanceof Date) {
						value = value.getTime();
					} else if(value instanceof TimeSpan) {
						value = value.startingTime.valueOf();
					} else if(typeof(value)==="string") {
						value = Date.parse(value);
					}
					this.value = value;
					this.toPrecision(precision,true);
				};
				Time.prototype = Object.create(constructor.prototype);
				Time.prototype.valueOf = function() {
					return this.value;
				};
				Time.prototype.withPrecision = function(precision) {
					return this.toPrecision(precision,false);
				};
				Time.prototype.toPrecision = function(precision,modify) {
					modify = (modify || modify==null ? true : false);
					if(!precision || this.value===Infinity || this.value===-Infinity || isNaN(this.value)) {
						if(modify) {
							return this;
						}
						return new Time(this.value);
					}
					var Y1 = this.getFullYear();
					var M1 = (["M","D","h","m","s","ms"].indexOf(precision)!==-1 ? this.getMonth() : null);
					var D1 = (["D","h","m","s","ms"].indexOf(precision)!==-1 ? this.getDate() : null);
					var h1 = (["h","m","s","ms"].indexOf(precision)!==-1 ? this.getHours() : null);
					var m1 = (["m","s","ms"].indexOf(precision)!==-1 ? this.getMinutes() : null);
					var s1 = (["s","ms"].indexOf(precision)!==-1 ? this.getSeconds() : null);
					var ms1 = (["ms"].indexOf(precision)!==-1 ? this.getMilliseconds() : null);
					var date = new Date(Y1,M1,D1,h1,m1,s1,ms1);
					if(modify) {
						this.setTime(date.getTime());
						return this;
					}
					return new Time(date);
				};
				Time.prototype.lt = toPredicate(function(value,precision) {
					return new Time(this).withPrecision(precision).valueOf() < new Time(value,precision).valueOf();
				});
				Time.prototype.lte = toPredicate(function(value,precision) {
					if(value===this) {
						return true;
					}
					return new Time(this).withPrecision(precision).valueOf() <= new Time(value,precision).valueOf();
				});
				Time.prototype.eq = toPredicate(function(value,precision) {
					if(value===this) {
						return true;
					}
					return new Time(this).withPrecision(precision).valueOf() === new Time(value,precision).valueOf();
				});
				Time.prototype.neq = toPredicate(function(value,precision) {
					return new Time(this).withPrecision(precision).valueOf() !== new Time(value,precision).valueOf();
				});
				Time.prototype.gte = toPredicate(function(value,precision) {
					if(value===this) {
						return true;
					}
					return new Time(this).withPrecision(precision).valueOf() >= new Time(value,precision).valueOf();
				});
				Time.prototype.gt = toPredicate(function(value,precision) {
					return new Time(this).withPrecision(precision).valueOf() > new Time(value,precision).valueOf();
				});
				Time.prototype["in"] = toPredicate(function(value,precision) {
					if(value instanceof TimeSpan) {
						return value.contains(this);
					}
					return new Time(this,precision).valueOf() === new Time(value,precision).valueOf();
				});
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
								var dt = new Date(this.value);
								var result = dt[key].apply(dt,arguments);
								this.value = dt.getTime();
								return result;
						}
					}
				});
				function Duration(value,period) {
					period || (period = "ms");
					if(value instanceof Duration) {
						period = "ms";
						value = value.valueOf();
					}
					this.value = value * Duration.factors[period];
					this.range = 0;
				};
				Duration.factors = {
						Y: 31557600*1000,
						M: (31557600*1000)/12, // psuedo-month
						D: 24 * 60 * 60 * 1000,
						h: 60 * 60 * 1000,
						m: 60 * 1000,
						s: 1000,
						ms: 1
					}
				Duration.prototype = Object.create(constructor.prototype);
				Duration.prototype.valueOf = function() {
					return this.value;
				};
				Duration.prototype.lt = toPredicate(function(value,period) {
					period || (period = "s");
					return this.valueOf() / Duration.factors[period] < new Duration(value).valueOf()  / Duration.factors[period];
				});
				Duration.prototype.lte = toPredicate(function(value,period) {
					if(value===this) {
						return true;
					}
					period || (period = "s");
					return this.valueOf() / Duration.factors[period] <= new Duration(value).valueOf()  / Duration.factors[period];
				});
				Duration.prototype.eq = toPredicate(function(value,period) {
					if(value===this) {
						return true;
					}
					period || (period = "s");
					return this.valueOf() / Duration.factors[period] === new Duration(value).valueOf()  / Duration.factors[period];
				});
				Duration.prototype.neq = toPredicate(function(value,period) {
					period || (period = "s");
					return this.valueOf() / Duration.factors[period] !== new Duration(value).valueOf()  / Duration.factors[period];
				});
				Duration.prototype.gte = toPredicate(function(value,period) {
					if(value===this) {
						return true;
					}
					period || (period = "s");
					return this.valueOf() / Duration.factors[period] >= new Duration(value).valueOf()  / Duration.factors[period];
				});
				Duration.prototype.gt = toPredicate(function(value,period) {
					period || (period = "s");
					return this.valueOf() / Duration.factors[period] > new Duration(value).valueOf()  / Duration.factors[period];
				});
				Duration.prototype.atLeast = function() {
					this.range = -1;
				};
				Duration.prototype.atMost = function() {
					this.range = 1;
				};
				Duration.prototype.exact = function() {
					this.range = 0;
				};
				// need to define gt, lt etc. in context of range
				function TimeSpan(startingTime,endingTime) {
					if(startingTime instanceof TimeSpan) {
						return new TimeSpan(startingTime.startingTime,startingTime.endingTime);
					}
					this.startingTime = (startingTime!=null ? new Time(startingTime) : new Time(-Infinity));
					this.endingTime = (endingTime!=null ? new Time(endingTime) : new Time(Infinity));
					Object.defineProperty(this,"duration",{enumerable:true,configurable:false,get:function() { return this.endingTime - this.startingTime}, set: function() {}});
				};
				TimeSpan.prototype = Object.create(constructor.prototype);
				TimeSpan.prototype.contains = toPredicate(function(value,precision) {
					var startingTime = new Time(value.startingTime,precision);
					var endingTime = new Time(value.endingTime,precision);
					var time = new Time(value,precision);
					return startingTime.valueOf() <= time.valueOf() <= endingTime.valueOf();
				});
				TimeSpan.prototype.intersects = toPredicate(function(value,precision) {
					var startingTime = new Time(value.startingTime,precision);
					var endingTime = new Time(value.endingTime,precision);
					if(this.startingTime>=startingTime && this.startingTime<=endingTime) {
						return true;
					}
					if(this.endingTime<=value.endingTime && this.endingTime>=startingTime) {
						return true;
					}
					return false;
				});
				TimeSpan.prototype.disjoint = toPredicate(function(value,precision) {
					return !this.intersects(value,precision);
				});
				TimeSpan.prototype.coincident = toPredicate(function(value,precision) {
					var startingTime, endingTime;
					if(value instanceof Date || typeof(value)==="number") {
						startingTime = endingTime = new Time(value,precision);
					} else {
						startingTime = new Time(value.startingTime,precision);
						endingTime = new Time(value.endingTime,precision);
					}
					return new Time(this.startingTime,precision).valueOf()==startingTime.valueOf() && new Time(this.endingTime,precision).valueOf()==endingTime.valueOf();
				})
				TimeSpan.prototype.eq = toPredicate(function(value,precision) {
					if(this===value) {
						return true;
					}
					if(!value instanceof TimeSpan) {
						return false;
					}
					return new Time(this.startingTime,precision).valueOf() === new Time(value.startingTime,precision).valueOf() &&
						new Time(this.endingTime,precision).valueOf() === new Time(value.endingTime,precision).valueOf();
				});
				TimeSpan.prototype.adjacentOrBefore = toPredicate(function(value,precision) {
					return new Time(this.endingTime+new Duration(1,precision),precision).valueOf() <= new Time(value,precision).valueOf();
				});
				TimeSpan.prototype.before = toPredicate(function(value,precision) {
					return new Time(this.endingTime+new Duration(1,precision),precision).valueOf() < new Time(value,precision).valueOf();
				});
				TimeSpan.prototype.adjacentBefore = toPredicate(function(value,precision) {
					return new Time(this.endingTime+new Duration(1,precision),precision).valueOf() === new Time(value,precision).valueOf();
				});
				TimeSpan.prototype.adjacentOrAfter = toPredicate(function(value,precision) {
					var endingTime;
					if(value instanceof TimeSpan) {
						endingTime = new Time(value.endingTime,precision);
					} else {
						endingTime = new Time(value,precision);
					}
					return new Time(this.startingTime-new Duration(1,precision),precision).valueOf() >= endingTime.valueOf();
				});
				TimeSpan.prototype.after = toPredicate(function(value,precision) {
					var endingTime;
					if(value instanceof TimeSpan) {
						endingTime = new Time(value.endingTime,precision);
					} else {
						endingTime = new Time(value,precision);
					}
					return new Time(this.startingTime-new Duration(1,precision),precision).valueOf() > endingTime.valueOf();
				});
				TimeSpan.prototype.adjacentAfter = toPredicate(function(value,precision) {
					var endingTime;
					if(value instanceof TimeSpan) {
						endingTime = new Time(value.endingTime,precision);
					} else {
						endingTime = new Time(value,precision);
					}
					return new Time(this.startingTime-new Duration(1,precision),precision).valueOf() == endingTime.valueOf();
				});
				TimeSpan.prototype.adjacent = toPredicate(function(value,precision) {
					if(this.adjacentBefore(value,precision)) {
						return -1;
					}
					if(this.adjacentAfter(value,precision)) {
						return 1;
					}
					return 0;
				});
				constructor.prototype.joqularMatch = function(pattern,scope) {
					return joqularMatch.call(this,pattern,scope);
				};
				(constructor.prototype["instanceof"] = function(constructor) {
					return this instanceof constructor;
				}).predicate = true;
				constructor.prototype.eq = toPredicate(function(value) {
					// first clause handles an object or primitve and value===null or value===undefined
					// second clause handles everything else because primitives and Objects will return themselves with .valueOf()
					// array and other types of objects may need to override eq
					return this.valueOf() === value || 
						(value!=null && this.valueOf() === value.valueOf());
				});
				constructor.prototype.neq = toPredicate(function(value) {
					return !this.eq(value);
				});
				if(config.enhancePrimitives) {
					[Number,String,Boolean].forEach(function(primitive) {
						primitive.prototype.joqularMatch = constructor.prototype.joqularMatch;
						(primitive.prototype.lt = function(value) {
							return this.valueOf() < value || this.valueOf() < value.valueOf();
						}).predicate=true;
						(primitive.prototype.lte = function(value) {
							return this.valueOf() <= value || this.valueOf() <= value.valueOf();
						}).predicate=true;
						(primitive.prototype.eq = function(value) {
							value = toObject(value);
							return this === value || (value!==undefined && this.valueOf() === value.valueOf());
						}).predicate=true;
						(primitive.prototype.neq = function(value) {
							return !this.eq(value);
						}).predicate=true;
						(primitive.prototype.gte = function(value) {
							return this.valueOf() >= value || this.valueOf() >= value.valueOf();
						}).predicate=true;
						(primitive.prototype.gt = function(value) {
							return this.valueOf() > value || this.valueOf() > value.valueOf();
						}).predicate=true;
						(primitive.prototype["in"] = function(value) {
							return value && value.contains && value.contains(this);
						}).predicate=true;
						(primitive.prototype.nin = function(value) {
							return !value || !value.contains || !value.contains(this);
						}).predicate=true;
					});
				}
				String.prototype.echoes = toPredicate(function(value) {
					return soundex(this)===soundex(value);
				});
				String.prototype.soundex = String.prototype.echoes;
				String.prototype.match.predicate = true;
				if(config.enhanceDate) {
					Date.prototype.joqularMatch = constructor.prototype.joqularMatch;
					Object.defineProperty(Date.prototype,"time",{enumerable:true,configurable:false,set:function() { return; },get:function() { return this.getTime(); }});
					Date.prototype.lt = toPredicate(function(value,precision) {
						if(value instanceof TimeSpan) {
							return value.after(this,precision);
						}
						return new Time(this,precision) < new Time(value,precision);
					});
					Date.prototype.lte = toPredicate(function(value,precision) {
						if(value instanceof TimeSpan) {
							return value.adjacentOrAfter(this,precision);
						}
						return new Time(this,precision) <= new Time(value,precision);
					});
					Date.prototype.eq = toPredicate(function(value,precision) {
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
					});
					Date.prototype.neq = toPredicate(function(value,precision) {
						return new Time(this,precision).valueOf() !== new Time(value,precision).valueOf();
					});
					Date.prototype.gte = toPredicate(function(value,precision) {
						if(value instanceof TimeSpan) {
							return value.adjacentOrBefore(this,precision);
						}
						return new Time(this,precision).valueOf() >= new Time(value,precision).valueOf();
					});
					Date.prototype.gt = toPredicate(function(value,precision) {
						if(value instanceof TimeSpan) {
							return value.adjacentOrBefore(this,precision);
						}
						return new Time(this,precision).valueOf() >= new Time(value,precision).valueOf();
					});
					Date.prototype.before = Date.prototype.lt;
					Date.prototype.adjacentOrBefore = Date.prototype.lte;
					Date.prototype.after = Date.prototype.gt;
					Date.prototype.adjacentOrAfter = Date.prototype.gte;
					Date.prototype.coincident = toPredicate(function(value,precision) {
						if(value instanceof TimeSpan) {
							var d = new TimeSpan(this,this);
							return d.coincident(value,precision);
						}
						return this.eq(value,precision);
					});
					Date.prototype.disjoint = toPredicate(function(value,precision) {
						if(value instanceof TimeSpan) {
							var d = new TimeSpan(this,this);
							return d.disjoint(value,precision);
						}
						return this.neq(value,precision);
					});
					Date.prototype.intersects = toPredicate(function(value,precision) {
						if(value instanceof TimeSpan) {
							var d = new TimeSpan(this,this);
							return d.intersects(value,precision);
						}
						return this.eq(value,precision);
					});
				}
				if(config.enhanceArray) {
					Array.prototype.joqularMatch = constructor.prototype.joqularMatch;
					Array.prototype.count = toProvider(function(type) {
						return (!type ? this.length : this.filter(function(item) { return item && typeof(item.valueOf())===type; }).length);
					});
					Array.prototype.avg = toProvider(function(ignoreEnds) {
						var sum = 0;
						var copy = this.filter(function(item) { return item!=null && typeof(item.valueOf())==="number" && !isNaN(item.valueOf()); }).sort(function(a,b) { return a - b;});
						if(ignoreEnds && copy.length>2) {
							copy.shift();
							copy.pop();
						}
						for(var i=0;i<copy.length;i++) {
							sum += this[i].valueOf();
						}
						return sum / copy.length;
					});
					Array.prototype.stdev = toProvider(function(ignoreEnds) {
						return Math.sqrt(this.variance(ignoreEnds));
					})
					Array.prototype.variance = toProvider(function(ignoreEnds)
					{
					    var len = 0;
					    var sum = 0;
					    var arr = this.filter(function(item) { return item!=null && typeof(item.valueOf())==="number" && !isNaN(item.valueOf()); }).sort(function(a,b) { return a - b;});
						if(ignoreEnds && arr.length>2) {
							arr.shift();
							arr.pop();
						}
					    for(var i=0;i<arr.length;i++)
					    {
					             len = len + 1;
					             sum = sum + arr[i].valueOf(); 
					    }
					    var v = 0;
					    if (len > 1)
					    {
					        var mean = sum / len;
					        for(var i=0;i<arr.length;i++)
					        {
					              v = v + (arr[i] - mean) * (arr[i] - mean);                 
					        }
					        return v / len;
					    }
					    else
					    {
					       return 0;
					    }    
					});
					Array.prototype.every.predicate = true;
					Array.prototype.some.predicate = true;
					Array.prototype.sum = toProvider(function(ignoreEnds) {
						var sum = 0;
						var copy = this.filter(function(item) { return item!=null && typeof(item.valueOf())==="number" && !isNaN(item.valueOf()); }).sort(function(a,b) { return a - b;});
						if(ignoreEnds && copy.length>2) {
							copy.shift();
							copy.pop();
						}
						for(var i=0;i<copy.length;i++) {
							sum += this[i].valueOf();
						}
						return sum;
					});
					Array.prototype.min = toProvider(function(type,ignoreEnds) {
						type || (type="number");
						var i = 0;
						var copy = this.filter(function(item) { return item!=null && typeof(item.valueOf())===type && (!type==="number" || !isNaN(item.valueOf())); });
						if(type==="number") {
							copy.sort(function(a,b) { return a.valueOf() - b.valueOf();});
						} else {
							copy.sort();
						}
						if(ignoreEnds && copy.length>2) i++;
						return copy[i];
					});
					Array.prototype.max = toProvider(function(type,ignoreEnds) {
						type || (type="number");
						var copy = this.filter(function(item) { return item!=null && typeof(item.valueOf())===type && (!type==="number" || !isNaN(item.valueOf())); });
						if(type==="number") {
							copy.sort(function(a,b) { return a.valueOf() - b.valueOf();});
						} else {
							copy.sort();
						}
						var i = copy.length-1;
						if(ignoreEnds  && copy.length>2) i--;
						return copy[i];
					});
					Array.prototype.bsearch = function(value,sorter) {
						var me = this;
						if(sorter) {
							me = this.slice(0).sort(sorter);
						}
						return binarySearch(me,value);
					};
					Array.prototype.eq = toPredicate(function(value) {
						if(this===value) { return true; }
						if(!(value instanceof Array) || this.length!==value.length) {
							return false;
						}
						return this.every(function(item,i) {
							var v = value[i];
							if(item===v) {
								return true;
							}
							if(item instanceof constructor) {
								return item.eq(v);
							}
						});
					});
					Array.prototype.neq =  toPredicate(function(value) {
						return !this.eq(value);
					});
					Array.prototype.intersects =  toPredicate(function(value) {
						if(value instanceof Set) {
							value = Set.toArray()
						}
						var result = intersection(this,value);
						return result && result.length>0;
					});
					Array.prototype.disjoint =  toPredicate(function(value) {
						return !this.intersects(value);
					});
					Array.prototype.coincident =  toPredicate(function(value) {
						return this.count() === value.count() &&
							this.every(function(item) {
								return value.contains(item);
							});
					});					
					Array.prototype.contains =  toPredicate(function(value) {
						return this.some(function(item) {
							if(item===value ||
								(item!=null && item.valueOf()===value) ||
								(value!=null && item===value.valueOf()) || 
								(item!=null && value!=null && item.valueOf()===value.valueOf())) {
								return true;
							}
							if(typeof(item.eq)==="function") {
								return item.eq(value);
							}
							return false;
						});
					});
					Array.prototype.includes = Array.prototype.contains;
					Array.prototype.excludes =  toPredicate(function(value) {
						return !this.includes(value);
					});
				}
				if(config.enhanceSet) {
					Set.prototype.joqularMatch = constructor.prototype.joqularMatch;
					Set.prototype.count = function() {
						return this.size;
					};
					Set.prototype.toArray = function() {
						var array = [];
						this.forEach(function(item) {
							array.push(item);
						})
						return array;
					};
					Set.prototype.every =  toPredicate(function(f) {
						var array = this.toArray();
						return array.every(f)
					});
					Set.prototype.some =  toPredicate(function(f) {
						var array = this.toArray();
						return array.some(f)
					});
					Set.prototype.indexOf = function(value) {
						var array = this.toArray();
						return array.indexOf(value);
					};
					Set.prototype.contains =  toPredicate(function(value) {
						return (!value && this.has(value)) || this.has(value.valueOf());
					});
					Set.prototype.eq =  toPredicate(function(value) {
						var me = this;
						if(this===value) { return true; }
						if(!(value instanceof Set) || this.size!==this.size) {
							return false;
						}
						return me.every(function(item) {
							return value.has(item);
						});
					});
					Set.prototype.neq =  toPredicate(function(value) {
						return !this.eq(value);
					});
					Set.prototype.intersects =  toPredicate(function(value) {
						if(!value || typeof(value.contains)!=="function") {
							return false;
						}
						return this.some(function(item) {
							return value.contains(item);
						});
					});
					Set.prototype.disjoint =  toPredicate(function(value) {
						return !this.intersects(value);
					});
					Set.prototype.coincident =  toPredicate(function(value) {
						return typeof(value.count)==="function" && 
							this.count() === value.count() &&
							this.every(function(item) {
								return value.contains(item);
							});
					});
					Set.prototype.includes = Set.prototype.contains;
					Set.prototype.excludes =  toPredicate(function(value) {
						return !this.includes(value);
					});
				}
				JOQULAR.createIndex = createIndex;
				JOQULAR.TimeSpan = TimeSpan;
				JOQULAR.Time = Time;
				JOQULAR.Duration = Duration;
				return constructor;
			}
		}
	exports.JOQULAR = JOQULAR;
})("undefined"!=typeof exports&&"undefined"!=typeof global?global:window);