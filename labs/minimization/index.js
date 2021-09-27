import * as fs from 'fs'

/**
 * @typedef {{
 *   state: string,
 *   outputSignal: string,
 * }}
 */
let StateInfo

/**
 * @typedef {Map<string, Array<StateInfo>>}
 */
let MoorAutomaton

/**
 * @param {Array<string>} rawData
 * @return {MoorAutomaton}
 */
function parseMoorAutomaton(rawData) {
    /** @type {MoorAutomaton} */
    const moorAutomaton = new Map()
    const outputSignals = rawData[0].split(' ')
    for (let i = 1; i < rawData.length; ++i) {
        const [inputSignal, rawStates] = rawData[i].split(': ')
        const states = rawStates.split(' ')
        /** @type {Array<StateInfo>} */
        const statesInfo = states.map((state, index) => ({
            state,
            outputSignal: outputSignals[index],
        }))
        moorAutomaton.set(inputSignal, statesInfo)
    }
    return moorAutomaton
}

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
        const dataRows =  data.split('\n')
        if (dataRows[0] === 'Mr') {
            const moorAutomaton = parseMoorAutomaton(dataRows.slice(4))
            printMoorAutomaton(moorAutomaton)
        }
    })
}

/**
 * @param {MoorAutomaton} automaton
 */
function printMoorAutomaton(automaton) {
    automaton.forEach((statesInfo, inputSignal) => {
        let statesText = ''
        statesInfo.forEach(x => statesText += ` ${x.state}/${x.outputSignal}`)
        console.log(`${inputSignal}:${statesText}`)
    })
}

start()