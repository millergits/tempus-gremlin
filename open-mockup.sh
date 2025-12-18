#!/bin/bash

# Open the combined demo page
DIR="$(cd "$(dirname "$0")" && pwd)"
open "$DIR/mockup.html"

echo "Mockup opened: Gremlin CLI (left) | Walkthrough (right)"
