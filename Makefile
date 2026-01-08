# Makefile for Ubuntu Make Apps

.PHONY: all clean install build-appimage help

# Default target
all: help

# Display help
help:
	@echo "Ubuntu Make Apps - Build System"
	@echo ""
	@echo "Available targets:"
	@echo "  make install         - Build AppImage (recommended)"
	@echo "  make build-appimage  - Build AppImage package"
	@echo "  make clean           - Clean build artifacts"
	@echo "  make help            - Show this help message"
	@echo ""
	@echo "Examples:"
	@echo "  make install         # Creates AppImage in dist/"
	@echo "  make clean install   # Clean and build AppImage"

# Install dependencies
deps:
	@echo "Installing dependencies..."
	npm install

# Build AppImage
build-appimage: deps
	@echo "Building AppImage..."
	npm run build-appimage
	@echo "AppImage created in dist/"

# Build and create AppImage (main target)
install: build-appimage
	@echo ""
	@echo "========================================="
	@echo "AppImage build complete!"
	@echo "========================================="
	@echo ""
	@echo "Your portable AppImage is ready in dist/"
	@echo ""
	@echo "To run:"
	@echo "  chmod +x dist/*.AppImage"
	@echo "  ./dist/*.AppImage"
	@echo ""
	@echo "AppImages are portable and require NO installation or dependencies!"
	@echo ""

# Remove build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf dist/
	rm -rf node_modules/
	@echo "Clean complete"

# Note: AppImages don't require uninstallation
# Simply delete the .AppImage file to remove the application
