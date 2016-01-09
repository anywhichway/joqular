var expect, Validator;
if(typeof(window)==="undefined") {
	expect = require("chai").expect;
	Validator = require('../index.js');
}


function TestObject() {
	this.stringProperty = "a";
	this.numberProperty = 1;
	this.booleanProperty = true;
	this.objectProperty = {};
}
var Anonymous = function() {
	
}
describe('Validator', function() {
  var name = TestObject.name;
  it('should use provided error handler if there is one', function(done) {
	  	var constraint = {};
		constraint.stringProperty = {type: "string"};
		var validator = new Validator(constraint);
		var constructor = validator.bind(TestObject,function(err) { done(); });
		var instance = new constructor();
		instance.stringProperty = undefined;
	  });
  it('should have __kind__ with same name as constructor if not specified, i.e. ' + name, function() {
	var validator = new Validator();
	var constructor = validator.bind(TestObject);
	var result = new constructor();
	expect(result.__kind__).to.be.equal(name);
  });
  describe('type', function () {
	  var to = new TestObject();
	  var properties = Object.keys(to);
	  properties.forEach(function(property) {
		var constraint = {};
		constraint[property] = {type: typeof(to[property])};
		var validator = new Validator(constraint);
		var constructor = validator.bind(TestObject,null,"TestObject");
		var instance = new constructor();
		it('should throw TypeError if value set is not a ' + typeof(to[property]), function () {
			var result;
			try {
				instance[property] = undefined;
			} catch(err) {
				result = err;
			}
			expect(result).to.be.an.instanceOf(Error);
			expect(result.errors[property].validation.type.error).to.be.an.instanceOf(TypeError);
		});
	  });
  });
  describe('ranges',function() {
	 it('should throw RangeError if string value set is not in range', function() {
		 var constraint = {};
		 var range = ["a","c"];
		 var property = "stringProperty";
		 constraint[property] = {between: range};
		 var validator = new Validator(constraint);
		 var constructor = validator.bind(TestObject,null,"TestObject");
		 var instance = new constructor();
		var result;
		try {
			instance[property] = "d";
		} catch(err) {
			result = err;
		}
		expect(result).to.be.an.instanceOf(Error);
		expect(result.errors[property].validation.between.error).to.be.an.instanceOf(RangeError);
	 });
	 it('should throw RangeError if number value set is not in range', function() {
		 var constraint = {};
		 var range = [0,2];
		 var property = "numberProperty";
		 constraint[property] = {between: range};
		 var validator = new Validator(constraint);
		 var constructor = validator.bind(TestObject,null,"TestObject");
		 var instance = new constructor();
		var result;
		try {
			instance[property] = 3;
		} catch(err) {
			result = err;
		}
		expect(result).to.be.an.instanceOf(Error);
		expect(result.errors[property].validation.between.error).to.be.an.instanceOf(RangeError);
	 });
	 it('should throw RangeError if number value set is less than min', function() {
		 var constraint = {};
		 var property = "numberProperty";
		 constraint[property] = {min: 4};
		 var validator = new Validator(constraint);
		 var constructor = validator.bind(TestObject,null,"TestObject");
		 var instance = new constructor();
		var result;
		try {
			instance[property] = 3;
		} catch(err) {
			result = err;
		}
		expect(result).to.be.an.instanceOf(Error);
		expect(result.errors[property].validation.min.error).to.be.an.instanceOf(RangeError);
	 });
	 it('should throw RangeError if number value set is greater than max', function() {
		 var constraint = {};
		 var property = "numberProperty";
		 constraint[property] = {max: 4};
		 var validator = new Validator(constraint);
		 var constructor = validator.bind(TestObject,null,"TestObject");
		 var instance = new constructor();
		var result;
		try {
			instance[property] = 5;
		} catch(err) {
			result = err;
		}
		expect(result).to.be.an.instanceOf(Error);
		expect(result.errors[property].validation.max.error).to.be.an.instanceOf(RangeError);
	 });
  });
  
});