import {standardCompare} from '../../common/utils/string.js'
import {GrammarType, ItemNFA, MapDFA} from './model/AutomatonData.js'

/**
 * @param {{
 *   NFA: Array<ItemNFA>,
 *   grammarType: GrammarType,
 * }} args
 * @return {MapDFA}
 */
function determinizeAutomaton({
	NFA,
	grammarType,
}) {
	/** @type {MapDFA} */
	const DFA = new Map()
	fillFirstTransitions({
		NFA,
		DFA,
	})
	return DFA
}

/**
 * @param {{
 *   NFA: Array<ItemNFA>,
 *   DFA: MapDFA,
 * }} args
 * @description Заполняем информацию по первому состоянию DFA: определяем все выходы из первого состояния S. Если в граматике правила были записаны криво:
 *   S->..., B->..., затем снова S->..., то программа отработает неккореткно. Чтобы доработать, можно NFA представить в виде Map.
 */
function fillFirstTransitions({
	NFA,
	DFA,
}) {
	let previousItemNFA = NFA[0]
	for (const item of NFA) {
		if (item.startState !== previousItemNFA.startState) {
			break
		}
		const transitionsMap = DFA.get(item.startState)
		if (transitionsMap) {
			const newState = transitionsMap.get(item.inputSignal)
			if (newState) {
				if (!newState.includes(item.endState)) {
					transitionsMap.set(item.inputSignal, sortChars(newState + item.endState))
				}
			}
			else {
				transitionsMap.set(item.inputSignal, item.endState)
			}
		}
		else {
			const newTransitionsMap = new Map([
				[item.inputSignal, item.endState],
			])
			DFA.set(item.startState, newTransitionsMap)
		}
		previousItemNFA = item
	}
}

/**
 * @param {string} value
 * @return {string}
 */
function sortChars(value) {
	return value.split('').sort(standardCompare).join('')
}

export {
	determinizeAutomaton,
}