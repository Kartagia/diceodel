
/**
 * @module testkit/utils
*/

/**
 * The options for stringification.
 * @typedef {Object} ToStringOptions
 * @property {string} [prefix=""] The prefix of the values.
 * @property {string} [suffix=""] The suffix fo the values.
 * @property {string} [open] The opening of the entry list.
 * @property {string} [close] The closing of the entry list.
 * @property {string} [indent] The identation used for array or object entreis.
 * Defaults to no identation.
 * @property {boolean} [showMethods=false] Does the object stringification show methods.
 * @property {boolean} [showSymbols=false] DOes the object stringification show symbol properties.
 * @property {string} [memberPrefix=""] The prefix used for array member value stringification.
 * @property {string} [memberSuffix=""] The suffix used for array member value stringification.
 * @property {boolean} [indexPrefix=false] Does array entries contain index prefix. 
 * @property {boolean} [propertyPrefix=true] Does object entries containt property name prefix.
 */

/**
 * Create the string representation of a symbol. The string representation uses the
 * global symbol name, or the symbol index. 
 * @param {symbol} value The stringified value.
 * @param {ToStringOptions} [options] The stringificaiton options. 
 * @returns {string} The given value stringified.
 * @throws {SyntaxError} The stringification was not possible.
 */
export function symbolToString(value, options = {}) {
    if (typeof value === "symbol") {
        return `${options.prefix ?? ""}Symbol [${Symbol.keyFor(prop) ?? `local [${value.description}]`}]${options.suffix ?? ""}`;
    } else {
        throw new SyntaxError("The value was not a symbol");
    }
}

/**
 * Create the string representation of a funciton.
 * @param {function} value The stringified value.
 * @param {ToStringOptions} [options] The stringificaiton options. 
 * @returns {string} The given value stringified.
 * @throws {SyntaxError} The stringification was not possible.
 */
export function functionToString(value, options = {}) {
    if (typeof value === "function") {
        return `${options.prefix ?? ""}Function ${toString(value.name ?? "anonymous")}()${options.suffix ?? ""}`;
    } else {
        throw new SyntaxError("The value was not a symbol");
    }
}



/**
 * Create a string representation of an array for human reporting.
 * @param {*[]} value The stringified value.
 * @param {ToStringOptions} [options] The stringificaiton options. 
 * @returns {string} The given value stringified.
 * @throws {SyntaxError} The stringification was not possible.
 */
export function arrayToString(value, options = {}) {
    if (Array.isArray(value)) {
        const open = options.open ?? "[";
        const close = options.close ?? "]";
        const prefix = "" + (options.prefix ?? "");
        const delimiter = `,${options.indent ? "\n" : " "}`;
        const indent = options.indent ?? "";
        const suffix = "" + (options.suffix ?? "");
        const memberOptions = { ...options, prefix: options.memberPrefix ?? "", suffix: options.memberSuffix ?? "" };
        const entryPrefix = options.indexPrefix ? ((index) => (`[${index}]:`)) : () => '';
        if (options.indent === undefined) {
            // No indentation
            return `${prefix}${open}${value.map((value, index) => `${entryPrefix(index)}${toString(value, memberOptions)}`).join(delimiter)}${close}${suffix}`;
        } else {
            // With indentation
            return `${prefix}${open}${value.length > 0 ? "\n" : ""}${value.map(
                (entry, index) => (`${prefix}${indent}${entryPrefix(index)}${toString(entry, memberOptions)}`)
            ).join(delimiter)}${value.length > 0 ? "\n" : ""}${prefix}${close}${suffix}`;
        }
    } else {
        throw new SyntaxError("Not an array");
    }
}


/**
 * The predicate testing is the value a function.
 * @param {*} value THe tested value.
 * @returns {boolean} True, if and only if the value is function.
 */
export function isFunction(value) { return typeof value === "function" };


/**
 * Create a string representation of an object for human reporting.
 * @param {object} value The stringified value.
 * @param {ToStringOptions} [options] The stringificaiton options. 
 * @returns {string} The given value stringified.
 * @throws {SyntaxError} The stringification was not possible.
 */
