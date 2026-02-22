@search @regression
Feature: Product Search
  As a customer
  I want to search for products
  So that I can find items I want to purchase

  Background:
    Given the user is on the home page

  @smoke @search-product
  Scenario: Search for a valid product
    When the user navigates to the products page
    And the user searches for "Blue Top"
    Then the search results should be displayed
    And the search results should contain products

  @search-product
  Scenario: Search for a product with partial name
    When the user navigates to the products page
    And the user searches for "Top"
    Then the search results should be displayed
    And the search results should contain products

  @search-product
  Scenario: Verify all products page is visible
    When the user navigates to the products page
    Then the all products page should be visible
    And the products list should not be empty
