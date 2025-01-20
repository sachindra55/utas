#!/bin/bash

# Remove existing public/h5p directory if it exists
rm -rf public/h5p

# Create public/h5p directory
mkdir -p public/h5p

# Copy all H5P files from h5p to public/h5p
cp -r h5p/* public/h5p/

# Set permissions
chmod -R 755 public/h5p

echo "H5P files copied successfully!"
