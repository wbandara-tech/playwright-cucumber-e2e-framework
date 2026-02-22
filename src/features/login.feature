@login @regression
Feature: User Login
  As a registered user
  I want to log in to my account
  So that I can access personalized features

  Background:
    Given the user is on the home page
    And the user navigates to the login page

  @smoke @valid-login
  Scenario: Valid login with correct credentials
    When the user enters valid login credentials
    Then the user should be logged in successfully
    And the user should see their username in the navbar

  @invalid-login
  Scenario: Invalid login with incorrect email
    When the user enters email "invalid@test.com" and password "wrongpassword"
    Then the user should see the login error message "Your email or password is incorrect!"

  @invalid-login
  Scenario: Invalid login with incorrect password
    When the user enters email "testuser@test.com" and password "wrongpassword"
    Then the user should see the login error message "Your email or password is incorrect!"

  @invalid-login
  Scenario Outline: Invalid login with various wrong credentials
    When the user enters email "<email>" and password "<password>"
    Then the user should see the login error message "Your email or password is incorrect!"

    Examples:
      | email              | password     |
      | invalid@test.com   | wrongpass    |
      | nouser@fake.com    | test1234     |
      | bad@email          | password123  |
