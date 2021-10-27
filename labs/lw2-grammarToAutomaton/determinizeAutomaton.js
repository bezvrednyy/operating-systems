import {GrammarType, MapFA} from './model/AutomatonData.js'

/**
 * @param {{
 *   NFA: MapFA,
 *   grammarType: GrammarType,
 * }} args
 * @return {MapFA}
 */
function determinizeAutomaton({
	NFA,
	grammarType,
}) {
	/** @type {MapFA} */
	const DFA = new Map()
	const firstStartState = NFA.keys().next().value
	DFA.set(firstStartState, NFA.get(firstStartState))

	return DFA
}

export {
	determinizeAutomaton,
}