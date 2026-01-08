# Installation Guide

## AppImage - Recommended Portable Format

AppImage is a **portable** format that requires **no installation** and **no system dependencies**. Everything is included in a single executable file.

### AppImage Advantages

- No system dependencies required
- No installation needed
- Works on all Linux distributions
- Portable: can be run from a USB drive
- No root/sudo access needed
- Easy to remove (just delete the file)

---

## Method 1: Using Makefile (Recommended)

The easiest way to build your AppImage:

```bash
# Build the AppImage
make install

# The AppImage will be created in dist/
```

Then, to launch the application:

```bash
# Make the file executable
chmod +x dist/*.AppImage

# Run the application
./dist/*.AppImage
```

---

## Method 2: Manual build with npm

If you prefer using npm directly:

```bash
# Install development dependencies
npm install

# Build the AppImage
npm run build-appimage
```

The AppImage will be created in the `dist/` folder.

---

## Method 3: Using the build script

```bash
# Run the build script
./build.sh

# The script will install npm dependencies and build the AppImage
```

---

## Using the AppImage

### First use

```bash
# Navigate to the folder containing the AppImage
cd dist/

# Make the file executable (one time only)
chmod +x Ubuntu-Make-Apps-*.AppImage

# Launch the application
./Ubuntu-Make-Apps-*.AppImage
```

### System Integration (Optional)

To add the application to your system menu:

1. **Move the AppImage to a permanent folder**:
   ```bash
   mkdir -p ~/Applications
   mv dist/Ubuntu-Make-Apps-*.AppImage ~/Applications/
   chmod +x ~/Applications/Ubuntu-Make-Apps-*.AppImage
   ```

2. **Create a menu entry**:
   ```bash
   mkdir -p ~/.local/share/applications

   cat > ~/.local/share/applications/ubuntu-make-apps.desktop << 'EOF'
   [Desktop Entry]
   Name=Ubuntu Make Apps
   Comment=Manage AppImage applications
   Exec=/home/$USER/Applications/Ubuntu-Make-Apps-1.0.0.AppImage
   Icon=application-x-executable
   Terminal=false
   Type=Application
   Categories=Utility;Application;
   EOF
   ```

3. **Update the application database**:
   ```bash
   update-desktop-database ~/.local/share/applications
   ```

The application will now appear in your application menu.

---

## Uninstallation

AppImages require **no uninstallation**. To remove the application:

```bash
# Remove the AppImage
rm ~/Applications/Ubuntu-Make-Apps-*.AppImage

# Remove the menu entry (if you created one)
rm ~/.local/share/applications/ubuntu-make-apps.desktop
update-desktop-database ~/.local/share/applications
```

---

## System Requirements

### To use the AppImage (end user)

- **OS**: Any Linux distribution (Ubuntu, Debian, Fedora, Arch, etc.)
- **Architecture**: x64 (64-bit)
- **Libraries**: None! Everything is included in the AppImage
- **Disk space**: ~150-200 MB for the AppImage

### To build the AppImage (developer)

- **OS**: Ubuntu 24.04 LTS or compatible Linux distribution
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **Disk space**: ~500 MB (dependencies + build)

---

## Node.js Version Check

If you need to build the AppImage, check your Node.js version:

```bash
node --version
```

If you need to update Node.js:

```bash
# Recommended method: NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

---

## Build Structure

During build, the following files are created:

```
dist/
└── Ubuntu-Make-Apps-1.0.0.AppImage    # Standalone portable file
```

---

## Troubleshooting

### AppImage won't start

1. **Check permissions**:
   ```bash
   chmod +x dist/*.AppImage
   ```

2. **Run from terminal to see errors**:
   ```bash
   ./dist/*.AppImage
   ```

3. **Check FUSE** (required for AppImages):
   ```bash
   # Install FUSE if needed
   sudo apt install fuse libfuse2
   ```

### Build errors

1. **Clean and rebuild**:
   ```bash
   make clean
   make install
   ```

2. **Check npm dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build-appimage
   ```

3. **Check Node.js version**:
   ```bash
   node --version  # Must be >= 18.0.0
   ```

### Application doesn't show in menu

If you created the `.desktop` entry but the application doesn't appear:

```bash
# Update the database
update-desktop-database ~/.local/share/applications

# Check the desktop file
cat ~/.local/share/applications/ubuntu-make-apps.desktop

# Make sure the Exec= path is correct
```

---

## Available Make Commands

```bash
make install         # Build the AppImage (recommended)
make build-appimage  # Build the AppImage
make clean          # Clean build files
make help           # Show help
```

---

## Why AppImage?

Unlike `.deb` or `.rpm` formats, AppImages:

1. **Require no installation** - Just download and run
2. **No dependency conflicts** - Everything is bundled
3. **Portable** - Works on all distributions
4. **Easy to remove** - No system residue
5. **No sudo needed** - No root privileges required
6. **Multi-version** - Multiple versions can coexist

---

## Resources

- **Project**: https://github.com/aluzed/ubuntu-make-apps
- **AppImage**: https://appimage.org/
- **Electron**: https://www.electronjs.org/

---

## License

This project is licensed under the MIT License.
