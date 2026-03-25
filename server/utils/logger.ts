import { createConsola } from "consola";
import type { ConsolaInstance } from "consola";

const isProd = process.env.NODE_ENV === "production";

export const logger = createConsola({
  level: isProd ? 3 : 4,
  reporters: isProd
    ? [
        {
          log: (logObj) => {
            const output = {
              time: logObj.date.toISOString(),
              level: logObj.type,
              tag: logObj.tag || undefined,
              message: logObj.args.map(String).join(" "),
            };
            process.stdout.write(JSON.stringify(output) + "\n");
          },
        },
      ]
    : undefined,
});

export function createLogger(tag: string): ConsolaInstance {
  return logger.withTag(tag);
}
