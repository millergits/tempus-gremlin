# Tempus Gremlin Project Instructions

## Build Command

When the user says "build" or asks to "build the mockup", execute the following script:

```bash
./build_mockup.sh [major|minor|patch]
```

*   **Default**: Increments the **patch** version (e.g., `v2.4.0` -> `v2.4.1`).
*   **Arguments**: Pass `minor` or `major` to increment those segments instead.
*   The script automatically updates `mockup.html` before building.

## Open Mockup Command

When the user says "mockup", "open mockup", "demo", or asks to "open the demo/mockup", execute the following script:

```bash
./open-mockup.sh
```

This opens `mockup.html` which shows a navigation bar with workflow selection and both panels side by side:
- Left: Interactive CLI Mockup
- Right: Walkthrough Guide

## Project Structure

```
tempus-gremlin/
├── mockup.html                  # Main mockup UI with workflow navigation
├── workflows/                   # Workflow files (cli + walkthrough pairs)
│   ├── mm-fusion-cli.html       # Multiple Myeloma Fusion - CLI mockup
│   └── mm-fusion-walkthrough.html  # Multiple Myeloma Fusion - Walkthrough
├── gremlin-cli-mockup.js        # Terminal-based interactive CLI mockup (run with `node gremlin-cli-mockup.js`)
├── build_mockup.sh            # Build/Deployment script (handles obfuscation + surge)
└── open-mockup.sh               # Script to open mockup locally
```

## Adding New Workflows

See **[workflows/README.md](workflows/README.md)** for the complete guide including:
- File templates and structure
- CSS classes for styling CLI responses
- Walkthrough section templates
- Testing tips and troubleshooting

**Quick steps:**

1. Create two HTML files in the `workflows/` folder:
   - `{workflow-id}-cli.html` - The interactive CLI demo
   - `{workflow-id}-walkthrough.html` - The walkthrough guide

2. Add the workflow to the `WORKFLOWS` array in `demo.html` (~line 263):
   ```javascript
   {
       id: 'workflow-id',
       name: 'Display Name',
       description: 'Brief description',
       cli: 'workflows/workflow-id-cli.html',
       walkthrough: 'workflows/workflow-id-walkthrough.html'
   }
   ```

3. Test locally: `./open-demos.sh`

4. Deploy: `./deploy_demo.sh` - automatically discovers and obfuscates all workflow files.

## Critical Deployment Rules

> [!IMPORTANT]
> **ALWAYS** use the permanent domain: `7d3389c1-8dd1-4480-87d9-c36b9e04fc54.surge.sh`

*   **NEVER** generate a new random domain.
*   The `.domain` file must always contain this exact GUID.
*   The `mockup.html` file must hardcode `DEPLOY_URL` to this exact domain.
*   If deployment fails due to permissions, it means the user needs to switch to the `michael.miller@egen.ai` surge account.
