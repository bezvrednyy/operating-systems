import * as fs from 'fs'

/** @typedef {string} */
let State

/** @typedef {string} */
let OutputSignal

/** @typedef {string} */
let InputSignal

/** @typedef {string} */
let EquivalenceClass

/** @typedef {Map<InputSignal, State>} */
let MoorInitialTransitionsMap

/**
 * @typedef {Map<State, MoorInitialTransitionsMap>}
 */
let MoorInitialAutomatonMap

/**
 * @typedef {{
 *   equivalenceClass: EquivalenceClass,
 *   transitions: Map<InputSignal, EquivalenceClass>
 * }}
 */
let MoorEquivalenceClassInfo

/**
 * @typedef {Map<State, MoorEquivalenceClassInfo>}
 */
let MoorConvertedAutomaton

/**
 * @param {Array<string>} rawData
 * @return {{
 *   stateAndOutputSignalsMap: Map<State, OutputSignal>,
 *   initialMoorAutomaton: MoorInitialAutomatonMap,
 * }}
 */
function parseMoorAutomaton(rawData) {
    /** @type {Map<State, OutputSignal>} */
    const stateAndOutputSignalsMap = new Map()
    /** @type {MoorInitialAutomatonMap} */
    const initialMoorAutomaton = new Map()



    const moorStates = rawData[0].split(' ')
    moorStates.forEach(state => {
        const [startState, outputSignal] = state.split('/')
        stateAndOutputSignalsMap.set(startState, outputSignal)
    })

    for (let i = 1; i < rawData.length; ++i) {
        const [inputSignal, rawNextStates] = rawData[i].split(': ')
        const nextStates = rawNextStates.split(' ')

        Array.from(stateAndOutputSignalsMap.keys()).forEach((startState, k) => {
            const transitionsMap = initialMoorAutomaton.get(startState)
            if (transitionsMap) {
                transitionsMap.set(inputSignal, nextStates[k])
            } else {
                initialMoorAutomaton.set(startState, new Map([
                    [inputSignal, nextStates[k]],
                ]))
            }
        })
    }

    return {
        stateAndOutputSignalsMap,
        initialMoorAutomaton,
    }
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
            const {
                stateAndOutputSignalsMap,
                initialMoorAutomaton,
            } = parseMoorAutomaton(dataRows.slice(4))
        }
    })
}

// /**
//  * @param {MoorConvertedAutomaton} moorAutomaton
//  */
// function minimizeMoorAutomaton(moorAutomaton) {
//     /** @type {MoorConvertedAutomaton} */
//     const newAutomaton = new Map()
//     for (const [equalClassId, stateTransitionsMap] of moorAutomaton.entries()) {
//         /** @type {Map<string, Array<State>>} */
//         const subClasses = new Map()
//         for (const [startState, transitions] of stateTransitionsMap.entries()) {
//             let statesString = ''
//             transitions.forEach(({endState}) => statesString += endState)
//             const subClassStates = subClasses.get(statesString)
//             if (subClassStates) {
//                 subClassStates.push(startState)
//             }
//             else {
//                 subClasses.set(statesString, [startState])
//             }
//         }
//         subClasses.forEach(states => {
//             /** @type {MoorStateInfo} */
//             const newEqualClass = new Map()
//             states.forEach(q => newEqualClass.set(q, []))
//             newAutomaton.set(uuidv4(), newEqualClass)
//         })
//     }
// }

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
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