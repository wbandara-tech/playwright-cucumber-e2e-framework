import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * LoginPage – Handles login and signup form interactions.
 */
export class LoginPage extends BasePage {
  // Login form
  private readonly loginEmailInput: Locator;
  private readonly loginPasswordInput: Locator;
  private readonly loginButton: Locator;
  private readonly loginErrorMessage: Locator;

  // Signup form
  private readonly signupNameInput: Locator;
  private readonly signupEmailInput: Locator;
  private readonly signupButton: Locator;
  private readonly signupErrorMessage: Locator;

  // Page identifiers
  private readonly loginFormHeading: Locator;
  private readonly signupFormHeading: Locator;

  constructor(page: Page) {
    super(page);

    // Login form locators
    this.loginEmailInput = page.locator(
      'form[action="/login"] input[data-qa="login-email"]'
    );
    this.loginPasswordInput = page.locator(
      'form[action="/login"] input[data-qa="login-password"]'
    );
    this.loginButton = page.locator('button[data-qa="login-button"]');
    this.loginErrorMessage = page.locator(
      'form[action="/login"] p[style*="color: red"]'
    );

    // Signup form locators
    this.signupNameInput = page.locator(
      'form[action="/signup"] input[data-qa="signup-name"]'
    );
    this.signupEmailInput = page.locator(
      'form[action="/signup"] input[data-qa="signup-email"]'
    );
    this.signupButton = page.locator('button[data-qa="signup-button"]');
    this.signupErrorMessage = page.locator(
      'form[action="/signup"] p[style*="color: red"]'
    );

    // Headings
    this.loginFormHeading = page.locator(
      '.login-form h2:has-text("Login to your account")'
    );
    this.signupFormHeading = page.locator(
      '.signup-form h2:has-text("New User Signup!")'
    );
  }

  /**
   * Opens the login page directly.
   */
  async open(): Promise<void> {
    await this.navigate("/login");
  }

  /**
   * Logs in with the given credentials.
   */
  async login(email: string, password: string): Promise<void> {
    this.logger.info(`Logging in with email: ${email}`);
    await this.fillInput(this.loginEmailInput, email);
    await this.fillInput(this.loginPasswordInput, password);
    await this.clickElement(this.loginButton);
  }

  /**
   * Fills the signup form and submits.
   */
  async signup(name: string, email: string): Promise<void> {
    this.logger.info(`Signing up with name: ${name}, email: ${email}`);
    await this.fillInput(this.signupNameInput, name);
    await this.fillInput(this.signupEmailInput, email);
    await this.clickElement(this.signupButton);
  }

  /**
   * Returns the login error message text.
   */
  async getLoginErrorMessage(): Promise<string> {
    return await this.getTextContent(this.loginErrorMessage);
  }

  /**
   * Returns the signup error message text.
   */
  async getSignupErrorMessage(): Promise<string> {
    return await this.getTextContent(this.signupErrorMessage);
  }

  /**
   * Checks if the login form is visible.
   */
  async isLoginFormVisible(): Promise<boolean> {
    return await this.isElementVisible(this.loginFormHeading);
  }

  /**
   * Checks if the signup form is visible.
   */
  async isSignupFormVisible(): Promise<boolean> {
    return await this.isElementVisible(this.signupFormHeading);
  }
}

/**
 * RegisterPage – Handles the multi-step registration form after signup initiation.
 */
export class RegisterPage extends BasePage {
  // Account information
  private readonly titleMr: Locator;
  private readonly titleMrs: Locator;
  private readonly nameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly daySelect: Locator;
  private readonly monthSelect: Locator;
  private readonly yearSelect: Locator;
  private readonly newsletterCheckbox: Locator;
  private readonly offersCheckbox: Locator;

  // Address information
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly companyInput: Locator;
  private readonly addressInput: Locator;
  private readonly address2Input: Locator;
  private readonly countrySelect: Locator;
  private readonly stateInput: Locator;
  private readonly cityInput: Locator;
  private readonly zipcodeInput: Locator;
  private readonly mobileInput: Locator;

