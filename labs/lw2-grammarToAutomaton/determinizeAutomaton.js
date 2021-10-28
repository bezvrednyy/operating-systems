import {filterUnique} from '../../common/utils/filterUnique.js'
import {sortChars, standardCompare} from '../../common/utils/string.js'
import {GrammarType, MapFA, TransitionsMap} from './model/AutomatonData.js'

/**
 * @param {{
 *   NFA: MapFA,
 *   grammarType: GrammarType,
 * }} args
 * @return {MapFA}
 */
function determinizeAutomaton({
	NFA,
	grammarType,
}) {
	/** @type {MapFA} */
	const DFA = new Map()
	const firstStartState = NFA.keys().next().value
	DFA.set(firstStartState, NFA.get(firstStartState))
	DFA.forEach(transitionsMap => {
		transitionsMap.forEach(newEndState => {
			if (!DFA.has(newEndState)) {
				/** @type {Array<TransitionsMap>} */
				const transitionsMaps = []
				newEndState.split('').forEach(endState => {
					NFA.has(endState) && transitionsMaps.push(NFA.get(endState))
				})
				DFA.set(newEndState, mergeTransitions(transitionsMaps))
			}
		})
	})

	return DFA
}

/**
 * @param {Array<TransitionsMap>} maps
 * @return {TransitionsMap}
 */
function mergeTransitions(maps) {
	/** @type {TransitionsMap} */
	const newMap = new Map()
	const keys = maps.flatMap(x => [...x.keys()])
	const inputSignals = filterUnique(keys).sort(standardCompare)

	inputSignals.forEach(inputSignal => {
		const states = maps.map(transitionMap => transitionMap.get(inputSignal))
		const resultState = sortChars({
			value: states.join(''),
			needFilterUnique: true,
		})
		newMap.set(inputSignal, resultState)
	})

	return newMap
}

export {
	determinizeAutomaton,
}