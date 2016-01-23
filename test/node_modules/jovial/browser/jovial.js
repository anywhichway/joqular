(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//     jovial
//
//     Copyright (c) 2015, 2016 Simon Y. Blackwell, AnyWhichWay
//     MIT License - http://opensource.org/licenses/mit-license.php
(function() {
	"use strict";
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
	var ProxyConstructor;
	function Validator(config) {
		var me = this;
		if(config) {
			var keys = Object.keys(config);
			keys.forEach(function(key) {
				me[key] = config[key];
				me[key].name = key;
			});
		}
	}
	var Proxy;
	if(typeof(Proxy)==="undefined"  && typeof(require)==="function") {
		var ProxyConstructor = require('chrome-proxy');
		if(typeof(ProxyConstructor)==="function") {
			Proxy = ProxyConstructor;
		} else if(this.Proxy) {
			Proxy = this.Proxy; // lift Proxy in case inside a closure
		}
	}
	Validator.prototype.bind = function(constructorOrObject,onerror,name) {
		function validate(target,property,value,proxy,skipset,skiponerror,error) { 
			var validation = validator[property], keys, error;
			if(validation) {
				keys = Object.keys(validation);
				try {
					value = (validation.transform ? Validator.validation.transform(validation.transform,value) : value);
				} catch(e) {
					error = (error ? error : new Validator.ValidationError(target));
					error.errors[property] = (error.errors[property] ? error.errors[property] : {});
					error.errors[property].value = (value===undefined ? null : value);
					error.errors[property].validation = (error.errors[property].validation ? error.errors[property].validation : {});
					error.errors[property].validation.transform = {constraint: validation.transform};
					error.errors[property].validation.transform.error = e;
				}
				keys.forEach(function(key) {
					if(typeof(Validator.validation[key])==="function" && key!=="transform" && (value!==undefined || key==="required")) {
						var result = Validator.validation[key](validation[key],value);
						if(!result) {
							error = (error ? error : new Validator.ValidationError(target));
							error.errors[property] = (error.errors[property] ? error.errors[property] : {});
							error.errors[property].value = (value===undefined ? null : value);
							error.errors[property].validation = (error.errors[property].validation ? error.errors[property].validation : {});
							error.errors[property].validation[key] = {constraint: validation[key]};
							var msg = property + ":" + (typeof(value)==="string" ? "\"" + value + "\"" : (value instanceof Object ? JSON.stringify(value) : value)) + " failed validation {\"" + key + "\":" + JSON.stringify(error.errors[property].validation[key]) + "}";
							Validator.validation.type.onError = TypeError;
							var propertyerror = new (Validator.validation[key].onError ? Validator.validation[key].onError : Error)(msg);
							error.errors[property].validation[key].error = propertyerror;
						}
					}
				});
			}
			if(error) {
				if(!skiponerror && onerror) {
					onerror(error)
				} else {
					throw error;
				}
			} else  {
				if(!skipset) {
					target[property] = value;
				}
				return true;
			}
		}
		function validateInstance(trap) {
			var me = this, keys = Object.keys(me), error;
			keys.forEach(function(key) {
				var value = me[key];
				if(typeof(value)!=="function") {
					try {
						validate(me,key,value,undefined,true,true,error);
					} catch(e) {
						error = e;
					}
				}
			});
			if(trap) {
				return error;
			}
			if(onerror) {
				if(error) {
					onerror(error);
				}
			} else if(error) {
				throw error;
			}
		}
		name = (name ? name : (constructorOrObject.name ? constructorOrObject.name : "anonymous"));
		var validator = this, cons;
		var handler = {
			deleteProperty: function(target,property,proxy) {
				var validation = validator[property];
				if(Validator.validation.required(validation.required,undefined)) {
					delete target[property];
					return true;
				}
				handler.set(target,property,undefined,proxy,true);
			},
			defineProperty: function(target, property, descriptor, proxy) {
				if(handler.set(target, property, descriptor.value, proxy, true)) {
					Object.defineProperty(target, property, descriptor);
				}
			},
			set: validate
		};
		if(constructorOrObject instanceof Function) {
			cons = Function("cons","hndlr","prxy","return function " + name + "() { cons.apply(this,arguments); return new prxy(this,hndlr);  }")(constructorOrObject,handler,Proxy);
			cons.prototype = Object.create(constructorOrObject.prototype);
			cons.prototype.__kind__ = name;
			cons.prototype.constructor = cons;
			cons.prototype.validate = validateInstance;
			return cons;
		} else {
			constructorOrObject.validate = validateInstance;
		}
		return new Proxy(constructorOrObject,handler);
	}
	Validator.ValidationError = function(object) {
		this.object = object;
		this.errors = {};
	}
	Validator.ValidationError.prototype = Object.create(Error.prototype);
	Validator.ValidationError.prototype.constructor = Validator.ValidationError;
	Validator.validation = {};
	
	Validator.validation.transform = function(f,value) {
		return f(value);
	}
	Validator.validation.transform.onError = TypeError;
	
	Validator.validation.between = function(between,value) {
		between.sort(function(a,b) { return a - b; });
		var min = between[0];
		var max = between[between.length-1];
		return value>=min && value<=max;
	}
	Validator.validation.between.onError = RangeError;
	
	Validator.validation.echoes = function(echoes,value) {
		return soundex(echoes)===soundex(value);
	}
	Validator.validation.echoes.onError = RangeError;
	
	Validator.validation.in = function(values,value) {
		return values.indexOf(value)>=0;
	}
	Validator.validation.in.onError = RangeError;
	
	Validator.validation.length = function(length,value) {
		if(length instanceof Array) {
			length.sort(function(a,b) { return a - b; });
			var min = length[0];
			var max = length[length.length-1];
			return value && ((value.length>=min && value.length<=max) || (value.count>=min && value.count<=max));
		}
		return value && (value.length===length || value.count===length);
	}
	Validator.validation.length.onError = RangeError;
	
	Validator.validation.matches = function(regex,value) {
		return new RegExp(regex).test(value);
	}
	Validator.validation.matches.onError = RangeError;
	
	Validator.validation.max = function(max,value) {
		return value<=max;
	}
	Validator.validation.max.onError = RangeError;
	
	Validator.validation.min = function(min,value) {
		return value>=min;
	}
	Validator.validation.min.onError = RangeError;
	
	Validator.validation.required = function(required,value) {
		return (required ? value!==undefined : true);
	}
	Validator.validation.required.onError = TypeError;
	
	Validator.validation.satisfies = function(satisfies,value) {
		return satisfies(value);
	}
	Validator.validation.satisfies.onError = RangeError;
	
	Validator.validation.type = function(type,value) {
		var tel = {
				us: /^[01]?[- .]?\(?[2-9]\d{2}\)?[- .]?\d{3}[- .]?\d{4}$/
		};
		if(value===undefined || typeof(value)===type) {
			return true;
		}
		if(typeof(type)==="function") {
			return value instanceof type;
		}
		if(type==="SSN") {
			return /^\d{3}-\d{2}-\d{4}$/.test(value);
		}
		if(type==="latlon") {
			// David Jacobs via http://www.regexlib.com/
			return /(-?(90[ :°d]*00[ :\'\'m]*00(\.0+)?|[0-8][0-9][ :°d]*[0-5][0-9][ :\'\'m]*[0-5][0-9](\.\d+)?)[ :\?\"s]*(N|n|S|s)?)[ ,]*(-?(180[ :°d]*00[ :\'\'m]*00(\.0+)?|(1[0-7][0-9]|0[0-9][0-9])[ :°d]*[0-5][0-9][ :\'\'m]*[0-5][0-9](\.\d+)?)[ :\?\"s]*(E|e|W|w)?)/.test(value);
		}
		if(type.indexOf("tel")===0) {
			var split = type.split(".");
			split.shift();
			if(split.length===0) {
				split.push("us");
			}
			return split.some(function(country) {
				if(tel[country]) {
					return tel[country].test(value);
				}
			});
		}
		return false;
	}
	Validator.validation.type.onError = TypeError;
	
	if (this.exports) {
		this.exports  = Validator;
	} else if (typeof define === 'function' && define.amd) {
		// Publish as AMD module
		define(function() {return Validator;});
	} else {
		this.Validator = Validator;
	}
}).call((typeof(window)!=='undefined' ? window : (typeof(module)!=='undefined' ? module : null)));
},{"chrome-proxy":2}],2:[function(require,module,exports){
//     chrome-proxy
//
//     Copyright (c) 2015, 2016 Simon Y. Blackwell, AnyWhichWay
//     MIT License - http://opensource.org/licenses/mit-license.php
(function() {
	//"use strict"; DO NOT ENABLE STRICT
	if(typeof(Proxy)==="undefined" && typeof(Object.observe)==="function") {
		Object.original = {};
		// get, set have to be handled differently since they are not Object methods that can be overwritten
		var traps = ["getPrototypeOf","setPrototypeOf","isExtensible","preventExtensions","getOwnPropertyDescriptor","defineProperty","getOwnPropertyNames","apply","deleteProperty","set","get"];
		traps.forEach(function(fname) {
			var oldf = Object[fname];
			if(oldf) {
				Object.original[fname] = oldf;
				Object[fname] = function() {
					var object = arguments[0];
					if(typeof(Proxy)!=="undefined" && object instanceof Proxy) {
						if(fname==="getOwnPropertyNames" && object.ownKeys) {
							return object.ownKeys(object.__target__);
						} else if(object.__handler__[fname]) {
							 return object.__handler__[fname].apply(object.__handler__,arguments);
						} else {
							 arguments[0] = object.__target__;
							 return oldf.apply(Object,arguments);
						}
					}
					return oldf.apply(Object,arguments);
				}
			}
		});
		function ProxyConstructor() {
			return function Proxy(target,handler) {
				function addHandling(proxy,key,value) {
					var desc = {enumerable:true,configurable:true,writable:true};
					if(typeof(value)==="function") { // if it is a function, just call the proxied target version
						desc.value = function() {
							if(handler[key]) {
								return handler[key].apply(handler,arguments);
							} else {
								return target[key].apply(target,arguments);
							}
						}
					} else { // if it is a value, then create get and set to use the value on the proxied object, unless the handler has a trap or the value
						delete desc.writable;
						desc.get = function() { 
							if(handler.get) {
								return handler.get(target,key,proxy); 
							} 
							//if(Object.getOwnPropertyDescriptor(handler,key)) { // handler property masks target
							//	return handler[key];
							//}
							return target[key];
						}
						desc.set = function(value) { 
							if(handler.set) { 
								return handler.set(target,key,value,proxy);
							}
							if(!Object.getOwnPropertyDescriptor(handler,key)) { // handler property stops value from passing down to target
								target[key] = value;
								return value;
							}
						}
					}
					// make a try/catch because can't override some built ins
					try {
						Object.original.defineProperty.call(Object,proxy,key,desc);
					} catch(e) {
						
					}
					return true;
				}
				var proxy = this;
				Object.original.defineProperty.call(Object,proxy,"__target__",{enumerable:false,configurable:false,writable:false,value:target});
				Object.original.defineProperty.call(Object,proxy,"__handler__",{enumerable:false,configurable:false,writable:false,value:handler});
				//override Object.prototype properties
				Object.original.defineProperty.call(Object,proxy, '__lookupGetter__', {value: target.__lookupSetter__.bind(target)});
				Object.original.defineProperty.call(Object,proxy, '__lookupSetter__', {value: target.__lookupSetter__.bind(target)});
				Object.original.defineProperty.call(Object,proxy, '__defineGetter__', {value: target.__defineGetter__.bind(target)});
				Object.original.defineProperty.call(Object,proxy, '__defineSetter__', {value: target.__defineSetter__.bind(target)});
				Object.original.defineProperty.call(Object,proxy, 'toString', {value: target.toString.bind(target)});
				Object.original.defineProperty.call(Object,proxy, 'valueOf', {value: target.valueOf.bind(target)});
				Object.original.defineProperty.call(Object,proxy, '__proto__', {
					get: function() { return Object.getPrototypeOf(proxy); },
					set: function(value){ return Object.setPrototypeOf(proxy,value);	}
				});
				Object.original.defineProperty.call(Object,proxy, 'hasOwnProperty', {value: function (property) {
					if (handler.has) {
						return handler.has(target, property);
					} else {
						return target.hasOwnProperty(property);
					}
				}});
				
				// add handling for everything in the target
				var proto = Object.getPrototypeOf(target);
				var keys = Object.getOwnPropertyNames(target).concat(Object.getOwnPropertyNames(proto));
				keys.forEach(function(key) {
					addHandling(proxy,key,target[key]);
				});
				// Observe the target for changes and update the handlers accordingly
				var targetobserver = function (changeset) {
					changeset.forEach(function(change) {
						if(change.name!=="__target__") {
							if(change.type==="delete") {
								delete proxy[change.name];
							} else if(change.type==="update") { // update handler if target key value changes from function to non-function or from a non-function to a function
								if((typeof(change.oldValue)==="function" && typeof(target[change.name])!=="function") || (typeof(change.oldValue)!=="function" && typeof(target[change.name])==="function")) {
									addHandling(proxy,change.name,target[change.name]);
								}
							} else if(!proxy[change.name]) {
								addHandling(proxy,change.name,target[change.name]);
							}
						}
					})};
				Object.observe(target,targetobserver,["add","delete","update"]);
				// Observe the proxy for add/delete and set value on target, the target observer will add the handling
				var proxyobserver = function(changeset) {
					changeset.forEach(function(change) {
						if(change.name!=="__target__") {
							if(change.type==="delete") {
								if(handler.deleteProperty) {
									if(!handler.deleteProperty(target,change.name)) { // restore property if delete handler fails
										Object.original.defineProperty(Object,proxy,Object.original.getOwnPropertyDescriptor(target,change.name));
									}
								} else {
									delete target[change.name];
								}
							} else {
								if(handler.defineProperty) {
									var desc = Object.getOwnPropertyDescriptor(target,change.name);
									if(!desc) {
										desc = Object.original.getOwnPropertyDescriptor.call(Object,proxy,change.name);
									}
									if(desc && handler.defineProperty(target,change.name,desc)) {
										addHandling(proxy,change.name,desc.value);
									} else { // delete property if define handler fails
										delete proxy[change.name];
									}
								} 
								if(target[change.name]!==proxy[change.name]){
									target[change.name] = proxy[change.name];
								}
							}
						}
					});
				}
				Object.observe(proxy,proxyobserver,["add","delete"]);
				return proxy;
			}
		}
	} else {
		Object.original = Object;
	}
	
	if(this.exports) {
		this.exports = (typeof(Proxy)!=="undefined" ? Proxy : ProxyConstructor());
	} else if (typeof define === 'function' && define.amd) {
		// Publish as AMD module
		define(function() {return (typeof(Proxy)!=="undefined" ? Proxy : ProxyConstructor());});
	} else {
		this.Proxy = (typeof(Proxy)!=="undefined" ? Proxy : ProxyConstructor());
	}
}).call((typeof(window)!=='undefined' ? window : (typeof(module)!=='undefined' ? module : null)));
},{}]},{},[1]);
