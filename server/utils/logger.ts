export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  level: number;
}

export function createLogger(name: string): Logger {
  const prefix = `[${name}]`;
  return {
    level: process.env.NODE_ENV === "production" ? 2 : 4,
    debug(message: string, ...args: unknown[]) {
      if (this.level >= 4) {
        console.debug(prefix, message, ...args);
      }
    },
    info(message: string, ...args: unknown[]) {
      if (this.level >= 3) {
        console.info(prefix, message, ...args);
      }
    },
    warn(message: string, ...args: unknown[]) {
      if (this.level >= 2) {
        console.warn(prefix, message, ...args);
      }
    },
    error(message: string, ...args: unknown[]) {
      console.error(prefix, message, ...args);
    },
  };
}

// Default logger instance
export const logger = createLogger("app");
