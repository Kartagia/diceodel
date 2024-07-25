
/**
 * @module test/util/lettersAndDigits
 * 
 * The testing of the {@link module:util/lettersAndDigits}
 */

import { expect } from "chai";
import { checkDigit, checkHexDigit, checkLetter, HexDigitComparison } from "../src/lettersAndDigits.mjs";
import { toString } from "../src/testkit/utils.mjs";


describe("checkDigit", function () {
    for (let i = 0; i < 10; i++) {
        it(`Test Case: ${i}`, function () {
            expect(() => {
                checkDigit(i);
            }).not.throw();
        });
    }
});


describe("checkLetter", function () {
    const testCases = [
        ...([" ", "A", "Z", "a", "z", "9"].map( (tested) => ({
            name: `Single letter digit "${tested}"`,
            params: [tested],
            expected: tested
        }))), 
        
        ...(["a", "z", "A", "Z", "k"].map( (tested) => ({
            name: `Single ASCII letter "${tested}"`,
            params: [tested, {compare: HexDigitComparison}],
            expected: tested
        })))
    ].map( testCase => ({...testCase, 
        testFunction: () => {
        return checkLetter(...testCase.params)
    }}));
    testCases.forEach((testCase, index) => {
        it(`Test case #${index}: ${testCase.name ?? ""}`, function () {
            if (testCase.exception) {
                expect(testCase.testFunction).to.throw(testCase.exception);
            } else {
                expect(testCase.testFunction).not.throw();
                const result = testCase.testFunction();
                expect(result).eql(testCase.expected);
            }
        });
    });
});

describe("checkLetterDigit", function () {

});

describe("checkHexDigit", function () {

    for (let i = 0; i < 16; i++) {
        it(`Test case ${i}`, function () {
            expect(() => {
                if (i < 10) {
                    const result = checkHexDigit(i);
                } else {
                    const result = checkHexDigit(i.toString(16).toUpperCase());
                }
            }).not.throw();
        })
    }

});


