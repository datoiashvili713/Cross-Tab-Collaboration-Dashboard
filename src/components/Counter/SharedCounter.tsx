import React from "react";
import { CounterState, User } from "../../types";
import { formatDistanceToNow } from "date-fns";

interface SharedCounterProps {
  counter: CounterState;
  users: User[];
  onIncrement: () => Promise<void>;
  onDecrement: () => Promise<void>;
  isLoading?: boolean;
}

export const SharedCounter: React.FC<SharedCounterProps> = ({
  counter,
  users,
  onIncrement,
  onDecrement,
  isLoading = false,
}) => {
  const lastUser = counter.lastAction
    ? users.find((u) => u.id === counter.lastAction?.userId)
    : null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Counter
        </h2>
        <div className="flex flex-col items-center gap-2">
          <div className="text-6xl font-bold text-indigo-600 dark:text-indigo-400">
            {counter.value}
          </div>
          {counter.lastAction && lastUser && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">
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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onDecrement();
            }}
            disabled={isLoading}
            className="w-12 h-12 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold text-xl transition-colors flex items-center justify-center"
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
            className="w-12 h-12 rounded-lg bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold text-xl transition-colors flex items-center justify-center"
            aria-label="Increment"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};
