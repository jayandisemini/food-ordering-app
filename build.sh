#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Downloading Flutter SDK..."
git clone https://github.com/flutter/flutter.git -b stable --depth 1
export PATH="$PATH:`pwd`/flutter/bin"

echo "Building Flutter Web App..."
cd flutter_app
flutter build web --release
