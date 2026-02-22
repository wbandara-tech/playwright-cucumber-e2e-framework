import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env file at project root
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const ENV = {
  /** Application base URL */
  BASE_URL: process.env.BASE_URL || "https://automationexercise.com",

  /** Current environment (QA, DEV, STAGING) */
  ENV: process.env.ENV || "QA",

  /** Browser to use: chromium | firefox | webkit */
  BROWSER: (process.env.BROWSER || "chromium") as
    | "chromium"
    | "firefox"
    | "webkit",

  /** Run in headless mode */
  HEADLESS: process.env.HEADLESS === "true",

  /** Default element timeout in ms */
  DEFAULT_TIMEOUT: parseInt(process.env.DEFAULT_TIMEOUT || "30000", 10),

  /** Navigation timeout in ms */
  NAVIGATION_TIMEOUT: parseInt(process.env.NAVIGATION_TIMEOUT || "60000", 10),

  /** Number of retries on failure */
  RETRY_COUNT: parseInt(process.env.RETRY_COUNT || "1", 10),

  /** Capture screenshot on failure */
  SCREENSHOT_ON_FAILURE: process.env.SCREENSHOT_ON_FAILURE !== "false",

  /** Record video on failure */
  VIDEO_ON_FAILURE: process.env.VIDEO_ON_FAILURE !== "false",
};
