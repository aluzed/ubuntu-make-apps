const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getUsername: () => ipcRenderer.invoke('get-username'),
  getApplications: () => ipcRenderer.invoke('get-applications'),
  getApplication: (id) => ipcRenderer.invoke('get-application', { id }),
  selectAppImage: () => ipcRenderer.invoke('select-appimage'),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  selectIcon: () => ipcRenderer.invoke('select-icon'),
  processAppImage: (sourcePath, action, appName) =>
    ipcRenderer.invoke('process-appimage', { sourcePath, action, appName }),
  processIcon: (sourcePath, appName) =>
    ipcRenderer.invoke('process-icon', { sourcePath, appName }),
  saveDesktopFile: (data) => ipcRenderer.invoke('save-desktop-file', data),
  deleteApplication: (id) => ipcRenderer.invoke('delete-application', { id }),
  getIgnorePatterns: () => ipcRenderer.invoke('get-ignore-patterns'),
  addIgnorePattern: (pattern) => ipcRenderer.invoke('add-ignore-pattern', { pattern }),
  removeIgnorePattern: (pattern) => ipcRenderer.invoke('remove-ignore-pattern', { pattern })
});
