import {calculatorFn} from "./calculator.ts";
import {expect, describe, it} from "bun:test";

describe('calculatorFn', () => {

    it('should return 4 when expression is "2+2"', async () => {
        const result = await calculatorFn({expression: '2+2'});
        expect(result).toBe({message: '4'});
    });

    it('should throw an error when expression is "1/0"', async () => {
        const result = await calculatorFn({expression: '1/0'})
        expect(result).toBe({message: Infinity});
    });

    it('should throw an error when expression is "1/0"', async () => {
        await expect(calculatorFn({expression: 'string'})).rejects.toThrow();
    });
});
