'use strict';

var test = require('tape');
var isArguments = require('../isArguments');

test('is.arguments', function (t) {
	t.notOk(isArguments([]), 'array is not arguments', { operator: isArguments });
	(function () { t.ok(isArguments(arguments), 'arguments is arguments', { operator: isArguments }); }());
	(function () {
		var args = Array.prototype.slice.call(arguments);
		t.notOk(isArguments(args), 'sliced arguments is not arguments', { operator: isArguments });
	}());
	var fakeOldArguments = {
		callee: function () {},
		length: 3
	};
	t.ok(isArguments(fakeOldArguments), 'old-style arguments is arguments', { operator: isArguments });
	t.end();
});
