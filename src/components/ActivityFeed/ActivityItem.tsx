import React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  LogIn,
  LogOut,
  MessageSquare,
  Trash2,
  Plus,
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

const getActivityIcon = (type: string) => {
  const iconClass = "w-4 h-4 text-gray-500 dark:text-[#707080]";
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
      return <Plus className={iconClass} />;
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

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  return (
    <div className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {getActivityText(activity)}
        </p>
        <div className="flex items-center gap-1">
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
};
