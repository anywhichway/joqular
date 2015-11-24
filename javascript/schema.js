(function(exports) {
	
	function Schema(config,constructor,name) {
		var me = this;
		if(config) {
			var keys = Object.keys(config);
			keys.forEach(function(key) {
				me[key] = config[key];
				me[key].name = key;
			});
		}
		if(constructor) {
			me.bind(constructor,name);
		}
	}
	Schema.prototype.bind = function(constructor,name) {
		name = (name ? name : constructor.name);
		var schema = this;
		Schema.bound[name] = {constructor:constructor,schema:schema};
		constructor.prototype.validate = function(onFail) {
			var me = this;
			if(!me.__schemaShadow__) {
				Object.defineProperty(me,"__schemaShadow__",{enumerable:false,value:{}});
				var keys = Object.keys(me);
				keys.forEach(function(key) {
					me.__schemaShadow__[key] = me[key];
				});
				Object.observe(me,function(changeset) {
					changeset.forEach(function(change) {
						if(change.name==="__unblockSchemaOperations__") {
							delete me.__blockSchemaOperations__;
							delete me.__unblockSchemaOperations__;
						}
						if(change.name==="__unblockSchemaOperations__" || change.name==="__blockSchemaOperations__") {
							return;
						}
						if(!me.__blockSchemaOperations__) {
							// if Schema.bound[key].schema.continuous
							me.__schemaShadow__[change.name] = change.oldValue;
						}
					});
				},["add","update","delete"]);
			}
			var properties = Object.keys(schema), error;
			properties.forEach(function(property) {
				var value = me[property], validator = schema[property];
				var keys = Object.keys(validator);
				keys.forEach(function(key) {
					if(typeof(Schema.validator[key])==="function") {
						var result = Schema.validator[key](validator[key],value);
						if(!result) {
							if(onFail==="rollbackProperty") {
								me.rollback(property);
								result = Schema.validator[key](validator[key],me[property]);
							}
							if(!result) {
								var onerror = (Schema.validator[key].onError ? Schema.validator[key].onError: Error);
								error = (error ? error : new Schema.ValidationError(me));
								var validation = {};
								error.errors[property] = (error.errors[property] ? error.errors[property] : {});
								error.errors[property].value = (value===undefined ? null : value);
								error.errors[property].validation = (error.errors[property].validation ? error.errors[property].validation : {});
								error.errors[property].validation[key] = {constraint: validator[key]};
								var msg = property + ":" + (typeof(value)==="string" ? "\"" + value + "\"" : (value instanceof Object ? JSON.stringify(value) : value)) + " failed validation {\"" + key + "\":" + JSON.stringify(error.errors[property].validation[key]) + "}";
								var propertyerror = new Error(msg);
								error.errors[property].validation[key].error = propertyerror;
							}
						}
					}
				});
			});
			if(error) {
				if(onFail==="rollback") {
					me.rollback();
				} else if(onFail==="throw") {
					throw error;
				} else if(typeof(onFail)==="function") {
					onFail(error);
				}
			}
			return (error ? error : true);
		}
		constructor.prototype.rollback = function(property) {
			var me = this;
			if(!me.__schemaShadow__) return true;
			var keys = Object.keys(me.__schemaShadow__);
			me.__blockSchemaOperations__ = true;
			if(property) {
				me[property] = me.__schemaShadow__[property];
			} else {
				keys.forEach(function(key) {
					if(me[key]!==me.__schemaShadow__[key]) {
						me[key] = me.__schemaShadow__[key];
					}
				});
			}
			me.__unblockSchemaOperations__ = true;
		}
	}
	Schema.prototype.continuousValidation = function(continuous) {
		this.continuous = (continuous===undefined ? true : continuous);
	}
	Schema.bound = {};
	Schema.ValidationError = function(object) {
		this.object = object;
		this.errors = {};
	}
	Schema.ValidationError.prototype = Object.create(Error.prototype);
	Schema.ValidationError.prototype.constructor = Schema.ValidationError;
	Schema.validator = {};
	Schema.validator.coerce = function(value,to) {
		var coersions = {
				string: {number: parseFloat}
		};
		var from = typeof(value);
		if(coersions[from] && coersions[from][to]) {
			return coersions[from][to](value);
		}
		return value;
	}
	Schema.validator.required = function(required,value) {
		return (required ? value!==undefined : true);
	}
	Schema.validator.type = function(type,value) {
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
	Schema.validator.type.onError = TypeError;
	Schema.validator.between = function(between,value) {
		between.sort(function(a,b) { return a - b; });
		var min = between[0];
		var max = between[between.length-1];
		return value>=min && value<=max;
	}
	Schema.validator.between.onError = RangeError;
	Schema.validator.min = function(min,value) {
		return value>=min;
	}
	Schema.validator.max = function(max,value) {
		return value<=max;
	}
	Schema.validator.matches = function(regex,value) {
		return new RegExp(regex).test(value);
	}
	
	exports.Schema = Schema;
	
})("undefined"!=typeof exports&&"undefined"!=typeof global?global:window);