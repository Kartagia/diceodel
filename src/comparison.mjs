
/**
 * The comparison module comparing values. 
 * @module utils/comparison
 */

import { checkInteger } from "./integer.mjs";

/**
 * The comparison result.
 * - An undefined value, if the values are not comparable.
 * - A negative integer, if the compared is less than the comparee.
 * - A positive integer, if the compared is greater than teh comparee.
 * - A zero, if the compared is equal to the comparee.
 * @typedef {ZeroInteger|PositiveInteger|NegativeInteger|undefined} ComparisonResult
 */
/**
 * Comparison function.
 * @template [TYPE=any]
 * @callback Compare
 * @param {TYPE} compared The compared value.
 * @param {TYPE} comparee The value compared to.
 * @returns {ComparisonResult} The result of the comparison.
 */
/**
 * The default comparison using object equality and less than operator.
 * @template [TYPE=any]
 * @type {Compare<TYPE>}
 */


export function DefaultComparison(compared, comparee) {
    try {
        return (a === b ? /** @type {ZeroInteger} */ 0 : (a < b ? /** @type {NegativeInteger} */ -1 : (b < a ? /** @type {PositiveInteger} */ 1 : undefined)));
    } catch (error) {
        // The value was not comparable due throwing an error. 
        return undefined;
    }
}
/**
 * The type of an insertion index. The actual index is calculated with formula: index = (-1 - InsertionIndex).
 * @typedef {NegativeInteger} InsertionIndex
 */
/**
 * The type of an existing index. This value is always in range [0, length of array].
 * @typedef {ZeroInteger|PositiveInteger} ExistingIndex
 */
/**
 * Indirect comparison of source values referrred by indexes in the sorted indexes array.
 * This function allows sorting arrays in place and sorting read only arrays wihtout copying the values
 * until the whole sorting is done.
 * @template TYPE the type of the compared value.
 * @param {Readonly<TYPE[]>} source The source array.
 * @param {Readonly<Integer[]>} sortedIndexes The sorted indexes.
 * @param {Readonly<TYPE>} seeked The seeked value.
 * @param {number} [start] The start index. Defaults to 0.
 * @param {number} [end] The end index. Defaults to the length of the sorted indexes array.
 * @param {Compare<TYPE>} [compare] The compare function comparing the results.
 * @returns {InsertionIndex|ExistingIndex|undefined} An undefined value, if the seeked was not comparable with
 * all values withing the sorted indexes. Otherwise either {@link ExistingIndex} with seekd found, or {@link InsertionIndex}
 * indicating the index where seeked should be inserted.
 */
export function indirectBinarySearch(source, sortedIndexes, seeked, start = 0, end = sortedIndexes.length, compare = DefaultComparison) {

    if (start < 0) {
        throw new RangeError(`Invalid start index`);
    } else if (end > sortedIndexes.length) {
        throw new RangeError(`Invalid end index`);
    }

    let cursor;
    let cmp = 0;
    while (start < end) {
        cursor = Math.floor((start + end) / 2);
        cmp = compare(source[sortedIndexes[cursor]], seeked);
        if (cmp === undefined) {
            return undefined;
        } else if (cmp === 0) {
            // The result found.
            return checkInteger(cursor);
        } else if (cmp < 0) {
            // The result is at the beginning half.
            end = cursor;
        } else {
            // The result is on the end of the are.
            start = cursor + 1;
        }
    }

    // The value was not found - returning the insertion index.
    return checkInteger(-1 - start);
}
/**
 * @template [TYPE=any] The type of the compared values.
 * @typedef {Object} BinarySearchOptions
 * @property {Integer} [start=0] The start index.
 * @property {Integer} [end] The end index. The length of hte sorted indexes.
 * @property {Compare<TYPE>} [compare=DefaultComparison] The comparison used to compare values.
 * @property {boolean} [returnFirstPosition=false] Does the binary search return first position instead of the
 * last position.
 */
/**
 * Perform an indirect binary search allowing duplicates.
 * @template [TYPE=any] The type of the compared values.
 * @param {Readonly<TYPE[]>} source
 * @param {Readonly<number[]>} sortedIndexes The sorted indexes.
 * @param {Readonly<TYPE>} seeked The seeked value.
 * @param {Readonly<BinarySearchOptions<TYPE>>} [options] The options of the binary search.
 */


export function indirectBinarySearchWithDuplicates(source, sortedIndexes, seeked, options = {}) {
    const { start = 0, end = sortedIndexes.length, compare = DefaultComparison } = options;
    let baseResult = indirectBinarySearch(source, sortedIndexes, seeked, start, end, compare);
    if (baseResult === undefined || Number.isNaN(baseResult)) {
        // The comparison failed.
        return undefined;
    }
    /**
     * @type {ExistingIndex}
     */
    let insertionIndex = (baseResult < 0 ? -1 - baseResult : baseResult);
    if (insertionIndex < sortedIndexes.length) {
        const compared = source[sortedIndexes[insertionIndex]];
        if ((baseResult < 0 ? (compare(seeked, compared) < 0 ? options.returnFirstPosition : !options.returnFirstPosition) : options.returnFirstPosition)) {
            // The result is the first index with value equal to the compared.
            while (insertionIndex > 0 && compare(source[sortedIndexes[insertionIndex - 1]], compared) === 0) {
                insertionIndex--;
            }
        } else {
            // The result is the last index with the value equal to the compared.
            while (insertionIndex < sortedIndexes.length - 1 && compare(source[sortedIndexes[insertionIndex + 1]], compared) === 0) {
                insertionIndex++;
            }
        }
    }

    /**
     * The result of the comparison with equal values taken into account.
     * @type {InsertionIndex|ExistingIndex}
     */
    const result = (baseResult < 0 ? /** @type {InsertionIndex} */ -1 - insertionIndex : insertionIndex);
    return result;
}

