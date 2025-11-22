import React, { useEffect, useRef } from "react";
import { Message, User } from "../../../types";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";

interface ChatWindowProps {
  messages: Message[];
  users: User[];
  currentUserId: string;
  typingUsers: Record<string, number>;
  focusedUsers?: Record<string, number>;
  onSendMessage: (text: string, expiresInMs?: number) => Promise<unknown>;
  onDeleteMessage: (messageId: string) => Promise<void>;
  onTyping: () => void;
  onClearTyping: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  isLoading?: boolean;
  getUserName?: (userId: string) => string | undefined;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  users,
  currentUserId,
  typingUsers,
  focusedUsers: _focusedUsers = {},
  onSendMessage,
  onDeleteMessage,
  onTyping,
  onClearTyping,
  onFocus = () => {},
  onBlur = () => {},
  isLoading = false,
  getUserName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const lastMessageCountRef = useRef(0);
  const lastMessageUserIdRef = useRef<string | null>(null);
  const hasInitializedRef = useRef(false);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (!hasInitializedRef.current && messages.length > 0) {
      hasInitializedRef.current = true;
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages]);

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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      const isScrolling = container.scrollHeight > container.clientHeight;
      if (isScrolling) {
        const isAtTop = container.scrollTop === 0 && e.deltaY < 0;
        const isAtBottom =
          container.scrollHeight -
            container.scrollTop -
            container.clientHeight <
            1 && e.deltaY > 0;

        if (isAtTop || isAtBottom) {
          e.preventDefault();
        }
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div className="flex flex-col h-[400px] md:h-[600px] border border-neutral-200 dark:border-[#1a1a1a] rounded-lg bg-white dark:bg-[#0f0f0f] overflow-hidden">
      <ChatHeader />
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 min-h-0"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              No messages yet
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
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
                <ChatMessage
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
      <TypingIndicator
        typingUsers={typingUsers}
        users={users}
        currentUserId={currentUserId}
      />
      <ChatInput
        onSendMessage={onSendMessage}
        onTyping={onTyping}
        onClearTyping={onClearTyping}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={isLoading}
      />
    </div>
  );
};
