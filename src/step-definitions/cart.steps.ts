import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../utils/world";
import { HomePage } from "../pages/HomePage";
import { ProductPage } from "../pages/ProductPage";
import { CartPage } from "../pages/CartPage";

let homePage: HomePage;
let productPage: ProductPage;
let cartPage: CartPage;

// ──── Product / Search Steps ────

When(
  "the user navigates to the products page",
  async function (this: CustomWorld) {
    homePage = new HomePage(this.page);
    await homePage.goToProducts();
    productPage = new ProductPage(this.page);
  }
);

When(
  "the user searches for {string}",
  async function (this: CustomWorld, productName: string) {
    await productPage.searchProduct(productName);
  }
);

Then(
  "the search results should be displayed",
  async function (this: CustomWorld) {
    const isVisible = await productPage.isSearchResultsVisible();
    expect(isVisible).toBeTruthy();
  }
);

Then(
  "the search results should contain products",
  async function (this: CustomWorld) {
    const count = await productPage.getProductCount();
    expect(count).toBeGreaterThan(0);
  }
);

Then(
  "the all products page should be visible",
  async function (this: CustomWorld) {
    const isVisible = await productPage.isAllProductsVisible();
    expect(isVisible).toBeTruthy();
  }
);

Then(
  "the products list should not be empty",
  async function (this: CustomWorld) {
    const count = await productPage.getProductCount();
    expect(count).toBeGreaterThan(0);
  }
);

// ──── Cart Steps ────

When(
  "the user adds the first product to the cart",
  async function (this: CustomWorld) {
    await productPage.addProductToCartByIndex(0);
  }
);

When(
  "the user adds the second product to the cart",
  async function (this: CustomWorld) {
    await productPage.addProductToCartByIndex(1);
  }
);

When("the user continues shopping", async function (this: CustomWorld) {
  await productPage.continueShopping();
});

Then(
  "the user navigates to the cart page",
  async function (this: CustomWorld) {
    homePage = new HomePage(this.page);
    await homePage.goToCart();
    cartPage = new CartPage(this.page);
  }
);

Then(
  "the cart should contain {int} item(s)",
  async function (this: CustomWorld, expectedCount: number) {
    const actualCount = await cartPage.getCartItemCount();
    expect(actualCount).toBe(expectedCount);
  }
);

Then(
  "the cart item name should be visible",
  async function (this: CustomWorld) {
    const name = await cartPage.getCartItemName(0);
    expect(name.length).toBeGreaterThan(0);
  }
);

Then(
  "the cart item price should be visible",
  async function (this: CustomWorld) {
    const price = await cartPage.getCartItemPrice(0);
    expect(price).toContain("Rs.");
  }
);

When(
  "the user removes the first item from the cart",
  async function (this: CustomWorld) {
    await cartPage.removeCartItem(0);
  }
);

Then("the cart should be empty", async function (this: CustomWorld) {
  const isEmpty = await cartPage.isCartEmpty();
  expect(isEmpty).toBeTruthy();
});
