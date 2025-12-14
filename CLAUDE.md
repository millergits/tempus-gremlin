# Tempus Gremlin Project Instructions

## Demo Command

When the user says "demo" or asks to "open the demo" or "run the demo", execute the following script:

```bash
./open-demos.sh
```

This opens `demo.html` which shows a navigation bar with workflow selection and both panels side by side:
- Left: Interactive CLI Demo
- Right: Walkthrough Guide

## Project Structure

```
tempus-gremlin/
├── demo.html                    # Main demo UI with workflow navigation
├── workflows/                   # Workflow files (cli + walkthrough pairs)
│   ├── mm-fusion-cli.html       # Multiple Myeloma Fusion - CLI demo
│   └── mm-fusion-walkthrough.html  # Multiple Myeloma Fusion - Walkthrough
├── gremlin-cli-demo.js          # Terminal-based interactive CLI demo (run with `node gremlin-cli-demo.js`)
├── deploy_demo.sh               # Deployment script (handles obfuscation + surge)
└── open-demos.sh                # Script to open demo locally
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
