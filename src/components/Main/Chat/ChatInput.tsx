import React, { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSendMessage: (text: string, expiresInMs?: number) => Promise<unknown>;
  onTyping: () => void;
  onClearTyping: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onTyping,
  onClearTyping,
  onFocus = () => {},
  onBlur = () => {},
  disabled = false,
}) => {
  const [text, setText] = useState("");
  const [expiresIn, setExpiresIn] = useState<number | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;

    const messageText = text.trim();
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await onSendMessage(messageText, expiresIn);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setText(newValue);
    if (newValue.trim().length > 0) {
      onTyping();
    } else {
      onClearTyping();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 flex-shrink-0 p-3 border-t border-neutral-200 dark:border-[#1a1a1a] bg-white dark:bg-[#0f0f0f]"
    >
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Type a message..."
          disabled={disabled}
          rows={1}
          className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:focus:ring-neutral-400 focus:border-neutral-500 dark:focus:border-neutral-400 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 text-sm resize-none transition-colors"
        />
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className="px-4 py-2 rounded-md border border-neutral-300 dark:border-[#2a2a2a] bg-white dark:bg-[#0f0f0f] hover:border-neutral-400 dark:hover:border-[#3a3a3a] hover:bg-neutral-50 dark:hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-neutral-300 dark:disabled:hover:border-[#2a2a2a] text-neutral-900 dark:text-neutral-100 text-sm font-medium transition-colors"
        >
          Send
        </button>
      </div>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
          <input
            type="checkbox"
            checked={expiresIn !== undefined}
            onChange={(e) => setExpiresIn(e.target.checked ? 30000 : undefined)}
            className="w-3.5 h-3.5 rounded border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 focus:ring-1 focus:ring-neutral-500 cursor-pointer"
          />
          <span>Expire in 30s</span>
        </label>
      </div>
    </form>
  );
};
