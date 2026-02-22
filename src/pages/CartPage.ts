import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * CartPage – Handles shopping cart interactions and verification.
 */
export class CartPage extends BasePage {
  // Cart elements
  private readonly cartItems: Locator;
  private readonly emptyCartMessage: Locator;
  private readonly proceedToCheckoutButton: Locator;
  private readonly shoppingCartHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = page.locator("#cart_info_table tbody tr");
    this.emptyCartMessage = page.locator(
      '#empty_cart, b:has-text("Cart is empty"), p:has-text("Cart is empty")'
    );
    this.proceedToCheckoutButton = page.locator(
      'a:has-text("Proceed To Checkout")'
    );
    this.shoppingCartHeading = page.locator(
      'li.active:has-text("Shopping Cart")'
    );
  }

  /**
   * Opens the cart page directly.
   */
  async open(): Promise<void> {
    await this.navigate("/view_cart");
  }

  /**
   * Returns the number of items in the cart.
   */
  async getCartItemCount(): Promise<number> {
    try {
      await this.cartItems.first().waitFor({ state: "visible", timeout: 5000 });
      return await this.cartItems.count();
    } catch {
      return 0;
    }
  }

  /**
   * Returns the name of a cart item by row index (0-based).
   */
  async getCartItemName(index: number): Promise<string> {
    const row = this.cartItems.nth(index);
    const nameLocator = row.locator("td.cart_description h4 a");
    return await this.getTextContent(nameLocator);
  }

  /**
   * Returns the price of a cart item by row index (0-based).
   */
  async getCartItemPrice(index: number): Promise<string> {
    const row = this.cartItems.nth(index);
    const priceLocator = row.locator("td.cart_price p");
    return await this.getTextContent(priceLocator);
  }

  /**
   * Returns the quantity of a cart item by row index (0-based).
   */
  async getCartItemQuantity(index: number): Promise<string> {
    const row = this.cartItems.nth(index);
    const quantityLocator = row.locator("td.cart_quantity button");
    return await this.getTextContent(quantityLocator);
  }

  /**
   * Removes a cart item by clicking the delete button at given index.
   */
  async removeCartItem(index: number): Promise<void> {
    this.logger.info(`Removing cart item at index ${index}`);
    const row = this.cartItems.nth(index);
    const deleteButton = row.locator("td.cart_delete a");
    await this.clickElement(deleteButton);
    // Wait for the item row to be removed from the DOM
    try {
      await row.waitFor({ state: "detached", timeout: 10000 });
    } catch {
      // fallback: wait a bit
      await this.page.waitForTimeout(2000);
    }
  }

  /**
   * Checks if the cart is empty.
   */
  async isCartEmpty(): Promise<boolean> {
    // First check if the empty cart element is visible
    const emptyVisible = await this.isElementVisible(this.emptyCartMessage);
    if (emptyVisible) return true;
    // Fallback: check if there are 0 items
    const count = await this.getCartItemCount();
    return count === 0;
  }

  /**
   * Checks if the Shopping Cart heading is visible.
   */
  async isCartPageVisible(): Promise<boolean> {
    return await this.isElementVisible(this.shoppingCartHeading);
  }

  /**
   * Clicks the Proceed To Checkout button.
   */
  async proceedToCheckout(): Promise<void> {
    this.logger.info("Proceeding to checkout");
    await this.clickElement(this.proceedToCheckoutButton);
  }

  /**
   * Returns all cart item names as an array.
   */
  async getAllCartItemNames(): Promise<string[]> {
    const count = await this.getCartItemCount();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      names.push(await this.getCartItemName(i));
    }
    return names;
  }
}
