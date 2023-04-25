var _storage = Object.create({});

const _store = undefined

module.exports = (id) => {
	if (!_storage[id]) {
		_storage[id] = _store;
	}

	function set(data) {
		_storage[id] = data;
		return data;
	}
	function get() {
		return _storage[id];
	}

	return { get, set };
};
