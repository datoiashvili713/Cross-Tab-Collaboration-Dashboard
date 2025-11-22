import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCollaborativeSession } from "../useCollaborativeSession";

vi.mock("../../utils/broadcastSync", () => ({
  useBroadcastChannel: vi.fn(() => ({
    messages: [],
    postMessage: vi.fn(),
  })),
  BROADCAST_CHANNEL_NAME: "test-channel",
}));

describe("useCollaborativeSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return session API with all required properties", async () => {
    const { result } = renderHook(() => useCollaborativeSession());

    await waitFor(() => {
      expect(result.current).toHaveProperty("user");
      expect(result.current).toHaveProperty("users");
      expect(result.current).toHaveProperty("messages");
      expect(result.current).toHaveProperty("counter");
      expect(result.current).toHaveProperty("typingUsers");
      expect(result.current).toHaveProperty("theme");
      expect(result.current).toHaveProperty("focusedUsers");
      expect(result.current).toHaveProperty("broadcastMessages");
      expect(result.current).toHaveProperty("localMessages");
    });
  });

  it("should return session API with all required methods", async () => {
    const { result } = renderHook(() => useCollaborativeSession());

    await waitFor(() => {
      expect(result.current).toHaveProperty("sendMessage");
      expect(result.current).toHaveProperty("deleteMessage");
      expect(result.current).toHaveProperty("updateCounter");
      expect(result.current).toHaveProperty("markTyping");
      expect(result.current).toHaveProperty("clearTyping");
      expect(result.current).toHaveProperty("setTheme");
      expect(result.current).toHaveProperty("markFocused");
      expect(result.current).toHaveProperty("markUnfocused");
      expect(result.current).toHaveProperty("getUserName");
    });
  });

  it("should have correct types for methods", async () => {
    const { result } = renderHook(() => useCollaborativeSession());

    await waitFor(() => {
      expect(typeof result.current.sendMessage).toBe("function");
      expect(typeof result.current.deleteMessage).toBe("function");
      expect(typeof result.current.updateCounter).toBe("function");
      expect(typeof result.current.setTheme).toBe("function");
    });
  });
});
