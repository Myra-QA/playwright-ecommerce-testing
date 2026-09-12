# Playwright E-Commerce Test Automation Framework

An end-to-end UI and API test automation framework built with **Playwright and TypeScript**, targeting the SauceDemo web application and a dedicated local Node.js mock API.

## Tech Stack

* **Core:** Playwright Test, TypeScript, Node.js
* **Browsers:** Chromium, Firefox, WebKit
* **API Testing:** Playwright `APIRequestContext`
* **CI/CD:** GitHub Actions
* **Mock Server:** Local Node.js server with in-memory test data

## Project Structure

```text
playwright-ecommerce-testing/
├── .github/
│   └── workflows/
│       └── playwright.yml
├── data/               # Typed test data
├── fixtures/           # UI test fixtures
├── mock-api/           # Local in-memory mock API server
├── page-objects/       # Page Objects and shared components
├── tests/
│   ├── ui/             # UI end-to-end test suites
│   └── api/            # API validation specs
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

## Key Architecture Highlights

* **Page Object Model & Components:** Centralizes locators and UI actions using Playwright's recommended locator strategies such as `getByTestId()` and `getByRole()`. Shared elements such as `SideMenu` and `Footer` are implemented as reusable components.

* **Composable Fixtures:** Custom fixtures prepare reusable application states such as authenticated inventory, ready-to-use cart and multi-step checkout states, reducing repetitive setup across tests.

* **Separation of Concerns:** UI and API tests run as separate Playwright projects. UI tests run across Chromium, Firefox and WebKit, while API tests run with a single worker to keep the in-memory mock server state deterministic.

* **Local Mock API:** A lightweight Node.js test double provides controlled products, authentication and order endpoints, including validation, authorization, status codes and order calculations.

## Quick Start

### Install Dependencies

```bash
npm ci
npx playwright install
```

### Run Tests

| Command             | Description                                                           |
| ------------------- | --------------------------------------------------------------------- |
| `npm test`          | Run the UI and API test suites                                        |
| `npm run test:ui`   | Run UI tests in Chromium and Firefox                                  |
| `npm run test:api`  | Run API tests against the local mock server                           |
| `npm run test:ci`   | Run the full CI regression suite in Chromium, Firefox, WebKit and API |
| `npm run typecheck` | Run TypeScript validation with `tsc --noEmit`                         |
| `npm run report`    | Open the Playwright HTML report                                       |

## CI/CD

GitHub Actions runs the framework on every push and pull request.

The workflow:

1. Checks out the repository and installs the locked dependencies with `npm ci`.
2. Installs the Chromium, Firefox and WebKit browsers required by the CI suite.
3. Runs TypeScript validation.
4. Executes the UI and API test suites.
5. Uploads the Playwright HTML report and test results, including failure screenshots and traces, as workflow artifacts.

## Test Coverage

### UI

* Login and authentication scenarios
* Inventory and product sorting
* Add/remove cart operations
* Product detail navigation
* Cart validation and persistence
* Checkout and order completion
* Shared navigation components

### API

* Product retrieval and creation
* Authentication and authorization
* Request validation and negative scenarios
* Order creation and total calculation
* Order retrieval and deletion
* Resource lifecycle validation