  // Actions
  private readonly createAccountButton: Locator;
  private readonly continueButton: Locator;

  // Confirmation
  private readonly accountCreatedHeading: Locator;

  constructor(page: Page) {
    super(page);

    // Account info
    this.titleMr = page.locator("#id_gender1");
    this.titleMrs = page.locator("#id_gender2");
    this.nameInput = page.locator('input[data-qa="name"]');
    this.passwordInput = page.locator('input[data-qa="password"]');
    this.daySelect = page.locator('select[data-qa="days"]');
    this.monthSelect = page.locator('select[data-qa="months"]');
    this.yearSelect = page.locator('select[data-qa="years"]');
    this.newsletterCheckbox = page.locator("#newsletter");
    this.offersCheckbox = page.locator("#optin");

    // Address info
    this.firstNameInput = page.locator('input[data-qa="first_name"]');
    this.lastNameInput = page.locator('input[data-qa="last_name"]');
    this.companyInput = page.locator('input[data-qa="company"]');
    this.addressInput = page.locator('input[data-qa="address"]');
    this.address2Input = page.locator('input[data-qa="address2"]');
    this.countrySelect = page.locator('select[data-qa="country"]');
    this.stateInput = page.locator('input[data-qa="state"]');
    this.cityInput = page.locator('input[data-qa="city"]');
    this.zipcodeInput = page.locator('input[data-qa="zipcode"]');
    this.mobileInput = page.locator('input[data-qa="mobile_number"]');

    // Actions
    this.createAccountButton = page.locator(
      'button[data-qa="create-account"]'
    );
    this.continueButton = page.locator('a[data-qa="continue-button"]');

    // Confirmation
    this.accountCreatedHeading = page.locator(
      'h2[data-qa="account-created"]'
    );
  }

  /**
   * Fills the entire registration form.
   */
  async fillRegistrationForm(userData: {
    title?: "Mr" | "Mrs";
    name: string;
    password: string;
    day: string;
    month: string;
    year: string;
    firstName: string;
    lastName: string;
    company?: string;
    address: string;
    address2?: string;
    country: string;
    state: string;
    city: string;
    zipcode: string;
    mobile: string;
  }): Promise<void> {
    this.logger.info("Filling registration form");

    // Title
    if (userData.title === "Mrs") {
      await this.clickElement(this.titleMrs);
    } else {
      await this.clickElement(this.titleMr);
    }

    // Account info
    await this.fillInput(this.passwordInput, userData.password);
    await this.daySelect.selectOption(userData.day);
    await this.monthSelect.selectOption(userData.month);
    await this.yearSelect.selectOption(userData.year);

    // Subscribe options
    await this.newsletterCheckbox.check();
    await this.offersCheckbox.check();

    // Address info
    await this.fillInput(this.firstNameInput, userData.firstName);
    await this.fillInput(this.lastNameInput, userData.lastName);

    if (userData.company) {
      await this.fillInput(this.companyInput, userData.company);
    }

    await this.fillInput(this.addressInput, userData.address);

    if (userData.address2) {
      await this.fillInput(this.address2Input, userData.address2);
    }

    await this.countrySelect.selectOption(userData.country);
    await this.fillInput(this.stateInput, userData.state);
    await this.fillInput(this.cityInput, userData.city);
    await this.fillInput(this.zipcodeInput, userData.zipcode);
    await this.fillInput(this.mobileInput, userData.mobile);
  }

  /**
   * Clicks the Create Account button.
   */
  async submitRegistration(): Promise<void> {
    this.logger.info("Submitting registration form");
    await this.clickElement(this.createAccountButton);
  }

  /**
   * Clicks Continue after account creation.
   */
  async clickContinue(): Promise<void> {
    await this.clickElement(this.continueButton);
  }

  /**
   * Verifies that the account was created successfully.
   */
  async isAccountCreated(): Promise<boolean> {
    return await this.isElementVisible(this.accountCreatedHeading);
  }

  /**
   * Returns the account created heading text.
   */
  async getAccountCreatedMessage(): Promise<string> {
    return await this.getTextContent(this.accountCreatedHeading);
  }
}
