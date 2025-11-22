import { useState, useEffect, useCallback, useRef } from "react";
import { ID, User } from "../types";
import { BroadcastEvent, BroadcastService } from "../utils/broadcastService";

interface UseFocusProps {
  broadcastMessages: Array<{ type: string; message: unknown }>;
  broadcastService: BroadcastService;
  currentUser: User;
}

const FOCUS_TIMEOUT = 5000;

export const useFocus = ({
  broadcastMessages,
  broadcastService,
  currentUser,
}: UseFocusProps) => {
  const [focusedUsers, setFocusedUsers] = useState<Record<ID, number>>({});
  const lastMessageCountRef = useRef(0);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (broadcastMessages.length <= lastMessageCountRef.current) {
      return;
    }

    const newMessages = broadcastMessages.slice(lastMessageCountRef.current);
    lastMessageCountRef.current = broadcastMessages.length;

    newMessages.forEach((msg) => {
      if (msg.type === "event") {
        const event = msg.message as BroadcastEvent;
        switch (event.type) {
          case "focus_start":
            setFocusedUsers((prev) => ({
              ...prev,
              [event.payload.userId]: Date.now(),
            }));
            break;
          case "focus_stop":
            setFocusedUsers((prev) => {
              const newFocused = { ...prev };
              delete newFocused[event.payload.userId];
              return newFocused;
            });
            break;
        }
      }
    });
  }, [broadcastMessages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFocusedUsers((prev) => {
        const now = Date.now();
        const newFocused: Record<ID, number> = {};
        let changed = false;

        Object.entries(prev).forEach(([userId, timestamp]) => {
          if (now - timestamp < FOCUS_TIMEOUT) {
            newFocused[userId] = timestamp;
          } else {
            changed = true;
          }
        });

        return changed ? newFocused : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const markFocused = useCallback(() => {
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
    }

    broadcastService.broadcastFocusStart(currentUser.id);
    setFocusedUsers((prev) => ({
      ...prev,
      [currentUser.id]: Date.now(),
    }));

    focusTimeoutRef.current = setTimeout(() => {
      broadcastService.broadcastFocusStop(currentUser.id);
      setFocusedUsers((prev) => {
        const newFocused = { ...prev };
        delete newFocused[currentUser.id];
        return newFocused;
      });
    }, FOCUS_TIMEOUT);
  }, [currentUser.id, broadcastService]);

  const markUnfocused = useCallback(() => {
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
      focusTimeoutRef.current = null;
    }

    broadcastService.broadcastFocusStop(currentUser.id);
    setFocusedUsers((prev) => {
      const newFocused = { ...prev };
      delete newFocused[currentUser.id];
      return newFocused;
    });
  }, [currentUser.id, broadcastService]);

  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  return { focusedUsers, markFocused, markUnfocused };
};

