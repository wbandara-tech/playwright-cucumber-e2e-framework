import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../utils/world";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import * as testData from "../test-data/users.json";

let homePage: HomePage;
let loginPage: LoginPage;

// Fresh account credentials created via API for valid login test
let freshEmail = "";
let freshPassword = "";

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
  "the user registers a fresh account via API",
  async function (this: CustomWorld) {
    // Create a unique user via the automationexercise.com API
    freshEmail = `autotest_${Date.now()}@test.com`;
    freshPassword = testData.validUser.password;
    const formData = new URLSearchParams();
    formData.append("name", testData.validUser.name);
    formData.append("email", freshEmail);
    formData.append("password", freshPassword);
    formData.append("title", "Mr");
    formData.append("birth_date", "15");
    formData.append("birth_month", "6");
    formData.append("birth_year", "1990");
    formData.append("firstname", "Test");
    formData.append("lastname", "User");
    formData.append("company", "TestCorp");
    formData.append("address1", "123 Test St");
    formData.append("address2", "");
    formData.append("country", "United States");
    formData.append("zipcode", "90001");
    formData.append("state", "California");
    formData.append("city", "Los Angeles");
    formData.append("mobile_number", "1234567890");

    const response = await this.page.request.post(
      "https://automationexercise.com/api/createAccount",
      { form: Object.fromEntries(formData) }
    );
    const body = JSON.parse(await response.text());
    if (body.responseCode !== 201) {
      // User may already exist, that's fine — just log it
      console.log(`API createAccount response: ${JSON.stringify(body)}`);
    }
  }
);

When(
  "the user enters valid login credentials",
  async function (this: CustomWorld) {
    const email = freshEmail || testData.validUser.email;
    const password = freshPassword || testData.validUser.password;
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
