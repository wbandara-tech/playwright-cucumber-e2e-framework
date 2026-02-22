import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  Status,
  AfterStep,
} from "@cucumber/cucumber";
import { CustomWorld } from "../utils/world";
import { ENV } from "../config/env";
import { Logger } from "../utils/logger";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

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
 * Generates Allure-compatible result files from Cucumber JSON report.
 */
AfterAll(async function () {
  logger.info("========== Test Suite Completed ==========");

  // Convert Cucumber JSON report to Allure result files
  const cucumberReportPath = path.resolve(
    process.cwd(),
    "reports/cucumber-report.json"
  );
  const allureResultsDir = path.resolve(process.cwd(), "reports/allure-results");

  if (!fs.existsSync(allureResultsDir)) {
    fs.mkdirSync(allureResultsDir, { recursive: true });
  }

  // Write environment.properties for Allure
  const envProps = [
    `Browser=${ENV.BROWSER}`,
    `Environment=${ENV.ENV}`,
    `Base_URL=${ENV.BASE_URL}`,
    `Headless=${ENV.HEADLESS}`,
    `Timeout=${ENV.DEFAULT_TIMEOUT}ms`,
  ].join("\n");
  fs.writeFileSync(
    path.join(allureResultsDir, "environment.properties"),
    envProps
  );

  // Write categories.json for Allure defect classification
  const categories = [
    {
      name: "Product Defects",
      matchedStatuses: ["failed"],
      messageRegex: ".*Expected.*",
    },
    {
      name: "Test Defects",
      matchedStatuses: ["broken"],
      messageRegex: ".*",
    },
    {
      name: "Skipped Tests",
      matchedStatuses: ["skipped"],
    },
  ];
  fs.writeFileSync(
    path.join(allureResultsDir, "categories.json"),
    JSON.stringify(categories, null, 2)
  );

  // Convert Cucumber JSON to Allure result containers and test cases
  if (fs.existsSync(cucumberReportPath)) {
    try {
      const cucumberData = JSON.parse(
        fs.readFileSync(cucumberReportPath, "utf-8")
      );
      logger.info(
        `Converting ${cucumberData.length} feature(s) to Allure results`
      );

      for (const feature of cucumberData) {
        for (const scenario of feature.elements || []) {
          const uuid = crypto.randomUUID();
          const allureResult = {
            uuid,
            historyId: crypto
              .createHash("md5")
              .update(`${feature.name}:${scenario.name}`)
              .digest("hex"),
            name: scenario.name,
            fullName: `${feature.name} > ${scenario.name}`,
            status: mapCucumberStatus(scenario),
            statusDetails: getStatusDetails(scenario),
            stage: "finished",
            start: getStartTime(scenario),
            stop: getStopTime(scenario),
            labels: [
              { name: "suite", value: feature.name },
              { name: "feature", value: feature.name },
              { name: "story", value: scenario.name },
              { name: "severity", value: getSeverity(scenario) },
              { name: "framework", value: "cucumber" },
              { name: "language", value: "typescript" },
              ...(scenario.tags || []).map((tag: { name: string }) => ({
                name: "tag",
                value: tag.name.replace("@", ""),
              })),
            ],
            steps: (scenario.steps || []).map(
              (step: {
                keyword: string;
                name: string;
                result: { status: string; duration: number; error_message?: string };
              }) => ({
                name: `${step.keyword}${step.name}`,
                status: step.result?.status === "passed" ? "passed" : step.result?.status === "failed" ? "failed" : "skipped",
                stage: "finished",
                start: 0,
                stop: step.result?.duration
                  ? Math.round(step.result.duration / 1000000)
                  : 0,
                statusDetails: step.result?.error_message
                  ? { message: step.result.error_message }
                  : {},
              })
            ),
          };

          // Write each test result as a separate JSON file
          fs.writeFileSync(
            path.join(allureResultsDir, `${uuid}-result.json`),
            JSON.stringify(allureResult, null, 2)
          );
        }
      }

      logger.info("Allure results generated successfully");
    } catch (error) {
      logger.error(`Failed to convert Cucumber results to Allure: ${error}`);
    }
  } else {
    logger.warn("Cucumber JSON report not found — skipping Allure conversion");
  }
});

/**
 * Maps Cucumber scenario status to Allure status.
 */
function mapCucumberStatus(scenario: {
  steps?: Array<{ result?: { status: string } }>;
}): string {
  const steps = scenario.steps || [];
  const hasFailure = steps.some((s) => s.result?.status === "failed");
  const hasUndefined = steps.some((s) => s.result?.status === "undefined");
  const hasSkipped = steps.some(
    (s) => s.result?.status === "skipped" || s.result?.status === "pending"
  );

  if (hasFailure) return "failed";
  if (hasUndefined) return "broken";
  if (hasSkipped) return "skipped";
  return "passed";
}

/**
 * Extracts error details from a failed scenario.
 */
function getStatusDetails(scenario: {
  steps?: Array<{ result?: { status: string; error_message?: string } }>;
}): { message?: string; trace?: string } {
  const failedStep = (scenario.steps || []).find(
    (s) => s.result?.status === "failed"
  );
  if (failedStep?.result?.error_message) {
    return {
      message: failedStep.result.error_message.split("\n")[0],
      trace: failedStep.result.error_message,
    };
  }
  return {};
}

/**
 * Calculates start time from scenario steps.
 */
function getStartTime(scenario: {
  steps?: Array<{ result?: { duration?: number } }>;
}): number {
  return Date.now() - getTotalDuration(scenario);
}

/**
 * Calculates stop time (current time).
 */
function getStopTime(_scenario: {
  steps?: Array<{ result?: { duration?: number } }>;
}): number {
  return Date.now();
}

/**
 * Calculates total duration of all steps in nanoseconds, returns ms.
 */
function getTotalDuration(scenario: {
  steps?: Array<{ result?: { duration?: number } }>;
}): number {
  return (scenario.steps || []).reduce((total, step) => {
    return total + Math.round((step.result?.duration || 0) / 1000000);
  }, 0);
}

/**
 * Determines severity from scenario tags.
 */
function getSeverity(scenario: { tags?: Array<{ name: string }> }): string {
  const tags = (scenario.tags || []).map((t) => t.name);
  if (tags.includes("@critical")) return "critical";
  if (tags.includes("@smoke")) return "critical";
  if (tags.includes("@regression")) return "normal";
  return "normal";
}
