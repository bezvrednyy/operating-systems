import {filterUnique} from '../../common/utils/filterUnique.js'
import {fillTableMap, remapInitialAutomatonMapToMinimizedAutomatonMap, runMinimization} from './common.js'
import {
	EquivalenceClass,
	TransitionsTableMap,
	InputSignal,
	MinimizedAutomatonMap,
	OutputSignal,
	State,
} from './model/common.js'
import {MoorAutomatonPrintInfo} from './model/moorAutomationData.js'

const DEFAULT_INDENT = ' '.repeat(4)

/**
 * @param {Array<string>} rawData
 */
function minimizeMoorAutomaton(rawData) {
	const {
		stateAndOutputSignalsMap,
		initialMoorAutomaton,
	} = parseMoorAutomaton(rawData)
	const automatonForMinimization = remapInitialAutomatonMapToMinimizedAutomatonMap({
		stateAndClassesMap: stateAndOutputSignalsMap,
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
 *   initialMoorAutomaton: TransitionsTableMap,
 * }}
 */
function parseMoorAutomaton(rawData) {
	const moorStates = rawData[0].split(' ')
	const stateAndOutputSignalsMap = createStateAndOutputSignalsMap(moorStates)
	/** @type {TransitionsTableMap} */
	const initialMoorAutomaton = new Map()

	for (let i = 1; i < rawData.length; ++i) {
		const [inputSignal, rawNextStates] = rawData[i].split(': ')
		const nextStates = rawNextStates.split(' ')

		Array.from(stateAndOutputSignalsMap.keys()).forEach((startState, k) => {
			fillTableMap({
				table: initialMoorAutomaton,
				inputSignal,
				startState,
				value: nextStates[k],
			})
		})
	}

	return {
		stateAndOutputSignalsMap,
		initialMoorAutomaton,
	}
}

/**
 * @param {MinimizedAutomatonMap} moorAutomaton
 * @return {MoorAutomatonPrintInfo}
 */
function prepareMoorForPrint(moorAutomaton) {
	/** @type {Map<EquivalenceClass, State>} */
	const resultStatesMap = new Map()
	/** @type {MinimizedAutomatonMap} */
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