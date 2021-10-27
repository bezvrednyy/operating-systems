/** @typedef {'left'|'right'} */
let GrammarType

/**
 * @typedef {{
 *   startState: StartState,
 *   inputSignal: InputSignal,
 *   endState: EndState,
 * }}
 */
let ItemNFA

/**
 * @typedef {Map<InputSignal, EndState>}
 */
let TransitionsMap

/**
 * @typedef {Map<StartState, TransitionsMap>}
 */
let MapDFA

export {
	ItemNFA,
	GrammarType,
	MapDFA,
}