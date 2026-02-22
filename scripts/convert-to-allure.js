#!/usr/bin/env node

/**
 * Converts Cucumber JSON report to Allure-compatible result files.
 *
 * This script runs AFTER cucumber-js finishes (via npm posttest hook)
 * because Cucumber formatters write their output only after all hooks
 * (including AfterAll) have completed.
 *
 * Usage: node scripts/convert-to-allure.js
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const CUCUMBER_REPORT = path.resolve(
  process.cwd(),
  "reports/cucumber-report.json"
);
const ALLURE_RESULTS_DIR = path.resolve(
  process.cwd(),
  "reports/allure-results"
);

function main() {
  console.log("[allure-converter] Starting Cucumber → Allure conversion...");

  // Ensure output directory exists
  if (!fs.existsSync(ALLURE_RESULTS_DIR)) {
    fs.mkdirSync(ALLURE_RESULTS_DIR, { recursive: true });
  }

  // Check for cucumber report
  if (!fs.existsSync(CUCUMBER_REPORT)) {
    console.warn(
      "[allure-converter] cucumber-report.json not found — skipping."
    );
    process.exit(0);
  }

  let cucumberData;
  try {
    cucumberData = JSON.parse(fs.readFileSync(CUCUMBER_REPORT, "utf-8"));
  } catch (err) {
    console.error("[allure-converter] Failed to parse cucumber-report.json:", err.message);
    process.exit(1);
  }

  if (!Array.isArray(cucumberData) || cucumberData.length === 0) {
    console.warn("[allure-converter] No features found in cucumber report.");
    process.exit(0);
  }

  let resultCount = 0;

  for (const feature of cucumberData) {
    const elements = feature.elements || [];

    for (const scenario of elements) {
      // Skip background elements
      if (scenario.type === "background") continue;

      const uuid = crypto.randomUUID();
      const steps = scenario.steps || [];

      // Determine overall status
      const hasFailure = steps.some(
        (s) => s.result && s.result.status === "failed"
      );
      const hasUndefined = steps.some(
        (s) => s.result && s.result.status === "undefined"
      );
      const hasSkipped = steps.some(
        (s) =>
          s.result &&
          (s.result.status === "skipped" || s.result.status === "pending")
      );

      let status = "passed";
      if (hasFailure) status = "failed";
      else if (hasUndefined) status = "broken";
      else if (hasSkipped) status = "skipped";

      // Extract error details from the first failed step
      const failedStep = steps.find(
        (s) => s.result && s.result.status === "failed"
      );
      const statusDetails =
        failedStep && failedStep.result && failedStep.result.error_message
          ? {
              message: failedStep.result.error_message.split("\n")[0],
              trace: failedStep.result.error_message,
            }
          : {};

      // Calculate duration (Cucumber reports duration in nanoseconds)
      const totalDurationMs = steps.reduce((total, s) => {
        return total + Math.round((s.result && s.result.duration ? s.result.duration : 0) / 1e6);
      }, 0);

      // Determine severity from tags
      const tags = (scenario.tags || []).map((t) => t.name);
      let severity = "normal";
      if (tags.includes("@critical") || tags.includes("@smoke"))
        severity = "critical";

      // Build Allure result object
      const allureResult = {
        uuid,
        historyId: crypto
          .createHash("md5")
          .update(`${feature.name}:${scenario.name}`)
          .digest("hex"),
        name: scenario.name,
        fullName: `${feature.name} > ${scenario.name}`,
        status,
        statusDetails,
        stage: "finished",
        start: Date.now() - totalDurationMs,
        stop: Date.now(),
        labels: [
          { name: "suite", value: feature.name },
          { name: "feature", value: feature.name },
          { name: "story", value: scenario.name },
          { name: "severity", value: severity },
          { name: "framework", value: "cucumber" },
          { name: "language", value: "typescript" },
          ...tags.map((t) => ({
            name: "tag",
            value: t.replace("@", ""),
          })),
        ],
        steps: steps
          .filter(
            (s) =>
              s.keyword &&
              s.keyword.trim() !== "After" &&
              s.keyword.trim() !== "Before"
          )
          .map((s) => ({
            name: `${s.keyword || ""}${s.name}`,
            status:
              s.result && s.result.status === "passed"
                ? "passed"
                : s.result && s.result.status === "failed"
                ? "failed"
                : "skipped",
            stage: "finished",
            start: 0,
            stop: s.result && s.result.duration
              ? Math.round(s.result.duration / 1e6)
              : 0,
            statusDetails:
              s.result && s.result.error_message
                ? { message: s.result.error_message.split("\n")[0] }
                : {},
          })),
      };

      // Write result file
      const filePath = path.join(ALLURE_RESULTS_DIR, `${uuid}-result.json`);
      fs.writeFileSync(filePath, JSON.stringify(allureResult, null, 2));
      resultCount++;
    }
  }

  // Write environment.properties
  const envProps = [
    `Browser=${process.env.BROWSER || "chromium"}`,
    `Environment=${process.env.ENV || "QA"}`,
    `Base_URL=${process.env.BASE_URL || "https://automationexercise.com"}`,
    `Node=${process.version}`,
  ].join("\n");
  fs.writeFileSync(
    path.join(ALLURE_RESULTS_DIR, "environment.properties"),
    envProps
  );

  // Write categories.json
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
    path.join(ALLURE_RESULTS_DIR, "categories.json"),
    JSON.stringify(categories, null, 2)
  );

  console.log(
    `[allure-converter] Successfully generated ${resultCount} Allure result file(s).`
  );
}

main();
