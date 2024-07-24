
/**
 * @module utils/integer
 * 
 * A module containing integer operations and methods.
 */

/**
 * A stamped number containing an integer value.
 * @typedef {number & {__integer__: true}} Integer
 */

/**
 * A stamped number containg a negative integer value.
 * @typedef {Integer & {__negative__:true}} NegativeInteger
 */

/**
 * A stamped number containg a positive integer value.
 * @typedef {Integer & {__positive__:true}} PositiveInteger
 */

/**
 * A stamped number containg a zero integer value.
 * @typedef {Integer & {__zero__:true}} ZeroInteger
 */



/**
 * The options for integer checker.
 * @typedef {Object} IntegerCheckerOptions
 * @property {boolean} [allowInfinity=false] Does the checker allow infinite values.
 * @property {boolean} [allowUnsafe=false] Does the checker allow unsafe integers.
 * @property {string} [message="Value was not an integer"] The error message of the exception.
 * @property {Predicate<number>} [constraint] An additional constraint the valid value must pass.
 */

/**
 * Check that a value is an integer.
 * @param {*} value The checked value.
 * @param {IntegerCheckerOptions} options THe checker options.
 * @returns {Integer} An integer value passing the constraints.
 * @throws {SyntaxError} The value was not an integer.
 */
export function checkInteger(value, options = {}) {
    const { allowInfinity = false, allowUnsafe = false, message = "Value was not an integer", constraint = undefined } = options;
    if (typeof value !== "number") {
        throw new SyntaxError(message);
    }
    if (Number.isSafeInteger(value)) {
        return /** @type {Integer} */ value;
    } else if (Number.isInteger(value)) {
        if (allowUnsafe) {
            return /** @type {Integer} */ value;
        }

    } else if (allowInfinity && (value === Number.POSITIVE_INFINITY || value === Number.NEGATIVE_INFINITY)) {
        return /** @type {Integer} */ value;
    }
    throw SyntaxError(message);
}

/**
 * Check that a value is a negative integer.
 * @param {*} value The tested value.
 * @param {IntegerCheckerOptions} [options] The integer checker options.
 * @returns {NegativeInteger} The negative inder of value.
 * @throws {SyntaxError} The value was not a negative integer.
 */
export function checkNegativeInteger(value, options = {}) {
    return /** @type {NegativeInteger} */ checkInteger(value, { ...options, constraint(value) { return (value < 0) && (options.constraint === undefined ?? options.constraint(value)) } });
}

/**
 * Check that a value is a positive integer.
 * @param {*} value The tested value.
 * @param {IntegerCheckerOptions} [options] The integer checker options.
 * @returns {PositiveInteger} The negative inder of value.
 * @throws {SyntaxError} The value was not a negative integer.
 */
export function checkPositiveInteger(value, options = {}) {
    return /** @type {PositiveInteger} */ checkInteger(value, { ...options, constraint(value) { return (value > 0) && (options.constraint === undefined ?? options.constraint(value)) } });
}/**
 * A predicate test.
 * @template [TYPE=any] The tested type.
 * @callback Predicate
 * @param {TYPE} tested The tested value.
 * @returns {boolean} True, if and only if the value fuflils the predicate.
 */
/**
 * Check that value is a zero integer.
 * @param {*} value The tested value.
 * @param {IntegerCheckerOptions} [options] The integer checker options.
 * @returns {ZeroInteger} The integer value equal to zero derived from the value.
 * @throws {SyntaxError} The value was not an integer with zero value.
 */

export function checkZero(value, options = {}) {
    return /** @type {ZeroInteger} */ checkInteger(value, { ...options, constraint(value) { return (value === 0) && (options.constraint === undefined ?? options.constraint(value)); } });
}

