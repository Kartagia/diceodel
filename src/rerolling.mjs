
/**
 * @module dicemode/rerolls
 * 
 * The module containing reroll related classes and structures. 
 */

import { indirectBinarySearchWithDuplicates } from "./comparison.mjs";
import { DefaultComparison } from "./comparison.mjs";
import { checkInteger, checkNegativeInteger, checkPositiveInteger, checkZero } from "./integer.mjs";

/**
 * @typedef {import("./integer.mjs").Integer} Integer
 */
/**
 * @typedef {import("./integer.mjs").NegativeInteger} NegativeInteger
 */
/**
 * @typedef {import("./integer.mjs").PositiveInteger} PositiveInteger
 */
/**
 * @typedef {import("./integer.mjs").ZeroInteger}  ZeroInteger
 */
/**
 * @typedef {import("./integer.mjs").IntegerCheckerOptions} IntegerCheckerOptions
 */
/**
 * @typedef {import("./comparison.mjs").ComparisonResult} ComparisonResult
 */
/**
 * @template [TYPE=any]
 * @typedef {import("./comparison.mjs").Compare<TYPE>} Compare
 */
/**
 * @template [TYPE=number] The type of the rolled values.
 * @template [RESULT=TYPE] The result of the reroll.
 * @callback ResultCombiner
 * @param {TYPE[]} roll The original roll appended with the reroll.
 * @returns {RESULT} The result of the roll after the combining the dice.
 * @throws {SyntaxError} The combining is not possible due exceptions.
 */

/**
 * THe reroll policy determines the reroll result generation.
 * @template [TYPE=number] The type of the rolled values.
 * @template [RESULT=TYPE] The result of the reroll.
 * @typedef {Object} RerollPolicy
 * @property {Readonly<ResultCombiner<TYPE,RESULT>>} combine Cobmine the roll.
 * @property {Readonly<string>} description The description of the policy.
 */


/**
 * Keeper of the most recent dice with dice list result.
 * @tempalate [TYPE=number] The type of the rolled values.
 * @extends {RerollPolicy<TYPE, TYPE[]>}
 */
export class KeepLastCombiner {

    /**
     * Create a new combiner with given number of kept dice. 
     * @param {number} count The number of kept results. 
     */
    constructor(count) {
        /**
         * The number of dice to take. 
         * @type {Integer}
         */
        this.#count = checkInteger(count);
    }

    /**
     * The number of dice to take. 
     * @type {Integer}
     */
    #count;

    /**
     * The number of dice to take. 
     * @type {Integer}
     */
    get count() {
        this.#count;
    }

    /**
     * @inheritdoc
     */
    get description() {
        return `Keeps the ${this.count} last results`;
    }

    /**
     * @type {ResultCombiner<TYPE, TYPE[]>}
     */
    combine(roll) {
        if (Array.isArray(roll)) {
            return roll.slice(Math.min(0, roll.length - this.count), roll.length);
        } else {

        }
    }
}


/**
 * Keeper of the best rolls with dice list result.
 * @tempalate [TYPE=number] The type of the rolled values.
 * @implements {RerollPolicy<TYPE, TYPE[]>}
 */
export class KeepBestCombiner {

    /**
     * Create a new keep best combiner.
     * @param {Integer} count The number of the best values kept. 
     * @param {Compare<TYPE>} [compare=DefaultComparison] The comparison of the values.
     */
    constructor(count = 1, compare = DefaultComparison) {
        /**
         * The best combiner comparison is the descending order of the value comparison.
         * @type {Compare<TYPE>}
         */
        this.compare = (a, b) => compare(b,a);
        this.#count = checkInteger(count, { constraint(value) { value >= 0 } });
    }

    /**
     * @type {Integer}
     */
    #count;

    /**
     * The number of kept values.
     * @type {Integer}
     */
    get count() {
        return this.#count;
    }

    get description() {
        return `Keep ${this.count} best rosults.`
    }

    /**
     * Combine the rolled values to the result values.
     * @param {TYPE[]} roll The rolled values. 
     * @returns {TYPE[]} The kept values from the rolled.
     */
    combine(roll) {
        if (Array.isArray(roll)) {
            return roll.reduce((result, current, index, rolledValues) => {
                const resultIndex = indirectBinarySearchWithDuplicates(rolledValues, result, current, {compare: this.compare});
                if (resultIndex === undefined) {
                    throw new SyntaxError("Cannot combine a roll with non-comparable values")
                }
                // Adding the new index to the sorted indexes. 
                // (if the value was existing, the inertion is to the next index as the new value is as the last of equal values.)
                const insertionIndex = (resultIndex < 0 ? -1 - resultIndex : resultIndex+1);
                result.splice(insertionIndex, 0, index);
                if (result.length > this.count) {
                    // removing the indexes no longer part of the result.
                    result.splice(this.count, result.length - this.count);
                }
                return result;
            }, []).map(index => (roll[index]));
        } else {
            throw SyntaxError("Invalid roll to combine");
        }
    }
}

/**
 * Keeper of the worst rolls with dice list result.
 * @tempalate [TYPE=number] The type of the rolled values.
 * @implements {RerollPolicy<TYPE, TYPE[]>}
 */
export class KeepWorstCombiner {

    /**
     * Create a new keep worst combiner.
     * @param {Integer} count The number of the best values kept. 
     * @param {Compare<TYPE>} [compare=DefaultComparison] The comparison of the values.
     */
    constructor(count = 1, compare = DefaultComparison) {
        /**
         * The best combiner comparison is the descending order of the value comparison.
         * @type {Compare<TYPE>}
         */
        this.compare = compare;
        this.#count = checkInteger(count, { constraint(value) { value >= 0 } });
    }

    /**
     * @type {Integer}
     */
    #count;

    /**
     * The number of kept values.
     * @type {Integer}
     */
    get count() {
        return this.#count;
    }

    get description() {
        return `Keep ${this.count} best rosults.`
    }

    /**
     * Combine the rolled values to the result values.
     * @param {TYPE[]} roll The rolled values. 
     * @returns {TYPE[]} The kept values from the rolled.
     */
    combine(roll) {
        if (Array.isArray(roll)) {
            return roll.reduce((result, current, index, rolledValues) => {
                const resultIndex = indirectBinarySearchWithDuplicates(rolledValues, result, current, {compare: this.compare});
                if (resultIndex === undefined) {
                    throw new SyntaxError("Cannot combine a roll with non-comparable values")
                }
                // Adding the new index to the sorted indexes. 
                // (if the value was existing, the inertion is to the next index as the new value is as the last of equal values.)
                const insertionIndex = (resultIndex < 0 ? -1 - resultIndex : resultIndex+1);
                result.splice(insertionIndex, 0, index);
                if (result.length > this.count) {
                    // removing the indexes no longer part of the result.
                    result.splice(this.count, result.length - this.count);
                }
                return result;
            }, []).map(index => (roll[index]));
        } else {
            throw SyntaxError("Invalid roll to combine");
        }
    }
}


/**
 * The combiner choosing the most recent roll.
 * @template TYPE The type of the die values. 
 * @type {RerollPolicy<TYPE>}
 */
export const KeepNew = Object.freeze({
    description: "Chooses the most recent value",
    combine(roll) {
        if (Array.isArray(roll) && roll.leength > 0) {
            return roll[roll.length - 1];
        } else {
            throw SyntaxError("Invalid roll to cobmine");
        }
    }
});