export function objectToString(value, options = {}) {
    const open = options.open ?? "{";
    const close = options.close ?? "}";
    const prefix = "" + (options.prefix ?? "");
    const delimiter = `,${options.indent ? "\n" : " "}`;
    const indent = options.indent ?? "";
    const suffix = "" + (options.suffix ?? "");
    const memberOptions = { ...options, prefix: "", suffix:  "" };
    const entryPrefix = options.propertyPrefix ? ((property) => (`${indent}${options.memberPrefix ?? ""}[${property}]:`)) : () => (`${indent}${options.memberPrefix ?? ""}`);
    if (typeof value !== "object") {
        throw new SyntaxError("Not an object");
    } else if (value === null) {
        return `${prefix}null${suffix}`;
    } else {
        const result = [];
        Object.getOwnPropertyNames(value).filter((prop) => (!isFunction(value[prop]))).reduce((propResult, prop) => {
            propResult.push(`${entryPrefix(prop)}${toString(value[prop], memberOptions)}${options.memberSuffix ?? ""}`);
            return propResult;
        }, result);
        if (options.showSymbols) {
            Object.getOwnPropertySymbols(value).filter((prop) => (!isFunction(value[prop]))).reduce(
                (propResult, prop) => (propResult.push(`${entryPrefix(symbolToString(prop))}${toString(value[prop], memberOptions)}${options.memberSuffix ?? ""}`)), result
            )
        }
        if (options.showMethods) {
            Object.getOwnPropertyNames(value).filter((prop) => (isFunction(value[prop]))).reduce(
                (propResult, prop) => {
                    propResult.push(`${options.memberPrefix ?? ""}Function ${prop.name}()${options.memberSuffix ?? ""}`);
                    return propResult;
                }, result
            );
            if (options.showSymbols) {
                Object.getOwnPropertySymbols(value).filter((prop) => (isFunction(value[prop]))).reduce(
                    (propResult, prop) => {
                        propResult.push(`${options.memberPrefix ?? ""}Function ${symbolToString(prop)}()${options.memberSuffix ?? ""}`);
                        return propResult;
                    }, result
                );
            }
        }

        if (options.indent === undefined) {
            return `${prefix}${open}${result.join(delimiter)}${close}${suffix}`;
        } else {
            return `${prefix}${open}${result.length > 0 ? "\n" : ""}${result.join(delimiter)}${result.length > 0 ? "\n" : ""}${prefix}${close}${suffix}`;
        }
    }
}

/**
 * The escape options.
 * @typedef {Object} EscapeOptions
 * @property {string} [quoteEscape="\\\""] The escpae sequence used to replace quote.
 */

/**
 * Escape unaccepted cahracters from stirng.
 * @param {string} value The unescaped source value. 
 * @param {*} options The escap eoptions
 * @returns 
 */
export function escape(value, options = {}) {
    if (typeof value === "string") {
        return value.replaceAll("\"", options.quoteEscape ?? "\\\"");
    } else {
        throw new TypeError("Cannot escape non-string value");
    }
}


/**
 * Create a string representation of a value for human reporting.
 * @param {*} value The stringified value.
 * @param {ToStringOptions} [options] The stringificaiton options. 
 * @returns {string} The given value stringified.
 * @throws {SyntaxError} The stringification was not possible.
 */
export function toString(value, options = {}) {
    switch (typeof value) {
        case "undefined":
        case "number":
        case "boolean":
            return `${options.prefix ?? ""}${value}${options.suffix ?? ""}`
        case "string":
            return `${options.prefix ?? ""}"${escape(value, options)}"${options.suffix ?? ""}`
        case "symbol":
            return symbolToString(value, options);
        case "function":
            return functionToString(value, options);
        case "object":
            if (value !== null && Array.isArray(value)) {
                return arrayToString(value, options);
            } else {
                return objectToString(value, options);
            }
    }
}