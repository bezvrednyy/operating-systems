import {EquivalenceClass, InputSignal, State} from './common.js'

/** @typedef {Map<InputSignal, State|EquivalenceClass>} */
let MoorTransitionsMap

/**
 * @typedef {Map<State, MoorTransitionsMap>}
 */
let MoorInitialAutomatonMap

/**
 * @typedef {{
 *   equivalenceClass: EquivalenceClass,
 *   transitions: MoorTransitionsMap,
 * }}
 */
let MoorEquivalenceClassInfo

/**
 * @typedef {Map<State, MoorEquivalenceClassInfo>}
 */
let MoorMinimizedAutomatonMap

export {
	MoorTransitionsMap,
	MoorInitialAutomatonMap,
	MoorEquivalenceClassInfo,
	MoorMinimizedAutomatonMap,
}