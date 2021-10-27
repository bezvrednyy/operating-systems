/**
 * @param {string} str
 * @return {string}
 */
function fullTrim(str) {
	return str.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' ')
}

/**
 * @param {string} x
 * @param {string} y
 * @return {number}
 */
function standardCompare(x, y) {
	return x.localeCompare(y, 'en', {caseFirst: 'upper'})
}


export {
	fullTrim,
	standardCompare,
}