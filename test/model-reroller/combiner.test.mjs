
import { expect } from "chai";
import { DefaultComparison } from "../../src/comparison.mjs";
import { KeepBestCombiner } from "../../src/rerolling.mjs";
import { checkInteger } from "../../src/integer.mjs";


const testCases = [
    {
        name: "Single die (numbers)",
        construction: [checkInteger(1)],
        params: [3, 5, 2, 1, 0]
    }

];

describe("class KeepBestCombiner", function () {
    testCases.map((testCase) => {
        const params = testCase.construction;
        const compare = testCase.construction?.[1] ?? DefaultComparison;
        const expected = testCase.params.reduce((result, value) => {
            if (result === undefined) {
                return result;
            }
            /**
             * @type {import("../../src/comparison.mjs").ComparisonResult}
             */
            const cmp = compare(result, value);
            if (cmp === undefined) {
                return undefined;
            } else if (cmp > 0) {
                return value;
            } else {
                return result;
            }
        });
        if (expected === undefined) {
            return { ...testCase, tested: new KeepBestCombiner( ...params  ), exception: SyntaxError };
        } else {
            return { ...testCase, tested: new KeepBestCombiner( ...params  ),expected: [expected]};
        }
    }).forEach((testCase, index) => {
        const testFunc = () => (testCase.tested.combine(testCase.params));
        it(`Test case #${testCase.name}`, function () {
            if (testCase.exception) {
                expect(testFunc).throw(testCase.exception);
            } else {
                expect(testFunc).not.throw();
                const result = testFunc();
                expect(result).eql(testCase.expected);
            }
        });
    });
});