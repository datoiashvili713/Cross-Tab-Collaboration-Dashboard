import { useState, useEffect, useCallback, useRef } from "react";
import { Message, ID, User } from "../types";
import { v4 as uuidv4 } from "uuid";
import { filterExpiredMessages } from "../utils/messageUtils";
import { BroadcastEvent, BroadcastService } from "../utils/broadcastService";
import { MESSAGE_EXPIRATION_CHECK_INTERVAL } from "../utils/constants";
import { rehydrateState, persistState } from "../utils/rehydration";

interface UseMessagesProps {
  broadcastMessages: Array<{ type: string; message: unknown }>;
  broadcastService: BroadcastService;
  currentUser: User;
}

export const useMessages = ({
  broadcastMessages,
  broadcastService,
  currentUser,
}: UseMessagesProps) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const rehydrated = rehydrateState();
    return rehydrated.messages || [];
  });
  const processedEventsRef = useRef<Set<string>>(new Set());
  const lastMessageCountRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (broadcastMessages.length <= lastMessageCountRef.current) {
      return;
    }

    const newMessages = broadcastMessages.slice(lastMessageCountRef.current);
    lastMessageCountRef.current = broadcastMessages.length;
    const currentTabId = currentUser.tabId;

    newMessages.forEach((msg) => {
      if (msg.type === "event") {
        const event = msg.message as BroadcastEvent;
        const eventKey = `${event.type}-${JSON.stringify(event.payload)}`;

        if (processedEventsRef.current.has(eventKey)) {
          return;
        }
        processedEventsRef.current.add(eventKey);

        if (processedEventsRef.current.size > 1000) {
          const entries = Array.from(processedEventsRef.current);
          entries.slice(0, 100).forEach(key => processedEventsRef.current.delete(key));
        }

        switch (event.type) {
          case "message_send":
            const message = event.payload;
            setMessages((prev) => {
              const messageId = message.id;
              if (prev.some((m) => m.id === messageId)) {
                return prev;
              }
              return [...prev, message];
            });
            break;
          case "message_delete":
            setMessages((prev) =>
              prev.map((m) =>
                m.id === event.payload.messageId &&
                m.userId === event.payload.userId
                  ? { ...m, deleted: true }
                  : m
              )
            );
            break;
          case "state_sync":
            if (event.payload.fromTabId !== currentTabId) {
              setMessages((prev) => {
                const merged = [...prev];
                const syncMessages = event.payload.messages || [];
                syncMessages.forEach((msg) => {
                  if (!merged.some((m) => m.id === msg.id)) {
                    merged.push(msg);
                  }
                });
                return merged.sort((a, b) => a.timestamp - b.timestamp);
              });
            }
            break;
        }
      }
    });
  }, [broadcastMessages, currentUser.tabId]);

  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      return;
    }
    persistState({ messages });
  }, [messages]);

  useEffect(() => {
    isMountedRef.current = true;
    
    const interval = setInterval(() => {
      setMessages((prev) => filterExpiredMessages(prev));
    }, MESSAGE_EXPIRATION_CHECK_INTERVAL);

    return () => {
      clearInterval(interval);
      isMountedRef.current = false;
      processedEventsRef.current.clear();
    };
  }, []);

  const sendMessage = useCallback(
    async (text: string, expiresInMs?: number): Promise<Message> => {
      const message: Message = {
        id: uuidv4(),
        userId: currentUser.id,
        text: text.trim(),
        timestamp: Date.now(),
        expiresAt: expiresInMs ? Date.now() + expiresInMs : undefined,
      };

      const eventKey = `message_send-${JSON.stringify(message)}`;
      processedEventsRef.current.add(eventKey);

      broadcastService.broadcastMessageSend(message);
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });

      return message;
    },
    [currentUser, broadcastService]
  );

  const deleteMessage = useCallback(
    async (messageId: ID): Promise<void> => {
      const message = messages.find((m) => m.id === messageId);
      if (!message || message.userId !== currentUser.id) return;

      broadcastService.broadcastMessageDelete(messageId, currentUser.id);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, deleted: true } : msg
        )
      );
    },
    [currentUser, messages, broadcastService]
  );

  return {
    messages: messages.filter((msg) => !msg.deleted),
    sendMessage,
    deleteMessage,
  };
};
