#!/bin/bash

# Set the git postBuffer configuration
git config --global http.postBuffer 524288000

# Pull the latest changes from the repository
git pull origin main

# Ensure node_modules and bower_components are not tracked
echo "node_modules/" >> .gitignore
echo "bower_components/" >> .gitignore

# Remove existing node_modules and bower_components from Git tracking if any
git rm -r --cached node_modules
git rm -r --cached bower_components

# Commit .gitignore changes if not already committed
git add .gitignore
git commit -m "Update .gitignore to exclude node_modules and bower_components"

# Install dependencies and build the project
npm install
npm run build

# Any other deployment steps you need to perform
