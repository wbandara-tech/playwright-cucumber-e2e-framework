import { Page, Locator } from "@playwright/test";
import { ENV } from "../config/env";
import { Logger } from "../utils/logger";

/**
 * BasePage – Abstract base class for all page objects.
 * Encapsulates common interactions and Playwright best practices.
 */
export abstract class BasePage {
  protected page: Page;
  protected logger: Logger;

  constructor(page: Page) {
    this.page = page;
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * Navigates to a path relative to BASE_URL.
   */
  async navigate(path: string = "/"): Promise<void> {
    const url = `${ENV.BASE_URL}${path}`;
    this.logger.info(`Navigating to: ${url}`);
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  /**
   * Waits for an element to be visible, then clicks it.
   */
  async clickElement(locator: Locator): Promise<void> {
    await locator.waitFor({ state: "visible" });
    await locator.click();
  }

  /**
   * Clears input field and types the given text.
   */
  async fillInput(locator: Locator, text: string): Promise<void> {
    await locator.waitFor({ state: "visible" });
    await locator.clear();
    await locator.fill(text);
  }

  /**
   * Returns trimmed text content of an element.
   */
  async getTextContent(locator: Locator): Promise<string> {
    await locator.waitFor({ state: "visible" });
    const text = await locator.textContent();
    return text?.trim() || "";
  }

  /**
   * Checks whether an element is visible on the page.
   */
  async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: "visible", timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Waits for page navigation to complete.
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Returns the current page title.
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Returns the current page URL.
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Scrolls element into view.
   */
  async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Waits for a specific URL pattern.
   */
  async waitForUrl(urlPattern: string | RegExp): Promise<void> {
    await this.page.waitForURL(urlPattern);
  }

  /**
   * Takes a screenshot of the current page.
   */
  async takeScreenshot(name: string): Promise<Buffer> {
    return await this.page.screenshot({
      path: `reports/screenshots/${name}.png`,
      fullPage: true,
    });
  }
}
