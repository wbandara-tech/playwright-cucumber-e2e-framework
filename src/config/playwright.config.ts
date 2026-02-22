import { LaunchOptions } from "@playwright/test";
import { ENV } from "./env";

/**
 * Playwright configuration for browser launch options.
 * This is consumed by the custom World to launch browsers.
 */
export const playwrightConfig: LaunchOptions = {
  headless: ENV.HEADLESS,
  slowMo: 0,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
  ],
};

export const browserContextOptions = {
  viewport: { width: 1920, height: 1080 },
  ignoreHTTPSErrors: true,
  acceptDownloads: true,
  recordVideo: ENV.VIDEO_ON_FAILURE
    ? { dir: "reports/videos/", size: { width: 1920, height: 1080 } }
    : undefined,
};
