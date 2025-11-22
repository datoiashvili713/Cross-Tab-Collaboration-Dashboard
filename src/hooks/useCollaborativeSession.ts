import { useMemo, useEffect, useRef, useState } from "react";
import {
  useBroadcastChannel,
  BROADCAST_CHANNEL_NAME,
} from "../utils/broadcastSync";
import { SessionAPI } from "../types";
import {
  createBroadcastService,
  BroadcastEvent,
} from "../utils/broadcastService";
import { useUsers } from "./useUsers";
import { useMessages } from "./useMessages";
import { useCounter } from "./useCounter";
import { useTyping } from "./useTyping";
import { useTheme } from "./useTheme";
import { useFocus } from "./useFocus";

export const useCollaborativeSession = (): SessionAPI => {
  const { messages: broadcastMessages, postMessage } = useBroadcastChannel(
    BROADCAST_CHANNEL_NAME
  );

  const [localMessages, setLocalMessages] = useState<
    Array<{ type: string; message: unknown }>
  >([]);

  const wrappedPostMessage = useMemo(() => {
    return (type: string, message: unknown) => {
      postMessage(type, message);
      setLocalMessages((prev) => {
        const newMessages = [...prev, { type, message }];
        if (newMessages.length > 100) {
          return newMessages.slice(-100);
        }
        return newMessages;
      });
    };
  }, [postMessage]);

  const broadcastService = useMemo(
    () => createBroadcastService(wrappedPostMessage),
    [wrappedPostMessage]
  );

  const { users, currentUser, getUserName, getUserNamesMap } = useUsers({
    broadcastMessages,
    broadcastService,
  });

  const { messages, sendMessage, deleteMessage } = useMessages({
    broadcastMessages,
    broadcastService,
    currentUser,
  });

  const { counter, updateCounter } = useCounter({
    broadcastMessages,
    broadcastService,
    currentUser,
  });

  const { typingUsers, markTyping, clearTyping } = useTyping({
    broadcastMessages,
    broadcastService,
    currentUser,
  });

  const { theme, setTheme } = useTheme({
    broadcastMessages,
    broadcastService,
  });

  const { focusedUsers, markFocused, markUnfocused } = useFocus({
    broadcastMessages,
    broadcastService,
    currentUser,
  });

  const stateSyncHandledRef = useRef<Set<string>>(new Set());
  const lastMessageCountRef = useRef(0);
  const usersRef = useRef(users);
  const messagesRef = useRef(messages);
  const counterRef = useRef(counter);
  const currentUserRef = useRef(currentUser);
  const themeRef = useRef(theme);

  usersRef.current = users;
  messagesRef.current = messages;
  counterRef.current = counter;
  currentUserRef.current = currentUser;
  themeRef.current = theme;

  useEffect(() => {
    if (broadcastMessages.length <= lastMessageCountRef.current) {
      return;
    }

    const newMessages = broadcastMessages.slice(lastMessageCountRef.current);
    lastMessageCountRef.current = broadcastMessages.length;
    const currentTabId = currentUserRef.current.tabId;

    newMessages.forEach((msg) => {
      if (msg.type === "event") {
        const event = msg.message as BroadcastEvent;

        if (event.type === "state_request") {
          if (
            currentTabId &&
            event.payload.requesterId !== currentUserRef.current.id
          ) {
            const syncKey = `${currentTabId}-${event.payload.requesterId}`;
            if (!stateSyncHandledRef.current.has(syncKey)) {
              stateSyncHandledRef.current.add(syncKey);
              setTimeout(() => {
                stateSyncHandledRef.current.delete(syncKey);
              }, 1000);

              broadcastService.broadcastStateSync(
                usersRef.current,
                messagesRef.current,
                counterRef.current,
                currentTabId!,
                getUserNamesMap(),
                themeRef.current
              );
            }
          }
        }
      }
    });
  }, [broadcastMessages, broadcastService, getUserNamesMap]);

  return {
    user: currentUser,
    users,
    messages,
    counter,
    typingUsers,
    theme,
    focusedUsers,
    broadcastMessages,
    localMessages,
    sendMessage,
    deleteMessage,
    updateCounter,
    markTyping,
    clearTyping,
    setTheme,
    markFocused,
    markUnfocused,
    getUserName,
  };
};
