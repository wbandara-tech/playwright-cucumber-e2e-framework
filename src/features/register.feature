@register @regression
Feature: User Registration
  As a new user
  I want to register an account
  So that I can shop on the website

  Background:
    Given the user is on the home page
    And the user navigates to the login page

  @smoke @new-registration
  Scenario: Register a new user account successfully
    When the user enters a new name and email for signup
    And the user fills in the registration form with valid details
    And the user submits the registration form
    Then the account should be created successfully
    And the user should see the "ACCOUNT CREATED!" message
