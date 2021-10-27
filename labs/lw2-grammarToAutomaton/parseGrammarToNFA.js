import {GrammarType, ItemNFA} from './model/AutomatonData.js'

const END_STATE = 'H'

/**
 * @param {Array<string>} dataRows
 * @return {?Array<ItemNFA>}
 */
function parseGrammarToNFA(dataRows) {
	const grammarType = dataRows.length > 3 && defineGrammarType(dataRows[0].toLowerCase())
	if (!grammarType) {
		return null
	}
	/** @type {Array<ItemNFA>} */
	const NFA = []

	for (let i = 2; i < dataRows.length; i++) {
		const [firstNonterminal, rawTransitionsString] = dataRows[i].split(' ')
		const rawTransitions = rawTransitionsString.trim().split('|')
		rawTransitions.forEach(transitionInfo => {
			const inputSignal = transitionInfo[0]
			const secondNonterminal = transitionInfo[1] || END_STATE
			NFA.push({
				startState: grammarType === 'right' ? firstNonterminal : secondNonterminal,
				inputSignal,
				endState: grammarType === 'right' ? secondNonterminal : firstNonterminal,
			})
		})
	}

	return NFA
}

/**
 * @param {string} rawType
 * @return {?GrammarType}
 */
function defineGrammarType(rawType) {
	return rawType === 'l'
		? 'left'
		: (rawType === 'r' ? 'right' : null)
}

/**
 * @param {Array<ItemNFA>} NFA
 */
function printNFA(NFA) {
	NFA.forEach(({
		startState,
		inputSignal,
		endState,
	}) => {
		console.log(`${startState} ${inputSignal} ${endState}`)
	})
}

export {
	parseGrammarToNFA,
	printNFA,
}
