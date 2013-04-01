(function () {
	"use strict";

	var forEach = function (arr, iterator) {
		var i, len = arr.length;
		for (i = 0; i < len; ++i) {
			iterator(arr[i], i, arr);
		}
	};

	module.exports = forEach;
}());

