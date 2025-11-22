import React from "react";

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="h-screen bg-white dark:bg-[#0a0a0a]">
      <div className="flex flex-col md:flex-row h-screen">
        <div className="w-[280px] h-full flex-shrink-0 flex flex-col gap-4 p-4 border-r border-neutral-200 dark:border-[#1a1a1a] bg-white dark:bg-[#0f0f0f]">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="h-5 bg-neutral-200 dark:bg-[#1a1a1a] rounded w-24 animate-pulse" />
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-neutral-200 dark:bg-[#1a1a1a] rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-neutral-200 dark:bg-[#1a1a1a] rounded w-20 mb-1 animate-pulse" />
                      <div className="h-3 bg-neutral-200 dark:bg-[#1a1a1a] rounded w-16 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-5 bg-neutral-200 dark:bg-[#1a1a1a] rounded w-20 animate-pulse" />
              <div className="flex flex-col gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-3.5 h-3.5 bg-neutral-200 dark:bg-[#1a1a1a] rounded animate-pulse" />
                    <div className="flex-1">
                      <div className="h-3 bg-neutral-200 dark:bg-[#1a1a1a] rounded w-full mb-1 animate-pulse" />
                      <div className="h-2 bg-neutral-200 dark:bg-[#1a1a1a] rounded w-16 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-4 p-3 md:p-4 bg-white dark:bg-[#0a0a0a]">
          <div className="flex flex-col gap-3 p-4 border border-neutral-200 dark:border-[#1a1a1a] rounded-lg bg-white dark:bg-[#0f0f0f]">
            <div className="h-5 bg-neutral-200 dark:bg-[#1a1a1a] rounded w-20 animate-pulse" />
            <div className="h-12 bg-neutral-200 dark:bg-[#1a1a1a] rounded w-16 animate-pulse" />
            <div className="flex gap-2">
              <div className="flex-1 h-9 bg-neutral-200 dark:bg-[#1a1a1a] rounded-md animate-pulse" />
              <div className="flex-1 h-9 bg-neutral-200 dark:bg-[#1a1a1a] rounded-md animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col h-[400px] md:h-[600px] border border-neutral-200 dark:border-[#1a1a1a] rounded-lg bg-white dark:bg-[#0f0f0f]">
            <div className="h-12 border-b border-neutral-200 dark:border-[#1a1a1a] flex items-center px-4">
              <div className="h-5 bg-neutral-200 dark:bg-[#1a1a1a] rounded w-20 animate-pulse" />
            </div>
            <div className="flex-1 p-4 flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="h-3 bg-neutral-200 dark:bg-[#1a1a1a] rounded w-24 animate-pulse" />
                    <div className="h-2 bg-neutral-200 dark:bg-[#1a1a1a] rounded w-20 animate-pulse" />
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-neutral-200 dark:bg-[#1a1a1a] rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="h-12 bg-neutral-200 dark:bg-[#1a1a1a] rounded-md w-3/4 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

