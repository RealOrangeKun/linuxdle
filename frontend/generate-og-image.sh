#!/bin/bash
# Generate og-image.png for Linuxdle
# This creates a 1200x630px social media preview image

cd "$(dirname "$0")/public" || exit 1

# Create a terminal-styled og-image using ImageMagick
magick -size 1200x630 xc:"#0D1117" \
  -gravity center \
  -fill "#1793D1" -font "DejaVu-Sans-Mono-Bold" -pointsize 120 \
  -annotate +0-120 "LINUXDLE" \
  -fill "#C9D1D9" -font "DejaVu-Sans-Mono" -pointsize 40 \
  -annotate +0-40 "Daily Linux Puzzle Games" \
  -fill "#1793D1" -font "DejaVu-Sans-Mono" -pointsize 32 \
  -annotate +0+40 "\$ guess-command" \
  -annotate +0+90 "\$ identify-distro" \
  -annotate +0+140 "\$ recognize-desktop-env" \
  -fill "#1793D1" -pointsize 80 \
  -annotate -500+0 ">" \
  og-image.png

echo "✓ og-image.png created successfully at $(pwd)/og-image.png"
