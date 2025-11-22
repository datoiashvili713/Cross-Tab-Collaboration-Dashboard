import { v4 as uuidv4 } from "uuid";
import { User, ID } from "../types";

export const generateUserId = (): ID => {
  const stored = sessionStorage.getItem("userId");
  if (stored) return stored;

  const newId = uuidv4();
  sessionStorage.setItem("userId", newId);
  return newId;
};

export const generateUserName = (): string => {
  const stored = sessionStorage.getItem("userName");
  if (stored) return stored;

  const adjectives = [
    "Swift",
    "Bold",
    "Clever",
    "Bright",
    "Noble",
    "Wise",
    "Brave",
    "Calm",
  ];
  const nouns = [
    "Eagle",
    "Wolf",
    "Fox",
    "Lion",
    "Tiger",
    "Bear",
    "Hawk",
    "Falcon",
  ];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const name = `${adj}${noun}${Math.floor(Math.random() * 1000)}`;
  sessionStorage.setItem("userName", name);
  return name;
};

export const generateTabId = (): string => {
  return uuidv4();
};

export const createUser = (id: ID, name: string, tabId: string): User => ({
  id,
  name,
  lastActive: Date.now(),
  tabId,
});
