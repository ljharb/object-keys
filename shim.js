(function () {
	"use strict";

	// modified from https://github.com/kriskowal/es5-shim
	var has = Object.prototype.hasOwnProperty,
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
		dontEnumsLength = dontEnums.length;
	for (var key in {"toString": null}) { hasDontEnumBug = false; }

	var keysShim = function keys(object) {
		if ((typeof object !== "object" && typeof object !== "function") || object === null) {
			throw new TypeError("Object.keys called on a non-object");
		}

		var keys = [];
		for (var name in object) {
			if (has.call(object, name)) {
				keys.push(name);
			}
		}

		if (hasDontEnumBug) {
			for (var i = 0, ii = dontEnumsLength; i < ii; i++) {
				var dontEnum = dontEnums[i];
				if (has.call(dontEnums, dontEnum)) {
					keys.push(dontEnum);
				}
			}
		}
		return keys;
	};

	module.exports = keysShim;
}());

