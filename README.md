# Cross-Tab Collaboration Dashboard

A real-time collaborative workspace that syncs across browser tabs. Built to explore the BroadcastChannel API using `react-broadcast-sync`.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in multiple tabs to see it work.

## What's This?

Ever wondered how to sync state across multiple browser tabs without a backend? This project does exactly that. Open the app in a few tabs and watch as your actions in one tab instantly appear in all the others.

**Try it:**

- Type in the chat and see typing indicators appear in other tabs
- Increment the counter and watch it update everywhere
- Toggle dark mode and see all tabs switch together
- Focus on the chat input and see who else is typing

It's pretty neat how the BroadcastChannel API handles all this with zero server involvement.

## The Tech

Built with Vite, React 18, TypeScript, and Tailwind. Uses `react-broadcast-sync` to handle the cross-tab messaging. State persists across page reloads using sessionStorage.

## Features

- **Chat** - Real-time messaging with typing indicators and message expiration
- **Counter** - Shared counter that stays in sync, shows who did what and when
- **User presence** - See who's online, when they joined/left, and who's focused
- **Activity feed** - A log of everything that happens (yes, including your own actions)
- **Theme sync** - Switch between light/dark mode and watch all tabs follow
- **Focus tracking** - See who's actively typing in the chat

## Running Tests

```bash
npm test              # Run once
npm run test:watch    # Watch mode
npm run test:ui       # Open Vitest UI
```

## Project Structure

The codebase follows a modular pattern where each feature gets its own hook:

- `useUsers` - Handles user presence and activity
- `useMessages` - Chat messaging with expiration
- `useCounter` - Shared counter sync
- `useTyping` - Typing indicators with debouncing
- `useTheme` - Theme sync across tabs
- `useFocus` - Focus state tracking

Everything ties together in `useCollaborativeSession` which exposes a clean API to the UI components.

## Notes

This was built as part of a coding challenge to demonstrate proper use of BroadcastChannel, clean React patterns, and TypeScript. The hardest part was getting the activity feed to show your own actions since BroadcastChannel doesn't echo messages back to the sender - solved that with a local message queue.

If you're curious about the implementation details, check out the hooks in `src/hooks/` - they're well-commented and fairly straightforward.
