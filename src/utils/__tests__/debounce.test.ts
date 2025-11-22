import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { debounce } from "../debounce";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should debounce function calls", () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    debouncedFunc();
    debouncedFunc();

    expect(func).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(func).toHaveBeenCalledTimes(1);
  });

  it("should call function with correct arguments", () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc("test", 123);

    vi.advanceTimersByTime(100);

    expect(func).toHaveBeenCalledWith("test", 123);
  });

  it("should reset timer on subsequent calls", () => {
    const func = vi.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    vi.advanceTimersByTime(50);
    debouncedFunc();
    vi.advanceTimersByTime(50);

    expect(func).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);

    expect(func).toHaveBeenCalledTimes(1);
  });
});
