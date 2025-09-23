const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = process.env.ELECTRON_IS_DEV === 'true';
const Store = require('electron-store');
const keytar = require('keytar');
const { exec, spawn } = require('child_process');
const fs = require('fs').promises;
const os = require('os');

// Initialize secure store for preferences
const store = new Store();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers

// API Key Management
ipcMain.handle('save-api-key', async (event, apiKey) => {
  try {
    await keytar.setPassword('glm-ai-config', 'api-key', apiKey);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-api-key', async () => {
  try {
    const apiKey = await keytar.getPassword('glm-ai-config', 'api-key');
    return { success: true, apiKey };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-api-key', async () => {
  try {
    await keytar.deletePassword('glm-ai-config', 'api-key');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Directory Selection
ipcMain.handle('select-directory', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Select Repository Directory'
    });

    if (!result.canceled && result.filePaths.length > 0) {
      return { success: true, path: result.filePaths[0] };
    }
    return { success: false, error: 'No directory selected' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Environment Variables (Windows)
ipcMain.handle('set-env-vars', async (event, vars) => {
  try {
    const commands = [];
    for (const [key, value] of Object.entries(vars)) {
      commands.push(`[Environment]::SetEnvironmentVariable('${key}', '${value}', 'User')`);
    }

    const psCommand = commands.join('; ');

    return new Promise((resolve) => {
      exec(`powershell -Command "${psCommand}"`, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: error.message });
        } else {
          resolve({ success: true });
        }
      });
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-env-vars', async (event, varNames) => {
  try {
    const commands = varNames.map(name => `[Environment]::GetEnvironmentVariable('${name}', 'User')`).join('; ');

    return new Promise((resolve) => {
      exec(`powershell -Command "${commands}"`, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: error.message });
        } else {
          const values = stdout.trim().split('\n').map(v => v.trim());
          const result = {};
          varNames.forEach((name, index) => {
            const value = values[index];
            // Consider empty strings, undefined, or whitespace as null
            result[name] = (value && value !== '' && value !== 'null' && value !== 'undefined') ? value : null;
          });
          resolve({ success: true, values: result });
        }
      });
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('remove-env-vars', async (event, varNames) => {
  try {
    const commands = varNames.map(name =>
      `[Environment]::SetEnvironmentVariable('${name}', $null, 'User')`
    );

    const psCommand = commands.join('; ');

    return new Promise((resolve) => {
      exec(`powershell -Command "${psCommand}"`, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: error.message });
        } else {
          resolve({ success: true });
        }
      });
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// File Operations
ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    await fs.writeFile(filePath, content, 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file-exists', async (event, filePath) => {
  try {
    await fs.access(filePath);
    return { success: true, exists: true };
  } catch (error) {
    return { success: true, exists: false };
  }
});

ipcMain.handle('create-directory', async (event, dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Configuration Status Storage
ipcMain.handle('save-config', async (event, key, value) => {
  try {
    store.set(key, value);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-config', async (event, key) => {
  try {
    const value = store.get(key);
    return { success: true, value };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Execute Commands
ipcMain.handle('execute-command', async (event, command, options = {}) => {
  try {
    return new Promise((resolve) => {
      exec(command, options, (error, stdout, stderr) => {
        resolve({
          success: !error,
          stdout: stdout || '',
          stderr: stderr || '',
          error: error ? error.message : null
        });
      });
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get System Info
ipcMain.handle('get-system-info', async () => {
  try {
    return {
      success: true,
      info: {
        platform: os.platform(),
        arch: os.arch(),
        homedir: os.homedir(),
        username: os.userInfo().username,
        versions: {
          electron: process.versions.electron,
          node: process.versions.node,
          chrome: process.versions.chrome,
          v8: process.versions.v8
        }
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});