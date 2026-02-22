import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  Status,
  AfterStep,
  setDefaultTimeout,
} from "@cucumber/cucumber";
import { CustomWorld } from "../utils/world";
import { ENV } from "../config/env";
import { Logger } from "../utils/logger";
import * as fs from "fs";
import * as path from "path";

// Set Cucumber step timeout to 30 seconds (default is 5s)
setDefaultTimeout(30000);

const logger = new Logger("Hooks");

/**
 * Ensures required report directories exist before test execution.
 */
BeforeAll(async function () {
  logger.info("========== Test Suite Starting ==========");
  logger.info(`Environment: ${ENV.ENV}`);
  logger.info(`Base URL: ${ENV.BASE_URL}`);
  logger.info(`Browser: ${ENV.BROWSER}`);
  logger.info(`Headless: ${ENV.HEADLESS}`);

  // Create report directories
  const dirs = [
    "reports",
    "reports/screenshots",
    "reports/videos",
    "reports/allure-results",
  ];
  for (const dir of dirs) {
    const dirPath = path.resolve(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
});

/**
 * Before each scenario: launch browser and create a new page.
 */
Before(async function (this: CustomWorld, scenario) {
  this.testName = scenario.pickle.name;
  this.startTime = new Date();
  logger.info(`--- Starting Scenario: ${this.testName} ---`);

  await this.launchBrowser();
});

/**
 * After each step: capture screenshot on failure.
 */
AfterStep(async function (this: CustomWorld, { result }) {
  if (result?.status === Status.FAILED && ENV.SCREENSHOT_ON_FAILURE) {
    try {
      const screenshot = await this.takeScreenshot();
      this.attach(screenshot, "image/png");
      logger.info("Screenshot captured after failed step");
    } catch (error) {
      logger.error(`Failed to capture screenshot: ${error}`);
    }
  }
});

/**
 * After each scenario: capture artifacts on failure, then tear down browser.
 */
After(async function (this: CustomWorld, scenario) {
  const scenarioName = scenario.pickle.name;
  const status = scenario.result?.status;

  if (status === Status.FAILED) {
    logger.error(`Scenario FAILED: ${scenarioName}`);

    // Final screenshot on failure
    if (ENV.SCREENSHOT_ON_FAILURE) {
      try {
        const screenshot = await this.takeScreenshot();
        this.attach(screenshot, "image/png");

        // Also save to disk
        const sanitizedName = scenarioName.replace(/[^a-zA-Z0-9]/g, "_");
        const screenshotPath = path.resolve(
          process.cwd(),
          `reports/screenshots/${sanitizedName}_${Date.now()}.png`
        );
        fs.writeFileSync(screenshotPath, screenshot);
        logger.info(`Screenshot saved: ${screenshotPath}`);
      } catch (error) {
        logger.error(`Failed to capture final screenshot: ${error}`);
      }
    }

    // Attach video on failure
    if (ENV.VIDEO_ON_FAILURE) {
      try {
        const video = this.page.video();
        if (video) {
          const videoPath = await video.path();
          if (videoPath && fs.existsSync(videoPath)) {
            const videoBuffer = fs.readFileSync(videoPath);
            this.attach(videoBuffer, "video/webm");
            logger.info(`Video attached for failed scenario: ${scenarioName}`);
          }
        }
      } catch (error) {
        logger.error(`Failed to attach video: ${error}`);
      }
    }
  } else {
    logger.info(`Scenario PASSED: ${scenarioName}`);
  }

  // Calculate duration
  if (this.startTime) {
    const duration = new Date().getTime() - this.startTime.getTime();
    logger.info(`Duration: ${(duration / 1000).toFixed(2)}s`);
  }

  // Tear down browser
  await this.teardown();
  logger.info(`--- Finished Scenario: ${scenarioName} ---\n`);
});

/**
 * After all scenarios complete.
 * Note: Allure result conversion is handled by scripts/convert-to-allure.js
 * (runs as posttest hook) because Cucumber formatters write JSON output
 * AFTER all hooks complete, so cucumber-report.json doesn't exist yet here.
 */
AfterAll(async function () {
  logger.info("========== Test Suite Completed ==========");
});
