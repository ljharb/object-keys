var test = require('tape');
var is = require('is');
var keys = require('../index.js');
var indexOf = require('indexof');
var has = Object.prototype.hasOwnProperty;
var enumerable = Object.prototype.propertyIsEnumerable;

var obj = {
	str: 'boz',
	obj: {},
	arr: [],
	bool: true,
	num: 42,
	aNull: null,
	undef: undefined
};
var objKeys = ['str', 'obj', 'arr', 'bool', 'num', 'aNull', 'undef'];

test('exports a "shim" function', function (t) {
	t.equal(typeof keys.shim, 'function', 'keys.shim is a function');

	t.test('when Object.keys is present', function (st) {
		var originalObjectKeys = Object.keys;
		Object.keys = function () {};
		var shimmedKeys = keys.shim();
		st.notEqual(Object.keys, keys, 'Object.keys is not overridden');
		st.equal(shimmedKeys, Object.keys, 'Object.keys is returned');
		Object.keys = originalObjectKeys;
		st.end();
	});

	t.test('when Object.keys is not present', function (st) {
		var originalObjectKeys = Object.keys;
		Object.keys = undefined;
		delete Object.keys;
		st.notOk(Object.keys, 'Object.keys has been deleted');
		var shimmedKeys = keys.shim();
		st.equal(Object.keys, keys, 'Object.keys is overridden');
		st.equal(shimmedKeys, keys, 'shim is returned');
		Object.keys = originalObjectKeys;
		st.end();
	});

	t.end();
});

test('working with actual shim', function (t) {
	t.notEqual(Object.keys, keys, 'keys shim is not native Object.keys');
	t.end();
});

test('works with an object literal', function (t) {
	var theKeys = keys(obj);
	t.equal(is.array(theKeys), true, 'returns an array');
	t.deepEqual(theKeys, objKeys, 'Object has expected keys');
	t.end();
});

test('works with an arguments object', function (t) {
	(function () {
		t.equal(arguments.length, 3, 'arguments has length of 3');
		t.deepEqual(keys(arguments), ['0', '1', '2'], 'returns keys of arguments');
	}(1, 2, 3));
	t.end();
});

test('works with a boxed primitive', function (t) {
	t.deepEqual(keys(new String('hello')), ['0', '1', '2', '3', '4'], 'String object returns proper keys');
	t.deepEqual(keys(Object('hello')), ['0', '1', '2', '3', '4'], 'object string returns proper keys');

	var x = new String('x');
	x.y = 1;
	t.deepEqual(keys(x).sort(), ['0', 'y'].sort(), 'String object with extra properties returns proper keys');

	t.end();
});

test('works with an array', function (t) {
	var arr = [1, 2, 3];
	var theKeys = keys(arr);
	t.equal(is.array(theKeys), true, 'returns an array');
	t.deepEqual(theKeys, ['0', '1', '2'], 'Array has expected keys');
	t.end();
});

test('works with a function', function (t) {
	var foo = function () {};
	foo.a = true;

	t.doesNotThrow(function () { return keys(foo); }, 'does not throw an error');
	t.deepEqual(keys(foo), ['a'], 'returns expected keys');
	t.end();
});

test('returns names which are own properties', function (t) {
	var theKeys = keys(obj);
	for (var i = 0; i < theKeys.length; ++i) {
		t.equal(has.call(obj, theKeys[i]), true, theKeys[i] + ' should be returned');
	}
	t.end();
});

test('returns names which are enumerable', function (t) {
	var k, loopedValues = [];
	for (k in obj) {
		if (enumerable.call(obj, k)) {
			loopedValues.push(k);
		}
	}
	var theKeys = keys(obj);
	for (var i = 0; i < theKeys.length; ++i) {
		t.notEqual(indexOf(loopedValues, theKeys[i]), -1, theKeys[i] + ' is not enumerable');
	}
	t.end();
});

test('throws an error for a non-object', function (t) {
	t.throws(
		function () { return keys(42); },
		new TypeError('Object.keys called on a non-object'),
		'throws on a non-object'
	);
	t.end();
});

test('works with an object instance', function (t) {
	var Prototype = function () {};
	Prototype.prototype.foo = true;
	var obj = new Prototype();
	obj.bar = true;
	var theKeys = keys(obj);
	t.equal(is.array(theKeys), true, 'returns an array');
	t.deepEqual(theKeys, ['bar'], 'Instance has expected keys');
	t.end();
});

test('works in iOS 5 mobile Safari', function (t) {
	var Foo = function () {};
	Foo.a = function () {};

	// the bug is keys(Foo) => ['a', 'prototype'] instead of ['a']
	t.deepEqual(keys(Foo), ['a'], 'has expected keys');
	t.end();
});

test('works in environments with the dontEnum bug (IE < 9)', function (t) {
	var Foo = function () {};
	Foo.prototype.a = function () {};

	// the bug is keys(Foo.prototype) => ['a', 'constructor'] instead of ['a']
	t.deepEqual(keys(Foo.prototype), ['a'], 'has expected keys');
	t.end();
});

test('shadowed properties', function (t) {
	var shadowedProps = [
		'dummyControlProp', /* just to be sure */
		'constructor',
		'hasOwnProperty',
		'isPrototypeOf',
		'propertyIsEnumerable',
		'toLocaleString',
		'toString',
		'valueOf'
	];
	shadowedProps.sort();
	var shadowedObject = {};
	for (var i = 0; i < shadowedProps.length; ++i) {
		shadowedObject[shadowedProps[i]] = i;
	}
	var shadowedObjectKeys = keys(shadowedObject);
	shadowedObjectKeys.sort();
	t.deepEqual(shadowedObjectKeys, shadowedProps, 'troublesome shadowed properties are keys of object literals');
	t.end();
});

