/**
 * @param {string} str
 * @return {string}
 */
function fullTrim(str) {
	return str.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' ')
}

export {
	fullTrim,
}