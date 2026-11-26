import { describe, expect, it, vi } from "vitest";

const { fn } = vi;

function callIt(f: Function, value?: any) {
  f(value);
}

function dontCallIt(f: Function) {}

describe("lesson 1", () => {
  it("Mock calling", () => {
    const f = fn();

    dontCallIt(f);

    expect(f).not.toHaveBeenCalled();

    callIt(f);

    expect(f).toHaveBeenCalled();
  });

  it("Mock calling with args", () => {
    const f = fn();

    dontCallIt(f);

    expect(f).not.toHaveBeenCalled();

    callIt(f, 12);

    expect(f).toHaveBeenCalled();
    expect(f).toHaveBeenCalledWith(12);
    expect(f).not.toHaveBeenCalledWith(13);
  });
});
