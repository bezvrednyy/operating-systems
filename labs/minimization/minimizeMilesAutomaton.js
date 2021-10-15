import {filterUnique} from '../../common/utils/filterUnique.js'
import {remapInitialAutomatonMapToMinimizedAutomatonMap, runMinimization} from './common.js'
import {EquivalenceClass, InitialAutomatonMap, InputSignal, OutputSignal, State} from './model/common.js'

const DEFAULT_INDENT = ' '.repeat(4)

/**
 * @param {Array<string>} rawData
 */
function minimizeMilesAutomaton(rawData) {
	const {
		stateAndClassesMap,
		initialMoorAutomaton,
	} = parseMilesAutomaton(rawData)

	//TODO: при парсинге можно сразу подготовить формат автомата для минимизации
	const automatonForMinimization = remapInitialAutomatonMapToMinimizedAutomatonMap({
		stateAndClassesMap,
		initialMoorAutomaton,
	})
	const equivalenceClassCount = filterUnique(Array.from(stateAndClassesMap.values())).length
	const minimizedAutomaton = runMinimization(automatonForMinimization, equivalenceClassCount, initialMoorAutomaton)
	console.log(minimizedAutomaton)
	//TODO: подобрать другие тестовые данные для автомата
	// Реализовать метод подготовки автомата Мили к печати и сам метод печати

	// const moorPrintInfo = prepareMoorForPrint(minimizedAutomaton)
	// printMoorAutomaton(moorPrintInfo)
}

/**
 * @param {Array<string>} rawData
 * @return {{
 *   stateAndClassesMap: Map<State, EquivalenceClass>,
 *   initialMoorAutomaton: InitialAutomatonMap,
 * }}
 */
function parseMilesAutomaton(rawData) {
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

	/** @type {Map<State, OutputSignal>} */
	const stateAndClassesMap = new Map()
	/** @type {InitialAutomatonMap} */
	const initialMoorAutomaton = new Map()
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
			fillTransitions(inputSignal, startState, nextState)
		})
	}

	return {
		stateAndClassesMap,
		initialMoorAutomaton,
	}
}

export {
	minimizeMilesAutomaton,
}