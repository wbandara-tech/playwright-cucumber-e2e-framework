import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * ProductPage – Handles product listing, search, and add-to-cart interactions.
 */
export class ProductPage extends BasePage {
  // Search elements
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;
  private readonly searchedProductsHeading: Locator;

  // Product listing
  private readonly productsList: Locator;
  private readonly allProductsHeading: Locator;

  // Product overlay / modal
  private readonly continueShoppingButton: Locator;
  private readonly viewCartLink: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.locator("#search_product");
    this.searchButton = page.locator("#submit_search");
    this.searchedProductsHeading = page.locator(
      'h2:has-text("Searched Products")'
    );
    this.productsList = page.locator(".features_items .col-sm-4");
    this.allProductsHeading = page.locator(
      'h2.title:has-text("All Products")'
    );
    this.continueShoppingButton = page.locator(
      'button:has-text("Continue Shopping")'
    );
    this.viewCartLink = page.locator(
      '.modal-body a[href="/view_cart"]'
    );
  }

  /**
   * Opens the products page directly.
   */
  async open(): Promise<void> {
    await this.navigate("/products");
  }

  /**
   * Searches for a product by name.
   */
  async searchProduct(productName: string): Promise<void> {
    this.logger.info(`Searching for product: ${productName}`);
    await this.fillInput(this.searchInput, productName);
    await this.clickElement(this.searchButton);
  }

  /**
   * Returns the count of visible products.
   */
  async getProductCount(): Promise<number> {
    await this.productsList.first().waitFor({ state: "visible", timeout: 10000 });
    return await this.productsList.count();
  }

  /**
   * Checks if search results heading is visible.
   */
  async isSearchResultsVisible(): Promise<boolean> {
    return await this.isElementVisible(this.searchedProductsHeading);
  }

  /**
   * Checks if All Products heading is visible.
   */
  async isAllProductsVisible(): Promise<boolean> {
    return await this.isElementVisible(this.allProductsHeading);
  }

  /**
   * Adds a product to cart by its index (0-based).
   */
  async addProductToCartByIndex(index: number): Promise<void> {
    this.logger.info(`Adding product at index ${index} to cart`);
    const product = this.productsList.nth(index);
    await this.scrollIntoView(product);

    // Hover to reveal the overlay add-to-cart button
    await product.hover();
    const addToCartButton = product.locator(
      'a.btn.add-to-cart'
    );
    await addToCartButton.first().click();
  }

  /**
   * Clicks "Continue Shopping" on the modal after adding to cart.
   */
  async continueShopping(): Promise<void> {
    await this.clickElement(this.continueShoppingButton);
  }

  /**
   * Clicks "View Cart" in the modal after adding to cart.
   */
  async viewCart(): Promise<void> {
    await this.clickElement(this.viewCartLink);
  }

  /**
   * Returns the name of a product by its index.
   */
  async getProductNameByIndex(index: number): Promise<string> {
    const product = this.productsList.nth(index);
    const nameLocator = product.locator(".productinfo p");
    return await this.getTextContent(nameLocator);
  }

  /**
   * Returns the price of a product by its index.
   */
  async getProductPriceByIndex(index: number): Promise<string> {
    const product = this.productsList.nth(index);
    const priceLocator = product.locator(".productinfo h2");
    return await this.getTextContent(priceLocator);
  }
}
