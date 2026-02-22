import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../utils/world";
import { LoginPage, RegisterPage } from "../pages/LoginPage";
import * as testData from "../test-data/users.json";

let loginPage: LoginPage;
let registerPage: RegisterPage;

When(
  "the user enters a new name and email for signup",
  async function (this: CustomWorld) {
    loginPage = new LoginPage(this.page);
    const { name, email } = testData.newUser;
    // Generate unique email to avoid conflicts
    const uniqueEmail = `testuser_${Date.now()}@test.com`;
    await loginPage.signup(name, uniqueEmail);
  }
);

When(
  "the user fills in the registration form with valid details",
  async function (this: CustomWorld) {
    registerPage = new RegisterPage(this.page);
    const regData = testData.registrationData;
    await registerPage.fillRegistrationForm({
      title: regData.title as "Mr" | "Mrs",
      name: regData.name,
      password: regData.password,
      day: regData.day,
      month: regData.month,
      year: regData.year,
      firstName: regData.firstName,
      lastName: regData.lastName,
      company: regData.company,
      address: regData.address,
      address2: regData.address2,
      country: regData.country,
      state: regData.state,
      city: regData.city,
      zipcode: regData.zipcode,
      mobile: regData.mobile,
    });
  }
);

When(
  "the user submits the registration form",
  async function (this: CustomWorld) {
    await registerPage.submitRegistration();
  }
);

Then(
  "the account should be created successfully",
  async function (this: CustomWorld) {
    const isCreated = await registerPage.isAccountCreated();
    expect(isCreated).toBeTruthy();
  }
);

Then(
  "the user should see the {string} message",
  async function (this: CustomWorld, expectedMessage: string) {
    const message = await registerPage.getAccountCreatedMessage();
    expect(message).toBe(expectedMessage);
  }
);
