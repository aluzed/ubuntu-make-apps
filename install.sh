#!/bin/bash

# Ubuntu Make Apps - Installation Script
# Usage: curl -fsSL https://raw.githubusercontent.com/aluzed/ubuntu-make-apps/master/install.sh | bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/aluzed/ubuntu-make-apps.git"
APP_NAME="ubuntu-make-apps"
TEMP_DIR="/tmp/${APP_NAME}-install-$$"
INSTALL_DIR="$HOME/Applications"
DESKTOP_DIR="$HOME/.local/share/applications"

# Functions
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_command() {
    if command -v "$1" &> /dev/null; then
        return 0
    else
        return 1
    fi
}

check_node_version() {
    local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -ge 18 ]; then
        return 0
    else
        return 1
    fi
}

cleanup() {
    if [ -d "$TEMP_DIR" ]; then
        print_info "Cleaning up temporary files..."
        rm -rf "$TEMP_DIR"
    fi
}

# Trap to cleanup on exit
trap cleanup EXIT

# Header
echo ""
echo "=========================================="
echo "  Ubuntu Make Apps - Installation Script"
echo "=========================================="
echo ""

# Check if running on Linux
if [ "$(uname -s)" != "Linux" ]; then
    print_error "This script only works on Linux systems."
    exit 1
fi

# Check for required commands
print_info "Checking system requirements..."

MISSING_DEPS=()

if ! check_command git; then
    MISSING_DEPS+=("git")
fi

if ! check_command node; then
    MISSING_DEPS+=("nodejs")
fi

if ! check_command npm; then
    MISSING_DEPS+=("npm")
fi

if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
    print_error "Missing required dependencies: ${MISSING_DEPS[*]}"
    echo ""
    print_info "To install them on Ubuntu/Debian:"
    echo "  sudo apt update"
    echo "  sudo apt install -y ${MISSING_DEPS[*]}"
    echo ""
    print_info "For Node.js 18+, use NodeSource:"
    echo "  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "  sudo apt install -y nodejs"
    exit 1
fi

# Check Node.js version
if ! check_node_version; then
    print_error "Node.js version 18 or higher is required."
    echo ""
    print_info "Current version: $(node --version)"
    echo ""
    print_info "To upgrade Node.js:"
    echo "  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "  sudo apt install -y nodejs"
    exit 1
fi

print_success "All requirements satisfied"
print_info "Node.js: $(node --version)"
print_info "npm: $(npm --version)"

# Check for FUSE (optional but recommended for AppImages)
if ! check_command fusermount && ! [ -e /dev/fuse ]; then
    print_warning "FUSE is not installed. AppImages may not work properly."
    print_info "To install FUSE: sudo apt install -y fuse libfuse2"
fi

# Create temporary directory
print_info "Creating temporary directory..."
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

# Clone repository
print_info "Cloning repository..."
git clone --depth 1 "$REPO_URL" "$APP_NAME"
cd "$APP_NAME"

# Install dependencies
print_info "Installing npm dependencies..."
npm install --production=false

# Build AppImage
print_info "Building AppImage (this may take a few minutes)..."
npm run build-appimage

# Check if AppImage was created
APPIMAGE_PATH=$(find dist -name "*.AppImage" -type f | head -n 1)

if [ -z "$APPIMAGE_PATH" ]; then
    print_error "Failed to build AppImage. No .AppImage file found in dist/"
    exit 1
fi

print_success "AppImage built successfully: $(basename $APPIMAGE_PATH)"

# Create Applications directory
print_info "Creating installation directory..."
mkdir -p "$INSTALL_DIR"

# Install AppImage
APPIMAGE_NAME=$(basename "$APPIMAGE_PATH")
INSTALLED_PATH="$INSTALL_DIR/$APPIMAGE_NAME"

print_info "Installing AppImage to $INSTALL_DIR..."
cp "$APPIMAGE_PATH" "$INSTALLED_PATH"
chmod +x "$INSTALLED_PATH"

print_success "AppImage installed to: $INSTALLED_PATH"

# Create desktop entry
print_info "Creating desktop entry..."
mkdir -p "$DESKTOP_DIR"

cat > "$DESKTOP_DIR/ubuntu-make-apps.desktop" << EOF
[Desktop Entry]
Name=Ubuntu Make Apps
Comment=Manage AppImage applications
Exec=$INSTALLED_PATH
Icon=application-x-executable
Terminal=false
Type=Application
Categories=Utility;Application;
EOF

# Update desktop database
if check_command update-desktop-database; then
    update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
fi

print_success "Desktop entry created"

# Final messages
echo ""
echo "=========================================="
print_success "Installation completed successfully!"
echo "=========================================="
echo ""
print_info "Application location: $INSTALLED_PATH"
print_info "Desktop entry: $DESKTOP_DIR/ubuntu-make-apps.desktop"
echo ""
print_info "To launch the application:"
echo "  1. Search for 'Ubuntu Make Apps' in your application menu"
echo "  2. Or run: $INSTALLED_PATH"
echo ""

# Ask if user wants to launch the application
read -p "$(echo -e ${BLUE}[INPUT]${NC} Do you want to launch Ubuntu Make Apps now? [y/N]: )" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Launching Ubuntu Make Apps..."
    nohup "$INSTALLED_PATH" > /dev/null 2>&1 &
    print_success "Application launched!"
fi

echo ""
print_info "Uninstallation:"
echo "  rm $INSTALLED_PATH"
echo "  rm $DESKTOP_DIR/ubuntu-make-apps.desktop"
echo ""
print_info "Repository: $REPO_URL"
echo ""
