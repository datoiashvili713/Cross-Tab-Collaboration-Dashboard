import { useState, useEffect, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { CounterState, User } from "../types";
import { BroadcastEvent, BroadcastService } from "../utils/broadcastService";
import { rehydrateState, persistState } from "../utils/rehydration";

interface UseCounterProps {
  broadcastMessages: Array<{ type: string; message: unknown }>;
  broadcastService: BroadcastService;
  currentUser: User;
}

export const useCounter = ({
  broadcastMessages,
  broadcastService,
  currentUser,
}: UseCounterProps) => {
  const [counter, setCounter] = useState<CounterState>(() => {
    const rehydrated = rehydrateState();
    return rehydrated.counter || { value: 0 };
  });
  const processedEventsRef = useRef<Set<string>>(new Set());
  const lastMessageCountRef = useRef(0);
  const isInitializedRef = useRef(false);
  const ownEventIdsRef = useRef<Set<string>>(new Set());
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      return;
    }
    persistState({ counter });
  }, [counter]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      processedEventsRef.current.clear();
      ownEventIdsRef.current.clear();
    };
  }, []);

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
        if (event.type === "counter_update") {
          const { delta, userId, eventId } = event.payload;

          if (eventId && ownEventIdsRef.current.has(eventId)) {
            return;
          }

          const eventKey =
            eventId || `counter-${userId}-${delta}-${Date.now()}`;

          if (processedEventsRef.current.has(eventKey)) {
            return;
          }

          processedEventsRef.current.add(eventKey);

          if (processedEventsRef.current.size > 1000) {
            const entries = Array.from(processedEventsRef.current);
            entries
              .slice(0, 100)
              .forEach((key) => processedEventsRef.current.delete(key));
          }

          setCounter((prev) => {
            const newValue = prev.value + delta;
            if (newValue < 0) return prev;
            return {
              value: newValue,
              lastAction: {
                userId: userId,
                timestamp: Date.now(),
              },
            };
          });
        } else if (event.type === "state_sync") {
          if (event.payload.fromTabId !== currentTabId) {
            setCounter((prev) => {
              const syncedCounter = event.payload.counter;
              if (syncedCounter && syncedCounter.value !== undefined) {
                if (
                  !prev.lastAction ||
                  (syncedCounter.lastAction &&
                    syncedCounter.lastAction.timestamp >
                      prev.lastAction.timestamp)
                ) {
                  return syncedCounter;
                }
              }
              return prev;
            });
          }
        }
      }
    });
  }, [broadcastMessages, currentUser.tabId]);

  const updateCounter = useCallback(
    async (delta: number): Promise<void> => {
      const eventId = uuidv4();
      ownEventIdsRef.current.add(eventId);

      setCounter((prev) => {
        const newValue = prev.value + delta;
        if (newValue < 0) return prev;

        return {
          value: newValue,
          lastAction: {
            userId: currentUser.id,
            timestamp: Date.now(),
          },
        };
      });

      broadcastService.broadcastCounterUpdate(delta, currentUser.id, eventId);

      setTimeout(() => {
        ownEventIdsRef.current.delete(eventId);
      }, 1000);
    },
    [currentUser.id, broadcastService]
  );

  return { counter, updateCounter };
};
