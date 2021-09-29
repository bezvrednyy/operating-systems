import {generateKey} from 'crypto'
import * as fs from 'fs'

/** @typedef {string} */
let State

/** @typedef {string} */
let OutputSignal

/** @typedef {string} */
let InputSignal

/** @typedef {string} */
let EqualClass

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
 * @typedef {{
 *   inputSignal: InputSignal,
 *   endEqualClass: EqualClass,
 * }}
 */
let ClassTransitionInfo

/**
 * @typedef {Map<EqualClass, Array<TransitionInfo>>}
 */
let MoorEqualClassesMap

/**
 * @typedef {Map<OutputSignal, MoorEqualClassesMap>}
 */
let MoorConvertedAutomaton

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

/**
 * @param {MoorInitialAutomaton} moorAutomaton
 */
function minimizeMoorAutomaton(moorAutomaton) {
    /** @type {MoorInitialAutomaton} */
    const newAutomaton = new Map()
    for (const [equalClassId, stateTransitionsMap] of moorAutomaton.entries()) {
        /** @type {Map<string, Array<State>>} */
        const subClasses = new Map()
        for (const [startState, transitions] of stateTransitionsMap.entries()) {
            let statesString = ''
            transitions.forEach(({endState}) => statesString += endState)
            const subClassStates = subClasses.get(statesString)
            if (subClassStates) {
                subClassStates.push(startState)
            }
            else {
                subClasses.set(statesString, [startState])
            }
        }
        subClasses.forEach(states => {
            /** @type {MoorStateInfo} */
            const newEqualClass = new Map()
            states.forEach(q => newEqualClass.set(q, []))
            newAutomaton.set(uuidv4(), newEqualClass)
        })
    }
}

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