const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // API Key Management
  saveApiKey: (apiKey) => ipcRenderer.invoke('save-api-key', apiKey),
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  deleteApiKey: () => ipcRenderer.invoke('delete-api-key'),

  // Directory Operations
  selectDirectory: () => ipcRenderer.invoke('select-directory'),

  // Environment Variables
  setEnvVars: (vars) => ipcRenderer.invoke('set-env-vars', vars),
  getEnvVars: (varNames) => ipcRenderer.invoke('get-env-vars', varNames),
  removeEnvVars: (varNames) => ipcRenderer.invoke('remove-env-vars', varNames),

  // File Operations
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  fileExists: (filePath) => ipcRenderer.invoke('file-exists', filePath),
  createDirectory: (dirPath) => ipcRenderer.invoke('create-directory', dirPath),

  // Configuration Storage
  saveConfig: (key, value) => ipcRenderer.invoke('save-config', key, value),
  getConfig: (key) => ipcRenderer.invoke('get-config', key),

  // Command Execution
  executeCommand: (command, options) => ipcRenderer.invoke('execute-command', command, options),

  // System Information
  getSystemInfo: () => ipcRenderer.invoke('get-system-info')
});