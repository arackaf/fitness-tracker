import { beforeEach, describe, expect, it, vi } from "vitest";

function foo(timeout: number) {
  const result = {
    status: "pending",
  };
  setTimeout(async () => {
    result.status = "loading";
    await Promise.resolve();
    result.status = "complete";
  }, timeout);

  return result;
}

describe("demo async", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("sync", () => {
    const obj = foo(1000);

    vi.advanceTimersByTime(1000);

    expect(obj.status).toBe("loading");
  });

  it("async", async () => {
    const obj = foo(1000);

    await vi.advanceTimersByTimeAsync(1000);

    expect(obj.status).toBe("complete");
  });

  it("sync 2", async () => {
    const obj1 = foo(500);
    const obj2 = foo(1000);

    vi.advanceTimersByTime(1000);

    expect(obj1.status).toBe("loading");
    expect(obj2.status).toBe("loading");
  });
});
