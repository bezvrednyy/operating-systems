/** @typedef {'left'|'right'} */
let GrammarType

/**
 * @typedef {Map<InputSignal, EndState>}
 */
let TransitionsMap

/**
 * @typedef {Map<StartState, TransitionsMap>}
 */
let MapFA //Единая модель для NFA и DFA

export {
	GrammarType,
	MapFA,
}