import { defineNitroConfig } from "nitropack/config";
import { config } from "dotenv";

// Load .env, .env.local, .env.development.local (Nitro only reads .env by default)
config({ path: ".env" });
config({ path: ".env.local", override: true });
config({ path: ".env.development.local", override: true });

export default defineNitroConfig({
  srcDir: "server",
  compatibilityDate: "2025-03-23",
});
