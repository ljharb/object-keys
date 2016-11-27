/* global window */

'use strict';

var test = require('tape');
var is = require('is');
var keysShim = require('../index.js');
var indexOf = require('indexof');
var has = Object.prototype.hasOwnProperty;
var enumerable = Object.prototype.propertyIsEnumerable;

var obj = {
	aNull: null,
	arr: [],
	bool: true,
	num: 42,
	obj: {},
	str: 'boz',
	undef: undefined
};
var objKeys = ['aNull', 'arr', 'bool', 'num', 'obj', 'str', 'undef'];

var noop = function () {};
var preserve = function preserveProperty(object, property, callback) {
	return function preserved() {
		var original = object[property];
		try {
			return callback.apply(this, arguments);
		} finally {
			object[property] = original;
		}
	};
};

test('exports a "shim" function', function (t) {
	t.equal(typeof keysShim.shim, 'function', 'keysShim.shim is a function');

	t.test('when Object.keys is present', preserve(Object, 'keys', function (st) {
		Object.keys = noop;
		st.equal(Object.keys, noop, 'Object.keys has been replaced');
		var shimmedKeys = keysShim.shim();
		st.notEqual(Object.keys, keysShim, 'Object.keys is not overridden');
		st.equal(shimmedKeys, Object.keys, 'Object.keys is returned');
		st.end();
	}));

	t.test('when Object.keys is not present', preserve(Object, 'keys', function (st) {
		Object.keys = undefined;
		delete Object.keys;
		st.notOk(Object.keys, 'Object.keys has been deleted');
		var shimmedKeys = keysShim.shim();
		st.equal(Object.keys, keysShim, 'Object.keys is overridden');
		st.equal(shimmedKeys, keysShim, 'shim is returned');
		st.end();
	}));

	t.test('when Object.keys has arguments bug', preserve(Object, 'keys', function (st) {
		var originalObjectKeys = Object.keys;
		Object.keys = function keys(object) { // eslint-disable-line func-name-matching
			if (is.args(object)) { return []; }
			return originalObjectKeys(object);
		};
		st.notDeepEqual(Object.keys(arguments), ['0'], 'Object.keys has arguments bug');
		var shimmedKeys = keysShim.shim();
		st.equal(Object.keys, shimmedKeys, 'Object.keys is overridden');
		st.deepEqual(Object.keys(arguments), ['0'], 'Object.keys now works with arguments');
		st.end();
	}));

	t.end();
});

test('working with actual shim', function (t) {
	t.notEqual(Object.keys, keysShim, 'keys shim is not native Object.keys');
	t.end();
});

test('works with an object literal', function (t) {
	var theKeys = keysShim(obj);
	t.equal(is.array(theKeys), true, 'returns an array');
	t.deepEqual(theKeys, objKeys, 'Object has expected keys');
	t.end();
});

test('works with an arguments object', function (t) {
	(function () {
		t.equal(arguments.length, 3, 'arguments has length of 3');
		t.deepEqual(keysShim(arguments), ['0', '1', '2'], 'returns keys of arguments');
	}(1, 2, 3));
	t.end();
});

test('works with a boxed primitive', function (t) {
	t.deepEqual(keysShim(Object('hello')), ['0', '1', '2', '3', '4'], 'object string returns proper keys');
	/* eslint-disable no-new-wrappers */
	t.deepEqual(keysShim(new String('hello')), ['0', '1', '2', '3', '4'], 'String object returns proper keys');

	var x = new String('x');
	/* eslint-enable no-new-wrappers */
	x.y = 1;
	t.deepEqual(keysShim(x).sort(), ['0', 'y'].sort(), 'String object with extra properties returns proper keys');

	t.end();
});

test('works with an array', function (t) {
	var arr = [1, 2, 3];
	var theKeys = keysShim(arr);
	t.equal(is.array(theKeys), true, 'returns an array');
	t.deepEqual(theKeys, ['0', '1', '2'], 'Array has expected keys');
	t.end();
});

test('works with a function', function (t) {
	var foo = function () {};
	foo.a = true;

	t.doesNotThrow(function () { return keysShim(foo); }, 'does not throw an error');
	t.deepEqual(keysShim(foo), ['a'], 'returns expected keys');
	t.end();
});

test('returns names which are own properties', function (t) {
	var theKeys = keysShim(obj);
	for (var i = 0; i < theKeys.length; ++i) {
		t.equal(has.call(obj, theKeys[i]), true, theKeys[i] + ' should be returned');
	}
	t.end();
});

test('returns names which are enumerable', function (t) {
	var k;
	var loopedValues = [];
	for (k in obj) {
		if (enumerable.call(obj, k)) {
			loopedValues.push(k);
		}
	}
	var theKeys = keysShim(obj);
	for (var i = 0; i < theKeys.length; ++i) {
		t.notEqual(indexOf(loopedValues, theKeys[i]), -1, theKeys[i] + ' is not enumerable');
	}
	t.end();
});

test('throws an error for a non-object', function (t) {
	t.throws(
		function () { return keysShim(42); },
		new TypeError('Object.keys called on a non-object'),
		'throws on a non-object'
	);
	t.end();
});

test('works with an object instance', function (t) {
	var Prototype = function () {};
	Prototype.prototype.foo = true;
	var instance = new Prototype();
	instance.bar = true;
	var theKeys = keysShim(instance);
	t.equal(is.array(theKeys), true, 'returns an array');
	t.deepEqual(theKeys, ['bar'], 'Instance has expected keys');
	t.end();
});

test('works in iOS 5 mobile Safari', function (t) {
	var Foo = function () {};
	Foo.a = function () {};

	// the bug is keysShim(Foo) => ['a', 'prototype'] instead of ['a']
	t.deepEqual(keysShim(Foo), ['a'], 'has expected keys');
	t.end();
});

test('works in environments with the dontEnum bug (IE < 9)', function (t) {
	var Foo = function () {};
	Foo.prototype.a = function () {};

	// the bug is keysShim(Foo.prototype) => ['a', 'constructor'] instead of ['a']
	t.deepEqual(keysShim(Foo.prototype), ['a'], 'has expected keys');
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
	var shadowedObjectKeys = keysShim(shadowedObject);
	shadowedObjectKeys.sort();
	t.deepEqual(shadowedObjectKeys, shadowedProps, 'troublesome shadowed properties are keys of object literals');
	t.end();
});

test('host objects on `window` constructor.prototype equal to themselves', { skip: typeof window === 'undefined' }, function (t) {
	var keys, exception;
	var excludedKeys = {
		$console: true,
		$external: true,
		$frame: true,
		$frameElement: true,
		$frames: true,
		$innerHeight: true,
		$innerWidth: true,
		$outerHeight: true,
		$outerWidth: true,
		$pageXOffset: true,
		$pageYOffset: true,
		$parent: true,
		$scrollLeft: true,
		$scrollTop: true,
		$scrollX: true,
		$scrollY: true,
		$self: true,
		$webkitIndexedDB: true,
		$webkitStorageInfo: true,
		$window: true
	};
	for (var k in window) {
		keys = undefined;
		exception = undefined;
		if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
			try {
				keys = keysShim(window[k]);
			} catch (e) {
				exception = e;
			}
			t.ok(is.array(keys), 'keys of window["' + k + '"] is an array');
			t.equal(exception, undefined, 'there is no exception: window["' + k + '"]');
		}
	}
	t.end();
});
