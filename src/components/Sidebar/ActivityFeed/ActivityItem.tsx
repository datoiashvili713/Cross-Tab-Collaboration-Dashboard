import React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  LogIn,
  LogOut,
  MessageSquare,
  Trash2,
  Plus,
  Minus,
  Circle,
} from "lucide-react";

interface Activity {
  id: string;
  type: string;
  userId: string;
  userName: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface ActivityItemProps {
  activity: Activity;
}

const getActivityIcon = (type: string, metadata?: Record<string, unknown>) => {
  const iconClass = "w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400";
  switch (type) {
    case "user_join":
      return <LogIn className={iconClass} />;
    case "user_leave":
      return <LogOut className={iconClass} />;
    case "message_send":
      return <MessageSquare className={iconClass} />;
    case "message_delete":
      return <Trash2 className={iconClass} />;
    case "counter_update":
      const delta = metadata?.delta as number;
      return delta > 0 ? <Plus className={iconClass} /> : <Minus className={iconClass} />;
    default:
      return <Circle className={iconClass} />;
  }
};

const getActivityText = (activity: Activity): string => {
  switch (activity.type) {
    case "user_join":
      return `${activity.userName} joined`;
    case "user_leave":
      return `${activity.userName} left`;
    case "message_send":
      return `${activity.userName} sent a message`;
    case "message_delete":
      return `${activity.userName} deleted a message`;
    case "counter_update":
      const delta = activity.metadata?.delta as number;
      return `${activity.userName} ${delta > 0 ? "incremented" : "decremented"} the counter`;
    default:
      return `${activity.userName} performed an action`;
  }
};

export const ActivityItem: React.FC<ActivityItemProps> = React.memo(({ activity }) => {
  return (
    <div className="flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-neutral-50 dark:hover:bg-[#1a1a1a] transition-colors">
      <div className="flex-shrink-0 flex items-start">{getActivityIcon(activity.type, activity.metadata)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 leading-snug">
          {getActivityText(activity)}
        </p>
        <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
          {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
});

