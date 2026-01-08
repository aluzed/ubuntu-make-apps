const { app, BrowserWindow, ipcMain, dialog, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Load config from JSON file
let config = {
  ignorePatterns: []
};

const configPath = path.join(__dirname, 'config.json');

function loadConfig() {
  try {
    const data = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(data);
  } catch (error) {
    console.error('Error loading config:', error);
    config = { ignorePatterns: [] };
  }
}

function saveConfig() {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving config:', error);
  }
}

// Load config on startup
loadConfig();

let mainWindow;

function createWindow() {
  // Load icon using nativeImage for better Linux support
  const iconPath = path.join(__dirname, 'assets', 'UMA.png');
  const icon = nativeImage.createFromPath(iconPath);

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    icon: icon,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Remove menu bar
  mainWindow.removeMenu();

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  // Create ~/Applications folder at startup
  const applicationsDir = path.join(os.homedir(), 'Applications');
  if (!fs.existsSync(applicationsDir)) {
    fs.mkdirSync(applicationsDir, { recursive: true });
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers

// Convert glob pattern to regex
function globToRegex(pattern) {
  return new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
}

// Check if a filename matches any ignore pattern
function shouldIgnore(filename) {
  return config.ignorePatterns.some(pattern => {
    const regex = globToRegex(pattern);
    return regex.test(filename);
  });
}

// Get system username
ipcMain.handle('get-username', () => {
  return os.userInfo().username;
});

// Get applications list
ipcMain.handle('get-applications', () => {
  const desktopDir = path.join(os.homedir(), '.local', 'share', 'applications');

  if (!fs.existsSync(desktopDir)) {
    fs.mkdirSync(desktopDir, { recursive: true });
    return [];
  }

  const files = fs.readdirSync(desktopDir).filter(file => {
    return file.endsWith('.desktop') && !shouldIgnore(file);
  });
  const apps = [];

  files.forEach(file => {
    const filePath = path.join(desktopDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    const app = parseDesktopFile(content);
    if (app) {
      app.id = file.replace('.desktop', '');
      app.filename = file;
      apps.push(app);
    }
  });

  return apps;
});

// Parse a .desktop file
function parseDesktopFile(content) {
  const lines = content.split('\n');
  const app = {};

  lines.forEach(line => {
    if (line.startsWith('Name=')) {
      app.name = line.substring(5).trim();
    } else if (line.startsWith('Exec=')) {
      app.exec = line.substring(5).trim();
    } else if (line.startsWith('Icon=')) {
      app.icon = line.substring(5).trim();
    } else if (line.startsWith('Type=')) {
      app.type = line.substring(5).trim();
    } else if (line.startsWith('Categories=')) {
      app.categories = line.substring(11).trim();
    }
  });

  return app.name ? app : null;
}

// Open dialog to select AppImage
ipcMain.handle('select-appimage', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'AppImage', extensions: ['AppImage', 'appimage'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  return result.canceled ? null : result.filePaths[0];
});

// Open dialog to select a folder
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });

  return result.canceled ? null : result.filePaths[0];
});

// Open dialog to select an icon
ipcMain.handle('select-icon', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'svg', 'xpm'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  return result.canceled ? null : result.filePaths[0];
});

// Copy or move the AppImage file
ipcMain.handle('process-appimage', async (event, { sourcePath, action, appName }) => {
  const applicationsDir = path.join(os.homedir(), 'Applications');
  const fileName = path.basename(sourcePath);
  const destPath = path.join(applicationsDir, fileName);

  try {
    if (action === 'copy') {
      fs.copyFileSync(sourcePath, destPath);
    } else if (action === 'move') {
      fs.renameSync(sourcePath, destPath);
    }

    // chmod +x
    fs.chmodSync(destPath, 0o755);

    return { success: true, path: destPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Copy the icon
ipcMain.handle('process-icon', async (event, { sourcePath, appName }) => {
  const applicationsDir = path.join(os.homedir(), 'Applications');
  const ext = path.extname(sourcePath);
  const iconFileName = `${appName}${ext}`;
  const destPath = path.join(applicationsDir, iconFileName);

  try {
    fs.copyFileSync(sourcePath, destPath);
    return { success: true, path: destPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Save the .desktop file
ipcMain.handle('save-desktop-file', async (event, { id, name, exec, icon, type, categories }) => {
  const desktopDir = path.join(os.homedir(), '.local', 'share', 'applications');
  const filename = id ? `${id}.desktop` : `${name.toLowerCase().replace(/\s+/g, '-')}.desktop`;
  const filePath = path.join(desktopDir, filename);

  const content = `[Desktop Entry]
Type=${type}
Name=${name}
Exec=${exec}
Icon=${icon}
Terminal=false
Categories=${categories}
`;

  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Delete an application
ipcMain.handle('delete-application', async (event, { id }) => {
  const desktopDir = path.join(os.homedir(), '.local', 'share', 'applications');
  const filePath = path.join(desktopDir, `${id}.desktop`);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get a specific application
ipcMain.handle('get-application', async (event, { id }) => {
  const desktopDir = path.join(os.homedir(), '.local', 'share', 'applications');
  const filePath = path.join(desktopDir, `${id}.desktop`);

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const app = parseDesktopFile(content);
    if (app) {
      app.id = id;
      app.filename = `${id}.desktop`;
    }
    return app;
  } catch (error) {
    return null;
  }
});

// Get ignore patterns
ipcMain.handle('get-ignore-patterns', () => {
  loadConfig();
  return config.ignorePatterns;
});

// Add ignore pattern
ipcMain.handle('add-ignore-pattern', async (event, { pattern }) => {
  loadConfig();
  if (!config.ignorePatterns.includes(pattern)) {
    config.ignorePatterns.push(pattern);
    saveConfig();
  }
  return config.ignorePatterns;
});

// Remove ignore pattern
ipcMain.handle('remove-ignore-pattern', async (event, { pattern }) => {
  loadConfig();
  config.ignorePatterns = config.ignorePatterns.filter(p => p !== pattern);
  saveConfig();
  return config.ignorePatterns;
});
