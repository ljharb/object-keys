var test = require('tape'); // require('tap').test; // tape works in browserify, tap works in node 0.10
var shimmedKeys = require('./index.js');
var keys = require('./shim.js');

test('works', function (t) {
	var obj = {
		a: true,
		b: true,
		c: true
	};
	var obj = {
		"str": "boz",
		"obj": {},
		"arr": [],
		"bool": true,
		"num": 42,
		"null": null,
		"undefined": undefined
	};
	var objKeys = ['str', 'obj', 'arr', 'bool', 'num', 'null', 'undefined'];

	t.test('exports a function', function (st) {
		st.plan(1);
		if (Object.keys) {
			st.equal(Object.keys, shimmedKeys, 'Object.keys is supported and exported');
		} else {
			st.equal(keys, shimmedKeys, 'Object.keys is not supported; shim is exported');
		}
	});

	t.test('working with actual shim', function (st) {
		st.plan(1);
		st.notEqual(Object.keys, keys, 'keys shim is not native Object.keys');
	});

	t.test('works with an object literal', function (st) {
		st.plan(2);
		var theKeys = keys(obj);
		st.equal(Array.isArray(theKeys), true, 'returns an array');
		st.deepEqual(theKeys, objKeys, 'Object has expected keys');
	});

	t.test('returns names which are own properties', function (st) {
		keys(obj).forEach(function (name) {
			st.equal(obj.hasOwnProperty(name), true);
		});
		st.end();
	});

	t.test('returns names which are enumerable', function (st) {
		var loopedValues = [];
		for (var k in obj) {
			loopedValues.push(k);
		}
		keys(obj).forEach(function (name) {
			st.notEqual(loopedValues.indexOf(name), -1, name + ' is not enumerable');
		});
		st.end();
	});

	t.test('throws an error for a non-object', function (st) {
		st.plan(1);
		st.throws(function () {
			return keys(42);
		}, new RangeError(), 'throws on a non-object');
	});
	t.end();
});

test('works with an object instance', function (t) {
	t.plan(2);
	var Prototype = function () {};
	Prototype.prototype.foo = true;
	var obj = new Prototype();
	obj.bar = true;
	var theKeys = keys(obj);
	t.equal(Array.isArray(theKeys), true, 'returns an array');
	t.deepEqual(theKeys, ['bar'], 'Instance has expected keys');
});

