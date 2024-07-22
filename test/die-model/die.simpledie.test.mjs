
import { expect } from "chai";
import { SimpleDie } from "../../src/die.mjs";
import { toString } from "../../src/testkit/utils.mjs";

/**
 * @module dicemodel/test/die/simpledie
 * THe testing suite for JUnit testing of the class SimpleDie.
 */

function createExpectedSides(sideCount) {
    if (Number.isSafeInteger(sideCount)) {
        const sides = Math.abs(sideCount);
        const mod = sideCount < 0 ? -1 : 1;

        return {
            value: mod,
            i: 1,
            end: Math.abs(sideCount),
            next() {
                if (this.i <= this.end) {
                    const result = { value: this.value };
                    this.value += mod;
                    this.i++;
                    return result;
                } else {
                    return {
                        done: true
                    }
                }
            },
            return(result = undefined) {
                this.i = sideCount + 1;
                return { value: result, done: true };
            },
            [Symbol.iterator]() {
                return this;
            }
        }
    } else {
        return {
            next() {
                return { done: true };
            }
        }
    }
}

describe("class SimpleDie", function () {

    describe("static method createSides", function() {
        const testCases = [
            ["d6/2", [0.5, 3, (value) => (value+0.5)], (value) => {
                expect(value).instanceOf(Array);
                expect(value).length(6);
                expect(value).eql([0.5,1,1.5,2,2.5,3]);
            }], 
            ["dHex", [0, "F", ( /** @type {number|string} */ value) => (typeof value === "number" ? (value < 9 ? value +1 : "A") : (value <= "F" ? String.fromCodePoint( value.codePointAt(0) + 1) : undefined)), 
            (a,b) => (typeof a === typeof b ? a <= b : (typeof a === "number" ? -1 : 1))], 
            (value) => {
                console.log(`Testing ${toString(value)}`)
                expect(value).instanceof(Array);
                expect(value).length(16, `Invalid length for ${toString(value)}`);
                expect(value).eql([0, 1,2,3,4,5,6, 7,8,9,"A", "B", "C", "D", "E", "F"]);
            }]
        ];
        testCases.forEach( ([name, paramArray, tester, exception = undefined], index) => {
            it(`Test #${index}: ${name}`, function() {
                if (exception) {
                    expect( () => {

                    }).to.throw(exception);
                } else {
                    expect( () => {
                        const rsult = SimpleDie.createSides(...paramArray);
                    }).not.throw(exception);
                    const result = SimpleDie.createSides(...paramArray);
                    tester(result);
                }

            })
        });
    });

    const baseDice = [0, 2, 3, 4, 6, 8, 10, 12, 20, 30, 100];

    const testCases = [
        ["Default (undefined)", undefined, (value) => {
            expect(value).eql([1, 2, 3, 4, 5, 6]);
        }],
        ["D6 (array)", [1, 2, 3, 4, 5, 6], (value) => {
            expect(value).eql([1, 2, 3, 4, 5, 6]);
        }],
        ...(baseDice.map(sideCount => ([`D${sideCount} (array)`, [...createExpectedSides(sideCount)], (value) => {
            expect(value).eql([...createExpectedSides(sideCount)]);
        }]))),
        ...(baseDice.map(sideCount => ([`D${sideCount} (sideCount)`, { sideCount }, (value) => {
            expect(value).eql([...createExpectedSides(sideCount)]);
        }, SyntaxError]))),
        ...(baseDice.map(sideCount => ([`D${sideCount} (object)`, { sideCount, sides: [...createExpectedSides(sideCount)] }, (value) => {
            expect(value).eql([...createExpectedSides(sideCount)]);
        }]))),
        ...(baseDice.map(sideCount => ([`D${sideCount} (sides)`, { sides: [...createExpectedSides(sideCount)] },
        (value) => {
            expect(value).eql([...createExpectedSides(sideCount)]);
        }]))),
    ];
    describe("Static method createDieSides", function () {
        testCases.forEach(([name, param, tester, exception = undefined], index) => {
            it(`Test Case #${index}: ${name}`, function () {
                if (exception !== undefined) {
                    expect(function () {
                        console.log(`Creating test case ${toString(param)}`)
                        const result = SimpleDie.createDieSides(param);
                        tester(result);
                    }).throw(exception);

                } else if ((param === undefined || Number.isSafeInteger(param))) {
                    expect(function () {
                        const result = SimpleDie.createDieSides(param);
                        tester(result);
                    }).not.throw();
                } else {
                    expect(function () {
                        const result = SimpleDie.createDieSides(param);
                        tester(result);
                    }).throw(SyntaxError);

                }
            });
        })
    });
    describe("constructor", function () {
        testCases.forEach(([name, param, tester, exception = undefined], index) => {
            it(`Test Case #${index}: ${name}`, function () {
                if (exception) {
                    expect(function () {
                        console.log(`Creating test case ${toString(param)}`)
                        const result = new SimpleDie(param);
                        tester(result?.sides);
                    }).throw(exception);
                } else {
                    expect(function () {
                        console.log(`Creating test case ${toString(param)}`)
                        const result = new SimpleDie(param);
                        tester(result?.sides);
                    }).not.throw();
                }
            });
        })
    });
})