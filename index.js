"use strict";

// modified from https://github.com/es-shims/es5-shim
var has = Object.prototype.hasOwnProperty,
	toString = Object.prototype.toString,
	isArgs = require('./isArguments'),
	hasDontEnumBug = !({'toString': null}).propertyIsEnumerable('toString'),
	hasProtoEnumBug = (function () {}).propertyIsEnumerable('prototype'),
	dontEnums = [
		"toString",
		"toLocaleString",
		"valueOf",
		"hasOwnProperty",
		"isPrototypeOf",
		"propertyIsEnumerable",
		"constructor"
	];

var keysShim = function keys(object) {
	var isObject = object !== null && typeof object === 'object',
		isFunction = toString.call(object) === '[object Function]',
		isArguments = isArgs(object),
		isString = isObject && toString.call(object) === '[object String]',
		theKeys = [];

	if (!isObject && !isFunction && !isArguments) {
		throw new TypeError("Object.keys called on a non-object");
	}

	var skipProto = hasProtoEnumBug && isFunction;
	if (isString && object.length > 0 && !has.call(object, 0)) {
		for (var i = 0; i < object.length; ++i) {
			theKeys.push(String(i));
		}
	}

	if (isArguments && object.length > 0) {
		for (var j = 0; j < object.length; ++j) {
			theKeys.push(String(j));
		}
	} else {
		for (var name in object) {
			if (!(skipProto && name === 'prototype') && has.call(object, name)) {
				theKeys.push(String(name));
			}
		}
	}

	if (hasDontEnumBug) {
		var ctor = object.constructor;
		var skipConstructor = ctor && ctor.prototype === object;

		for (var j = 0; j < dontEnums.length; ++j) {
			if (!(skipConstructor && dontEnums[j] === 'constructor') && has.call(object, dontEnums[j])) {
				theKeys.push(dontEnums[j]);
			}
		}
	}
	return theKeys;
};

keysShim.shim = function shimObjectKeys() {
	if (!Object.keys) {
		Object.keys = keysShim;
	}
	return Object.keys || keysShim;
};

module.exports = keysShim;

