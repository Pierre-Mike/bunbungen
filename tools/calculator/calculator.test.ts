import { describe, it, expect } from "bun:test";
import { calculatorFn } from "./calculator";

describe("calculatorFn", () => {
    it("should evaluate basic arithmetic expressions", async () => {
        const params = { expression: "2 + 2" };
        const result = await calculatorFn(params);
        expect(result).toBe("4");
    });

    it("should handle multiplication and division", async () => {
        const params = { expression: "10 * 5 / 2" };
        const result = await calculatorFn(params);
        expect(result).toBe("25");
    });

    it("should respect order of operations", async () => {
        const params = { expression: "2 + 3 * 4" };
        const result = await calculatorFn(params);
        expect(result).toBe("14");
    });

    it("should handle parentheses", async () => {
        const params = { expression: "(2 + 3) * 4" };
        const result = await calculatorFn(params);
        expect(result).toBe("20");
    });

    it("should handle decimal numbers", async () => {
        const params = { expression: "5.5 + 2.7" };
        const result = await calculatorFn(params);
        expect(result).toBe("8.2");
    });

    it("should throw error for invalid expressions", async () => {
        const params = { expression: "2 +" };
        await expect(calculatorFn(params)).rejects.toThrow();
    });

    it("should handle division by zero and return Infinity", async () => {
        const params = { expression: "1 / 0" };
        const result = await calculatorFn(params);
        expect(result).toBe("Infinity");
    });
});