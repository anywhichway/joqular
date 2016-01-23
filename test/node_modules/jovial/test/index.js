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
	this.arrayProperty = [];
}
var Anonymous = function() {
	
}
describe('Validator ', function() {
  var name = TestObject.name;
  it('should support batch validation on constructor instance', function() {
	var constraint = {stringProperty: {type: "string"}, numberProperty: {type: "number"}, booleanProperty: {type: "boolean"}};
	var validator = new Validator(constraint);
	var constructor = validator.bind(TestObject,function(err) { done(); });
	var instance = new constructor();
	var err = instance.validate(true);
	expect(err).to.equal(undefined);
  });
  it('should support batch validation error on constructor instance', function() {
		var constraint = {stringProperty: {type: "number"}, numberProperty: {type: "string"}, booleanProperty: {type: "object"}};
		var validator = new Validator(constraint);
		var constructor = validator.bind(TestObject,function(err) { done(); });
		var instance = new constructor();
		var err = instance.validate(true);
		expect(err).to.be.instanceof(Validator.ValidationError);
	  });
  it('should use provided error handler if there is one ', function(done) {
	  	var constraint = {stringProperty: {type: "string"}};
		var validator = new Validator(constraint);
		var constructor = validator.bind(TestObject,function(err) { done(); });
		var instance = new constructor();
		instance.stringProperty = null;
	  });
  it('should have __kind__ with same name as constructor if not specified, i.e. ' + name, function() {
	var validator = new Validator();
	var constructor = validator.bind(TestObject);
	var result = new constructor();
	expect(result.__kind__).to.be.equal(name);
  });
  if(typeof(window)==="object") {
	  it('should throw TypeError if required property is deleted ', function() {
		var constraint = {stringProperty: {required: true}};
		var validator = new Validator(constraint);
		var constructor = validator.bind(TestObject,null,"TestObject");
		var instance = new constructor();
		var result;
		try {
			delete instance.stringProperty;
		} catch(err) {
			result = err;
		}
		expect(result).to.be.an.instanceOf(Error);
		expect(result.errors.stringProperty.validation.required.error).to.be.an.instanceOf(TypeError);
	 });
   }
   it('should transform values ', function() {
	 var constraint = {stringProperty: {transform: function(v) { return v+"b"; }}};
	 var validator = new Validator(constraint);
	 var constructor = validator.bind(TestObject,null,"TestObject");
	 var instance = new constructor();
	 instance.stringProperty = "a";
	 expect(instance.stringProperty).to.equal("ab");
	 });
   it('should throw a RangeError for non-transforming value ', function() {
	 var constraint = {stringProperty: {transform: function(v) { throw new Error("can't transform"); }}};
	 var validator = new Validator(constraint);
	 var constructor = validator.bind(TestObject,null,"TestObject");
	 var instance = new constructor();
	 var result;
	 try {
		 instance.stringProperty = 1;
	 } catch(e) {
		 result = e;
	 }
	expect(result).to.be.an.instanceOf(Error);
	expect(result.errors.stringProperty.validation.transform.error).to.be.an.instanceOf(Error);
   });
   it('should allow a similar sounding word ', function() {
	 var constraint = {stringProperty: {echoes: "eco"}};
	 var validator = new Validator(constraint);
	 var constructor = validator.bind(TestObject,null,"TestObject");
	 var instance = new constructor();
	 instance.stringProperty = "echo";
	 expect(instance.stringProperty).to.equal("echo");
   });
   it('should throw a RangeError for a dis-similar sounding word ', function() {
	 var constraint = {stringProperty: {echoes: "eco"}};
	 var validator = new Validator(constraint);
	 var constructor = validator.bind(TestObject,null,"TestObject");
	 var instance = new constructor();
	 var result;
	 try {
		 instance.stringProperty = "silence";
	 } catch(e) {
		 result = e;
	 }
	expect(result).to.be.an.instanceOf(Error);
	expect(result.errors.stringProperty.validation.echoes.error).to.be.an.instanceOf(RangeError);
   });
   it('should match an SSN using match ', function() {
	 var constraint = {stringProperty: {matches: /^\d{3}-\d{2}-\d{4}$/}};
	 var validator = new Validator(constraint);
	 var constructor = validator.bind(TestObject,null,"TestObject");
	 var instance = new constructor();
	 instance.stringProperty = "555-55-5555";
	 expect(instance.stringProperty).to.equal("555-55-5555");
   });
   it('should throw a RangeError for a non-SSN match ', function() {
	 var constraint = {stringProperty: {matches: /^\d{3}-\d{2}-\d{4}$/}};
	 var validator = new Validator(constraint);
	 var constructor = validator.bind(TestObject,null,"TestObject");
	 var instance = new constructor();
	 var result;
	 try {
		 instance.stringProperty = "555-555-555";
	 } catch(e) {
		 result = e;
	 }
	expect(result).to.be.an.instanceOf(Error);
	expect(result.errors.stringProperty.validation.matches.error).to.be.an.instanceOf(RangeError);
   });
   it('should allow a satisfying value ', function() {
	 var constraint = {stringProperty: {satisfies: isNaN}};
	 var validator = new Validator(constraint);
	 var constructor = validator.bind(TestObject,null,"TestObject");
	 var instance = new constructor();
	 instance.stringProperty = "one";
	 expect(instance.stringProperty).to.equal("one");
   });
   it('should throw a RangeError for a non-satisfying value ', function() {
	 var constraint = {stringProperty: {satisfies: isNaN}};
	 var validator = new Validator(constraint);
	 var constructor = validator.bind(TestObject,null,"TestObject");
	 var instance = new constructor();
	 var result;
	 try {
		 instance.stringProperty = 1;
	 } catch(e) {
		 result = e;
	 }
	expect(result).to.be.an.instanceOf(Error);
	expect(result.errors.stringProperty.validation.satisfies.error).to.be.an.instanceOf(RangeError);
   });
   it('should throw TypeError if required and undefined ', function() {
		var constraint = {stringProperty: {required: true}};
		var validator = new Validator(constraint);
		var constructor = validator.bind(TestObject,null,"TestObject");
		var instance = new constructor();
		var result;
		try {
			instance.stringProperty = undefined;
		} catch(err) {
			result = err;
		}
		expect(result).to.be.an.instanceOf(Error);
		expect(result.errors.stringProperty.validation.required.error).to.be.an.instanceOf(TypeError);
	  });
  describe('type ', function () {
	  var to = new TestObject();
	  to.stringProperty = "b";
	  to.numberProperty = 2;
	  to.booleanProperty = false;
	  to.objectProperty = {nested:true};
	  to.arrayProperty = [0,1];
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
				instance[property] = (typeof(to[property])==="object" ? 1 : null);
			} catch(err) {
				result = err;
			}
			expect(result).to.be.an.instanceOf(Error);
			expect(result.errors[property].validation.type.error).to.be.an.instanceOf(TypeError);
		});
		it('should succeed if value is a ' + typeof(to[property]), function () {
			instance[property] = to[property];
			expect(instance[property]).to.equal(to[property]);
		});
	  });
	  it('should support instanceof check ', function() {
		var constraint = {objectProperty: {type: Object}};
		var validator = new Validator(constraint);
		var constructor = validator.bind(TestObject,null,"TestObject");
		var instance = new constructor();
		var obj = {};
		instance.objectProperty = obj;
		expect(instance.objectProperty).to.equal(obj);
	  });
	  it('should throw TypeError if object is not instanceof ', function() {
		var constraint = {objectProperty: {type: Object}};
		var validator = new Validator(constraint);
		var constructor = validator.bind(TestObject,null,"TestObject");
		var instance = new constructor();
		var result;
		try {
			instance.objectProperty = "a";
		} catch(err) {
			result = err;
		}
		expect(result).to.be.an.instanceOf(Error);
		expect(result.errors.objectProperty.validation.type.error).to.be.an.instanceOf(TypeError);
	  });
	  it('should support SSN check ', function() {
		var constraint = {stringProperty: {type: "SSN"}};
		var validator = new Validator(constraint);
		var constructor = validator.bind(TestObject,null,"TestObject");
		var instance = new constructor();
		instance.stringProperty = "555-55-5555";
		expect(instance.stringProperty).to.equal("555-55-5555");
	  });
	  it('should throw TypeError if value is not SSN ', function() {
		var constraint = {stringProperty: {type: "SSN"}};
		var validator = new Validator(constraint);
		var constructor = validator.bind(TestObject,null,"TestObject");
		var instance = new constructor();
		var result;
		try {
			instance.stringProperty = "a";
		} catch(err) {
			result = err;
		}
		expect(result).to.be.an.instanceOf(Error);
		expect(result.errors.stringProperty.validation.type.error).to.be.an.instanceOf(TypeError);
	  });
	  describe('tel type ', function() {
			var constraint = {stringProperty: {type: "tel"}};
			var validator = new Validator(constraint);
			var constructor = validator.bind(TestObject,null,"TestObject");
			var instance = new constructor();
			it('should support ###-###-#### ', function() {
				instance.stringProperty = "800-555-1212";
				expect(instance.stringProperty).to.equal("800-555-1212");
			});
			it('should support ###.###.#### ', function() {
				instance.stringProperty = "800.555.1212";
				expect(instance.stringProperty).to.equal("800.555.1212");
			});
			it('should support (###) ###-#### ', function() {
				instance.stringProperty = "(800) 555-1212";
				expect(instance.stringProperty).to.equal("(800) 555-1212");
			});
			it('should throw TypeError if value is not tel ', function() {
				var constraint = {stringProperty: {type: "SSN"}};
				var validator = new Validator(constraint);
				var constructor = validator.bind(TestObject,null,"TestObject");
				var instance = new constructor();
				var result;
				try {
					instance.stringProperty = "a";
				} catch(err) {
					result = err;
				}
				expect(result).to.be.an.instanceOf(Error);
				expect(result.errors.stringProperty.validation.type.error).to.be.an.instanceOf(TypeError);
			});
	  	});
	  
	  describe('latlon type ', function() {
			var constraint = {stringProperty: {type: "latlon"}};
			var validator = new Validator(constraint);
			var constructor = validator.bind(TestObject,null,"TestObject");
			var instance = new constructor();
			it('should support 40:26:46N,079:56:55W ', function() {
				instance.stringProperty = "40:26:46N,079:56:55W";
				expect(instance.stringProperty).to.equal("40:26:46N,079:56:55W");
			});
			it('should support 40d 26m 47s N 079d 58\' 36" W ', function() {
				instance.stringProperty = "40d 26m 47s N 079d 58' 36\" W";
				expect(instance.stringProperty).to.equal("40d 26m 47s N 079d 58' 36\" W");
			});
			it('should support 40°26\'47"N 079°58\'36"W ', function() {
				instance.stringProperty = "40°26'47\"N 079°58'36\"W";
				expect(instance.stringProperty).to.equal("40°26'47\"N 079°58'36\"W");
			});
			it('should support 90 00 00.0, 180 00 00.0 ', function() {
				instance.stringProperty = "90 00 00.0, 180 00 00.0";
				expect(instance.stringProperty).to.equal("90 00 00.0, 180 00 00.0");
			});
			it('should support 89 59 50.4141 S 090 29 20.4 E ', function() {
				instance.stringProperty = "89 59 50.4141 S 090 29 20.4 E";
				expect(instance.stringProperty).to.equal("89 59 50.4141 S 090 29 20.4 E");
			});
			it('should support 00 00 00.0, 000 00 00.0 ', function() {
				instance.stringProperty = "00 00 00.0, 000 00 00.0";
				expect(instance.stringProperty).to.equal("00 00 00.0, 000 00 00.0");
			});
			it('should throw TypeError if value is not a latlon ', function() {
				var constraint = {stringProperty: {type: "latlon"}};
				var validator = new Validator(constraint);
				var constructor = validator.bind(TestObject,null,"TestObject");
				var instance = new constructor();
				var result;
				try {
					instance.stringProperty = "a";
				} catch(err) {
					result = err;
				}
				expect(result).to.be.an.instanceOf(Error);
				expect(result.errors.stringProperty.validation.type.error).to.be.an.instanceOf(TypeError);
			});
	  	});
  });
  describe('ranges',function() {
	 it('should throw RangeError if string value set is not in range ', function() {
		 var constraint = {stringProperty: {between: ["a","c"]}};
		 var validator = new Validator(constraint);
		 var constructor = validator.bind(TestObject,null,"TestObject");
		 var instance = new constructor();
		var result;
		try {
			instance.stringProperty = "d";
		} catch(err) {
			result = err;
		}
		expect(result).to.be.an.instanceOf(Error);
		expect(result.errors.stringProperty.validation.between.error).to.be.an.instanceOf(RangeError);
	 });
	 it('should throw RangeError if number value set is not in range ', function() {
		 var constraint = {numberProperty:{between: [0,2]}};
		 var validator = new Validator(constraint);
		 var constructor = validator.bind(TestObject,null,"TestObject");
		 var instance = new constructor();
		var result;
		try {
			instance.numberProperty = 3;
		} catch(err) {
			result = err;
		}
		expect(result).to.be.an.instanceOf(Error);
		expect(result.errors.numberProperty.validation.between.error).to.be.an.instanceOf(RangeError);
	 });
	 it('should throw RangeError if number value set is less than min ', function() {
		 var constraint = {numberProperty: {min: 4}};
		 var validator = new Validator(constraint);
		 var constructor = validator.bind(TestObject,null,"TestObject");
		 var instance = new constructor();
		var result;
		try {
			instance.numberProperty = 3;
		} catch(err) {
			result = err;
		}
		expect(result).to.be.an.instanceOf(Error);
		expect(result.errors.numberProperty.validation.min.error).to.be.an.instanceOf(RangeError);
	 });
	 it('should throw RangeError if number value set is greater than max ', function() {
		 var constraint = {numberProperty: {max: 4}};
		 var validator = new Validator(constraint);
		 var constructor = validator.bind(TestObject,null,"TestObject");
		 var instance = new constructor();
		var result;
		try {
			instance.numberProperty = 5;
		} catch(err) {
			result = err;
		}
		expect(result).to.be.an.instanceOf(Error);
		expect(result.errors.numberProperty.validation.max.error).to.be.an.instanceOf(RangeError);
	 });
	 it('should throw RangeError if string length is not correct ', function() {
		 var constraint = {stringProperty: {length: 1}};
		 var validator = new Validator(constraint);
		 var constructor = validator.bind(TestObject,null,"TestObject");
		 var instance = new constructor();
		var result;
		try {
			instance.stringProperty = "aa";
		} catch(err) {
			result = err;
		}
		expect(result).to.be.an.instanceOf(Error);
		expect(result.errors.stringProperty.validation.length.error).to.be.an.instanceOf(RangeError);
	 });
	 it('should support length check on string ', function() {
		 var constraint = {stringProperty: {length: 2}};
		 var validator = new Validator(constraint);
		 var constructor = validator.bind(TestObject,null,"TestObject");
		 var instance = new constructor();
		 instance.stringProperty = "aa";
		 expect(instance.stringProperty).to.equal("aa");
	 });
	 it('should throw RangeError if string length is not in range ', function() {
		var constraint = {stringProperty: {length: [3,6]}};
		var validator = new Validator(constraint);
		var constructor = validator.bind(TestObject,null,"TestObject");
		var instance = new constructor();
		var result;
		try {
			instance.stringProperty = "aa";
		} catch(err) {
			result = err;
		}
		expect(result).to.be.an.instanceOf(Error);
		expect(result.errors.stringProperty.validation.length.error).to.be.an.instanceOf(RangeError);
	 });
	 it('should support length check on Array ', function() {
		 var constraint = {arrayProperty: {length: 2}};
		 var validator = new Validator(constraint);
		 var constructor = validator.bind(TestObject,null,"TestObject");
		 var instance = new constructor();
		 var value = [0,1];
		 instance.arrayProperty = value;
		 expect(instance.arrayProperty).to.equal(value);
	 });
	 it('should throw RangeError if Array length is not correct ', function() {
		var constraint = {arrayProperty: {length: 1}};
		var validator = new Validator(constraint);
		var constructor = validator.bind(TestObject,null,"TestObject");
		var instance = new constructor();
		var result;
		try {
			instance.arrayProperty = [0,1];
		} catch(err) {
			result = err;
		}
		expect(result).to.be.an.instanceOf(Error);
		expect(result.errors.arrayProperty.validation.length.error).to.be.an.instanceOf(RangeError);
	});
	 it('should support length check on Set ', function() {
		 var constraint = {arrayProperty: {length: 2}};
		 var validator = new Validator(constraint);
		 var constructor = validator.bind(TestObject,null,"TestObject");
		 var instance = new constructor();
		 var value = [0,1];
		 value.count = value.length;
		 instance.arrayProperty = value;
		 expect(instance.arrayProperty).to.equal(value);
	 });
	 it('should throw RangeError if Set length is not correct ', function() {
		var constraint = {arrayProperty: {length: 1}};
		var validator = new Validator(constraint);
		var constructor = validator.bind(TestObject,null,"TestObject");
		var instance = new constructor();
		var result;
		try {
			var value = [0,1];
			value.count = value.length;
			instance.arrayProperty = [0,1];
		} catch(err) {
			result = err;
		}
		expect(result).to.be.an.instanceOf(Error);
		expect(result.errors.arrayProperty.validation.length.error).to.be.an.instanceOf(RangeError);
	});
  });
  
});