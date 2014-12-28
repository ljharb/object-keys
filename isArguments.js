'use strict';

var toStr = Function.call.bind(Object.prototype.toString);

module.exports = function isArguments(value) {
	var str = toStr(value);
	var isArgs = str === '[object Arguments]';
	if (!isArgs) {
		isArgs = str !== '[object Array]'
			&& value !== null
			&& typeof value === 'object'
			&& typeof value.length === 'number'
			&& value.length >= 0
			&& toStr(value.callee) === '[object Function]';
	}
	return isArgs;
};
