#!/bin/bash

# Exit on error
set -e

echo "🔒 Preparing obfuscated build..."
rm -rf dist
mkdir -p dist
mkdir -p dist/workflows

# Handle Domain persistence (do this first so we can inject it into the HTML)
DOMAIN_FILE=".domain"

if [ -f "$DOMAIN_FILE" ]; then
    DEPLOY_DOMAIN=$(cat "$DOMAIN_FILE")
    echo "ℹ️  Using existing domain: $DEPLOY_DOMAIN"
else
    # Generate a random domain for the first time
    DEPLOY_DOMAIN="$(uuidgen | tr '[:upper:]' '[:lower:]').surge.sh"
    echo "$DEPLOY_DOMAIN" > "$DOMAIN_FILE"
    echo "🆕 Generated new domain: $DEPLOY_DOMAIN"
fi

# Create temporary index file
cp mockup.html mockup_temp.html

# Update the DEPLOY_URL in the HTML for the share button
# This replaces any existing .surge.sh domain with the current one
sed -i '' "s|DEPLOY_URL = '[^']*\.surge\.sh'|DEPLOY_URL = '${DEPLOY_DOMAIN}'|g" mockup_temp.html

echo "📂 Processing workflow files..."

# Loop through all CLI files in workflows directory
for cli_file in workflows/*-cli.html; do
    if [ -f "$cli_file" ]; then
        # Extract ID: workflows/mm-fusion-cli.html -> mm-fusion
        filename=$(basename "$cli_file")
        workflow_id="${filename%-cli.html}"

        walkthrough_file="workflows/${workflow_id}-walkthrough.html"

        # Generate random GUIDs
        GUID_CLI=$(uuidgen).html
        GUID_WALK=$(uuidgen).html

        echo "  - $workflow_id: Obfuscating..."

        # Copy to dist with new names
        cp "$cli_file" "dist/workflows/$GUID_CLI"
        if [ -f "$walkthrough_file" ]; then
            cp "$walkthrough_file" "dist/workflows/$GUID_WALK"
        fi

        # Replace paths in the temporary HTML file
        # WE use | as delimiter for sed to avoid escaping slashes
        sed -i '' "s|workflows/${workflow_id}-cli.html|workflows/${GUID_CLI}|g" mockup_temp.html
        sed -i '' "s|workflows/${workflow_id}-walkthrough.html|workflows/${GUID_WALK}|g" mockup_temp.html
    fi
done

echo "🔐 Encrypting..."
# Encrypt the temporary file
# Staticrypt outputs to "encrypted/" by default. We generate it there and move it.
# Using 'egen' as password with --short flag
npx --yes staticrypt mockup_temp.html -p "egen" --short
mv encrypted/mockup_temp.html dist/index.html
rm mockup_temp.html

# Copy any JS files needed (root level)
if [ -f "gremlin-cli-mockup.js" ]; then
    cp gremlin-cli-mockup.js dist/
fi

echo "🚀 Deploying to: $DEPLOY_DOMAIN"
npx surge dist --domain "$DEPLOY_DOMAIN"

echo "✅ Done! Your site is live at: https://$DEPLOY_DOMAIN"
