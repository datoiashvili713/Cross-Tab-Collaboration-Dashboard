import { Message, User, CounterState, Theme } from "../types";

interface RehydratedState {
  messages: Message[];
  users: Record<string, User>;
  counter: CounterState;
  theme: Theme;
  userNames: Record<string, string>;
}

export const rehydrateState = (): Partial<RehydratedState> => {
  try {
    const stored = sessionStorage.getItem("collaborative_state");
    if (!stored) return {};

    const parsed = JSON.parse(stored);
    const now = Date.now();

    return {
      messages: (parsed.messages || []).filter(
        (msg: Message) => !msg.expiresAt || msg.expiresAt > now
      ),
      users: parsed.users || {},
      counter: parsed.counter || { value: 0 },
      theme: parsed.theme || "light",
      userNames: parsed.userNames || {},
    };
  } catch {
    return {};
  }
};

export const persistState = (state: Partial<RehydratedState>): void => {
  try {
    const existing = sessionStorage.getItem("collaborative_state");
    const existingState = existing ? JSON.parse(existing) : {};
    const mergedState = { ...existingState, ...state };
    sessionStorage.setItem("collaborative_state", JSON.stringify(mergedState));
  } catch (error) {
    console.error("Failed to persist state:", error);
  }
};
