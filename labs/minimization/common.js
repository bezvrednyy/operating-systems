import {
	EquivalenceClass,
	EquivalenceClassInfo,
	TransitionsTableMap,
	InputSignal,
	MinimizedAutomatonMap,
	OutputSignal,
	State,
} from './model/common.js'
import {OutputSignalsTableMap} from './model/miliesAutomationData.js'

/**
 * @param {{
 *   stateAndClassesMap: Map<State, OutputSignal>,
 *   initialMoorAutomaton: TransitionsTableMap,
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

/**
 * @param {MinimizedAutomatonMap} moorAutomaton
 * @return {{
 *   getNewClassId: function(EquivalenceClassInfo):string,
 *   newClassesCount: number,
 * }}
 */
function prepareNewClasses(moorAutomaton) {
	/** @type {Map<string, string>} */
	const newClassesMap = new Map()
	let newClassesCount = 0

	/**
	 * @param {EquivalenceClassInfo} startStateInfo
	 * @return {string}
	 */
	function getUniqueStatesClassId(startStateInfo) {
		const {equivalenceClass, transitions} = startStateInfo
		let id = equivalenceClass
		transitions.forEach(nextEquivalenceClass => {
			id += nextEquivalenceClass
		})
		return id
	}

	moorAutomaton.forEach(startStateInfo => {
		const uniqueClassId = getUniqueStatesClassId(startStateInfo)
		if (!newClassesMap.has(uniqueClassId)) {
			newClassesMap.set(uniqueClassId, `S${newClassesCount++}`)
		}
	})

	return {
		getNewClassId: startStateInfo => {
			const key = getUniqueStatesClassId(startStateInfo)
			return newClassesMap.get(key)
		},
		newClassesCount,
	}
}

/**
 * @param {{
 *   table: (TransitionsTableMap|OutputSignalsTableMap),
 *   inputSignal: State,
 *   startState: State,
 *   value: (State|OutputSignal),
 * }} args
 */
function fillTableMap({
	table,
	inputSignal,
	startState,
	value,
}) {
	const transitionsMap = table.get(startState)
	if (transitionsMap) {
		transitionsMap.set(inputSignal, value)
	}
	else {
		table.set(startState, new Map([
			[inputSignal, value],
		]))
	}
}

/**
 * @param {MinimizedAutomatonMap} moorAutomaton
 * @param {number} previousClassesCount
 * @param {TransitionsTableMap} initialMoorAutomatonMap
 */
function runMinimization(moorAutomaton, previousClassesCount, initialMoorAutomatonMap) {
	/** @type {MinimizedAutomatonMap} */
	const newAutomaton = new Map()
	/** @type {Map<State, EquivalenceClass>} */
	const stateAndEquivalenceClassMap = new Map()
	const {getNewClassId, newClassesCount} = prepareNewClasses(moorAutomaton)

	moorAutomaton.forEach((startStateInfo, startState) => {
		const uniqueClassId = getNewClassId(startStateInfo)
		stateAndEquivalenceClassMap.set(startState, uniqueClassId)
	})

	moorAutomaton.forEach((startStateInfo, startState) => {
		const {transitions} = startStateInfo

		/** @type {Map<InputSignal, EquivalenceClass>} */
		const updatedTransitionsMap = new Map()
		transitions.forEach((_, inputSignal) => {
			const nextState = initialMoorAutomatonMap.get(startState).get(inputSignal)
			const equivalenceClass = stateAndEquivalenceClassMap.get(nextState)
			updatedTransitionsMap.set(inputSignal, equivalenceClass)
		})

		newAutomaton.set(startState, {
			equivalenceClass: getNewClassId(startStateInfo),
			transitions: updatedTransitionsMap,
		})
	})

	if (newClassesCount === previousClassesCount) {
		return newAutomaton
	}
	return runMinimization(newAutomaton, newClassesCount, initialMoorAutomatonMap)
}

export {
	remapInitialAutomatonMapToMinimizedAutomatonMap,
	runMinimization,
	fillTableMap,
}