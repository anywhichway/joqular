(function(exports) {
	"use strict";
	function toObject(value) {
		if(value===null || value===undefined) {
			return value;
		}
		if(value instanceof Object) {
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
	/*
	* http://www.anujgakhar.com/2014/03/01/binary-search-in-javascript/
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
	            while(array[mid]===key) {
	            	results.push(mid);
	            	mid++;
	            }
	            return results;
	        }
	    }
	    return results;
	}
	/*
	 * https://github.com/Benvie
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
		if(pattern instanceof Object) {
//			if(typeof(pattern)==="function" && pattern.predicate) {
//				if(pattern.length===0) {
//					if(me.valueOf()===pattern()) {
//						return me;
//					}
//				} else if(pattern(me.valueOf())) {
//					return me;
//				}
//			}
			if(pattern.$ && typeof(pattern.$)==="function") {
				if(pattern.$(me.valueOf())) {
					return me;
				}
				return null;
			}
			scope.push(me);
			if(Object.keys(pattern).every(function(key) {
				var value1 = toObject(me[key]);
				var value2 = pattern[key];
				if(value1!==undefined) {
					if(value2 instanceof Object) {
						if(typeof(value2)==="function" && value2.deferred) {
							value2 = value2(value1);
						} else {
							let path;
							for(var possiblepath in value2) {
								let anchor;
								if(possiblepath.indexOf("/")===0) {
									anchor = scope[0];
									path = possiblepath.substring(1).split(".");
								} else if(possiblepath.indexOf("..")===0) {
									let i = scope.length-3;
									if(i<0) { return false; }
									anchor = scope[i];
									path = possiblepath.substring(2).split(".");
								} else if(possiblepath.indexOf(".")===0) {
									let i = scope.length-2;
									if(i<0) { return false; }
									anchor = scope[i];
									path = possiblepath.substring(1).split(".");
								}
								if(anchor) {
									for(let i=0;i<path.length-2;i++) {
										anchor = anchor[path[i]];
										if(anchor==null) {
											return false;
										}
									}
									value2 = anchor[value2[possiblepath]];
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
					return (value1===value2===null || 
						value1===value2===undefined ||
						value1.valueOf()===value2.valueOf() || 
						(typeof(value1)==="function" && value1.predicate && value1.call(me,value2)) ||
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
	function joqularValues(index,key,type) {
		if(!index[key][type].joqularValues) {
			var desc = Object.getOwnPropertyDescriptor(index[key][type],"joqularValues");
			if(!desc) {
				Object.defineProperty(index[key][type],"joqularValues",{enumerable:false,configurable:false,writable:true,value:null}); // create hidden value cache if does not exist, hidden so does not show in own keys
			}
			var values = Object.keys(index[key][type]);
			switch(type) {
			case "number": values.sort(function(a,b) { return a - b; }); break;
			case "boolean": values.sort(); break;
			case "string": values.sort(); break;
			}
			index[key][type].joqularValues = values;
		}
		return index[key][type].joqularValues;
	}
	function joqularIndexValue(id,value,index,key,type) {
		index[key] || (index[key] = {});
		index[key][type] || (index[key][type] = {});
		index[key][type][value] || (index[key][type][value] = {});
		index[key][type][value][id] = 1;
		index[key][type].joqularValues = null; // remove cached values, they will be regenerated by first query
	}
	function joqularIndexFunction(id,func,index,key) {
		if(func.predicate) {
			index[key] || (index[key] = {});
			index[key]["function"] || (index[key]["function"] = {});
			index[key]["function"].predicate = true;
			index[key]["function"][id] || (index[key]["function"][id] = {});
			index[key]["function"][id] = 1;
		}
	}
	function joqularIndex(id,instance,index) {
		//var s = JSON.stringify(instance);
		//console.time("joqularIndex " + id + " " + s);
		var constructor = this;
		if(instance==null || typeof(instance)==="function") {
			return;
		}
		Object.observe(instance,function(changes) { 
			joqularUpdate.call(constructor,id,changes,index);
			});
		var keys = Object.getOwnPropertyNames(instance);
		keys = keys.concat(Object.getOwnPropertyNames(Object.getPrototypeOf(instance)));
		keys.filter(function(key) {
			var value = instance[key], type = typeof(value);
			if(type==="function") {
				return value.predicate;
			}
			return true;
		});
		keys.forEach(function(key) {
			var value = instance[key];
			if(value!==undefined) {
				var type = typeof(value);
				if(value instanceof Object) {
					if(type==="function") {
						joqularIndexFunction.call(constructor,id,value,index,key);
					} else {
						index[key] || (index[key] = {});
						joqularIndex.call(constructor,id,value,index[key]);
					}
				} else {
					if(value === null) {
						type = "undefined";
					}
					joqularIndexValue.call(constructor,id,value,index,key,type);
				}
			}
		});
		//console.timeEnd("joqularIndex " + id + " " + s);
	}
	function joqularUpdate(id,changes,index) {
		var constructor = this;
		changes.forEach(function(change) {
			var key = change.name, value = change.object[key];
			if(change.type==="update" || change.type==="delete") {
				let type = typeof(change.oldValue);
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
				let value = change.object[key],type = typeof(value);
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
	function joqularFind(pattern,index,results) {
		if(pattern==null || index==null) {
			return [];
		}
		var constructor = this;
		var keys = Object.keys(pattern);
		keys.every(function(key) {
			var value = pattern[key], type = typeof(value), subkey, matches = [], test;
			if(value === null) {
				type = "undefined";
			}
			if(value instanceof Object) {
				var subkey = Object.keys(value)[0], test;
				if(["lt","lte","eq","neq","gte","gt"].indexOf(subkey)>=0) {
					test = subkey;
					value = value[subkey];
					if(value===null) {
						type = "undefined";
					} else {
						type = typeof(value);
					}
					if(value instanceof Object) {
						return false;
					}
				} else if(index[key] && index[key][subkey] && index[key][subkey]["function"] && index[key][subkey]["function"].predicate) {
					let ids = Object.keys(index[key][subkey]["function"]);
					value = value[subkey];
					ids.forEach(function(id) {
						if(id!=="predicate") {
							if(constructor.ids[id]) {
								if(constructor.ids[id][key][subkey].length===0) {
									if(constructor.ids[id][key][subkey]()===value) {
										matches.push(constructor.ids[id]);
									}
								} else if(constructor.ids[id][key][subkey](value)) {
									matches.push(constructor.ids[id]);
								}
							} else {
								delete index[key][subkey]["function"][id];
							}
						}
					});
					results = (results ? intersection(results,matches) : matches);
					return results.length > 0;
				} else {
					let subresults = joqularFind.call(constructor,pattern[key],index[key],results);
					results = (results ? intersection(results,subresults) : subresults);
					return results.length>0;
				}
			}
			if(index[key]) {
				if(index[key][type] && index[key][type][value] instanceof Object) {
					let ids = Object.keys(index[key][type][value])
					ids.forEach(function(id) {
						if(constructor.ids[id]) {
						//	if(index[key][type][value][id].joqularMatch(pattern)) {
								matches.push(constructor.ids[id]);
						//	}
						} else {
							delete index[key][type][value][id];
						}
					});
					results = (results ? intersection(results,matches) : matches);
					return results.length > 0;
				} else if(!(index[key][type] && index[key][type][value] instanceof Object)) {
					test || (test = "eq");
					let types = (type==="undefined" ? ["string","number","boolean","undefined"] : [type]);
					types.forEach(function(type) {
						if(index[key][type]) {
							let values =  joqularValues(index,key,type);
							// instance values are in ascending order so we can do some optimizations
							if(test==="eq") {
								let i = values.bsearch(value)[0];
								if(i>=0) {
									let instancevalue = values[i];
									var ids = Object.keys(index[key][type][instancevalue]);
									ids.forEach(function(id) {
										if(constructor.ids[id]) {
										//	if(index[key][type][instancevalue][id].joqularMatch(pattern)) {
												matches.push(constructor.ids[id]);
										//	}
										} else {
											delete index[key][type][instancevalue][id];
										}
									});
								}
							} else if(["lt","lte","neq"].indexOf(test)>=0) {
								for(let i=0;i<values.length;i++) {
									let instancevalue = values[i];
									if(test==="lt") {
										if(!(instancevalue < value)) {
											break;
										}
									} else if(test==="lte") {
										if(!(instancevalue <= value)) {
											break;
										}
									} else { //neq
										if(!(instancevalue !== value)) {
											continue;
										}
									}
									let ids = Object.keys(index[key][type][instancevalue]);
									ids.forEach(function(id) {
										if(constructor.ids[id]) {
											//if(index[key][type][instancevalue][id].joqularMatch(pattern)) {
												matches.push(constructor.ids[id]);
											//}
										} else {
											delete index[key][type][instancevalue][id];
										}
									});
								}
							} else { // gte, gt}
								for(let i=values.length-1;i>0;i--) {
									let instancevalue = values[i];
									if(test==="gte") {
										if(!(instancevalue >= value)) {
											break;
										}
									} else if(test==="gt") {
										if(!(instancevalue > value)) {
											break;
										}
									}
									let ids = Object.keys(index[key][type][instancevalue]);
									ids.forEach(function(id) {
										if(constructor.ids[id]) {
										//	if(index[key][type][instancevalue][id].joqularMatch(pattern)) {
												matches.push(constructor.ids[id]);
										//	}
										} else {
											delete index[key][type][instancevalue][id];
										}
									});
								}
							}
						}
					});
					results = (results ? intersection(results,matches) : matches);
					return results.length > 0;
				}
			}
			return false;
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
					newcons.prototype = Object.create(cons.prototype);
					if(config.datastore && config.datastore.name && config.datastore.type==="IndexedDB") {
						newcons.persist = function(aysnch) {
							var me = this;
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
							};
							dbrequest.onerror = function(event) {
								if(event.target.error.name==="VersionError" && event.target.error.message.indexOf(" less ")>=0) {
									event.cancelBubble = true;
									me.dbVersion++;
									me.persist();
								}
							};
							dbrequest.onsuccess = function(event) {
								var db = event.target.result, objectstore;
								if(!db.objectStoreNames.contains(name)) {
									db.close();
									me.dbVersion++;
									me.persist();
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
									};
								}
							};
						}
						newcons.load = function(aysnch) {
							var me = this;
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
							};
							dbrequest.onerror = function(event) {
								if(event.target.error.name==="VersionError" && event.target.error.message.indexOf(" less ")>=0) {
									event.cancelBubble = true;
									me.dbVersion++;
									me.load();
								}
							};
							dbrequest.onsuccess = function(event) {
								var db = event.target.result, objectstore;
								if(!db.objectStoreNames.contains(name)) {
									db.close();
									me.dbVersion++;
									me.load();
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
									};
								}
							};
						}
					}
					return newcons;
				}
				if(config.index===true) {
					config.enhancePrimitives = true;
					config.enhanceArray = true;
					config.ehhanceDate = true;
					constructor.joqularFind = function(pattern,wait) {
						var me = this;
						if(wait) {
							function dowait(f) {
								if(Object.keys(me.indexing).length===0) {
									f();
								} else {
									setTimeout(function() { dowait(f) },100);
								}
							}
							if(typeof(wait)==="function") {
								dowait(function() { wait(joqularFind.call(me,pattern,me.index)); });
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
							let tid;
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
				}
				function Time(value,precision) {
					if(value instanceof Date) {
						value = value.getTime();
					}
					this.value = value;
					this.toPrecision(precision,true);
				}
				Time.prototype = Object.create(constructor.prototype);
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
					return new Time(dt);
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
					Time.prototype[key] = function() {
							var dt = new Date(this.value);
							var result = dt[key].apply(dt,arguments);
							this.value = dt.getTime();
							return result;
					}
				});
				Time.prototype.valueOf = function() {
					return this.value;
				}
				function Duration(milliseconds) {
					this.value = milliseconds;
					this.range = 0;
				}
				Duration.prototype = Object.create(constructor.prototype);
				Duration.prototype.valueOf = function() {
					return this.value;
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
				// need to define gt, lt etc. in context of range
				function TimeSpan(startingTime,endingTime) {
					this.startingTime = (startingTime!=null ? startingTime : -Infinity);
					this.endingTime = (endingTime!=null ? endingTime : Infinity);
					if(this.startingTime instanceof Date) {
						this.startingTime = this.startingTime.getTime();
					}
					if(this.endingTime instanceof Date) {
						this.endingTime = this.endingTime.getTime();
					}
					Object.defineProperty(this,"duration",{enumerate:true,configurable:false,get:function() { return this.endingTime - this.startingTime}, set: function() {}});
				}
				TimeSpan.prototype = Object.create(constructor.prototype);
				(TimeSpan.prototype.intersects = function(value,precision) {
					var startingTime = new Time(value.startingTime,precision);
					var endingTime = new Time(value.endingTime,precision);
					if(this.startingTime>=startingTime && this.startingTime<=endingTime) {
						return true;
					}
					if(this.endingTime<=value.endingTime && this.endingTime>=startingTime) {
						return true;
					}
					return false;
				}).predicate = true;
				(TimeSpan.prototype.disjoint = function(value,precision) {
					return !this.intersects(value,precision);
				}).predicate = true;
				(TimeSpan.prototype.coincident = function(value,precision) {
					var startingTime = new Time(value.startingTime,precision);
					var endingTime = new Time(value.endingTime,precision);
					return new Time(this.startingTime,precision).valueOf()==startingTime.valueOf() && new Time(this.endingTime,precision).valueOf()==endingTime.valueOf();
				}).predicate = true;
				(TimeSpan.prototype.adjacentOrBefore = function(value,precision) {
					var startingTime;
					if(value instanceof Date || typeof(value)==="number") {
						startingTime = new Time(value,precision);
					} else {
						startingTime = new Time(value.startingTime,precision);
					}
					return new Time(this.endingTime,precision).valueOf()<=startingTime.valueOf();
				}).predicate = true;
				(TimeSpan.prototype.before = function(value,precision) {
					var startingTime;
					if(value instanceof Date || typeof(value)==="number") {
						startingTime = new Time(value,precision);
					} else {
						startingTime = new Time(value.startingTime,precision);
					}
					return new Time(this.endingTime,precision).valueOf()<startingTime.valueOf();
				}).predicate = true;
				(TimeSpan.prototype.adjacentBefore = function(value,precision) {
					var startingTime;
					if(value instanceof Date || typeof(value)==="number") {
						startingTime = new Time(value,precision);
					} else {
						startingTime = new Time(value.startingTime,precision);
					}
					return new Time(this.endingTime,precision).valueOf()===startingTime.valueOf();
				}).predicate = true;
				(TimeSpan.prototype.adjacentOrAfter = function(value,precision) {
					var endingTime;
					if(value instanceof Date || typeof(value)==="number") {
						endingTime = new Time(value,precision);
					} else {
						endingTime = new Time(value.endingTime,precision);
					}
					return new Time(this.startingTime,precision).valueOf()>=endingTime.valueOf();
				}).predicate = true;
				(TimeSpan.prototype.after = function(value,precision) {
					var endingTime;
					if(value instanceof Date || typeof(value)==="number") {
						endingTime = new Time(value,precision);
					} else {
						endingTime = new Time(value.endingTime,precision);
					}
					return new Time(this.startingTime,precision).valueOf()>endingTime.valueOf();
				}).predicate = true;
				(TimeSpan.prototype.adjacentAfter = function(value,precision) {
					var endingTime;
					if(value instanceof Date || typeof(value)==="number") {
						endingTime = new Time(value,precision);
					} else {
						endingTime = new Time(value.endingTime,precision);
					}
					return new Time(this.startingTime,precision).valueOf()==endingTime.valueOf();
				}).predicate = true;
				(TimeSpan.prototype.adjacent = function(value,precision) {
					if(this.adjacentBefore(value,precision)) {
						return -1;
					}
					if(this.adjacentAfter(value,precision)) {
						return 1;
					}
					return 0;
				}).predicate = true;
				constructor.prototype.joqularMatch = function(pattern,scope) {
					return joqularMatch.call(this,pattern,scope);
				};
				(constructor.prototype.instanceof = function(constructor) {
					return this instanceof constructor;
				}).predicate = true;
				(constructor.prototype.eq = function(value) {
					// first clause handles an object or primitve and value===null or value===undefined
					// second clause handles everything else because primitives and Objects will return themselves with .valueOf()
					// array and other types of objects may need to override eq
					return this.valueOf() === value || 
						this.valueOf() === value.valueOf();
				}).predicate = true;
				(constructor.prototype.neq = function(value) {
					return !this.eq(value);
				}).predicate = true;
				if(config.enhancePrimitives) {
					[Number,String,Boolean].forEach(function(primitive) {
						primitive.prototype.joqularMatch = constructor.prototype.joqularMatch;
						(primitive.prototype.lt = function(value) {
							return this.valueOf() < value || this.valueOf() < value.valueOf();
						}).predicate=true;
						(primitive.prototype.lte = function(value) {
							return this.valueOf() <= value || this.valueOf() <= value.valueOf();
						}).predicate=true;
						primitive.prototype.eq = constructor.prototype.eq;
						primitive.prototype.neq = constructor.prototype.neq;
						(primitive.prototype.gte = function(value) {
							return this.valueOf() >= value || this.valueOf() >= value.valueOf();
						}).predicate=true;
						(primitive.prototype.gt = function(value) {
							return this.valueOf() > value || this.valueOf() > value.valueOf();
						}).predicate=true;
					});
				}
				if(config.enhanceDate) {
					Date.prototype.joqularMatch = constructor.prototype.joqularMatch;
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
						return new Time(this,precision) == new Time(value,precision);
					}
					Date.prototype.neq = function(value,precision) {
						return new Time(this,precision) != new Time(value,precision);
					}
					Date.prototype.gte = function(value,precision) {
						if(value instanceof TimeSpan) {
							return value.adjacentOrBefore(this,precision);
						}
						return new Time(this,precision) >= new Time(value,precision);
					}
					Date.prototype.gt = function(value,precision) {
						if(value instanceof TimeSpan) {
							return value.adjacentOrBefore(this,precision);
						}
						return new Time(this,precision) >= new Time(value,precision);
					}
					Date.prototype.before = Date.prototype.lt
					Date.prototype.adjacentOrBefore = Date.prototype.lt
					Date.prototype.after = Date.prototype.gt
					Date.prototype.adjacentOrAfter = Date.prototype.lt	
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
				}
				if(config.enhanceArray) {
					Array.prototype.joqularMatch = constructor.prototype.joqularMatch;
					Array.prototype.count = function() {
						return this.length;
					};
					Array.prototype.avg = function() {
						return this.sum() / this.count();
					}
					Array.prototype.sum = function(ignoreEnds) {
						var sum = 0;
						for(let i=0;i<this.length;i++) {
							if(ignoreEnds && (i===0 || i===this.length-1)) continue;
							sum += (this[i]!=null && typeof(this[i].valueOf())==="number" ? this[i].valueOf() : 0);
						}
						return sum;
					}
					Array.prototype.min = function(ignoreEnds) {
						var i = 0;
						if(ignoreEnds) i++;
						var copy = this.filter(function(item) { return item && typeof(item.valueOf())==="number" && !isNaN(item.valueOf()); }).sort(function(a,b) { return a - b;});
						return copy[i];
					}
					Array.prototype.max = function(ignoreEnds) {
						var i = this.length-1;
						if(ignoreEnds) i--;
						var copy = this.filter(function(item) { return item && typeof(item.valueOf())==="number" && !isNaN(item.valueOf()); }).sort(function(a,b) { return a - b;});
						return copy[i];
					}
					Array.prototype.bsearch = function(value) {
						return binarySearch(this,value);
					};
					(Array.prototype.eq = function(value) {
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
					}).predicate = true;
					(Array.prototype.intersects = function(value) {
						if(value instanceof Set) {
							value = Set.toArray()
						}
						var result = intersection(this,value);
						return result && result.length>0;
					}).predicate = true;
					(Array.prototype.disjoint = function(value) {
						return !this.intersects(value);
					}).predicate=true;
					(Array.prototype.coincident = function(value) {
						return this.count() === value.count() &&
							this.every(function(item) {
								return value.contains(item);
							});
					}).predicate = true;					
					(Array.prototype.contains = function(value) {
						return this.some(function(item) {
							if(item===value) {
								return true;
							}
							if(typeof(item.eq)==="function") {
								return item.eq(value);
							}
							return false;
						});
					}).predicate = true;
					Array.prototype.includes = Array.prototype.contains;
					(Array.prototype.excludes = function(value) {
						return !this.includes(value);
					}).predicate = true;
				}
				if(config.enhanceSet) {
					Set.prototype.joqularMatch = constructor.prototype.joqularMatch;
					Set.prototype.count = function() {
						return set.size;
					};
					Set.prototype.toArray = function() {
						var array = [];
						for(let item of this.values()) {
							array.push(item);
						}
						return array;
					};
					(Set.prototype.every = function(f,scope) {
						var i = 0;
						for(let item of this) {
							if(!f.call(scope,item,i)) {
								return false;
							}
							i++;
						}
						return true;
					}).predicate=true;
					(Set.prototype.some = function(f,scope) {
						var i = 0;
						for(let item of this) {
							if(f.call(scope,item,i)) {
								return true;
							}
							i++;
						}
						return false;
					}).predicate=true;
					Set.prototype.indexOf = function(value) {
						var i = 0;
						for(let item of this.values()) {
							if(item===value || (item && item.valueOf()===value) || (item && value && item.valueOf()===value.valueOf())) {
								return i;
							}
							i++;
						}
						return false;
					};
					(Set.prototype.contains = function(value) {
						(!value && this.has(value)) || this.has(value.valueOf());
					}).predicate=true;
					(Set.prototype.eq = function(value) {
						if(this===value) { return true; }
						if(!(value instanceof Set) || this.size!==this.size) {
							return false;
						}
						var array = this.toArray();
						var array2 = (value instanceof Array ? value : value.toArray());
						return array.every(function(item,i) {
							var v = array2[i];
							if(item===v) {
								return true;
							}
							if(typeof(item.eq)==="function") {
								return item.eq(v);
							}
							return false;
						});
					}).predicate = true;
					(Set.prototype.intersects = function(value) {
						if(!value || typeof(value.contains)!=="function") {
							return false;
						}
						return this.some(function(item) {
							return value.contains(item[1]);
						});
					}).predicate = true;
					(Set.prototype.disjoint = function(value) {
						return !this.intersects(value);
					}).predicate=true;
					(Set.prototype.coincident = function(value) {
						return typeof(value.count)==="function" && 
							this.count() === value.count() &&
							this.every(function(item) {
							value.contains(item);
							});
					}).predicate = true;
					Set.prototype.includes = Set.prototype.contains;
					(Set.prototype.excludes = function(value) {
						return !this.includes(value);
					}).predicate = true;
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