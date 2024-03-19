#!/bin/bash

# Navigate to the "pages" directory relative to the current directory
cd "$(dirname "$0")/pages"

# Install npm packages, fix audits, and build sass
npm i && npm audit fix && npm run build:sass

# Turn off echoing of commands
set +x

# Get the previous and current directory names
prevDir=$(basename "$(dirname "$(pwd)")")
currDir=$(basename "$(pwd)")

# Prepare the pm2 command
cmd="pm2 start main.js -n $prevDir-$currDir"

# Echo and execute the command
echo "Command: $cmd"
eval $cmd
