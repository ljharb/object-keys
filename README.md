#object-keys

[![browser support](https://ci.testling.com/ljharb/object-keys.png)](https://ci.testling.com/ljharb/object-keys)

An Object.keys shim. Uses Object.keys if available.

## Example

```js
var keys = require('object-keys');
var assert = require('assert');
var obj = {
	a: true,
	b: true,
	c: true
};

assert.equal(keys(obj), ['a', 'b', 'c']);
```

## Source
Implementation taken directly from https://github.com/kriskowal/es5-shim/blob/master/es5-shim.js#L542-589
