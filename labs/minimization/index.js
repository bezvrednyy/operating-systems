import * as fs from 'fs'
import {filterUnique} from '../../common/utils/filterUnique.js'

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
let MoorAutomatonForMinimizationMap

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
 * @param {{
 *   stateAndOutputSignalsMap: Map<State, OutputSignal>,
 *   initialMoorAutomaton: MoorInitialAutomatonMap,
 * }} args
 * @return {MoorAutomatonForMinimizationMap}
 */
function convertMoorAutomatonForMinimization({
    stateAndOutputSignalsMap,
    initialMoorAutomaton,
}) {
    /** @type {MoorAutomatonForMinimizationMap} */
    const automatonForMinimizationMap = new Map()
    initialMoorAutomaton.forEach((transitionsMap, startState) => {
        /** @type {Map<InputSignal, EquivalenceClass>} */
        const convertedTransitionsMap = new Map()
        transitionsMap.forEach((nextState, inputSignal) => {
            const outputSignal = stateAndOutputSignalsMap.get(nextState)
            convertedTransitionsMap.set(inputSignal, outputSignal)
        })

        automatonForMinimizationMap.set(startState, {
            equivalenceClass: stateAndOutputSignalsMap.get(startState),
            transitions: convertedTransitionsMap,
        })
    })
    return automatonForMinimizationMap
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
            const automatonForMinimization = convertMoorAutomatonForMinimization({
                stateAndOutputSignalsMap,
                initialMoorAutomaton,
            })
            const equivalenceClassCount = filterUnique(Array.from(stateAndOutputSignalsMap.values())).length
            const minimizedMoorAutomaton = minimizeMoorAutomaton(automatonForMinimization, equivalenceClassCount, initialMoorAutomaton)
            console.log('')
        }
    })
}

/**
 * @param {MoorAutomatonForMinimizationMap} moorAutomaton
 * @param {number} previousClassesCount
 * @param {MoorInitialAutomatonMap} initialMoorAutomatonMap
 */
function minimizeMoorAutomaton(moorAutomaton, previousClassesCount, initialMoorAutomatonMap) {
    /** @type {MoorAutomatonForMinimizationMap} */
    const newAutomaton = new Map()
    /** @type {Map<State, EquivalenceClass>} */
    const stateAndEquivalenceClassMap = new Map()

    moorAutomaton.forEach((startStateInfo, startState) => {
        const {equivalenceClass, transitions} = startStateInfo
        let uniqueClassId = equivalenceClass
        transitions.forEach((nextEquivalenceClass, inputSignal) => {
            uniqueClassId += nextEquivalenceClass
        })
        stateAndEquivalenceClassMap.set(startState, uniqueClassId)
    })

    moorAutomaton.forEach((startStateInfo, startState) => {
        const {equivalenceClass, transitions} = startStateInfo
        let uniqueClassId = equivalenceClass
        transitions.forEach((nextEquivalenceClass, inputSignal) => {
            uniqueClassId += nextEquivalenceClass
        })

        /** @type {Map<InputSignal, EquivalenceClass>} */
        const convertedTransitionsMap = new Map()
        transitions.forEach((_, inputSignal) => {
            const nextState = initialMoorAutomatonMap.get(startState).get(inputSignal)
            const equivalenceClass = stateAndEquivalenceClassMap.get(nextState)
            convertedTransitionsMap.set(inputSignal, equivalenceClass)
        })

        newAutomaton.set(startState, {
            equivalenceClass: uniqueClassId,
            transitions: convertedTransitionsMap,
        })
    })

    const currentClassesCount = filterUnique(Array.from(stateAndEquivalenceClassMap.values())).length
    if (currentClassesCount === previousClassesCount) {
        return newAutomaton
    }
    return minimizeMoorAutomaton(newAutomaton, currentClassesCount, initialMoorAutomatonMap)
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
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