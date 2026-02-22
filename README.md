# Playwright + Cucumber BDD Automation Framework

[![CI - Playwright Cucumber Tests](https://github.com/wbandara-tech/playwright-cucumber-e2e-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/wbandara-tech/playwright-cucumber-e2e-framework/actions/workflows/ci.yml)

An industrial-standard, enterprise-grade **Playwright + Cucumber (BDD)** end-to-end UI testing framework built with **TypeScript**. Designed for scalability, maintainability, and CI/CD integration.

---

## Project Overview

This framework automates UI functional testing for [Automation Exercise](https://automationexercise.com) using Behavior-Driven Development (BDD) with Cucumber and Playwright. It follows the **Page Object Model (POM)** pattern for clean separation of concerns and uses Allure for rich test reporting.

---

## Tech Stack

| Technology   | Purpose                        |
| ------------ | ------------------------------ |
| Playwright   | Browser automation engine      |
| Cucumber     | BDD framework (Gherkin syntax) |
| TypeScript   | Type-safe scripting            |
| Page Object  | Design pattern for UI testing  |
| dotenv       | Environment variable handling  |
| Winston      | Structured logging             |
| Allure       | Test reporting                 |
| GitHub Actions | CI/CD pipeline               |
| GitHub Pages | Report hosting                 |

---

## Folder Structure

```
playwright-cucumber-e2e-framework/
│
├── .github/workflows/ci.yml          # CI/CD pipeline
├── src/
│   ├── config/
│   │   ├── cucumber.js                # Cucumber configuration
│   │   ├── playwright.config.ts       # Playwright browser settings
│   │   └── env.ts                     # Environment variable loader
│   │
│   ├── features/
│   │   ├── login.feature              # Login scenarios
│   │   ├── register.feature           # Registration scenarios
│   │   ├── search.feature             # Product search scenarios
│   │   └── cart.feature               # Shopping cart scenarios
│   │
│   ├── step-definitions/
│   │   ├── hooks.ts                   # Before/After hooks
│   │   ├── login.steps.ts             # Login step definitions
│   │   ├── register.steps.ts          # Registration step definitions
│   │   └── cart.steps.ts              # Cart & search step definitions
│   │
│   ├── pages/
│   │   ├── BasePage.ts                # Abstract base page class
│   │   ├── HomePage.ts                # Home page object
│   │   ├── LoginPage.ts               # Login & Register page objects
│   │   ├── ProductPage.ts             # Product page object
│   │   └── CartPage.ts                # Cart page object
│   │
│   ├── utils/
│   │   ├── world.ts                   # Custom Cucumber World
│   │   └── logger.ts                  # Winston logger
│   │
│   └── test-data/
│       └── users.json                 # Test data
│
├── reports/                           # Generated test reports
├── .env                               # Environment configuration
├── .env.example                       # Environment template
├── tsconfig.json                      # TypeScript configuration
├── package.json                       # Project dependencies
└── README.md                          # This file
```

---

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Java** (for Allure CLI, optional for local report viewing)

---

## How to Install

```bash
# Clone the repository
git clone https://github.com/wbandara-tech/playwright-cucumber-e2e-framework.git

# Navigate to project directory
cd playwright-cucumber-e2e-framework

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps

# Copy environment file
cp .env.example .env
```

---

## How to Run Locally

### Run all tests

```bash
npm test
```

### Run with specific browser

Update `BROWSER` in `.env` to `chromium`, `firefox`, or `webkit`, then:

```bash
npm test
```

### Run in headed mode (visible browser)

Set `HEADLESS=false` in `.env`, then:

```bash
npm test
```

---

## How to Run with Tags

### Run smoke tests

```bash
npm run test:smoke
```

### Run regression tests

```bash
npm run test:regression
```

### Run by feature

```bash
npm run test:login
npm run test:register
npm run test:cart
npm run test:search
```

### Run with custom tags

```bash
npx cucumber-js --config src/config/cucumber.js --tags "@smoke and @login"
```

### Run in parallel

```bash
npm run test:parallel
```

---

## How to View Allure Report

### Generate and open locally

```bash
# Generate report from results
npm run report:generate

# Open in browser
npm run report:open

# Or generate and open in one command
npm run report
```

### View online (GitHub Pages)

After CI runs, the Allure report is automatically published to:

- **Dashboard:** [https://wbandara-tech.github.io/playwright-cucumber-e2e-framework/](https://wbandara-tech.github.io/playwright-cucumber-e2e-framework/)
- **Allure Report:** [https://wbandara-tech.github.io/playwright-cucumber-e2e-framework/allure/](https://wbandara-tech.github.io/playwright-cucumber-e2e-framework/allure/)

---

## CI/CD

The GitHub Actions workflow automatically:

1. Installs all dependencies
2. Installs Playwright browsers
3. Runs all Cucumber tests
4. Generates Allure report
5. Publishes report to GitHub Pages

Trigger: On every push to `main`/`develop` or pull request to `main`.

---

## Framework Features

| Feature                    | Status |
| -------------------------- | ------ |
| Page Object Model (POM)    | ✅      |
| Custom Cucumber World      | ✅      |
| Screenshot on failure      | ✅      |
| Video on failure           | ✅      |
| Retry mechanism            | ✅      |
| Parallel execution         | ✅      |
| Tag-based execution        | ✅      |
| Multi-environment (.env)   | ✅      |
| Allure reporting           | ✅      |
| CI/CD (GitHub Actions)     | ✅      |
| GitHub Pages report        | ✅      |
| Structured logging         | ✅      |
| Clean architecture         | ✅      |

---

## Test Scenarios

| Feature      | Scenario                              | Tags                  |
| ------------ | ------------------------------------- | --------------------- |
| Login        | Valid login                           | @smoke @valid-login   |
| Login        | Invalid login (wrong email)           | @invalid-login        |
| Login        | Invalid login (wrong password)        | @invalid-login        |
| Login        | Invalid login (data-driven)           | @invalid-login        |
| Register     | Register new user                     | @smoke @new-registration |
| Search       | Search valid product                  | @smoke @search-product |
| Search       | Search partial product name           | @search-product       |
| Search       | Verify all products page              | @search-product       |
| Cart         | Add product to cart                   | @smoke @add-to-cart   |
| Cart         | Add multiple products                 | @add-to-cart          |
| Cart         | Verify cart item details              | @verify-cart          |
| Cart         | Remove item from cart                 | @remove-from-cart     |

---

## Links

| Resource   | URL                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------ |
| Repository | [GitHub Repo](https://github.com/wbandara-tech/playwright-cucumber-e2e-framework)                |
| Dashboard  | [Test Dashboard](https://wbandara-tech.github.io/playwright-cucumber-e2e-framework/)             |
| Report     | [Allure Report](https://wbandara-tech.github.io/playwright-cucumber-e2e-framework/allure/)       |
| Target App | [Automation Exercise](https://automationexercise.com)                                            |

---

## License

MIT
