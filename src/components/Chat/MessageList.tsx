import React, { useEffect, useRef } from "react";
import { Message, User } from "../../types";
import { MessageItem } from "./MessageItem";

interface MessageListProps {
  messages: Message[];
  users: User[];
  currentUserId: string;
  onDeleteMessage: (messageId: string) => Promise<void>;
  getUserName?: (userId: string) => string | undefined;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  users,
  currentUserId,
  onDeleteMessage,
  getUserName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const lastMessageCountRef = useRef(0);
  const lastMessageUserIdRef = useRef<string | null>(null);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const hasNewMessages = messages.length > lastMessageCountRef.current;
    const lastMessage = messages[messages.length - 1];
    const isCurrentUserMessage = lastMessage?.userId === currentUserId;

    lastMessageCountRef.current = messages.length;
    lastMessageUserIdRef.current = lastMessage?.userId || null;

    if (hasNewMessages && containerRef.current) {
      const container = containerRef.current;
      const isAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        50;

      if (isAtBottom || isCurrentUserMessage) {
        requestAnimationFrame(() => {
          scrollToBottom();
        });
        shouldAutoScrollRef.current = true;
      }
    }
  }, [messages, currentUserId]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (containerRef.current) {
      const container = containerRef.current;
      const isAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        50;
      shouldAutoScrollRef.current = isAtBottom;
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      onWheel={(e) => {
        e.stopPropagation();
        const target = e.currentTarget;
        const isScrolling = target.scrollHeight > target.clientHeight;
        if (isScrolling) {
          e.preventDefault();
        }
      }}
      className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(156, 163, 175, 0.5) transparent",
      }}
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            No messages yet
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {messages.map((message) => {
            let user = users.find((u) => u.id === message.userId);
            if (!user && getUserName) {
              const userName = getUserName(message.userId);
              if (userName) {
                user = {
                  id: message.userId,
                  name: userName,
                  lastActive: message.timestamp,
                };
              }
            }
            return (
              <MessageItem
                key={message.id}
                message={message}
                user={user}
                isCurrentUser={message.userId === currentUserId}
                onDelete={onDeleteMessage}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
