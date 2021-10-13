/**
 * @template T, V
 * @param {Array<T>} array
 * @param {function(T, number):string} getKey
 * @param {function(T, number):V=} getValue
 * @return {Object<string, V>}
 */
function arrayToObject(array, getKey, getValue) {
	return array.reduce((obj, item, index) => {
		obj[getKey(item, index)] = /** @type {V} */(
			getValue ? getValue(item, index) : item
		)
		return obj
	}, /** @type {Object<string, V>} */({}))
}

export {
	arrayToObject,
}