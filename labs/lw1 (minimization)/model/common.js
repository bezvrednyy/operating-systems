/** @typedef {string} */
let State

/** @typedef {Map<InputSignal, State|EquivalenceClass>} */
let AutomatonTransitionsMap

/**
 * @typedef {Map<State, AutomatonTransitionsMap>}
 */
let TransitionsTableMap

/**
 * @typedef {{
 *   equivalenceClass: EquivalenceClass,
 *   transitions: AutomatonTransitionsMap,
 * }}
 */
let EquivalenceClassInfo

/**
 * @typedef {Map<State, EquivalenceClassInfo>}
 */
let MinimizedAutomatonMap

export {
	State,
	AutomatonTransitionsMap,
	TransitionsTableMap,
	EquivalenceClassInfo,
	MinimizedAutomatonMap,
}