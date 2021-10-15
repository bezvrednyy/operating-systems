import {AutomatonTransitionsMap, EquivalenceClass, InputSignal, State} from './common.js'

/**
 * @typedef {{
 *   equivalenceClass: EquivalenceClass,
 *   transitions: AutomatonTransitionsMap,
 * }}
 */
let MoorEquivalenceClassInfo

/**
 * @typedef {Map<State, MoorEquivalenceClassInfo>}
 */
let MoorMinimizedAutomatonMap

/**
 * @typedef {{
 *   states: string,
 *   transitions: Map<InputSignal, string>,
 * }}
 */
let MoorAutomatonPrintInfo

export {
	AutomatonTransitionsMap,
	MoorEquivalenceClassInfo,
	MoorMinimizedAutomatonMap,
	MoorAutomatonPrintInfo,
}