import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { debounce } from "./debounce";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debounces consecutive calls", () => {
    vi.useFakeTimers();

    const callback = vi.fn();
    const debounced = debounce(callback, 300);

    debounced("a");
    vi.advanceTimersByTime(100);

    debounced("ab");
    vi.advanceTimersByTime(100);

    debounced("abc");
    vi.advanceTimersByTime(299);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("abc");
  });
});
