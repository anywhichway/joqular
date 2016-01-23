var expect;
if(typeof(window)==="undefined") {
	expect = require("chai").expect;
	require('../index.js');
	Array = Array.extend();
	Set = Set.extend();
	Boolean = Boolean.extend();
	Number = Number.extend();
	String = String.extend();
	Date = Date.extend();
}

describe('Array',function() {
	var now = new Date();
	var a = [1,2,3], ea1 = new Array(1,2,3), ea2 = new Array(4,5,6), ea3 = new Array(now,now,now), ea4 = new Array(now,null,now), ea5 = new Array(1,2,null);
	it('eq ',function() {
		expect(ea1.eq(a)).to.be.true;
	});
	it('eq should fail ',function() {
		expect(ea2.eq(a)).to.be.false;
	});
	it('min ',function() {
		expect(ea1.min()).to.equal(1);
	});
	it('min NaN',function() {
		expect(isNaN([].min())).to.be.true;
	});
	it('min ',function() {
		expect(new Array("c","b","a").min()).to.equal("a");
	});
	it('avg ',function() {
		expect(ea1.avg()).to.equal(2);
	});
	it('avg with null ',function() {
		expect(ea5.avg()).to.equal(1.5);
	});
	it('avg all ',function() {
		expect(ea5.avg(true)).to.equal(1);
	});
	it('avg Date ',function() {
		expect(ea3.avg()).to.equal(now.getTime());
	});
	it('avg Date with null ',function() {
		expect(ea3.avg()).to.equal(now.getTime());
	});
	it('avg NaN ',function() {
		expect(isNaN([].avg())).to.be.true;
	});
	it('max ',function() {
		expect(ea1.max()).to.equal(3);
	});
	it('max ',function() {
		expect(new Array("a","b","c").max()).to.equal("c");
	});
	it('max ',function() {
		expect(isNaN([].max())).to.be.true;
	});
	it('intersection self has same elements ',function() {
		expect(ea1.intersection(ea1).every(function(item,i) { return item===ea1[i]; })).to.be.true;
	});
	it('intersects self is true ',function() {
		expect(ea1.intersects()).to.be.true;
	});
	it('intersects ',function() {
		expect(ea1.intersects(a)).to.be.true;
	});
	it('intersects multiple arguments',function() {
		expect(ea1.intersects(a,a)).to.be.true;
	});
	it('coincident ',function() {
		expect(ea1.coincident(a)).to.be.true;
	});
	it('disjoint ',function() {
		expect(ea1.disjoint(ea2)).to.be.true;
	});
	it('includes ',function() {
		expect(ea1.includes(1)).to.be.true;
	});
	it('excludes ',function() {
		expect(ea1.excludes(-1)).to.be.true;
	});
});
describe('Set',function() {
	var a = new Set([1,2,3]), sa1 = new Set([1,2,3]), sa2 = new Set([4,5,6]);
	it('eq ',function() {
		expect(sa1.eq(a)).to.be.true;
	});
	it('eq should fail ',function() {
		expect(sa2.eq(a)).to.be.false;
	});
	it('neq ',function() {
		expect(sa2.neq(a)).to.be.true;
	});
	it('min ',function() {
		expect(sa1.min()).to.equal(1);
	});
	it('avg ',function() {
		expect(sa1.avg()).to.equal(2);
	});
	it('every ', function() {
		expect(a.every(function(item) {
			return item!=0;
		})).to.be.true;
	});
	it('some ', function() {
		expect(a.some(function(item) {
			return item===3;
		})).to.be.true;
	});
	it('max ',function() {
		expect(sa1.max()).to.equal(3);
	});
	it('intersects ',function() {
		expect(sa1.intersects(a)).to.be.true;
	});
	it('coincident ',function() {
		expect(sa1.coincident(a)).to.be.true;
	});
	it('disjoint ',function() {
		expect(sa1.disjoint(sa2)).to.be.true;
	});
	it('intersects Array ',function() {
		expect(sa1.intersects([1,2,3])).to.be.true;
	});
	it('coincident Array ',function() {
		expect(sa1.coincident([1,2,3])).to.be.true;
	});
	it('disjoint Array ',function() {
		expect(sa1.disjoint([4,5,6])).to.be.true;
	});
});

