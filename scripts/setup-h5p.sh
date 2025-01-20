#!/bin/bash

# Remove existing public/h5p directory
rm -rf public/h5p

# Create required directories
mkdir -p public/h5p/core/js
mkdir -p public/h5p/core/styles
mkdir -p public/h5p/core/fonts
mkdir -p public/h5p/core/images
mkdir -p public/h5p/libraries
mkdir -p public/h5p/content

# Copy H5P standalone files
cp node_modules/h5p-standalone/dist/frame.bundle.js public/h5p/core/js/h5p-standalone-frame.js
cp node_modules/h5p-standalone/dist/main.bundle.js public/h5p/core/js/h5p-standalone.js

# Copy styles from node_modules
cp -r node_modules/h5p-standalone/dist/styles/* public/h5p/core/styles/

# Copy content and libraries
cp -r h5p/content/* public/h5p/content/
cp -r h5p/H5P.* public/h5p/libraries/
cp -r h5p/FontAwesome-4.5 public/h5p/libraries/
cp -r h5p/H5PEditor.* public/h5p/libraries/

# Copy h5p.json
cp h5p/h5p.json public/h5p/

# Create additional required files
cat > public/h5p/core/js/h5p.js << 'EOL'
var H5P = H5P || {};
H5P.preventInit = true;
EOL

# Set permissions
chmod -R 755 public/h5p

echo "H5P setup completed successfully!"
