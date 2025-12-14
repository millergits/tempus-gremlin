#!/bin/bash

# Open the combined demo page
DIR="$(cd "$(dirname "$0")" && pwd)"
open "$DIR/demo.html"

echo "Demo opened: Gremlin CLI (left) | Walkthrough (right)"
