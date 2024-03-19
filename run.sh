#!/bin/bash

# Navigate to the parent directory
cd ..

# Get the previous directory name
prevDir=$(basename "$(pwd)")

# Navigate back to the original directory
cd -

# Get the current directory name
currDir=$(basename "$(pwd)")

# Prepare the pm2 command
cmd="npm i && npm audit fix && npm run build:sass && pm2 start main.js -n $prevDir-$currDir && exit"

# Echo the command
echo "Command: $cmd"

# Execute the command in a new terminal
gnome-terminal -- /bin/bash -c "$cmd; exec /bin/bash"
