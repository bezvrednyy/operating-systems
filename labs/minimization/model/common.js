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
let InitialAutomatonMap

export {
	State,
	OutputSignal,
	InputSignal,
	EquivalenceClass,
	AutomatonTransitionsMap,
	InitialAutomatonMap,
}