import * as fs from 'fs'
import {GrammarType, ItemNFA} from './model/AutomatonData.js'

const END_STATE = 'H'

function start() {
	if (process.argv.length !== 3) {
		throw new Error('Invalid args count')
	}
	const inputPath = process.argv[2]
	fs.readFile(inputPath, 'utf8', (err, data) => {
		if (err) {
			console.log(err)
			return
		}
		const dataRows = data.split('\n')
		const NFA = parseGrammarToNFA(dataRows)
		if (!NFA) {
			console.error('Invalid syntax')
			return
		}
		printNFA(NFA)
	})
}

/**
 * @param {Array<string>} dataRows
 * @return {?Array<ItemNFA>}
 */
function parseGrammarToNFA(dataRows) {
	const grammarType = dataRows.length > 3 && defineGrammarType(dataRows[0].toLowerCase())
	if (!grammarType) {
		return null
	}
	/** @type {Array<ItemNFA>} */
	const NFA = []

	for (let i = 2; i < dataRows.length; i++) {
		const [firstNonterminal, rawTransitionsString] = dataRows[i].split(' ')
		const rawTransitions = rawTransitionsString.trim().split('|')
		rawTransitions.forEach(transitionInfo => {
			const inputSignal = transitionInfo[0]
			const secondNonterminal = transitionInfo[1] || END_STATE
			NFA.push({
				startState: grammarType === 'right' ? firstNonterminal : secondNonterminal,
				inputSignal,
				endState: grammarType === 'right' ? secondNonterminal : firstNonterminal,
			})
		})
	}

	return NFA
}

/**
 * @param {string} rawType
 * @return {?GrammarType}
 */
function defineGrammarType(rawType) {
	return rawType === 'l'
		? 'left'
		: (rawType === 'r' ? 'right' : null)
}

/**
 * @param {Array<ItemNFA>} NFA
 */
function printNFA(NFA) {
	NFA.forEach(({
		startState,
		inputSignal,
		endState,
	}) => {
		console.log(`${startState} ${inputSignal} ${endState}`)
	})
}

start()