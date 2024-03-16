#!/bin/bash

# Navigate to the skyfb directory and execute npm commands
cd "$(pwd)/skyfb"
npm i && npm audit fix && npm run build:sass
# Wait for 3 seconds
sleep 3

# Get the current directory path
currentPath="$(dirname "$(readlink -f "$0")")"

# Get the current directory name
currDir="$(basename "$currentPath")"

# Get the parent directory path
parentPath="$(dirname "$currentPath")"

# Get the parent directory name
prevDir="$(basename "$parentPath")"

# Get the grandparent directory path
grandParentPath="$(dirname "$parentPath")"

# Get the grandparent directory name
grandParentDir="$(basename "$grandParentPath")"

# Construct the command
cmd="pm2 start main.js -n ${grandParentDir}-${prevDir}"

# Echo the command
echo "Command: $cmd"

# Execute the command
eval $cmd
