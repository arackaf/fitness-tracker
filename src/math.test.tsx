import { describe, expect, it } from "vitest";
import { add, divide, multiply } from "./math";

describe("Intro", () => {
  it("Is a demo of vitest", () => {
    expect(5).toBe(5);
  });

  it("can add two numbers", () => {
    expect(add(1, 2)).toBe(3);
  });

  it("can divide two numbers", () => {
    expect(divide(10, 2)).toBe(5);
  });

  it("cannot divide by zero", () => {
    expect(() => divide(10, 0)).toThrow();
  });

  it("Rejects invalid numbers", () => {
    expect(add(NaN, 2)).toBe(NaN);
  });

  it("Rejects invalid numbers", () => {
    expect(add(NaN, 2)).toBeNaN();
  });
});

describe("Multiply", () => {
  it("can multiply two numbers", () => {
    expect(multiply(2, 3)).toBe(6);
  });

  it("zero times anything is zero test 1", () => {
    expect(multiply(0, 3)).toBe(0);
  });

  it("zero times anything is zero test 1", () => {
    expect(multiply(23, 0)).toBe(0);
  });
});
