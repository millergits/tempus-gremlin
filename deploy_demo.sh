#!/bin/bash

# Exit on error
set -e

echo "🔒 Preparing obfuscated build..."
mkdir -p dist
mkdir -p dist/workflows

# Generate a mapping file for the obfuscated names
# This stores workflow_id -> [cli_guid, walkthrough_guid]
declare -A WORKFLOW_GUIDS

# Find all workflow files and generate GUIDs for them
echo "📂 Processing workflow files..."

# Get list of CLI files in workflows folder
for cli_file in workflows/*-cli.html; do
    if [ -f "$cli_file" ]; then
        # Extract workflow ID (e.g., "mm-fusion" from "mm-fusion-cli.html")
        filename=$(basename "$cli_file")
        workflow_id="${filename%-cli.html}"

        # Generate GUIDs for both CLI and walkthrough
        GUID_CLI=$(uuidgen).html
        GUID_WALKTHROUGH=$(uuidgen).html

        echo "  - $workflow_id: CLI -> $GUID_CLI, Walkthrough -> $GUID_WALKTHROUGH"

        # Copy files with obfuscated names
        cp "$cli_file" "dist/workflows/$GUID_CLI"
        cp "workflows/${workflow_id}-walkthrough.html" "dist/workflows/$GUID_WALKTHROUGH"

        # Store for later use in demo.html replacement
        WORKFLOW_GUIDS["$workflow_id"]="$GUID_CLI|$GUID_WALKTHROUGH"
    fi
done

# Create modified demo.html with obfuscated paths
echo "📝 Creating obfuscated demo.html..."
cp demo.html demo_temp.html

# Replace each workflow's paths in the WORKFLOWS array
for workflow_id in "${!WORKFLOW_GUIDS[@]}"; do
    IFS='|' read -r guid_cli guid_walkthrough <<< "${WORKFLOW_GUIDS[$workflow_id]}"

    # Replace CLI path
    sed -i '' "s|workflows/${workflow_id}-cli.html|workflows/${guid_cli}|g" demo_temp.html
    # Replace walkthrough path
    sed -i '' "s|workflows/${workflow_id}-walkthrough.html|workflows/${guid_walkthrough}|g" demo_temp.html
done

# Copy any JS files needed
if [ -f "gremlin-cli-demo.js" ]; then
    cp gremlin-cli-demo.js dist/
fi

echo "🔐 Encrypting..."
# Encrypt the temporary file
npx --yes staticrypt demo_temp.html -p "tempus" -o dist/index.html --short
rm demo_temp.html

echo "🚀 Deploying to Surge..."
# Deploy using the established unique domain
npx surge dist --domain tempus-gremlin-demo-v1.surge.sh

echo "✅ Done! Your site is live at: https://tempus-gremlin-demo-v1.surge.sh"
