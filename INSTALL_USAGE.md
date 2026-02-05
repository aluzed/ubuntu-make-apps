# Installation Script Usage

## Remote Installation (Recommended)

Install directly from GitHub:

```bash
curl -fsSL https://raw.githubusercontent.com/aluzed/ubuntu-make-apps/master/install.sh | bash
```

## Local Installation

If you've already cloned the repository:

```bash
git clone https://github.com/aluzed/ubuntu-make-apps.git
cd ubuntu-make-apps
./install.sh
```

## What the Script Does

1. **System Check**: Verifies Node.js 18+, npm, and git are installed
2. **FUSE Check**: Warns if FUSE is not installed (required for AppImages)
3. **Clone Repository**: Downloads the latest version from GitHub
4. **Install Dependencies**: Runs `npm install` to get all required packages
5. **Build AppImage**: Compiles the application into a portable AppImage
6. **Install**: Copies the AppImage to `~/Applications`
7. **Desktop Entry**: Creates a menu entry for easy access
8. **Cleanup**: Removes temporary build files

## Requirements

### Mandatory
- **Linux OS**: Any distribution (Ubuntu, Debian, Fedora, Arch, etc.)
- **Node.js**: Version 18 or higher
- **npm**: Comes with Node.js
- **git**: For cloning the repository

### Optional but Recommended
- **FUSE**: Required for running AppImages
  ```bash
  sudo apt install -y fuse libfuse2
  ```

## Installing Node.js 18+

If you don't have Node.js 18 or higher:

### Ubuntu/Debian

```bash
# Using NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### Fedora

```bash
sudo dnf install nodejs npm
```

### Arch Linux

```bash
sudo pacman -S nodejs npm
```

## Installation Locations

- **AppImage**: `~/Applications/Ubuntu-Make-Apps-*.AppImage`
- **Desktop Entry**: `~/.local/share/applications/ubuntu-make-apps.desktop`
- **Temporary Files**: `/tmp/ubuntu-make-apps-install-<pid>` (auto-cleaned)

## Post-Installation

### Launching the App

**Method 1**: Search for "Ubuntu Make Apps" in your application menu

**Method 2**: Run directly from terminal:
```bash
~/Applications/Ubuntu-Make-Apps-*.AppImage
```

### Updating

To update to the latest version, run the installation script again:

```bash
curl -fsSL https://raw.githubusercontent.com/aluzed/ubuntu-make-apps/master/install.sh | bash
```

This will overwrite the existing installation.

## Uninstallation

To remove Ubuntu Make Apps:

```bash
# Remove the application
rm ~/Applications/Ubuntu-Make-Apps-*.AppImage

# Remove the desktop entry
rm ~/.local/share/applications/ubuntu-make-apps.desktop

# Update desktop database
update-desktop-database ~/.local/share/applications
```

## Troubleshooting

### "Node.js version 18 or higher is required"

Update Node.js using the installation commands above.

### "Missing required dependencies: git"

Install git:
```bash
sudo apt install -y git  # Ubuntu/Debian
sudo dnf install -y git  # Fedora
sudo pacman -S git       # Arch
```

### "AppImages may not work properly" (FUSE warning)

Install FUSE:
```bash
sudo apt install -y fuse libfuse2
```

### "Failed to build AppImage"

1. Check available disk space (need ~500 MB)
2. Try manual installation:
   ```bash
   git clone https://github.com/aluzed/ubuntu-make-apps.git
   cd ubuntu-make-apps
   npm install
   npm run build-appimage
   ```

### Permission Denied

If you get permission errors:
```bash
chmod +x ~/Applications/Ubuntu-Make-Apps-*.AppImage
```

## Script Features

- **Automatic cleanup**: Temporary files are removed even if installation fails
- **Color output**: Clear visual feedback during installation
- **Error handling**: Stops on errors with helpful messages
- **Requirement checks**: Validates all dependencies before starting
- **Interactive**: Option to launch the app immediately after installation
- **Safe**: Uses temporary directories and doesn't require sudo

## Security Notes

When running scripts from the internet with `curl | bash`:
- Always review the script first: https://raw.githubusercontent.com/aluzed/ubuntu-make-apps/master/install.sh
- The script doesn't require sudo/root access
- All installation happens in user directories (`~/`)
- Open source project with visible source code

## Alternative: Manual Installation

If you prefer not to use the automated script, see [Install.md](Install.md) for manual installation instructions.
