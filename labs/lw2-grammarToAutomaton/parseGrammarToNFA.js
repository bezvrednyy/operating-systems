import {sortChars} from '../../common/utils/string.js'
import {GrammarType, MapFA} from './model/AutomatonData.js'

const END_STATE = 'H'

/**
 * @typedef {{
 *   NFA: MapFA,
 *   grammarType: GrammarType,
 * }}
 */
let ParsedData

/**
 * @param {Array<string>} dataRows
 * @return {?ParsedData}
 */
function parseGrammarToNFA(dataRows) {
	const grammarType = dataRows.length > 3 && defineGrammarType(dataRows[0].toLowerCase())
	if (!grammarType) {
		return null
	}
	/** @type {MapFA} */
	const NFA = new Map()

	for (let i = 2; i < dataRows.length; i++) {
		const [firstNonterminal, rawTransitionsString] = dataRows[i].split(' ')
		const rawTransitions = rawTransitionsString.trim().split('|')
		rawTransitions.forEach(transitionInfo => {
			const inputSignal = transitionInfo[0]
			const secondNonterminal = transitionInfo[1] || END_STATE
			const startState = grammarType === 'right' ? firstNonterminal : secondNonterminal
			const endState = grammarType === 'right' ? secondNonterminal : firstNonterminal
			const transitionsMap = NFA.get(startState)
			if (transitionsMap) {
				//Каждая буква строки - это конечное состояние
				const endStatesString = transitionsMap.get(inputSignal)
				if (endStatesString) {
					transitionsMap.set(inputSignal, sortChars({
						value: endStatesString + endState,
						needFilterUnique: true,
					}))
				}
				else {
					transitionsMap.set(inputSignal, endState)
				}
			}
			else {
				NFA.set(startState, new Map([
					[inputSignal, endState],
				]))
			}
		})
	}

	return {
		NFA,
		grammarType,
	}
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
 * @param {MapFA} NFA
 */
function printNFA(NFA) {
	NFA.forEach((transitionsMap, startState) => {
		transitionsMap.forEach((endStates, inputSignal) => {
			endStates.split('').forEach(endState => {
				console.log(`${startState} ${inputSignal} ${endState}`)
			})
		})
	})
}

export {
	parseGrammarToNFA,
	printNFA,
}
