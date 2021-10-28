import {filterUnique} from '../../common/utils/filterUnique.js'
import {standardCompare} from '../../common/utils/string.js'
import {AutomatonType, MapFA} from './model/AutomatonData.js'

/**
 * @param {{
 *   type: AutomatonType,
 *   automaton: MapFA,
 * }} args
 */
function printFiniteAutomaton({
	type,
	automaton,
}) {
	if (type === 'deterministic') {
		printDFA(automaton)
		return
	}
	printNFA(automaton)
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

/**
 * @param {MapFA} DFA
 */
function printDFA(DFA) {
	const DEFAULT_OFFSET = ' '.repeat(3)
	const inputSignals = []
	DFA.forEach(transitionsMap => inputSignals.push(
		...transitionsMap.keys(),
	))
	const uniqueInputSignals = filterUnique(inputSignals)
	const inputSignalsString = uniqueInputSignals.sort(standardCompare).join(' ')
	console.log(DEFAULT_OFFSET + inputSignalsString)
	DFA.forEach((transitionsMap, startState) => {
		const transitionsString = uniqueInputSignals.map(inputSignal => transitionsMap.get(inputSignal) || '-').join(' ')
		console.log(`${startState}: ${transitionsString}`)
	})
}


export {
	printFiniteAutomaton,
}