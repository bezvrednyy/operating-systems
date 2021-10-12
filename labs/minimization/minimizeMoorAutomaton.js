import {filterUnique} from '../../common/utils/filterUnique.js'
import {EquivalenceClass, InputSignal, OutputSignal, State} from './model/common.js'
import {MoorAutomatonForMinimizationMap, MoorEquivalenceClassInfo, MoorInitialAutomatonMap} from './model/moorAutomationData.js'

/**
 * @param {Array<string>} rawData
 */
function minimizeMoorAutomaton(rawData) {
	const {
		stateAndOutputSignalsMap,
		initialMoorAutomaton,
	} = parseMoorAutomaton(rawData)
	const automatonForMinimization = convertMoorAutomatonForMinimization({
		stateAndOutputSignalsMap,
		initialMoorAutomaton,
	})
	const equivalenceClassCount = filterUnique(Array.from(stateAndOutputSignalsMap.values())).length
	const minimizedMoorAutomaton = runMinimization(automatonForMinimization, equivalenceClassCount, initialMoorAutomaton)
	console.log(minimizedMoorAutomaton)
	//TODO:Сконвертирвоать автомат в удобочитаемый формат и вернуть его. + Здесь же создать метод распечатки такого формата.
	//TODO:Обновить названия моделей и методов
	//TODO:Реализовать алгоритм минимизации Мили. сперва на листочке #эффективность
}

/**
 * @param {Array<string>} rawData
 * @return {{
 *   stateAndOutputSignalsMap: Map<State, OutputSignal>,
 *   initialMoorAutomaton: MoorInitialAutomatonMap,
 * }}
 */
function parseMoorAutomaton(rawData) {
	/** @type {Map<State, OutputSignal>} */
	const stateAndOutputSignalsMap = new Map()
	/** @type {MoorInitialAutomatonMap} */
	const initialMoorAutomaton = new Map()

	const moorStates = rawData[0].split(' ')
	moorStates.forEach(state => {
		const [startState, outputSignal] = state.split('/')
		stateAndOutputSignalsMap.set(startState, outputSignal)
	})

	for (let i = 1; i < rawData.length; ++i) {
		const [inputSignal, rawNextStates] = rawData[i].split(': ')
		const nextStates = rawNextStates.split(' ')

		Array.from(stateAndOutputSignalsMap.keys()).forEach((startState, k) => {
			const transitionsMap = initialMoorAutomaton.get(startState)
			if (transitionsMap) {
				transitionsMap.set(inputSignal, nextStates[k])
			}
			else {
				initialMoorAutomaton.set(startState, new Map([
					[inputSignal, nextStates[k]],
				]))
			}
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
 *   initialMoorAutomaton: MoorInitialAutomatonMap,
 * }} args
 * @return {MoorAutomatonForMinimizationMap}
 */
function convertMoorAutomatonForMinimization({
	stateAndOutputSignalsMap,
	initialMoorAutomaton,
}) {
	/** @type {MoorAutomatonForMinimizationMap} */
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
 * @param {MoorAutomatonForMinimizationMap} moorAutomaton
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
 * @param {MoorAutomatonForMinimizationMap} moorAutomaton
 * @param {number} previousClassesCount
 * @param {MoorInitialAutomatonMap} initialMoorAutomatonMap
 */
function runMinimization(moorAutomaton, previousClassesCount, initialMoorAutomatonMap) {
	/** @type {MoorAutomatonForMinimizationMap} */
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
	minimizeMoorAutomaton,
}