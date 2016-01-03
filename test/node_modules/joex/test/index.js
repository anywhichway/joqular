var expect;
if(typeof(window)==="undefined") {
	expect = require("chai").expect;
	ExtendedArray = require('../index.js').ExtendedArray;
	ExtendedSet = require('../index.js').ExtendedSet;
	ExtendedBoolean = require('../index.js').ExtendedBoolean;
	ExtendedNumber = require('../index.js').ExtendedNumber;
	ExtendedString = require('../index.js').ExtendedString;
	ExtendedDate = require('../index.js').ExtendedDate;
}

describe('Array',function() {
	var a = new Array(1,2,3), ea = new ExtendedArray(1,2,3);
	it('eq ',function() {
		expect(ea.eq(a)).to.be.true;
	})
});
describe('Set',function() {
	var a = new Set([1,2,3]), ea1 = new ExtendedSet([1,2,3]), ea2 = new ExtendedSet([2,3]);
	it('eq ',function() {
		expect(ea1.eq(a)).to.be.true;
	});
	it('eq should fail ',function() {
		expect(ea2.eq(a)).to.be.false;
	});
	it('neq ',function() {
		expect(ea2.neq(a)).to.be.true;
	})
});

describe('Boolean',function() {
	var b = new Boolean(true), eb = new ExtendedBoolean(true);
	it('eq ',function() {
		expect(eb.eq(b)).to.be.true;
	})
});


describe('Number',function() {
	var n = new Number(1), en = new ExtendedNumber(1);
	it('eq ',function() {
		expect(en.eq(n)).to.be.true;
	})
});

describe('String',function() {
	var s = new String("a string"), es = new ExtendedString("a string");
	it('eq ',function() {
		expect(es.eq(s)).to.be.true;
	})
});

describe('Date',function() {
	var dt = new Date(2016,1,0,0,0,0,0), edt = new ExtendedDate(2016,1,0,0,0,0,0);
	it('eq ',function() {
		expect(edt.eq(dt)).to.be.true;
	})
	it('2016 isLeapYear ',function() {
		expect(edt.isLeapYear()).to.be.true
	});
});