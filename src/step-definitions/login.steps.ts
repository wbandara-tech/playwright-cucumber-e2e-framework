import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../utils/world";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import * as testData from "../test-data/users.json";

let homePage: HomePage;
let loginPage: LoginPage;

Given("the user is on the home page", async function (this: CustomWorld) {
  homePage = new HomePage(this.page);
  await homePage.open();
  const isVisible = await homePage.isHomePageVisible();
  expect(isVisible).toBeTruthy();
});

Given(
  "the user navigates to the login page",
  async function (this: CustomWorld) {
    await homePage.goToSignupLogin();
    loginPage = new LoginPage(this.page);
    const isVisible = await loginPage.isLoginFormVisible();
    expect(isVisible).toBeTruthy();
  }
);

When(
  "the user enters valid login credentials",
  async function (this: CustomWorld) {
    const { email, password } = testData.validUser;
    await loginPage.login(email, password);
  }
);

When(
  "the user enters email {string} and password {string}",
  async function (this: CustomWorld, email: string, password: string) {
    await loginPage.login(email, password);
  }
);

Then(
  "the user should be logged in successfully",
  async function (this: CustomWorld) {
    homePage = new HomePage(this.page);
    const isLoggedIn = await homePage.isLoggedIn();
    expect(isLoggedIn).toBeTruthy();
  }
);

Then(
  "the user should see their username in the navbar",
  async function (this: CustomWorld) {
    const usernameText = await homePage.getLoggedInUsername();
    expect(usernameText).toContain("Logged in as");
  }
);

Then(
  "the user should see the login error message {string}",
  async function (this: CustomWorld, expectedMessage: string) {
    const errorMessage = await loginPage.getLoginErrorMessage();
    expect(errorMessage).toBe(expectedMessage);
  }
);
