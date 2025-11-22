import React, { useEffect, useRef, useState } from "react";
import { ActivityItem } from "./ActivityItem";
import { BroadcastEvent } from "../../../utils/broadcastService";
import { User } from "../../../types";

interface Activity {
  id: string;
  type: string;
  userId: string;
  userName: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface ActivityFeedProps {
  broadcastMessages: Array<{ type: string; message: unknown }>;
  localMessages: Array<{ type: string; message: unknown }>;
  users: User[];
  currentUser: User;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  broadcastMessages,
  localMessages,
  users,
  currentUser,
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const lastBroadcastCountRef = useRef(0);
  const lastLocalCountRef = useRef(0);
  const usersMapRef = useRef<Map<string, string>>(new Map());
  const processedJoinEventsRef = useRef<Set<string>>(new Set());
  const processedLeaveEventsRef = useRef<Set<string>>(new Set());
  const processedMessageIdsRef = useRef<Set<string>>(new Set());
  const processedCounterIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    usersMapRef.current.set(currentUser.id, currentUser.name);
    users.forEach((user) => {
      usersMapRef.current.set(user.id, user.name);
    });
  }, [users, currentUser]);

  const getUserName = (userId: string): string => {
    if (userId === currentUser.id) {
      return currentUser.name;
    }
    const user = users.find((u) => u.id === userId);
    if (user) {
      return user.name;
    }
    return usersMapRef.current.get(userId) || "Unknown";
  };

  useEffect(() => {
    const newBroadcastMessages = broadcastMessages.slice(
      lastBroadcastCountRef.current
    );
    const newLocalMessages = localMessages.slice(lastLocalCountRef.current);

    lastBroadcastCountRef.current = broadcastMessages.length;
    lastLocalCountRef.current = localMessages.length;

    const allNewMessages = [...newBroadcastMessages, ...newLocalMessages];

    if (allNewMessages.length === 0) {
      return;
    }

    const newActivities: Activity[] = [];

    allNewMessages.forEach((msg) => {
      if (msg.type === "event") {
        const event = msg.message as BroadcastEvent;
        let activity: Activity | null = null;

        switch (event.type) {
          case "user_join":
            const joinUser = event.payload as any;
            const joinEventKey = `join-${joinUser.id}`;

            if (!processedJoinEventsRef.current.has(joinEventKey)) {
              processedJoinEventsRef.current.add(joinEventKey);
              setTimeout(() => {
                processedJoinEventsRef.current.delete(joinEventKey);
              }, 30000);

              usersMapRef.current.set(joinUser.id, joinUser.name);
              activity = {
                id: `join-${joinUser.id}-${Date.now()}`,
                type: "user_join",
                userId: joinUser.id,
                userName: joinUser.name,
                timestamp: Date.now(),
              };
            }
            break;

          case "user_leave":
            const leaveUserId = (event.payload as any).userId;
            const leaveEventKey = `leave-${leaveUserId}`;

            if (!processedLeaveEventsRef.current.has(leaveEventKey)) {
              const leaveUserName = usersMapRef.current.get(leaveUserId);
              if (leaveUserName) {
                processedLeaveEventsRef.current.add(leaveEventKey);
                setTimeout(() => {
                  processedLeaveEventsRef.current.delete(leaveEventKey);
                }, 30000);

                activity = {
                  id: `leave-${leaveUserId}-${Date.now()}`,
                  type: "user_leave",
                  userId: leaveUserId,
                  userName: leaveUserName,
                  timestamp: Date.now(),
                };
                usersMapRef.current.delete(leaveUserId);
              }
            }
            break;

          case "message_send":
            const msgPayload = event.payload as any;
            const messageId = msgPayload.id;

            if (messageId && !processedMessageIdsRef.current.has(messageId)) {
              processedMessageIdsRef.current.add(messageId);

              if (processedMessageIdsRef.current.size > 500) {
                const entries = Array.from(processedMessageIdsRef.current);
                entries
                  .slice(0, 100)
                  .forEach((id) => processedMessageIdsRef.current.delete(id));
              }

              activity = {
                id: `msg-${messageId}`,
                type: "message_send",
                userId: msgPayload.userId,
                userName: getUserName(msgPayload.userId),
                timestamp: Date.now(),
              };
            }
            break;

          case "message_delete":
            const delPayload = event.payload as any;
            const delMessageId = delPayload.messageId;
            const delKey = `del-${delMessageId}`;

            activity = {
              id: delKey,
              type: "message_delete",
              userId: delPayload.userId,
              userName: getUserName(delPayload.userId),
              timestamp: Date.now(),
            };
            break;

          case "counter_update":
            const counterPayload = event.payload as any;
            const counterEventId = counterPayload.eventId;

            if (
              counterEventId &&
              !processedCounterIdsRef.current.has(counterEventId)
            ) {
              processedCounterIdsRef.current.add(counterEventId);

              if (processedCounterIdsRef.current.size > 500) {
                const entries = Array.from(processedCounterIdsRef.current);
                entries
                  .slice(0, 100)
                  .forEach((id) => processedCounterIdsRef.current.delete(id));
              }

              activity = {
                id: `counter-${counterEventId}`,
                type: "counter_update",
                userId: counterPayload.userId,
                userName: getUserName(counterPayload.userId),
                timestamp: Date.now(),
                metadata: { delta: counterPayload.delta },
              };
            }
            break;
        }

        if (activity) {
          newActivities.push(activity);
        }
      }
    });

    if (newActivities.length > 0) {
      setActivities((prev) => {
        const combined = [...prev, ...newActivities];
        return combined.slice(-50).sort((a, b) => b.timestamp - a.timestamp);
      });
    }
  }, [broadcastMessages, localMessages, users, currentUser]);

  return (
    <div className="flex flex-col h-[250px] md:h-[400px]">
      <div className="flex items-center justify-between gap-3 flex-shrink-0 pb-2 border-b border-neutral-200 dark:border-[#1a1a1a]">
        <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          Activity
        </h2>
        <div className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-900 rounded text-xs text-neutral-600 dark:text-neutral-400">
          {activities.length}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        {activities.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              No activity
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
