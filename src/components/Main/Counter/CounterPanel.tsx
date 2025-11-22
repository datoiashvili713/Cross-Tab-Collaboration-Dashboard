import React from "react";
import { CounterState, User } from "../../../types";
import { formatDistanceToNow } from "date-fns";

interface CounterPanelProps {
  counter: CounterState;
  users: User[];
  onIncrement: () => Promise<void>;
  onDecrement: () => Promise<void>;
  isLoading?: boolean;
}

export const CounterPanel: React.FC<CounterPanelProps> = React.memo(
  ({ counter, users, onIncrement, onDecrement, isLoading = false }) => {
    const lastUser = counter.lastAction
      ? users.find((u) => u.id === counter.lastAction?.userId)
      : null;

    return (
      <div className="flex flex-col gap-3 p-4 border border-neutral-200 dark:border-[#1a1a1a] rounded-lg bg-white dark:bg-[#0f0f0f]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Counter
          </h2>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-4xl font-medium text-neutral-900 dark:text-neutral-100">
            {counter.value}
          </div>
          {counter.lastAction && lastUser && (
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                {lastUser.name}
              </span>
              <span>•</span>
              <span>
                {formatDistanceToNow(counter.lastAction.timestamp, {
                  addSuffix: true,
                })}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onDecrement();
            }}
            disabled={isLoading || counter.value === 0}
            className="flex-1 px-3 py-2 rounded-md border border-neutral-300 dark:border-[#2a2a2a] bg-white dark:bg-[#0f0f0f] hover:bg-neutral-50 dark:hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed text-neutral-900 dark:text-neutral-100 text-sm font-medium transition-colors"
            aria-label="Decrement"
          >
            −
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onIncrement();
            }}
            disabled={isLoading}
            className="flex-1 px-3 py-2 rounded-md border border-neutral-300 dark:border-[#2a2a2a] bg-white dark:bg-[#0f0f0f] hover:bg-neutral-50 dark:hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed text-neutral-900 dark:text-neutral-100 text-sm font-medium transition-colors"
            aria-label="Increment"
          >
            +
          </button>
        </div>
      </div>
    );
  }
);
