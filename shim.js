(function () {
	"use strict";

	// modified from https://github.com/kriskowal/es5-shim
	var has = Object.prototype.hasOwnProperty,
		is = require('is-extended'),
		hasDontEnumBug = true,
		dontEnums = [
			"toString",
			"toLocaleString",
			"valueOf",
			"hasOwnProperty",
			"isPrototypeOf",
			"propertyIsEnumerable",
			"constructor"
		],
		dontEnumsLength = dontEnums.length,
		key, keysShim;
	for (key in {"toString": null}) { hasDontEnumBug = false; }

	keysShim = function keys(object) {
		if (!is.isObject(object)) {
			throw new TypeError("Object.keys called on a non-object");
		}

		var i, ii, name, theKeys = [];
		for (name in object) {
			if (has.call(object, name)) {
				theKeys.push(name);
			}
		}

		if (hasDontEnumBug) {
			for (i = 0, ii = dontEnumsLength; i < ii; i++) {
				var dontEnum = dontEnums[i];
				if (has.call(dontEnums, dontEnum)) {
					theKeys.push(dontEnum);
				}
			}
		}
		return theKeys;
	};

	module.exports = keysShim;
}());

