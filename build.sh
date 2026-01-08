#!/bin/bash
# Build script for Ubuntu Make Apps AppImage

set -e

echo "========================================="
echo "Ubuntu Make Apps - AppImage Builder"
echo "========================================="
echo ""

# Check if running on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "Warning: This script is designed for Linux. Build results may vary on other platforms."
    echo ""
fi

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node --version 2>/dev/null || echo "not installed")
echo "Node.js version: $NODE_VERSION"

if [[ "$NODE_VERSION" == "not installed" ]]; then
    echo "Error: Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

echo ""
echo "Building AppImage..."
npm run build-appimage

echo ""
echo "========================================="
echo "Build complete!"
echo "========================================="
echo ""
echo "AppImage location: dist/Ubuntu-Make-Apps-*.AppImage"
echo ""
echo "To run:"
echo "  chmod +x dist/*.AppImage"
echo "  ./dist/*.AppImage"
echo ""
echo "AppImages are portable and require NO installation or dependencies!"
echo ""
echo "For more information, see Install.md"
echo ""
