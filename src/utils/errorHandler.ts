export class BroadcastError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = "BroadcastError";
  }
}

export const handleBroadcastError = (error: unknown): void => {
  if (error instanceof Error) {
    console.error("[BroadcastError]", error.message);
  } else {
    console.error("[BroadcastError]", "Unknown error occurred");
  }
};

export const safeBroadcast = <T>(fn: () => T, fallback: T): T => {
  try {
    return fn();
  } catch (error) {
    handleBroadcastError(error);
    return fallback;
  }
};
