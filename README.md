# Tempus Gremlin Mockup

A high-fidelity interactive mockup for the Gremlin project, featuring a dual-pane interface with a simulated CLI and guided walkthroughs.

## Prerequisites

*   **Node.js & npm** (Required for deployment tools)
*   **Surge.sh CLI** (`npm install --global surge`)

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd tempus-gremlin
    ```

2.  **Install Dependencies:**
    This project uses `npx` to run tools on the fly, so strictly speaking no `npm install` is needed for the root, but ensure you have internet access.

## Running Locally

To view the mockup locally without deploying:

```bash
./open-mockup.sh
```

This simply opens `mockup.html` in your default browser.

## Building & Deploying

This project is deployed to a **fixed, permanent URL** via Surge.sh.

### 1. The Critical Rule
> [!IMPORTANT]
> **ALWAYS** use the permanent domain: `7d3389c1-8dd1-4480-87d9-c36b9e04fc54.surge.sh`

**NEVER** allow the build script to generate a new random domain. The `.domain` file in the root directory should contain this GUID.

### 2. Deploy Command
To build (obfuscate/encrypt) and deploy:

```bash
./build_mockup.sh
```

**What this script does:**
*   Creates a `dist/` folder.
*   Obfuscates workflow file names to random GUIDs.
*   Encrypts the entry point (`index.html`) using Staticrypt (Password: `egen`).
*   Deploys the `dist/` folder to the configured Surge domain.

### 3. Credentials
*   **Deploy Account:** `michael.miller@egen.ai`
*   **Secondary Account:** `accounts@itmiller.com`
*   **Password Hint:** "standard + W"

If you encounter a "permission denied" error, ensure you are logged in as the correct user:
```bash
npx surge login
```

## Project Structure

*   `mockup.html`: The main container UI.
*   `workflows/`: Contains the content for each workflow (CLI interactions + Walkthrough text).
*   `assets/`: Images and static resources.
*   `build_mockup.sh`: The deployment automation script.
*   `CLAUDE.md`: Instructions for AI assistants.
*   `DEPLOY.md`: detailed deployment history and account management info.
