//     jovial
//
//     Copyright (c) 2015 Simon Y. Blackwell, AnyWhichWay
//     MIT License - http://opensource.org/licenses/mit-license.php
(function() {
	"use strict";
	var _global = this, ProxyConstructor;
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
	if(typeof(Proxy)==="undefined") {
		ProxyConstructor = require('chrome-proxy');
	} else {
		ProxyConstructor = Proxy;
	}
	Validator.prototype.bind = function(constructorOrObject,onerror,name) {
		name = (name ? name : (constructorOrObject.name ? constructorOrObject.name : "anonymous"));
		var validator = this, cons;
		var handler = {
			set: function(target,property,value) { // ,proxy
				var validation = validator[property], keys = Object.keys(validation), error;
				keys.forEach(function(key) {
					if(typeof(Validator.validation[key])==="function") {
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
				if(error) {
					if(onerror) {
						onerror(error)
					} else {
						throw error;
					}
				}
			}
		};
		if(constructorOrObject instanceof Function) {
			cons = Function("cons","hndlr","prxy","return function " + name + "() { cons.apply(this,arguments); return new prxy(this,hndlr);  }")(constructorOrObject,handler,ProxyConstructor);
			cons.prototype = Object.create(constructorOrObject.prototype);
			cons.prototype.__kind__ = name;
			cons.prototype.constructor = cons;
			return cons;
		}
		return new ProxyConstructor(constructorOrObject,handler);
	}
	Validator.ValidationError = function(object) {
		this.object = object;
		this.errors = {};
	}
	Validator.ValidationError.prototype = Object.create(Error.prototype);
	Validator.ValidationError.prototype.constructor = Validator.ValidationError;
	Validator.validation = {};
	/*
	Validator.validation.coerce = function(value,to) {
		var coersions = {
				string: {number: parseFloat}
		};
		var from = typeof(value);
		if(coersions[from] && coersions[from][to]) {
			return coersions[from][to](value);
		}
		return value;
	}
	*/
	Validator.validation.required = function(required,value) {
		return (required ? value!==undefined : true);
	}
	Validator.validation.type = function(type,value) {
		var tel = {
				us: /^[01]?[- .]?\(?[2-9]\d{2}\)?[- .]?\d{3}[- .]?\d{4}$/
		};
		if(typeof(value)===type) {
			return true;
		}
		if(typeof(type)==="function") {
			return value instanceof Object && value.instanceOf(type);
		}
		if(type==="SSN") {
			return /^\d{3}-\d{2}-\d{4}$/.test(value);
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
	Validator.validation.between = function(between,value) {
		between.sort(function(a,b) { return a - b; });
		var min = between[0];
		var max = between[between.length-1];
		return value>=min && value<=max;
	}
	Validator.validation.between.onError = RangeError;
	Validator.validation.min = function(min,value) {
		return value>=min;
	}
	Validator.validation.min.onError = RangeError;
	Validator.validation.max = function(max,value) {
		return value<=max;
	}
	Validator.validation.max.onError = RangeError;
	Validator.validation.matches = function(regex,value) {
		return new RegExp(regex).test(value);
	}
	Validator.validation.matches.onError = RangeError;
	if (typeof(module) !== 'undefined' && module.exports) {
		module.exports = Validator;
	} else if (typeof define === 'function' && define.amd) {
		// Publish as AMD module
		define(function() {return Validator;});
	} else {
		// Publish as global (in browsers)
		var _previousRoot = _global.Validator;
		// **`noConflict()` - (browser only) to reset global 'Validator' var**
		Validator.noConflict = function() {
			_global.Validator = _previousRoot;
			return Validator;
		};
		_global.Validator = Validator;
	}
	
}).call(this);