describe('Boolean',function() {
	var t = true, f = false, etrue = new Boolean(true), efalse = new Boolean(false);
	it('lt ',function() {
		expect(efalse.lt(true)).to.be.true;
	});
	it('lt Object',function() {
		expect(efalse.lt(t)).to.be.true;
	});
	it('eq false',function() {
		expect(efalse.eq(f)).to.be.true;
	});
	it('eq true',function() {
		expect(etrue.eq(t)).to.be.true;
	});
	it('gt ',function() {
		expect(etrue.gt(false)).to.be.true;
	});
	it('gt Object',function() {
		expect(etrue.gt(efalse)).to.be.true;
	});
});


describe('Number',function() {
	var n = 1, en = new Number(1);
	it('lt ',function() {
		expect(en.lt(2)).to.be.true;
	});
	it('eq ',function() {
		expect(en.eq(n)).to.be.true;
	});
	it('eq Number',function() {
		expect(en.eq(n)).to.be.true;
	});
	it('gt ',function() {
		expect(en.gt(0)).to.be.true;
	});
	it('between ', function() {
		expect(en.between(0,2)).to.be.true;
	});
	it('between on first boundary', function() {
		expect(en.between(1,2)).to.be.true;
	});
	it('between on second boundary', function() {
		expect(en.between(2,1)).to.be.true;
	});
	it('outside ', function() {
		expect(en.outside(3,4)).to.be.true;
	});
});

describe('String',function() {
	var s = new String("a string"), es = new String("a string");
	it('eq ',function() {
		expect(es.eq(s)).to.be.true;
	});
	it('soundex ',function() {
		expect(es.echoes("a strng")).to.be.true;
	});
	it('soundex to fail',function() {
		expect(es.echoes("a nmbr")).to.be.false;
	});
	it('between ', function() {
		expect(es.between("*","b")).to.be.true;
	});
	it('between on first boundary', function() {
		expect(es.between(es,"b")).to.be.true;
	});
	it('between on second boundary', function() {
		expect(es.between("b",es)).to.be.true;
	});
	it('outside ', function() {
		expect(es.outside("b","d")).to.be.true;
	});
});

describe('Date',function() {
	var dt = new Date(2016,12,0,0,0,0,0), edt = new Date(2016,12,0,0,0,0,0);
	it('eq ',function() {
		expect(edt.eq(dt)).to.be.true;
	});
	it('eq Y',function() {
		expect(edt.eq(dt,"Y")).to.be.true;
	});
	it('eq M',function() {
		expect(edt.eq(dt,"M")).to.be.true;
	});
	it('eq D',function() {
		expect(edt.eq(dt,"D")).to.be.true;
	});
	it('eq h',function() {
		expect(edt.eq(dt,"h")).to.be.true;
	});
	it('eq m',function() {
		expect(edt.eq(dt,"m")).to.be.true;
	});
	it('eq s',function() {
		expect(edt.eq(dt,"s")).to.be.true;
	});
	it('eq ms',function() {
		expect(edt.eq(dt,"ms")).to.be.true;
	});
	it('getLastDayOfMonth ',function() {
		expect(edt.getLastDayOfMonth()).to.equal(31);
	});
	it('2016 isLeapYear ',function() {
		expect(edt.isLeapYear()).to.be.true
	});
	it('year ',function() {
		edt.year = 2017;
		expect(edt.year).to.equal(2017);
	});
	it('fullYear ',function() {
		edt.fullYear = 2017;
		expect(edt.fullYear).to.equal(2017);
	});
	it('month ',function() {
		edt.month = 0;
		expect(edt.month).to.equal(0);
	});
	it('dayOfMonth ',function() {
		edt.dayOfMonth = 15;
		expect(edt.dayOfMonth).to.equal(15);
	});
	it('hours ',function() {
		edt.hours = 12;
		expect(edt.hours).to.equal(12);
	});
	it('minutes ',function() {
		edt.minutes = 12;
		expect(edt.minutes).to.equal(12);
	});
	it('seconds ',function() {
		edt.seconds = 12;
		expect(edt.seconds).to.equal(12);
	});
	it('milliseconds ',function() {
		edt.milliseconds = 12;
		expect(edt.milliseconds).to.equal(12);
	});
});