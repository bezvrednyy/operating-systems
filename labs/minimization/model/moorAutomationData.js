import {EquivalenceClass, InputSignal, State} from './common.js'

/** @typedef {Map<InputSignal, State>} */
let MoorInitialTransitionsMap

/**
 * @typedef {Map<State, MoorInitialTransitionsMap>}
 */
let MoorInitialAutomatonMap

/**
 * @typedef {{
 *   equivalenceClass: EquivalenceClass,
 *   transitions: Map<InputSignal, EquivalenceClass>
 * }}
 */
let MoorEquivalenceClassInfo

/**
 * @typedef {Map<State, MoorEquivalenceClassInfo>}
 */
let MoorAutomatonForMinimizationMap

export {
	MoorInitialTransitionsMap,
	MoorInitialAutomatonMap,
	MoorEquivalenceClassInfo,
	MoorAutomatonForMinimizationMap,
}