import {
	EquivalenceClass,
	InitialAutomatonMap,
	InputSignal,
	MinimizedAutomatonMap,
	OutputSignal,
	State,
} from './model/common.js'


/**
 * @param {{
 *   stateAndClassesMap: Map<State, OutputSignal>,
 *   initialMoorAutomaton: InitialAutomatonMap,
 * }} args
 * @return {MinimizedAutomatonMap}
 */
function remapInitialAutomatonMapToMinimizedAutomatonMap({
	stateAndClassesMap,
	initialMoorAutomaton,
}) {
	/** @type {MinimizedAutomatonMap} */
	const automatonForMinimizationMap = new Map()
	initialMoorAutomaton.forEach((transitionsMap, startState) => {
		/** @type {Map<InputSignal, EquivalenceClass>} */
		const convertedTransitionsMap = new Map()
		transitionsMap.forEach((nextState, inputSignal) => {
			const outputSignal = stateAndClassesMap.get(nextState)
			convertedTransitionsMap.set(inputSignal, outputSignal)
		})

		automatonForMinimizationMap.set(startState, {
			equivalenceClass: stateAndClassesMap.get(startState),
			transitions: convertedTransitionsMap,
		})
	})
	return automatonForMinimizationMap
}

export {
	remapInitialAutomatonMapToMinimizedAutomatonMap,
}