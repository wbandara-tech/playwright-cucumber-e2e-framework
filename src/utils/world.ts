import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";
import {
  Browser,
  BrowserContext,
  Page,
  chromium,
  firefox,
  webkit,
} from "@playwright/test";
import { ENV } from "../config/env";
import {
  playwrightConfig,
  browserContextOptions,
} from "../config/playwright.config";
import { Logger } from "./logger";


/**
 * Custom Cucumber World that manages Playwright browser lifecycle.
 * Each scenario gets its own browser context and page for isolation.
 */
export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  logger: Logger;
  testName?: string;
  startTime?: Date;

  constructor(options: IWorldOptions) {
    super(options);
    this.logger = new Logger("CustomWorld");
  }

  /**
   * Launches browser and creates a new context + page.
   */
  async launchBrowser(): Promise<void> {
    this.logger.info(
      `Launching ${ENV.BROWSER} browser (headless: ${ENV.HEADLESS})`
    );

    const browserType = this.getBrowserType();
    this.browser = await browserType.launch(playwrightConfig);
    this.context = await this.browser.newContext(browserContextOptions);
    this.page = await this.context.newPage();

    // Set default timeouts
    this.page.setDefaultTimeout(ENV.DEFAULT_TIMEOUT);
    this.page.setDefaultNavigationTimeout(ENV.NAVIGATION_TIMEOUT);
  }

  /**
   * Closes page, context, and browser gracefully.
   */
  async teardown(): Promise<void> {
    this.logger.info("Tearing down browser resources");

    try {
      if (this.page) await this.page.close();
      if (this.context) await this.context.close();
      if (this.browser) await this.browser.close();
    } catch (error) {
      this.logger.error(`Error during teardown: ${error}`);
    }
  }

  /**
   * Takes a screenshot and returns it as a Buffer.
   */
  async takeScreenshot(): Promise<Buffer> {
    return await this.page.screenshot({
      fullPage: true,
      type: "png",
    });
  }

  /**
   * Navigates to a path relative to BASE_URL.
   */
  async navigateTo(path: string = "/"): Promise<void> {
    const url = `${ENV.BASE_URL}${path}`;
    this.logger.info(`Navigating to: ${url}`);
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  /**
   * Returns the appropriate Playwright browser type.
   */
  private getBrowserType() {
    switch (ENV.BROWSER) {
      case "firefox":
        return firefox;
      case "webkit":
        return webkit;
      case "chromium":
      default:
        return chromium;
    }
  }
}

setWorldConstructor(CustomWorld);
