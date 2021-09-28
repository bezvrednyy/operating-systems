import * as fs from 'fs'

/** @typedef {string} */
let State

/** @typedef {string} */
let OutputSignal

/** @typedef {string} */
let InputSignal

/**
 * @typedef {{
 *   inputSignal: InputSignal,
 *   endState: State,
 * }}
 */
let TransitionInfo

/**
 * @typedef {Map<State, Array<TransitionInfo>>}
 */
let MoorStateInfo

/**
 * @typedef {Map<OutputSignal, MoorStateInfo>}
 */
let MoorInitialAutomaton

/**
 * @param {Array<string>} rawData
 * @return {MoorInitialAutomaton}
 */
function parseMoorAutomaton(rawData) {
    /** @type {MoorInitialAutomaton} */
    const moorAutomaton = new Map()
    /** @type {Map<InputSignal, Array<State>>} */
    const transitionsMap = new Map()

    for (let i = 1; i < rawData.length; ++i) {
        const [inputSignal, rawStates] = rawData[i].split(': ')
        const states = rawStates.split(' ')
        transitionsMap.set(inputSignal, states)
    }

    const moorStates = rawData[0].split(' ')
    moorStates.forEach((moorState, index) => {
        const [state, outputSignal] = moorState.split('/')
        const stateTransitionsMap = moorAutomaton.get(outputSignal)
        if (stateTransitionsMap) {
            if (stateTransitionsMap.has(state)) {
                throw new Error(`Ошибка синтаксиса: дублирование состояния: "${state}".`)
            }
            stateTransitionsMap.set(state, convertRawTransitionsToArrayByIndex(transitionsMap, index))
        }
        else {
            moorAutomaton.set(outputSignal, new Map([
                [state, convertRawTransitionsToArrayByIndex(transitionsMap, index)],
            ]))
        }
    })

    return moorAutomaton
}

/**
 * @param {Map<InputSignal, Array<State>>} rawTransitions
 * @param {number} index
 * @return
 */
function convertRawTransitionsToArrayByIndex(rawTransitions, index) {
    const inputSignals = Array.from(rawTransitions.keys())
    return inputSignals.map(x => ({
        inputSignal: x,
        endState: rawTransitions.get(x)[index],
    }))
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
        }
    })
}

// /**
//  * @param {MoorAutomaton} automaton
//  */
// function printMoorAutomaton(automaton) {
//     automaton.forEach((statesInfo, inputSignal) => {
//         let statesText = ''
//         statesInfo.forEach(x => statesText += ` ${x.state}/${x.outputSignal}`)
//         console.log(`${inputSignal}:${statesText}`)
//     })
// }
//
// /**
//  * @param {MoorAutomaton} automaton
//  */
// function firstMoorMinimization(automaton) {
//
// }

start()