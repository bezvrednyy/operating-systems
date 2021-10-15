import {filterUnique} from '../../common/utils/filterUnique.js'
import {EquivalenceClass, InitialAutomatonMap, InputSignal, OutputSignal, State} from './model/common.js'
import {MoorMinimizedAutomatonMap, MoorEquivalenceClassInfo, MoorAutomatonPrintInfo} from './model/moorAutomationData.js'

const DEFAULT_INDENT = ' '.repeat(4)

/**
 * @param {Array<string>} rawData
 */
function minimizeMoorAutomaton(rawData) {
	const {
		stateAndOutputSignalsMap,
		initialMoorAutomaton,
	} = parseMoorAutomaton(rawData)
	const automatonForMinimization = remapMoorInitialAutomatonMapToMoorMinimizedAutomatonMap({
		stateAndOutputSignalsMap,
		initialMoorAutomaton,
	})
	const equivalenceClassCount = filterUnique(Array.from(stateAndOutputSignalsMap.values())).length
	const minimizedMoorAutomaton = runMinimization(automatonForMinimization, equivalenceClassCount, initialMoorAutomaton)
	const moorPrintInfo = prepareMoorForPrint(minimizedMoorAutomaton)
	printMoorAutomaton(moorPrintInfo)
}

/**
 * @param {Array<string>} moorStates
 * @return {Map<State, OutputSignal>}
 */
function createStateAndOutputSignalsMap(moorStates) {
	/** @type {Map<State, OutputSignal>} */
	const map = new Map()

	moorStates.forEach(state => {
		const [startState, outputSignal] = state.split('/')
		map.set(startState, outputSignal)
	})

	return map
}

/**
 * @param {Array<string>} rawData
 * @return {{
 *   stateAndOutputSignalsMap: Map<State, OutputSignal>,
 *   initialMoorAutomaton: InitialAutomatonMap,
 * }}
 */
function parseMoorAutomaton(rawData) {
	/**
	 * @param {InputSignal} inputSignal
	 * @param {State} startState
	 * @param {State} nextState
	 */
	function fillTransitions(inputSignal, startState, nextState) {
		const transitionsMap = initialMoorAutomaton.get(startState)
		if (transitionsMap) {
			transitionsMap.set(inputSignal, nextState)
		}
		else {
			initialMoorAutomaton.set(startState, new Map([
				[inputSignal, nextState],
			]))
		}
	}

	const moorStates = rawData[0].split(' ')
	const stateAndOutputSignalsMap = createStateAndOutputSignalsMap(moorStates)
	/** @type {InitialAutomatonMap} */
	const initialMoorAutomaton = new Map()

	for (let i = 1; i < rawData.length; ++i) {
		const [inputSignal, rawNextStates] = rawData[i].split(': ')
		const nextStates = rawNextStates.split(' ')

		Array.from(stateAndOutputSignalsMap.keys()).forEach((startState, k) => {
			fillTransitions(inputSignal, startState, nextStates[k])
		})
	}

	return {
		stateAndOutputSignalsMap,
		initialMoorAutomaton,
	}
}

/**
 * @param {{
 *   stateAndOutputSignalsMap: Map<State, OutputSignal>,
 *   initialMoorAutomaton: InitialAutomatonMap,
 * }} args
 * @return {MoorMinimizedAutomatonMap}
 */
function remapMoorInitialAutomatonMapToMoorMinimizedAutomatonMap({
	stateAndOutputSignalsMap,
	initialMoorAutomaton,
}) {
	/** @type {MoorMinimizedAutomatonMap} */
	const automatonForMinimizationMap = new Map()
	initialMoorAutomaton.forEach((transitionsMap, startState) => {
		/** @type {Map<InputSignal, EquivalenceClass>} */
		const convertedTransitionsMap = new Map()
		transitionsMap.forEach((nextState, inputSignal) => {
			const outputSignal = stateAndOutputSignalsMap.get(nextState)
			convertedTransitionsMap.set(inputSignal, outputSignal)
		})

		automatonForMinimizationMap.set(startState, {
			equivalenceClass: stateAndOutputSignalsMap.get(startState),
			transitions: convertedTransitionsMap,
		})
	})
	return automatonForMinimizationMap
}

/**
 * @param {MoorMinimizedAutomatonMap} moorAutomaton
 * @return {{
 *   getNewClassId: function(MoorEquivalenceClassInfo):string,
 *   newClassesCount: number,
 * }}
 */
function prepareNewClasses(moorAutomaton) {
	/** @type {Map<string, string>} */
	const newClassesMap = new Map()
	let newClassesCount = 0

	/**
	 * @param {MoorEquivalenceClassInfo} startStateInfo
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
 * @param {MoorMinimizedAutomatonMap} moorAutomaton
 * @param {number} previousClassesCount
 * @param {InitialAutomatonMap} initialMoorAutomatonMap
 */
function runMinimization(moorAutomaton, previousClassesCount, initialMoorAutomatonMap) {
	/** @type {MoorMinimizedAutomatonMap} */
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

/**
 * @param {MoorMinimizedAutomatonMap} moorAutomaton
 * @return {MoorAutomatonPrintInfo}
 */
function prepareMoorForPrint(moorAutomaton) {
	/** @type {Map<EquivalenceClass, State>} */
	const resultStatesMap = new Map()
	/** @type {MoorMinimizedAutomatonMap} */
	const selectiveMoorAutomaton = new Map()

	moorAutomaton.forEach((classInfo, startState) => {
		if (resultStatesMap.has(classInfo.equivalenceClass)) {
			return undefined
		}
		resultStatesMap.set(classInfo.equivalenceClass, startState)
		selectiveMoorAutomaton.set(startState, classInfo)
	})

	let statesString = ''
	/** @type {Map<InputSignal, string>} */
	const transitionsMap = new Map()

	selectiveMoorAutomaton.forEach((classInfo, startState) => {
		statesString += startState + ' '
		classInfo.transitions.forEach((nextClass, inputSignal) => {
			const inputSignalTransitions = transitionsMap.get(inputSignal) || ''
			transitionsMap.set(inputSignal, `${inputSignalTransitions} ${resultStatesMap.get(nextClass)}`)
		})
	})

	return {
		states: statesString,
		transitions: transitionsMap,
	}
}

/**
 * @param {MoorAutomatonPrintInfo} moorPrintInfo
 */
function printMoorAutomaton(moorPrintInfo) {
	console.log(`${DEFAULT_INDENT + moorPrintInfo.states.trim()}`)
	moorPrintInfo.transitions.forEach((states, inputSignal) => {
		console.log(`${inputSignal}: ${states.trim()}`)
	})
}

export {
	minimizeMoorAutomaton,
}