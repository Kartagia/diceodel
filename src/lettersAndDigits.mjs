
/**
 * @module util/lettersAndDigits
 */

import { DefaultComparison } from "./comparison.mjs";
import { checkInteger, checkNegativeInteger, checkPositiveInteger } from "./integer.mjs";

/**
 * @typedef {import("../../src/integer.mjs").PositiveInteger & {__digit__: true}} Digit
 */
/**
 *
 * @param {*} tested The tested value.
 * @param {import("./integer.mjs").IntegerCheckerOptions} options
 * @returns {Digit}
 */
export function checkDigit(tested, options = {}) {
    return checkPositiveInteger(tested, {
        ...options, constraint: (value) => (
            (options.constraint === undefined || options.constraint(value)) &&
            (value < 10))
    });
}
/**
 * Predicate testing a value.
 * @template TYPE
 * @callback Predicate
 * @param {TYPE} tested The tested value.
 * @returns {boolean} True, if and only if the value passes the predicate.
 */
/**
 * @typedef {Object} LetterCheckerOptions
 * @property {Predicate<string>} [constraint] The additional constriant for the value.
 * @property {string} [message] The error message.
 * @property {Integer|number} [maxLength=1] The maximum length of the letters.
 * @property {string[]} [rejected=[]] The list of the rejected strings, which are not letters.
 */
/**
 * Check a value is a letter.
 * @param {*} tested The tested value.
 * @param {LetterCheckerOptions} [options] The options of the checker.
 * @returns {Letter} The letter derived from the tested.
 * @throws {SyntaxError} The value was not a letter.
 * @throws {TypeError} The options is invalid.
 */
export function checkLetter(tested, options = {}) {
    if (typeof tested === "string" && tested.length > 0) {
        const { maxLength = 1, rejected = [], constraint = undefined, message: INVALID_LETTER_MESSAGE } = options;
        try {
            checkInteger(maxLength, { message: "Invalid letter option: maxLength is not an integer" });
        } catch (error) {
            throw new TypeError("Invalid letter checker options", { cause: error });
        }
        if (tested.length <= maxLength && (rejected.every((value) => (tested !== value))) && (constraint === undefined || constraint(value))) {
            // The tested is both valid length and not a prohibited value.
            return /** @type {Letter} */ tested;
        }
    }
    throw new SyntaxError(options.message ?? INVALID_LETTER_MESSAGE);
}
/**
 * @template TYPE The type of the digit.
 * @typedef {Object} DigitCheckerOptions
 * @property {TYPE[]} [excluded=[]] The excluded digit values.
 * @property {TYPE} [first="A"] The first letter digit.
 * @property {TYPE} [last="Z"] The last letter digit.
 * @property {import("./comparison.mjs").Compare<TYPE>} [compare=DefaultComparison] The comparison used to compared digits.
 */
/**
 * Check a value is both a letter and a digit.
 * @param {*} tested The tested value.
 * @param {LetterCheckerOptions & DigitCheckerOptions<string>} [options] The options of the checker.
 * @returns {LetterDigit} The letter derived from the tested.
 * @throws {SyntaxError} The value was not a letter.
 */
export function checkLetterDigit(tested, options = {}) {
    const letter = checkLetter(tested, { message: `${INVALID_HEX_DIGIT_MESSAGE} - Invalid letter ${tested}`, ...options });
    const compare = options.compare ?? DefaultComparison;
    if ( (compare((options.first ?? "A"), letter) <= 0) && (compare(letter, (options.last ?? "Z")) >= 0) && (options.excluded ?? []).every(excluded => (letter !== excluded))) {
        return /** @type {LetterDigit} */ letter;
    }

    throw new SyntaxError(`${options.message ?? INVALID_LETTER_DIGIT_MESSAGE} - Invalid letter digit ${tested}`);
}
/**
 * A hex digit.
 * @typedef {Digit|(("A"|"B"|"C"|"D"|"E"|"F") & LetterDigit)} HexDigit
 */
/**
 * Hex digit checker options.
 * The checker options rename the letter digit constraint to "letterConstraint" to prevent conflict, and allow user
 * to supply letter constraints.
 * @typedef { import("./integer.mjs").IntegerCheckerOptions & Omit<LetterCheckerOptions, "constraint"|"message"> & DigitCheckerOptions<string> & {letterConstraint?: Predicate<string>}} HexDigitCheckerOptions
 */

/**
 * @param {*} tested The tested value.
 * @param {HexDigitCheckerOptions} [options] The options of the hex digit checking.
 * @returns {HexDigit} The hex digit.
 * @throws {SyntaxError} THe digit was invalid.
 */
export function checkHexDigit(tested, options = {}) {
    switch (typeof tested) {
        case "string":
            if ("A" <= tested && tested <= "F") {
                return /** @type {HexDigit} */ tested;
            } else {
                break;
            }
            return checkLetterDigit(tested, { message: INVALID_HEX_DIGIT_MESSAGE, first: "A", last: "F", ...options, constraint: options.letterConstraint });
        case "number":
            return checkDigit(tested, { message: options.message ?? INVALID_HEX_DIGIT_MESSAGE });
        default:
            break;
    }
    throw new SyntaxError(INVALID_HEX_DIGIT_MESSAGE);
}
/**
 * The type of a letter.
 * @typedef {string & {__letter__: true}} Letter
 */

export const INVALID_LETTER_MESSAGE = "Invalid letter";
/**
 * A letter which is also a digit.
 * @typedef { Letter & {__digit__: true}} LetterDigit
 */

export const INVALID_LETTER_DIGIT_MESSAGE = "Invalid letter digit";
/**
 * @template TESTED The tested type.
 * @template [TYPE=undefined]
 * @template [PARAM=undefined]
 * @template [ERROR=any]
 * @template [CREATE_PARAM=undefined]
 * @typedef {Object} TestCase
 * @property {CREATE_PARAM} construction The construction parameters.
 * @property {string} name The test case name.
 * @property {PARAM} params The parameters of the call.
 * @property {TESTED} tested The tested value.
 * @property {TYPE} [expected] The expected value.
 * @property {ERROR} [exception] THe expected error.
 */
/**
 * The construction parameters of the reroll policy.
 * @template TYPE The type of the die result values.
 * @typedef {[count: Integer, compare: import("../../src/comparison.mjs").Compare<TYPE>|undefined]} RerollPolicyConstructionParams
 */
/**
 * The base definition of the test cases.
 * @template PARAM The roll result value type.
 * @template [RESULT=PARAM[]] The result type of the policy.
 * @template ERROR The error thrown on failure.
 * @typedef {Omit<TestCase<import("../../src/rerolling.mjs").RerollPolicy<PARAM, RESULT>, RESULT, PARAM[], ERROR, RerollPolicyConstructionParams<PARAM>>, "tested">} BaseRerollPolicyTestCase
 */
/**
 * The error message of an invalid hex digit.
 */

export const INVALID_HEX_DIGIT_MESSAGE = "Invalid hex digit";
/**
 * The comparison using Hex-Digit.
 * @type {Compare<HexDigit>}
 */

export const HexDigitComparison = /** @type {Compare<number|string>}*/ (a, b) => (typeof a === typeof b ? DefaultComparison(a, b) : typeof a === "number" ? checkNegativeInteger(-1) : checkPositiveInteger(1));

