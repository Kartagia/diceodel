
/**
 * A modue representing die related modules.
 * @module dicemodel/die
 */

/**
 * The parameters defining a simple die.
 * @typedef {Object} SimpleDieParams
 */

/**
 * A random generator.
 * @callback Random
 * @returns {number} A random number between 0 (inclusive) and 1 (exclusive).
 */

/**
 * The supplier of a random result.
 * @template TYPE
 * @callback ResultSupplier
 * @param {Readonly<Random>} [random] The random number generator.
 * @returns {TYPE} The result of the random value generation. 
 */

/**
 * The roll result properties.
 * @template [TYPE=number]
 * @template [RESULT=TYPE[]]
 * @typedef {Object} RollResultProperties
 * @property {Readonly<number>} length The number of results from which the roll is composed.
 * @property {Readonly<Die<TYPE>|DicePool<any, TYPE[]>[]>} members The members of the roll grouped into the sub results.
 * @property {boolean} [rerollable=false] Is the result rerollable.
 */

/**
 * The roll result methods.
 * @template [TYPE=number]
 * @template [RESULT=TYPE[]]
 * @typedef {Object} RollResultMethods
 * @property {Readonly<Supplier<RollResult<TYPE, RESULT>>} reroll Create a new dice pool by rerolling some or all dice.
 * @property {Readonly<RESULT>} [valueOf] Get the value of the roll. Defaults to the value of the result. This may
 * throw an exception, if the value is not a primitive value, and primitive value is wanted.
 * @property {Readonly<Supplier<string>>} [toString] The ring representation of the result. 
 */

/**
 * The POJO of the roll result.
 * @template [TYPE=number]
 * @template [RESULT=TYPE[]]
 * @typedef {Required<RollResultProperties<TYPE>} RollResultPojo
 */

/**
 * The interface for a roll result. 
 * @template [TYPE=number]
 * @template [RESULT=TYPE[]]
 * @typedef {RollResultProperties<TYPE> & RollResultMethods<TYPE, RESULT>} RollResult
 */

/**
 * Roll result supplier.
 * @template [TYPE=number]
 * @template [RESULT=TYPE[]]
 * @callback RollResultSupplier
 * @param {Readonly<Die<TYPE>|DiePool<any,TYPE[]>>[]} dice The roller dice.
 * @param {Converter<TYPE[], RESULT>} combiner The function combining the die results to roll result.
 * @returns {RollResult<TYPE, RESULT>} The roll result.
 */


/**
 * Convert a value from another.
 * @template SOURCE The source type.
 * @template [TARGET=SOURCE] The target type.
 * @template [ERROR=any] The error type.
 * @callback Converter
 * @param {SOURCE} source The converted value.
 * @returns {TARGET} The result of the conversion.
 * @throws {ERROR} THe conversion was not possible.
 */


/**
 * A single die properties.
 * @template [TYPE=number]
 * @typedef {Object} DieProperties
 * @property {number} sideCount The number of cases the die has.
 * @property {Readonly<TYPE[]>} sides The sides of the die.
 */

/**
 * A single die methods.
 * @template [TYPE=number]
 * @typedef {Object} DieMethods
 * @property {Readonly<ResultSupplier<TYPE>>} roll Get a random die result.
 */

/**
 * A single die. 
 * @template [TYPE=number]
 * @typedef {DieProperties<TYPE> & DieMethods<TYPE>} Die
 */


/**
 * A structure defining a dice pool. A dice pool consists variable number of dice pools and dice.
 * 
 * @template [TYPE=number] The member dice value type. The type should not be an array of any kind
 * as the implementation cannot recognize dice pool returning set of dice results from dice pool returning
 * a single value.
 * @template [RESULT=TYPE[]] The dice pool value type of th result.
 * @typedef {Object} DicePool 
 * @property {Readonly<number>} count The number of dice in the pool.
 * @property {Readonly<boolean>} [rerollable=false] Is the dice pool user rerollable.
 * @property {Readonly<Converter<TYPE[], RESULT>>} combiner The converter combining the
 * pool member results into the pool result.
 * @property {Readonly<(Die<TYPE>|DicePool<any, TYPE[]>|DicePool<any, TYPE>)[]>} [members=[]] The members of the dice pool 
 */

