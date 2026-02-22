@cart @regression
Feature: Shopping Cart
  As a customer
  I want to manage items in my shopping cart
  So that I can purchase the products I want

  Background:
    Given the user is on the home page

  @smoke @add-to-cart
  Scenario: Add a product to cart
    When the user navigates to the products page
    And the user adds the first product to the cart
    And the user continues shopping
    Then the user navigates to the cart page
    And the cart should contain 1 item

  @add-to-cart
  Scenario: Add multiple products to cart
    When the user navigates to the products page
    And the user adds the first product to the cart
    And the user continues shopping
    And the user adds the second product to the cart
    And the user continues shopping
    Then the user navigates to the cart page
    And the cart should contain 2 items

  @verify-cart
  Scenario: Verify cart item details
    When the user navigates to the products page
    And the user adds the first product to the cart
    And the user continues shopping
    Then the user navigates to the cart page
    And the cart should contain 1 item
    And the cart item name should be visible
    And the cart item price should be visible

  @remove-from-cart
  Scenario: Remove item from cart
    When the user navigates to the products page
    And the user adds the first product to the cart
    And the user continues shopping
    Then the user navigates to the cart page
    And the cart should contain 1 item
    When the user removes the first item from the cart
    Then the cart should be empty
