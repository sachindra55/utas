#!/bin/bash

# Create necessary directories
mkdir -p public/h5p/core/js
mkdir -p public/h5p/core/styles
mkdir -p public/h5p/core/fonts
mkdir -p public/h5p/libraries
mkdir -p public/h5p/content/images

# Create core JS file
cat > public/h5p/core/js/h5p-standalone-frame.js << 'EOL'
var H5P = H5P || {};
H5P.externalEmbed = false;
EOL

# Create core CSS file
cat > public/h5p/core/styles/h5p.css << 'EOL'
.h5p-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #fafafa;
}

.h5p-content {
  position: relative;
  height: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
}

.h5p-iframe-wrapper {
  width: 100%;
  height: 100%;
  background: #fff;
  position: relative;
}

.h5p-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
EOL

# Copy content files
cp h5p/content/content.json public/h5p/content/
cp -r h5p/content/images/* public/h5p/content/images/ 2>/dev/null || true

# Copy main h5p.json
cp h5p/h5p.json public/h5p/

# Copy library files
cp -r h5p/H5P.* public/h5p/ 2>/dev/null || true

# Set permissions
chmod -R 755 public/h5p

echo "H5P files setup completed!"
