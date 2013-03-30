var test = require('tape'); // require('tap').test; // tape works in browserify, tap works in node 0.10
var shimmedKeys = require('./index.js');
var keys = require('./shim.js');

test('works', function (t) {
	var obj = {
		a: true,
		b: true,
		c: true
	};
	var objKeys = ['a', 'b', 'c'];

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
		st.plan(1);
		st.deepEqual(keys(obj), objKeys, 'Object has expected keys');
	});
	t.end();
});

test('works with an object instance', function (t) {
	t.plan(1);
	var Prototype = function () {};
	Prototype.prototype.foo = true;
	var obj = new Prototype();
	obj.bar = true;
	t.deepEqual(keys(obj), ['bar'], 'Instance has expected keys');
});

