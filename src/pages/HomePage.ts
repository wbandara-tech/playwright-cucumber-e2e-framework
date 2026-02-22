import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * HomePage – Represents the main landing page of AutomationExercise.
 */
export class HomePage extends BasePage {
  // Navigation elements
  private readonly signupLoginLink: Locator;
  private readonly logoutLink: Locator;
  private readonly deleteAccountLink: Locator;
  private readonly contactUsLink: Locator;
  private readonly productsLink: Locator;
  private readonly cartLink: Locator;
  private readonly loggedInUser: Locator;

  // Consent / ad overlay
  private readonly consentButton: Locator;

  constructor(page: Page) {
    super(page);
    this.signupLoginLink = page.locator('a[href="/login"]');
    this.logoutLink = page.locator('a[href="/logout"]');
    this.deleteAccountLink = page.locator('a[href="/delete_account"]');
    this.contactUsLink = page.locator('a[href="/contact_us"]');
    this.productsLink = page.locator('a[href="/products"]');
    this.cartLink = page.locator('a[href="/view_cart"]');
    this.loggedInUser = page.locator("li:has(a:has(i.fa-user))");
    this.consentButton = page.locator('button.fc-cta-consent, [aria-label="Consent"]');
  }

  /**
   * Opens the home page and handles cookie consent if present.
   */
  async open(): Promise<void> {
    await this.navigate("/");
    await this.dismissConsentIfPresent();
  }

  /**
   * Dismisses cookie consent popup if it appears.
   */
  async dismissConsentIfPresent(): Promise<void> {
    try {
      const visible = await this.consentButton.isVisible({ timeout: 3000 });
      if (visible) {
        await this.consentButton.click();
        this.logger.info("Cookie consent dismissed");
      }
    } catch {
      // No consent dialog – proceed
    }
  }

  /**
   * Clicks the Signup / Login navigation link.
   */
  async goToSignupLogin(): Promise<void> {
    this.logger.info("Navigating to Signup/Login page");
    await this.clickElement(this.signupLoginLink);
  }

  /**
   * Clicks the Products navigation link.
   */
  async goToProducts(): Promise<void> {
    this.logger.info("Navigating to Products page");
    await this.clickElement(this.productsLink);
  }

  /**
   * Clicks the Cart navigation link.
   */
  async goToCart(): Promise<void> {
    this.logger.info("Navigating to Cart page");
    await this.clickElement(this.cartLink);
  }

  /**
   * Clicks the Logout link.
   */
  async logout(): Promise<void> {
    this.logger.info("Logging out");
    await this.clickElement(this.logoutLink);
  }

  /**
   * Clicks the Delete Account link.
   */
  async deleteAccount(): Promise<void> {
    this.logger.info("Deleting account");
    await this.clickElement(this.deleteAccountLink);
  }

  /**
   * Returns the logged-in username text.
   */
  async getLoggedInUsername(): Promise<string> {
    return await this.getTextContent(this.loggedInUser);
  }

  /**
   * Checks if user is currently logged in.
   */
  async isLoggedIn(): Promise<boolean> {
    return await this.isElementVisible(this.logoutLink);
  }

  /**
   * Verifies that the home page is loaded.
   */
  async isHomePageVisible(): Promise<boolean> {
    const title = await this.getPageTitle();
    return title.includes("Automation Exercise");
  }
}
