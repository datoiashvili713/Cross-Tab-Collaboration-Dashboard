import { useState, useEffect, useMemo, useRef } from "react";
import { User, ID } from "../types";
import {
  generateUserId,
  generateUserName,
  generateTabId,
  createUser,
} from "../utils/userUtils";
import { BroadcastEvent, BroadcastService } from "../utils/broadcastService";
import { BROADCAST_CHANNEL_NAME } from "../utils/constants";
import { rehydrateState, persistState } from "../utils/rehydration";

interface UseUsersProps {
  broadcastMessages: Array<{ type: string; message: unknown }>;
  broadcastService: BroadcastService;
}

export const useUsers = ({
  broadcastMessages,
  broadcastService,
}: UseUsersProps) => {
  const [users, setUsers] = useState<Record<ID, User>>({});
  const currentUserRef = useRef<User | null>(null);
  const broadcastServiceRef = useRef(broadcastService);
  const hasJoinedRef = useRef(false);
  const broadcastedLeavesRef = useRef<Set<ID>>(new Set());
  const processedEventIdsRef = useRef<Set<string>>(new Set());
  const lastProcessedMessageCountRef = useRef(0);
  const userNamesMapRef = useRef<Map<ID, string>>(new Map<ID, string>());

  broadcastServiceRef.current = broadcastService;

  const currentUser = useMemo(() => {
    if (currentUserRef.current) return currentUserRef.current;

    const userId = generateUserId();
    const userName = generateUserName();
    const tabId = generateTabId();
    const user = createUser(userId, userName, tabId);
    currentUserRef.current = user;
    return user;
  }, []);

  useEffect(() => {
    if (hasJoinedRef.current) return;

    const user = currentUserRef.current!;
    const userId = user.id;

    broadcastServiceRef.current.broadcastUserJoin(user);
    broadcastServiceRef.current.broadcastStateRequest(userId);
    userNamesMapRef.current.set(userId, user.name);
    setUsers((prev) => ({ ...prev, [userId]: user }));
    hasJoinedRef.current = true;

    const broadcastLeave = () => {
      try {
        broadcastServiceRef.current.broadcastUserLeave(userId);
        const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        channel.postMessage({
          type: "event",
          message: {
            type: "user_leave",
            payload: { userId },
          },
        });
        setTimeout(() => channel.close(), 200);
      } catch (e) {
        console.error("Failed to broadcast user leave:", e);
      }
    };

    const handleBeforeUnload = () => {
      broadcastLeave();
    };

    const handlePageHide = () => {
      broadcastLeave();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      hasJoinedRef.current = false;
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
      try {
        broadcastServiceRef.current.broadcastUserLeave(userId);
      } catch (e) {
        console.error("Failed to broadcast user leave:", e);
      }
    };
  }, []);

  useEffect(() => {
    if (broadcastMessages.length <= lastProcessedMessageCountRef.current) {
      return;
    }

    const newMessages = broadcastMessages.slice(
      lastProcessedMessageCountRef.current
    );
    lastProcessedMessageCountRef.current = broadcastMessages.length;
    const currentTabId = currentUserRef.current?.tabId;

    newMessages.forEach((msg) => {
      if (msg.type === "event") {
        const event = msg.message as BroadcastEvent;
        const eventId = `${event.type}-${JSON.stringify(event.payload)}`;

        if (processedEventIdsRef.current.has(eventId)) {
          return;
        }
        processedEventIdsRef.current.add(eventId);

        if (processedEventIdsRef.current.size > 1000) {
          const firstKey = Array.from(processedEventIdsRef.current)[0];
          processedEventIdsRef.current.delete(firstKey);
        }

        switch (event.type) {
          case "user_join":
            const joinUser = event.payload;
            userNamesMapRef.current.set(joinUser.id, joinUser.name);
            setUsers((prev) => {
              if (prev[joinUser.id]) return prev;
              return {
                ...prev,
                [joinUser.id]: joinUser,
              };
            });
            break;
          case "user_leave":
            const leaveUserId = event.payload.userId;
            setUsers((prev) => {
              if (!prev[leaveUserId]) return prev;
              const newUsers = { ...prev };
              delete newUsers[leaveUserId];
              return newUsers;
            });
            break;
          case "user_update":
            const updateUser = event.payload;
            userNamesMapRef.current.set(updateUser.id, updateUser.name);
            setUsers((prev) => {
              if (!prev[updateUser.id]) return prev;
              return {
                ...prev,
                [updateUser.id]: updateUser,
              };
            });
            break;
          case "state_request":
            break;
          case "state_sync":
            if (event.payload.fromTabId !== currentTabId) {
              event.payload.users.forEach((user) => {
                userNamesMapRef.current.set(user.id, user.name);
              });

              if (event.payload.userNames) {
                Object.entries(event.payload.userNames).forEach(
                  ([id, name]) => {
                    if (!userNamesMapRef.current.has(id)) {
                      userNamesMapRef.current.set(id, name);
                    }
                  }
                );
              }

              const rehydrated = rehydrateState();
              if (rehydrated.userNames) {
                Object.entries(rehydrated.userNames).forEach(([id, name]) => {
                  if (!userNamesMapRef.current.has(id)) {
                    userNamesMapRef.current.set(id, name);
                  }
                });
              }

              if (
                event.payload.messages &&
                Array.isArray(event.payload.messages)
              ) {
                event.payload.messages.forEach((msg: { userId?: string }) => {
                  if (msg.userId && !userNamesMapRef.current.has(msg.userId)) {
                    const user = event.payload.users.find(
                      (u: User) => u.id === msg.userId
                    );
                    if (user) {
                      userNamesMapRef.current.set(msg.userId, user.name);
                    } else if (event.payload.userNames?.[msg.userId]) {
                      userNamesMapRef.current.set(
                        msg.userId,
                        event.payload.userNames[msg.userId]
                      );
                    } else if (rehydrated.userNames?.[msg.userId]) {
                      userNamesMapRef.current.set(
                        msg.userId,
                        rehydrated.userNames[msg.userId]
                      );
                    }
                  }
                });
              }

              setUsers((prev) => {
                const merged = { ...prev };
                event.payload.users.forEach((user) => {
                  if (
                    !merged[user.id] ||
                    merged[user.id].lastActive < user.lastActive
                  ) {
                    merged[user.id] = user;
                  }
                });
                return merged;
              });
            }
            break;
        }
      }
    });
  }, [broadcastMessages]);

  useEffect(() => {
    const rehydrated = rehydrateState();
    if (rehydrated.userNames) {
      Object.entries(rehydrated.userNames).forEach(([id, name]) => {
        userNamesMapRef.current.set(id, name);
      });
    }

    if (rehydrated.messages && Array.isArray(rehydrated.messages)) {
      rehydrated.messages.forEach((msg: { userId?: string }) => {
        if (msg.userId && !userNamesMapRef.current.has(msg.userId)) {
          const storedName = rehydrated.userNames?.[msg.userId];
          if (storedName) {
            userNamesMapRef.current.set(msg.userId, storedName);
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    const userId = currentUserRef.current!.id;

    const updateUserActivity = () => {
      setUsers((prev) => {
        if (!prev[userId]) {
          const user = currentUserRef.current!;
          const updatedUser = { ...user, lastActive: Date.now() };
          broadcastServiceRef.current.broadcastUserUpdate(updatedUser);
          return {
            ...prev,
            [userId]: updatedUser,
          };
        }
        const updatedUser = { ...prev[userId], lastActive: Date.now() };
        broadcastServiceRef.current.broadcastUserUpdate(updatedUser);
        return {
          ...prev,
          [userId]: updatedUser,
        };
      });
    };

    updateUserActivity();
    const interval = setInterval(updateUserActivity, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const INACTIVE_THRESHOLD = 5000;

      setUsers((prev) => {
        const activeUsers: Record<ID, User> = {};
        const currentUserId = currentUserRef.current?.id;
        const removedUserIds: ID[] = [];

        Object.values(prev).forEach((user) => {
          if (user.id === currentUserId) {
            activeUsers[user.id] = user;
          } else if (now - user.lastActive < INACTIVE_THRESHOLD) {
            activeUsers[user.id] = user;
          } else {
            removedUserIds.push(user.id);
          }
        });

        if (removedUserIds.length > 0) {
          removedUserIds.forEach((removedId) => {
            if (!broadcastedLeavesRef.current.has(removedId)) {
              broadcastedLeavesRef.current.add(removedId);
              try {
                broadcastServiceRef.current.broadcastUserLeave(removedId);
              } catch (e) {
                console.error("[useUsers] Failed to broadcast user leave:", e);
              }
              setTimeout(() => {
                broadcastedLeavesRef.current.delete(removedId);
              }, 60000);
            }
          });
        }

        if (removedUserIds.length > 0) {
          return activeUsers;
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  const getUserName = (userId: ID): string | undefined => {
    return userNamesMapRef.current.get(userId);
  };

  const getUserNamesMap = (): Record<ID, string> => {
    const map: Record<ID, string> = {};
    userNamesMapRef.current.forEach((name, id) => {
      map[id] = name;
    });
    return map;
  };

  useEffect(() => {
    const userNames: Record<string, string> = {};
    userNamesMapRef.current.forEach((name, id) => {
      userNames[id] = name;
    });
    if (Object.keys(userNames).length > 0) {
      persistState({ userNames });
    }
  }, [users]);

  useEffect(() => {
    const interval = setInterval(() => {
      const userNames: Record<string, string> = {};
      userNamesMapRef.current.forEach((name, id) => {
        userNames[id] = name;
      });
      if (Object.keys(userNames).length > 0) {
        persistState({ userNames });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    users: Object.values(users),
    currentUser,
    getUserName,
    getUserNamesMap,
  };
};
