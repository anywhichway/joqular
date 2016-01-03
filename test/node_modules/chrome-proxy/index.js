(function() {
	//"use strict"; DO NOT ENABLE STRICT
	var _global = this;
	if(typeof(this.Proxy)==="undefined" && typeof(Object.observe)==="function") {
		Object.original = {};
		// get, set have to be handled differently since they are not Object methods that can be overwritten
		var traps = ["getPrototypeOf","setPrototypeOf","isExtensible","preventExtensions","getOwnPropertyDescriptor","defineProperty","getOwnPropertyNames","apply","deleteProperty","set","get"];
		traps.forEach(function(fname) {
			var oldf = Object[fname];
			if(oldf) {
				Object.original[fname] = oldf;
				Object[fname] = function() {
					var object = arguments[0];
					if(object instanceof Proxy) {
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
		function Proxy(target,handler) {
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
							return target[key] = value;
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
				set: function(val){ return Object.setPrototypeOf(proxy,value);	}
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
			targetobserver = function (changeset) {
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
									var desc = Object.getOwnPropertyDescriptor.call(target,change.name);
									Object.original.defineProperty(Object,proxy,desc);
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
								//}
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
	} else {
		Object.original = Object;
	}
	
	if (typeof(module) != 'undefined' && module.exports) {
		module.exports  = Proxy;
	} else if (typeof define === 'function' && define.amd) {
		// Publish as AMD module
		define(function() {return Proxy;});
	} else {
		_global.Proxy = Proxy;
	}
}).call(this);