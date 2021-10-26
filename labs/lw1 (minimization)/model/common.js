/** @typedef {string} */
let State

/** @typedef {string} */
let OutputSignal

/** @typedef {string} */
let InputSignal

/** @typedef {string} */
let EquivalenceClass

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
	OutputSignal,
	InputSignal,
	EquivalenceClass,
	AutomatonTransitionsMap,
	TransitionsTableMap,
	EquivalenceClassInfo,
	MinimizedAutomatonMap,
}