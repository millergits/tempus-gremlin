# Deployment & Access Guide

## Accessing the Mockup
The mockup is hosted at a **persistent, unique URL**.

*   **URL:** `https://[your-guid].surge.sh`
    *   *Check the ` .domain` file or the deployment output for your specific URL.*
*   **Password:** `egen`

## Deploying Updates
To deploy a new version to the **same URL**, run:

```bash
./build_mockup.sh
```

### How It Works
1.  **Persistent Domain**: The first time you run the script, it generates a unique `[guid].surge.sh` domain and saves it to a file named `.domain`.
2.  **Subsequent Deploys**: All future deployments read from `.domain` and push updates to that exact same URL.
3.  **GUID Obfuscation**: The content pages (`gremlin-cli-mockup.html` etc) are still renamed to *new* random GUIDs on every deploy for security.
4.  **Encryption**: The main page is always encrypted (Password: `egen`).

### Resetting the Domain
If you want to generate a **fresh, new URL** (for example, to invalidate the old link):

1.  Delete the hidden `.domain` file:
    ```bash
    rm .domain
    ```
2.  Run the deployment script again:
    ```bash
    ./build_mockup.sh
    ```
    This will generate a new random domain and save it to a new `.domain` file.

## Managing Deployment History

Since Surge deployments are permanent by default, you may want to list or remove old ones.

### List all your sites
To see every URL currently hosted by your account:
```bash
npx surge list
```

### Remove a site (Teardown)
To permanently delete an old deployment:
```bash
npx surge teardown [your-domain.surge.sh]
```

## Surge Credentials (Reference)
*   **URL (Permanent):** `https://7d3389c1-8dd1-4480-87d9-c36b9e04fc54.surge.sh`
*   **Email**: `michael.miller@egen.ai`
*   **Secondary Account**: `accounts@itmiller.com` (Same password hint)
*   **Password Hint**: "standard + W"

## Account Management

### Remove a Site
To permanently delete a specific deployment:
```bash
npx surge teardown [your-domain.surge.sh]
```

### Delete Account
To **permanently delete your entire Surge account** and all deployed sites:
```bash
npx surge nuke
```
*Note: You must be logged in as the account you wish to delete.*

## Git Authentication (Troubleshooting)

If you encounter the error `Password authentication is not supported for Git operations`, you need to use a **Personal Access Token (PAT)** instead of your account password.

### How to Fix
1.  Go to **GitHub Settings** -> **Developer Settings** -> **Personal Access Tokens** -> **Tokens (classic)**.
2.  Click **Generate new token (classic)**.
3.  Select the `repo` scope (full control of private repositories).
4.  copy the generated token (begins with `ghp_...`).
5.  In your terminal, run the push command again:
    ```bash
    git push origin main
    ```
6.  When asked for your **Password**, paste the **Token** you just copied.
