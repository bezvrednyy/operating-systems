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

export {
	ItemNFA,
	GrammarType,
}