import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { ID, User } from "../types";
import { BroadcastEvent, BroadcastService } from "../utils/broadcastService";
import {
  TYPING_INDICATOR_TIMEOUT,
  TYPING_DEBOUNCE_DELAY,
} from "../utils/constants";
import { debounce } from "../utils/debounce";

interface UseTypingProps {
  broadcastMessages: Array<{ type: string; message: unknown }>;
  broadcastService: BroadcastService;
  currentUser: User;
}

export const useTyping = ({
  broadcastMessages,
  broadcastService,
  currentUser,
}: UseTypingProps) => {
  const [typingUsers, setTypingUsers] = useState<Record<ID, number>>({});
  const typingTimeoutRef = useRef<Record<ID, NodeJS.Timeout>>({});

  useEffect(() => {
    broadcastMessages.forEach((msg) => {
      if (msg.type === "event") {
        const event = msg.message as BroadcastEvent;
        switch (event.type) {
          case "typing_start":
            setTypingUsers((prev) => ({
              ...prev,
              [event.payload.userId]: Date.now(),
            }));
            break;
          case "typing_stop":
            setTypingUsers((prev) => {
              const newTyping = { ...prev };
              delete newTyping[event.payload.userId];
              return newTyping;
            });
            break;
          case "message_send":
            const messageUserId = (event.payload as any).userId;
            if (typingTimeoutRef.current[messageUserId]) {
              clearTimeout(typingTimeoutRef.current[messageUserId]);
              delete typingTimeoutRef.current[messageUserId];
            }
            setTypingUsers((prev) => {
              if (!prev[messageUserId]) return prev;
              const newTyping = { ...prev };
              delete newTyping[messageUserId];
              return newTyping;
            });
            if (messageUserId === currentUser.id) {
              broadcastService.broadcastTypingStop(messageUserId);
            }
            break;
        }
      }
    });
  }, [broadcastMessages, currentUser.id, broadcastService]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers((prev) => {
        const now = Date.now();
        const newTyping = { ...prev };
        let changed = false;

        Object.entries(newTyping).forEach(([userId, timestamp]) => {
          if (now - timestamp > TYPING_INDICATOR_TIMEOUT) {
            delete newTyping[userId];
            changed = true;
          }
        });

        return changed ? newTyping : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const markTypingInternal = useCallback(() => {
    if (typingTimeoutRef.current[currentUser.id]) {
      clearTimeout(typingTimeoutRef.current[currentUser.id]);
    }

    broadcastService.broadcastTypingStart(currentUser.id);
    setTypingUsers((prev) => ({
      ...prev,
      [currentUser.id]: Date.now(),
    }));

    typingTimeoutRef.current[currentUser.id] = setTimeout(() => {
      broadcastService.broadcastTypingStop(currentUser.id);
      setTypingUsers((prev) => {
        const newTyping = { ...prev };
        delete newTyping[currentUser.id];
        return newTyping;
      });
      delete typingTimeoutRef.current[currentUser.id];
    }, TYPING_INDICATOR_TIMEOUT);
  }, [currentUser.id, broadcastService]);

  const markTyping = useMemo(
    () => debounce(markTypingInternal, TYPING_DEBOUNCE_DELAY),
    [markTypingInternal]
  );

  const clearTyping = useCallback(() => {
    if (typingTimeoutRef.current[currentUser.id]) {
      clearTimeout(typingTimeoutRef.current[currentUser.id]);
      delete typingTimeoutRef.current[currentUser.id];
    }

    broadcastService.broadcastTypingStop(currentUser.id);
    setTypingUsers((prev) => {
      const newTyping = { ...prev };
      delete newTyping[currentUser.id];
      return newTyping;
    });
  }, [currentUser, broadcastService]);

  useEffect(() => {
    return () => {
      Object.values(typingTimeoutRef.current).forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, []);

  return { typingUsers, markTyping, clearTyping };
};
