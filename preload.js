const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window Controls
  minimize: () => ipcRenderer.invoke('minimize-window'),
                                maximize: () => ipcRenderer.invoke('maximize-window'),
                                close: () => ipcRenderer.invoke('close-window'),

                                // File Operations
                                openFile: () => ipcRenderer.invoke('open-file'),
                                saveFile: (content, defaultPath) => ipcRenderer.invoke('save-file', { content, defaultPath }),

                                // Utils
                                platform: process.platform
});
