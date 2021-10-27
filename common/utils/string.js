import {filterUnique} from './filterUnique.js'

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

/**
 * @param {{
 *   value: string,
 *   needFilterUnique: (boolean|undefined),
 * }} args
 * @return {string}
 */
function sortChars({
	value,
	needFilterUnique,
}) {
	const sortedChars = value.split('').sort(standardCompare)
	return needFilterUnique
		? filterUnique(sortedChars).join('')
		: sortedChars.join('')
}

export {
	fullTrim,
	standardCompare,
	sortChars,
}