#!/bin/bash

echo "Checking H5P files..."

# Create main directories
mkdir -p public/h5p/content/images
mkdir -p public/h5p/core/{js,styles,fonts}
mkdir -p public/h5p/libraries

# Create h5p.json if it doesn't exist
if [ ! -f public/h5p/h5p.json ]; then
  echo "Creating h5p.json..."
  cat > public/h5p/h5p.json << 'EOL'
{
  "title": "Virtual Tour",
  "language": "en",
  "mainLibrary": "H5P.ThreeImage",
  "embedTypes": ["div"],
  "license": "U",
  "author": "",
  "preloadedDependencies": [
    {
      "machineName": "H5P.ThreeImage",
      "majorVersion": "0",
      "minorVersion": "5"
    },
    {
      "machineName": "H5P.ThreeJS",
      "majorVersion": "1",
      "minorVersion": "0"
    }
  ]
}
EOL
fi

# Create content.json if it doesn't exist
if [ ! -f public/h5p/content/content.json ]; then
  echo "Creating content.json..."
  cat > public/h5p/content/content.json << 'EOL'
{
  "threeImage": {
    "scenes": [
      {
        "sceneId": 0,
        "scenename": "Main Scene",
        "scenesrc": {
          "path": "images/scene1.jpg",
          "mime": "image/jpeg",
          "copyright": {
            "license": "U"
          }
        },
        "cameraStartPosition": "0,0"
      }
    ]
  }
}
EOL
fi

# Create required library files
mkdir -p public/h5p/H5P.ThreeImage-0.5
mkdir -p public/h5p/H5P.ThreeJS-1.0

# Create library.json files
cat > public/h5p/H5P.ThreeImage-0.5/library.json << 'EOL'
{
  "title": "Virtual Tour (360)",
  "description": "Create 360 virtual tours.",
  "majorVersion": 0,
  "minorVersion": 5,
  "patchVersion": 0,
  "runnable": 1,
  "author": "Joubel",
  "license": "MIT",
  "machineName": "H5P.ThreeImage",
  "preloadedJs": [
    {
      "path": "dist/three-image.js"
    }
  ],
  "preloadedCss": [
    {
      "path": "dist/three-image.css"
    }
  ],
  "preloadedDependencies": [
    {
      "machineName": "H5P.ThreeJS",
      "majorVersion": 1,
      "minorVersion": 0
    }
  ]
}
EOL

cat > public/h5p/H5P.ThreeJS-1.0/library.json << 'EOL'
{
  "title": "Three.js",
  "description": "Helper library for 3D rendering",
  "majorVersion": 1,
  "minorVersion": 0,
  "patchVersion": 0,
  "runnable": 0,
  "author": "Joubel",
  "license": "MIT",
  "machineName": "H5P.ThreeJS",
  "preloadedJs": [
    {
      "path": "dist/three.min.js"
    }
  ]
}
EOL

echo "H5P file check completed!"
