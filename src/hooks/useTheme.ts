import { useState, useEffect, useCallback, useRef } from "react";
import { Theme } from "../types";
import { BroadcastEvent, BroadcastService } from "../utils/broadcastService";

interface UseThemeProps {
  broadcastMessages: Array<{ type: string; message: unknown }>;
  broadcastService: BroadcastService;
}

export const useTheme = ({
  broadcastMessages,
  broadcastService,
}: UseThemeProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    return stored || "light";
  });
  const lastMessageCountRef = useRef(0);
  const processedEventsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const initialTheme = stored || "light";
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (broadcastMessages.length <= lastMessageCountRef.current) {
      return;
    }

    const newMessages = broadcastMessages.slice(lastMessageCountRef.current);
    lastMessageCountRef.current = broadcastMessages.length;

    newMessages.forEach((msg) => {
      if (msg.type === "event") {
        const event = msg.message as BroadcastEvent;
        if (event.type === "theme_change") {
          const eventKey = `theme-${event.payload.theme}-${Date.now()}`;
          if (processedEventsRef.current.has(eventKey)) {
            return;
          }
          processedEventsRef.current.add(eventKey);

          if (processedEventsRef.current.size > 100) {
            const firstKey = Array.from(processedEventsRef.current)[0];
            processedEventsRef.current.delete(firstKey);
          }

          const newTheme = event.payload.theme;
          setTheme(newTheme);
          localStorage.setItem("theme", newTheme);
          if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      }
    });
  }, [broadcastMessages]);

  const setThemeHandler = useCallback(
    (newTheme: Theme) => {
      setTheme(newTheme);
      localStorage.setItem("theme", newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
      broadcastService.broadcastThemeChange(newTheme);
    },
    [broadcastService]
  );

  return { theme, setTheme: setThemeHandler };
};
