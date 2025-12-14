# Deployment & Access Guide

## Accessing the Demo
The latest version of the demo is hosted at:
**[https://tempus-gremlin-demo-v1.surge.sh](https://tempus-gremlin-demo-v1.surge.sh)**

*   **Password:** `tempus`

## Deploying Updates
To deploy a new version, run the automated script:

```bash
./deploy_demo.sh
```

### How It Works
This script performs several security steps completely automatically:

1.  **GUID Generation**: It generates unique, random UUIDs (e.g., `a1b2-c3d4...html`) for your content pages (`gremlin-cli-demo.html` and `DEMO_WALKTHROUGH.html`).
2.  **Obfuscation**: It creates a temporary version of `demo.html` that points to these secret, random filenames instead of the obvious ones.
3.  **Encryption**: It uses **Staticrypt** to password-protect the main `demo.html` file.
4.  **Deployment**: It copies the renamed files and the encrypted index to the `dist` folder and pushes them to Surge.

**Result**: The "real" URLs of your inner pages change every time you deploy. Even if a bad actor guesses your domain, they cannot find the content without logging in through the main page.

## Surge Credentials (Reference)
*   **Email**: `accounts@itmiller.com`
*   **Password Hint**: "standard + W"
