const TAG = "[zhaohua]";

export const logger = {
  debug: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      console.debug(TAG, ...args);
    }
  },
  info: (...args: unknown[]) => console.info(TAG, ...args),
  warn: (...args: unknown[]) => console.warn(TAG, ...args),
  error: (...args: unknown[]) => console.error(TAG, ...args),
};
