import * as fs from 'fs'
import {minimizeMilesAutomaton} from './minimizeMilesAutomaton.js'
import {minimizeMoorAutomaton} from './minimizeMoorAutomaton.js'

/**
 * @description Нумерация состояний во входном файле должна начинаться с единицы
 */
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
		if (dataRows[0] === 'Mr') {
			minimizeMoorAutomaton(dataRows.slice(4))
		}
		else if (dataRows[0] === 'Ml') {
			minimizeMilesAutomaton(dataRows.slice(4))
		}
	})
}

start()