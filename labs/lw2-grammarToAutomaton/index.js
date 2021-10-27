import * as fs from 'fs'
import {parseGrammarToNFA, printNFA} from './parseGrammarToNFA.js'

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

start()