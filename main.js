const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#000000',
    titleBarStyle: 'hiddenInset',
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
                                 webSecurity: true
    },
    icon: path.join(__dirname, 'icon.png')
  });

  // Load diff.html instead of index.html
  mainWindow.loadFile('diff.html');

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ── IPC Handlers ──────────────────────────────────────────────────────────────

// Window Controls
ipcMain.handle('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) mainWindow.close();
});

// File Operations for Diff Manager
ipcMain.handle('open-file', async () => {
  const { filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Open Code File',
    filters: [{ name: 'Code Files', extensions: ['js', 'ts', 'py', 'html', 'css', 'txt', 'json'] }],
    properties: ['openFile']
  });
  if (filePaths && filePaths[0]) {
    try {
      const data = fs.readFileSync(filePaths[0], 'utf8');
      return { success: true, data, path: filePaths[0] };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  return { success: false };
});

ipcMain.handle('save-file', async (event, { content, defaultPath }) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Patched File',
    defaultPath: defaultPath || 'patched-file.txt',
      filters: [{ name: 'Code Files', extensions: ['txt', 'js', 'py', 'html'] }]
  });
  if (filePath) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      return { success: true, path: filePath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  return { success: false };
});
