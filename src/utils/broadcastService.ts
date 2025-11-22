import { ID, User, Message, Theme, CounterState } from "../types";

export type BroadcastEvent =
  | { type: "user_join"; payload: User }
  | { type: "user_leave"; payload: { userId: ID } }
  | { type: "user_update"; payload: User }
  | { type: "message_send"; payload: Message }
  | { type: "message_delete"; payload: { messageId: ID; userId: ID } }
  | {
      type: "counter_update";
      payload: { delta: number; userId: ID; eventId?: string };
    }
  | { type: "typing_start"; payload: { userId: ID } }
  | { type: "typing_stop"; payload: { userId: ID } }
  | { type: "theme_change"; payload: { theme: Theme } }
  | { type: "focus_start"; payload: { userId: ID } }
  | { type: "focus_stop"; payload: { userId: ID } }
  | { type: "state_request"; payload: { requesterId: ID } }
  | {
      type: "state_sync";
      payload: {
        users: User[];
        messages: Message[];
        counter: CounterState;
        fromTabId: ID;
        userNames?: Record<ID, string>;
      };
    };

export interface BroadcastService {
  broadcastUserJoin: (user: User) => void;
  broadcastUserLeave: (userId: ID) => void;
  broadcastUserUpdate: (user: User) => void;
  broadcastMessageSend: (message: Message) => void;
  broadcastMessageDelete: (messageId: ID, userId: ID) => void;
  broadcastCounterUpdate: (delta: number, userId: ID, eventId?: string) => void;
  broadcastTypingStart: (userId: ID) => void;
  broadcastTypingStop: (userId: ID) => void;
  broadcastThemeChange: (theme: Theme) => void;
  broadcastFocusStart: (userId: ID) => void;
  broadcastFocusStop: (userId: ID) => void;
  broadcastStateRequest: (requesterId: ID) => void;
  broadcastStateSync: (
    users: User[],
    messages: Message[],
    counter: CounterState,
    fromTabId: ID,
    userNames?: Record<ID, string>,
    theme?: Theme
  ) => void;
}

export const createBroadcastService = (
  postMessage: (type: string, message: unknown) => void
): BroadcastService => {
  return {
    broadcastUserJoin: (user: User) => {
      postMessage("event", {
        type: "user_join",
        payload: user,
      } as BroadcastEvent);
    },
    broadcastUserLeave: (userId: ID) => {
      postMessage("event", {
        type: "user_leave",
        payload: { userId },
      } as BroadcastEvent);
    },
    broadcastUserUpdate: (user: User) => {
      postMessage("event", {
        type: "user_update",
        payload: user,
      } as BroadcastEvent);
    },
    broadcastMessageSend: (message: Message) => {
      postMessage("event", {
        type: "message_send",
        payload: message,
      } as BroadcastEvent);
    },
    broadcastMessageDelete: (messageId: ID, userId: ID) => {
      postMessage("event", {
        type: "message_delete",
        payload: { messageId, userId },
      } as BroadcastEvent);
    },
    broadcastCounterUpdate: (delta: number, userId: ID, eventId?: string) => {
      postMessage("event", {
        type: "counter_update",
        payload: { delta, userId, eventId },
      } as BroadcastEvent);
    },
    broadcastTypingStart: (userId: ID) => {
      postMessage("event", {
        type: "typing_start",
        payload: { userId },
      } as BroadcastEvent);
    },
    broadcastTypingStop: (userId: ID) => {
      postMessage("event", {
        type: "typing_stop",
        payload: { userId },
      } as BroadcastEvent);
    },
    broadcastThemeChange: (theme: Theme) => {
      postMessage("event", {
        type: "theme_change",
        payload: { theme },
      } as BroadcastEvent);
    },
    broadcastFocusStart: (userId: ID) => {
      postMessage("event", {
        type: "focus_start",
        payload: { userId },
      } as BroadcastEvent);
    },
    broadcastFocusStop: (userId: ID) => {
      postMessage("event", {
        type: "focus_stop",
        payload: { userId },
      } as BroadcastEvent);
    },
    broadcastStateRequest: (requesterId: ID) => {
      postMessage("event", {
        type: "state_request",
        payload: { requesterId },
      } as BroadcastEvent);
    },
    broadcastStateSync: (
      users: User[],
      messages: Message[],
      counter: CounterState,
      fromTabId: ID,
      userNames?: Record<ID, string>,
      theme?: Theme
    ) => {
      postMessage("event", {
        type: "state_sync",
        payload: { users, messages, counter, fromTabId, userNames, theme },
      } as BroadcastEvent);
    },
  };
};
