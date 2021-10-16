import {AutomatonTransitionsMap, InputSignal} from './common.js'

/**
 * @typedef {{
 *   states: string,
 *   transitions: Map<InputSignal, string>,
 * }}
 */
let MoorAutomatonPrintInfo

export {
	AutomatonTransitionsMap,
	MoorAutomatonPrintInfo,
}