/**
 * The parameters for constructing a simple die.
 * @template [TYPE=number]
 * @typedef {TYPE[]|DieProperties<TYPE>} SimpleDieParams
 */


/**
 * A simple die is a simple construction of a single die.
 * @template [TYPE=number]
 * @implements {Die<TYPE>}
 */
export class SimpleDie {

    /**
     * Generate the list of sides.
     * @template [TYPE=number] The type of the side result.
     * @param {TYPE} first The first inclusive result.
     * @param {TYPE} last The last inclusive result.
     * @param {Converter<TYPE, TYPE|undefined>} increment The increment
     * function generating the next value.
     * @param {(compared: TYPE, comparee: TYPE) => boolean} [lessThanOrEqual] The comparison testing
     * whether compared is less than or equal to the comparee. Dfeaults to the default operator "<=".
     */
    static createSides(first, last, increment, lessThanOrEqual = ((compared, comparee) => (compared <= comparee))) {
        const result = [];
        let cursor = first;
        while (cursor !== undefined && lessThanOrEqual(cursor, last)) {
            result.push(cursor);
            cursor = increment(cursor);
        }
        return result;
    }

    /**
     * Create a die from the given number of sides. 
     * - If sides is negative, the numbers are from -1 to -sides.
     * - If sides is positive or zero, the numbers are from 1 to sides. 
     * - If sides is zero, the array is empty.
     * @param {number} [sideCount=6] The number of sides. Defaults to 6 creating
     * the basic 6 sided die.
     * @returns {number[]} The sides array.
     */
    static createDieSides(sideCount = 6) {
        if (!Number.isSafeInteger(sideCount)) {
            throw new SyntaxError("Invalid number of sides for die");
        }
        const mod = sideCount < 0 ? -1 : 1;
        return SimpleDie.createSides(
            mod,
            sideCount,
            (value) => (value += mod)
        );
    }


    /**
     * Create a new die.
     * @param {SimpleDieParams<TYPE>} [params] Die construction parameters. Defaults to the
     * default die with 6 sides from 1 to 6.
     */
    constructor(params = /** @type {SimpleDieParams<TYPE>}*/ { sideCount: 6 }) {
        this._init(params);
    }


    /**
     * The number of sides the die has.
     * @type {number}
     */
    #sideCount;

    /**
     * @type {TYPE[]}
     */
    #sides;

    /**
     * Initialize the created die.
     * @param {SimpleDieParams<TYPE>} params The initialization parameters.
     */
    _init(params) {
        if (params instanceof Array) {
            // An array of sides. 
            this.#sideCount = params.length;
            this.#sides = params;
            return;
        } else if (typeof params === "object" && params !== null && typeof params !== "function") {
            if (params.sideCount !== undefined && params.sides !== undefined) {
                this.#sides = params.sides;
                this.#sideCount = params.sideCount;
                return;
            } else if (params.sides) {
                return this._init(params.sides);
            }
        }

        // Default is failure as the params were not recognized as valid paarameters.
        throw new SyntaxError("Cannot construct a new simple die from an invalid properties");

    }

    /**
     * @inheritdoc
     */
    get sideCount() {
        return /** @type {Readonly<number>} */ this.#sideCount;
    }

    /**
     * @inheritdoc
     */
    get sides() {
        return /** @type {Readonly<TYPE[]>} */ this.#sides;
    }

    roll(random = Math.random) {
        return this.sides[Math.floor(random() * this.sideCount)];
    }

    /**
     * 
     * @param {number} count The number of repeats.
     * @returns {DicePool<TYPE>} The dice pool repeating the die given number of times.
     */
    repeat(count) {
        const members = [this].repeat(count);

        /**
         * @type {ResultSupplier<TYPE>}
         */
        const reroller = this.roll.bind(this);
        return /** @type {DicePool<TYPE>} */ {

            rerollable: true,
            roll(randomizer = undefined) {
                const result = /** @type {TYPE[]} */[];
                const sideCount = this.sideCount;
                for (let i = sideCount; i > 0; i--) {
                    result.push(reroller(randomizer));
                }
                return result;
            }
        };
    }
}


/**
 */
export class BasicDicePool {
}


export function createDie(params = {}) {

}

