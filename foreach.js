var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

module.exports = function forEach(obj, fn) {
	if (toString.call(fn) !== '[object Function]') {
		throw new TypeError('iterator must be a function');
	}
	var i, k,
		l = obj.length,
		context = arguments.length > 2 ? arguments[2] : this;
	if (l === +l) {
		for (i = 0; i < l; i++) {
			fn.call(context, obj[i], i, obj);
		}
	} else {
		for (k in obj) {
			if (hasOwn.call(obj, k)) {
				fn.call(context, obj[k], k, obj);
			}
		}
	}
};

