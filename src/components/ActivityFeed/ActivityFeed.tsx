import React, { useEffect, useRef, useState } from "react";
import { ActivityItem } from "./ActivityItem";
import { BroadcastEvent } from "../../utils/broadcastService";
import { User } from "../../types";

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
  users: User[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  broadcastMessages,
  users,
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const processedEventsRef = useRef<Set<string>>(new Set());
  const lastMessageCountRef = useRef(0);
  const usersMapRef = useRef<Map<string, string>>(new Map());
  const processedLeaveEventsRef = useRef<Set<string>>(new Set());
  const processedJoinEventsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    users.forEach((user) => {
      usersMapRef.current.set(user.id, user.name);
    });
  }, [users]);

  useEffect(() => {
    if (broadcastMessages.length <= lastMessageCountRef.current) {
      return;
    }

    const newMessages = broadcastMessages.slice(lastMessageCountRef.current);
    lastMessageCountRef.current = broadcastMessages.length;

    const newActivities: Activity[] = [];

    newMessages.forEach((msg, index) => {
      if (msg.type === "event") {
        const event = msg.message as BroadcastEvent;
        const messageIndex =
          lastMessageCountRef.current - newMessages.length + index;

        let eventKey: string;
        if (event.type === "user_leave") {
          const leaveUserId = (event.payload as any).userId;
          eventKey = `${event.type}-${leaveUserId}`;
        } else {
          eventKey = `${event.type}-${messageIndex}-${JSON.stringify(event.payload)}`;
        }

        if (processedEventsRef.current.has(eventKey)) {
          return;
        }
        processedEventsRef.current.add(eventKey);

        if (processedEventsRef.current.size > 1000) {
          const firstKey = Array.from(processedEventsRef.current)[0];
          processedEventsRef.current.delete(firstKey);
        }

        let userId: string | undefined;
        if (event.type === "user_join" || event.type === "user_update") {
          userId = (event.payload as any).id;
        } else if ("userId" in event.payload) {
          userId = (event.payload as { userId: string }).userId;
        }
        const user = userId ? users.find((u) => u.id === userId) : undefined;

        if (
          user ||
          event.type === "user_join" ||
          event.type === "user_leave" ||
          event.type === "message_send" ||
          event.type === "message_delete" ||
          event.type === "counter_update"
        ) {
          let activity: Activity | null = null;

          switch (event.type) {
            case "user_join":
              const joinUser = user || (event.payload as any);
              const joinEventKey = `join-${joinUser?.id || (event.payload as any)?.id}`;

              if (processedJoinEventsRef.current.has(joinEventKey)) {
                break;
              }

              if (joinUser && joinUser.id) {
                processedJoinEventsRef.current.add(joinEventKey);
                setTimeout(() => {
                  processedJoinEventsRef.current.delete(joinEventKey);
                }, 30000);

                usersMapRef.current.set(joinUser.id, joinUser.name);
                activity = {
                  id: `join-${joinUser.id}-${messageIndex}`,
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

              if (processedLeaveEventsRef.current.has(leaveEventKey)) {
                break;
              }

              const leaveUserName =
                usersMapRef.current.get(leaveUserId) ||
                users.find((u) => u.id === leaveUserId)?.name;

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
              break;
            case "message_send":
              if (user) {
                const messageId = (event.payload as any).id;
                activity = {
                  id: `msg-${messageId || messageIndex}`,
                  type: "message_send",
                  userId: user.id,
                  userName: user.name,
                  timestamp: Date.now(),
                };
              }
              break;
            case "message_delete":
              if (user) {
                const delMessageId = (event.payload as any).messageId;
                activity = {
                  id: `del-${delMessageId || messageIndex}`,
                  type: "message_delete",
                  userId: user.id,
                  userName: user.name,
                  timestamp: Date.now(),
                };
              }
              break;
            case "counter_update":
              if (user) {
                activity = {
                  id: `counter-${userId}-${messageIndex}`,
                  type: "counter_update",
                  userId: user.id,
                  userName: user.name,
                  timestamp: Date.now(),
                  metadata: { delta: (event.payload as any).delta },
                };
              }
              break;
          }

          if (activity) {
            newActivities.push(activity);
          }
        }
      }
    });

    if (newActivities.length > 0) {
      setActivities((prev) => {
        const combined = [...prev, ...newActivities];
        return combined.slice(-50).sort((a, b) => b.timestamp - a.timestamp);
      });
    }
  }, [broadcastMessages, users]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col h-[816px]">
      <div className="flex items-center justify-between gap-3 flex-shrink-0">
        <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Activity
        </h2>
        <div className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
          {activities.length}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        {activities.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No activity
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
