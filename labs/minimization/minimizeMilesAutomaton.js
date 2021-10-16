import {filterUnique} from '../../common/utils/filterUnique.js'
import {
	fillTableMap,
	remapInitialAutomatonMapToMinimizedAutomatonMap,
	runMinimization,
} from './common.js'
import {
	EquivalenceClass,
	TransitionsTableMap,
	InputSignal,
	MinimizedAutomatonMap,
	OutputSignal,
	State,
} from './model/common.js'
import {OutputSignalsTableMap} from './model/miliesAutomationData.js'
import {MoorAutomatonPrintInfo} from './model/moorAutomationData.js'

const DEFAULT_INDENT = ' '.repeat(4)

/**
 * @param {Array<string>} rawData
 */
function minimizeMilesAutomaton(rawData) {
	const {
		stateAndClassesMap,
		initialMoorAutomaton,
		outputSignalsMap,
	} = parseMilesAutomaton(rawData)

	//TODO: при парсинге можно сразу подготовить формат автомата для минимизации
	const automatonForMinimization = remapInitialAutomatonMapToMinimizedAutomatonMap({
		stateAndClassesMap,
		initialMoorAutomaton,
	})
	const equivalenceClassCount = filterUnique(Array.from(stateAndClassesMap.values())).length
	const minimizedAutomaton = runMinimization(automatonForMinimization, equivalenceClassCount, initialMoorAutomaton)
	const automatonForPrint = prepareMilesForPrint({
		milesAutomaton: minimizedAutomaton,
		outputSignalsMap,
	})
	printMoorAutomaton(automatonForPrint)
	//TODO:Проедебажить минимизацию: https://masters.donntu.org/2007/fvti/maluk/library/lib9.htm
}

/**
 * @param {Array<string>} rawData
 * @return {{
 *   stateAndClassesMap: Map<State, EquivalenceClass>,
 *   initialMoorAutomaton: TransitionsTableMap,
 *   outputSignalsMap: OutputSignalsTableMap,
 * }}
 */
function parseMilesAutomaton(rawData) {
	/** @type {Map<State, OutputSignal>} */
	const stateAndClassesMap = new Map()
	/** @type {TransitionsTableMap} */
	const initialMoorAutomaton = new Map()
	/** @type {OutputSignalsTableMap} */
	const outputSignalsMap = new Map()
	const stateLetter = rawData[0]

	for (let i = 1; i < rawData.length; ++i) {
		const [inputSignal, rawNextStates] = rawData[i].split(': ')
		const nextStates = rawNextStates.split(' ')

		nextStates.forEach((stateAndOutputSignal, k) => {
			const startState = `${stateLetter}${k + 1}`
			const [nextState, outputSignal] = stateAndOutputSignal.split('/')
			const classesName = stateAndClassesMap.has(startState)
				? stateAndClassesMap.get(startState) + outputSignal
				: outputSignal
			stateAndClassesMap.set(startState, classesName)
			fillTableMap({
				table: initialMoorAutomaton,
				startState,
				inputSignal,
				value: nextState,
			})
			fillTableMap({
				table: outputSignalsMap,
				startState,
				inputSignal,
				value: outputSignal,
			})
		})
	}

	return {
		stateAndClassesMap,
		initialMoorAutomaton,
		outputSignalsMap,
	}
}

/**
 * @param {{
 *   milesAutomaton: MinimizedAutomatonMap,
 *   outputSignalsMap: OutputSignalsTableMap,
 * }} args
 * @return {MoorAutomatonPrintInfo}
 */
function prepareMilesForPrint({
	milesAutomaton,
	outputSignalsMap,
}) {
	/** @type {Map<EquivalenceClass, State>} */
	const resultStatesMap = new Map()
	/** @type {MinimizedAutomatonMap} */
	const selectiveMoorAutomaton = new Map()

	milesAutomaton.forEach((classInfo, startState) => {
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
		statesString += startState + DEFAULT_INDENT
		classInfo.transitions.forEach((nextClass, inputSignal) => {
			const inputSignalTransitions = transitionsMap.get(inputSignal) || ''
			const newState = resultStatesMap.get(nextClass)
			const outputSignal = outputSignalsMap.get(startState).get(inputSignal)
			transitionsMap.set(inputSignal, `${inputSignalTransitions} ${newState}/${outputSignal}`)
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
	console.log(`${DEFAULT_INDENT + ' ' + moorPrintInfo.states.trim()}`)
	moorPrintInfo.transitions.forEach((states, inputSignal) => {
		console.log(`${inputSignal}: ${states.trim()}`)
	})
}


export {
	minimizeMilesAutomaton,
}