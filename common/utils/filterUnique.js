/**
 * @template T
 * @param {Array<T>} values
 * @return {Array<T>}
 */
function filterUnique(values) {
	return [...new Set(values)]
}

export {
	filterUnique,
}