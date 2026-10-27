# React Web Automation with Maestro

A demonstration project showcasing end-to-end UI automation testing for a **React web application** using **[Maestro](https://maestro.dev/)**. While Maestro is widely known for mobile testing (iOS/Android), it also provides powerful, declarative YAML-based testing for **desktop web browsers (Chromium)**.

---

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites & System Setup](#prerequisites--system-setup)
   - [1. Node.js & App Setup](#1-nodejs--app-setup)
   - [2. Java Runtime (OpenJDK)](#2-java-runtime-openjdk)
   - [3. Maestro CLI](#3-maestro-cli)
3. [Running the Application](#running-the-application)
4. [Running Maestro Tests](#running-maestro-tests)
5. [Test Flows Included in this Project](#test-flows-included-in-this-project)
6. [Handling Special Cases & Edge Cases](#handling-special-cases--edge-cases)
   - [1. Waiting for Slow APIs / Network Latency](#1-waiting-for-slow-apis--network-latency)
   - [2. Waiting for Loading Spinners to Disappear](#2-waiting-for-loading-spinners-to-disappear)
   - [3. Animations and Route Transitions](#3-animations-and-route-transitions)
   - [4. Conditional Actions (If-Then Flow)](#4-conditional-actions-if-then-flow)
   - [5. Flaky Network Retries](#5-flaky-network-retries)
   - [6. Long Form Scrolling](#6-long-form-scrolling)
   - [7. Clearing Input Fields Before Typing](#7-clearing-input-fields-before-typing)
7. [Comprehensive Maestro Command Reference (Unused Commands)](#comprehensive-maestro-command-reference-unused-commands)
   - [Flow Control & Modularity](#flow-control--modularity)
   - [Advanced Waiting & Retries](#advanced-waiting--retries)
   - [Gestures & Scrolling](#gestures--scrolling)
   - [Scripting & JavaScript Evaluation](#scripting--javascript-evaluation)
   - [Utilities & Diagnostics](#utilities--diagnostics)
8. [Maestro Web vs Mobile: Key Differences](#maestro-web-vs-mobile-key-differences)

---

## Overview

- **Frontend:** React 18, Vite, React Router v6.
- **Mock Credentials:** 
  - Username: `test`
  - Password: `test1234`
- **Features:** Input validation, simulated 3-second async API latency, loading states, error alerts, and dashboard navigation.
- **Testing Engine:** Maestro CLI utilizing its managed Chromium browser runner.

---

## Prerequisites & System Setup

### 1. Node.js & App Setup

Ensure Node.js (v18+) is installed:

```bash
# Check version
node -v
npm -v
```

If not installed (macOS via Homebrew):
```bash
sudo chown -R $(whoami) /opt/homebrew   # Ensure Homebrew permissions
brew install node
```

Install project dependencies:
```bash
cd "/Users/dhruval/Downloads/Maestro demo"
npm install
```

---

### 2. Java Runtime (OpenJDK)

> **Important:** Maestro is built on top of the JVM. You **must** have a Java runtime (Java 11+) installed and accessible in your shell environment.

Install OpenJDK via Homebrew:
```bash
brew install openjdk
```

Export Java to your `PATH` (add to `~/.zshrc`):
```bash
echo 'export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Verify Java works:
```bash
java -version
```

---

### 3. Maestro CLI

Install the official Maestro CLI tool:
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

Add Maestro to your `PATH` (if not added automatically):
```bash
echo 'export PATH="$HOME/.maestro/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Verify Maestro installation:
```bash
maestro --version
```

---

## Running the Application

Before running any Maestro web test, start the Vite development server:

```bash
npm run dev
```

The app will become available at:
`http://localhost:5173`

---

## Running Maestro Tests

Open a **separate terminal window** and run:

```bash
# 1. Run the Happy Path Login Test
maestro test .maestro/login-flow.yaml

# 2. Run the Async API Latency & Spinner Test
maestro test .maestro/login-with-delay.yaml

# 3. Run the Input Validation Test
maestro test .maestro/login-validation.yaml

# 4. Run the Wrong Credentials Error Test
maestro test .maestro/login-invalid-credentials.yaml

# 5. Run ALL test flows inside the .maestro directory
maestro test .maestro/
```

### Interactive Test Building: Maestro Studio

Maestro provides a built-in visual inspector for web:
```bash
maestro studio
```
This opens an interactive interface in your browser allowing you to point, click, view element hierarchy, and automatically generate YAML test blocks.

---

## Test Flows Included in this Project

All test files are stored in the [`.maestro/`](file:///Users/dhruval/Downloads/Maestro%20demo/.maestro/) directory:

| Test File | Description | Key Commands Used |
|---|---|---|
| [`login-flow.yaml`](file:///Users/dhruval/Downloads/Maestro%20demo/.maestro/login-flow.yaml) | Validates standard login, navigation to dashboard, and logout. | `launchApp`, `tapOn`, `inputText`, `assertVisible` |
| [`login-with-delay.yaml`](file:///Users/dhruval/Downloads/Maestro%20demo/.maestro/login-with-delay.yaml) | Validates that Maestro waits through a 3-second fake API call without failing. | `extendedWaitUntil`, `assertVisible` |
| [`login-validation.yaml`](file:///Users/dhruval/Downloads/Maestro%20demo/.maestro/login-validation.yaml) | Verifies empty field alerts ("Username is required", etc.). | `eraseText`, `tapOn`, `assertVisible` |
| [`login-invalid-credentials.yaml`](file:///Users/dhruval/Downloads/Maestro%20demo/.maestro/login-invalid-credentials.yaml) | Tests rejection and error banner upon entering wrong password. | `inputText`, `assertVisible` |

---

## Handling Special Cases & Edge Cases

Web automation frequently encounters timing issues, flaky network calls, animations, and dynamic elements. Below is how Maestro elegantly solves them without using fragile `sleep()` statements.

### 1. Waiting for Slow APIs / Network Latency

Maestro’s default assertion timeout is ~5 seconds. For APIs or page loads that take longer, use `extendedWaitUntil`:

```yaml
# Wait up to 15 seconds (15000 ms) for the dashboard heading to appear
- extendedWaitUntil:
    visible: "Dashboard"
    timeout: 15000
```

### 2. Waiting for Loading Spinners to Disappear

Often you need to verify that a loading skeleton or spinner goes away before proceeding:

```yaml
# Wait until the spinner is no longer present on the page
- assertNotVisible:
    id: "loading-spinner"

# Or by text/label
- assertNotVisible: "Signing In..."
```

### 3. Animations and Route Transitions

If page transitions or CSS animations cause assertions to fire prematurely, instruct Maestro to wait for the UI to stabilize:

```yaml
# Waits up to 5 seconds for all visual layout movements/animations to stop
- waitForAnimationToEnd:
    timeout: 5000
```

### 4. Conditional Actions (If-Then Flow)

If an action should only occur under certain conditions (e.g., cookie banners, optional popups):

```yaml
- runFlow:
    when:
      visible: "Accept Cookies"
    commands:
      - tapOn: "Accept Cookies"
```

### 5. Flaky Network Retries

When dealing with third-party web services or flaky endpoints that might need an action to be retried:

```yaml
- retry:
    maxRetries: 3
    commands:
      - tapOn: "Submit Order"
      - assertVisible: "Confirmation #"
```

### 6. Long Form Scrolling

When elements are rendered below the fold:

```yaml
# Scroll continuously until the button is in the viewport
- scrollUntilVisible:
    element:
      id: "submit-footer-btn"
    direction: DOWN
    timeout: 10000
```

### 7. Clearing Input Fields Before Typing

Browsers often keep autocomplete or pre-filled values. Use `eraseText` to clear inputs:

```yaml
- tapOn:
    id: "username"
# Clears up to 50 characters via backspace
- eraseText

# Or clear an exact number of characters
- eraseText: 20

# Type new input
- inputText: "newuser"
```

---

## Comprehensive Maestro Command Reference (Unused Commands)

Below is a reference guide for important Maestro commands not included in basic tests, with real-world examples:

### Flow Control & Modularity

#### `runFlow`
Reuses modular flows (subflows) across multiple tests (e.g., a shared login step).
```yaml
# Run an external YAML flow
- runFlow: subflows/auth-login.yaml

# Run subflow passing custom environment variables
- runFlow:
    file: subflows/create-user.yaml
    env:
      USERNAME: "qa_engineer"
      ROLE: "admin"
```

#### `repeat`
Repeats actions for a fixed count or while a condition holds true.
```yaml
# Fixed number of iterations
- repeat:
    times: 5
    commands:
      - tapOn: "Add Item"

# Conditional loop (e.g., paging through a table)
- repeat:
    while:
      notVisible: "End of Results"
    commands:
      - scroll
```

---

### Advanced Waiting & Retries

#### `extendedWaitUntil`
Overrides standard timeout thresholds for heavy background processing.
```yaml
- extendedWaitUntil:
    visible: "Payment Received"
    timeout: 30000   # 30 seconds
```

#### `assertNotVisible`
Validates that an element is completely removed from the page.
```yaml
- assertNotVisible: "Deleting row..."
```

#### `waitForAnimationToEnd`
Waits for JavaScript/CSS animations to finish settling.
```yaml
- waitForAnimationToEnd:
    timeout: 3000
```

---

### Gestures & Scrolling

#### `scroll`
Simple scrolling in four directions (`DOWN`, `UP`, `LEFT`, `RIGHT`).
```yaml
- scroll:
    direction: DOWN
```

#### `scrollUntilVisible`
Scrolls until a specific target is visible on the screen.
```yaml
- scrollUntilVisible:
    element: "Terms and Conditions"
    direction: DOWN
```

#### `swipe`
Simulates drag or swipe motions between coordinates or percentages.
```yaml
- swipe:
    direction: LEFT

# Custom swipe from one coordinate percentage to another
- swipe:
    start: "80%,50%"
    end: "20%,50%"
    duration: 500
```

---

### Scripting & JavaScript Evaluation

#### `evalScript`
Executes an inline JavaScript expression directly in the YAML file to manipulate or transform test variables.
```yaml
# Generate dynamic test data inline
- evalScript: ${output.randomEmail = 'user_' + Date.now() + '@example.com'}

# Use the generated variable in an input field
- tapOn:
    id: "email"
- inputText: ${output.randomEmail}
```

#### `runScript`
Executes an external `.js` file to run complex business logic, seed databases, or fetch authentication tokens from APIs.
```yaml
- runScript: scripts/generateAuthToken.js

# Access variables returned by the script:
- inputText: ${output.authToken}
```

---

### Utilities & Diagnostics

#### `takeScreenshot`
Takes a screenshot at a critical failure point or milestone for test reporting.
```yaml
- takeScreenshot: dashboard-loaded
```

#### `copyTextFrom`
Extracts text from a UI component and saves it to `maestro.copiedText`.
```yaml
- copyTextFrom:
    id: "order-id"
- evalScript: ${console.log("Copied Order ID: " + maestro.copiedText)}
```

#### `openLink`
Navigates directly to any URL or deep link during a test session.
```yaml
- openLink: "http://localhost:5173/dashboard"
```

#### `pressKey`
Sends keyboard key events (e.g., Enter, Backspace, Escape, Tab).
```yaml
- pressKey: Enter
- pressKey: Tab
- pressKey: Escape
```

#### `setLocation`
Mocks geolocation coordinates for location-sensitive web applications.
```yaml
- setLocation:
    latitude: 37.7749
    longitude: -122.4194
```

---

## Maestro Web vs Mobile: Key Differences

| Feature | Mobile (iOS / Android) | Desktop Web (Chromium) |
|---|---|---|
| **Entry Point Config** | `appId: com.example.app` | `url: http://localhost:5173` |
| **Driver Engine** | XCUITest (iOS) / UiAutomator (Android) | Headless / Managed Chromium |
| **Element Selectors** | Accessibility ID, text, point | Text, `id`, accessibility labels, `css` |
| **Input Clearing** | `eraseText` / `clearState` | `eraseText` |
| **Status** | Stable & Production Ready | **Beta** |
| **DOM Independence** | Operates on native accessibility hierarchy | Interacts at visual accessibility layer (framework-agnostic) |

---

## Troubleshooting

1. **`Unable to locate a Java Runtime`**:
   - Ensure OpenJDK is installed via `brew install openjdk`.
   - Ensure `export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"` is present in your active terminal.
2. **`Connection refused` on `http://localhost:5173`**:
   - Ensure the Vite server is running (`npm run dev`).
3. **Selector Not Found**:
   - Run `maestro studio` to inspect elements directly and verify text labels or DOM IDs.
