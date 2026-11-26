import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { moduleState } from "./library";

describe("lesson 2", () => {
  const incrementSpy = vi.spyOn(moduleState, "increment");

  beforeEach(() => {
    vi.resetAllMocks();
  });
  afterEach(() => {
    moduleState.currentValue = 0;
  });

  it("test 0", () => {
    incrementSpy.mockImplementation(() => {
      return 42;
    });

    const result = moduleState.increment();
    expect(result).toBe(42);
    expect(incrementSpy).toHaveBeenCalled();
    expect(incrementSpy).toHaveBeenCalledOnce();
  });

  it("test 1", () => {
    const result = moduleState.increment();

    expect(result).toBe(1);
    expect(incrementSpy).toHaveBeenCalled();
    expect(incrementSpy).toHaveBeenCalledOnce();
  });

  it("test 2", () => {
    const result = moduleState.increment();

    expect(result).toBe(1);
    expect(incrementSpy).toHaveBeenCalled();
    expect(incrementSpy).toHaveBeenCalledOnce();
  });
});
