const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopTracker', {
  captureScreenshot: () => ipcRenderer.invoke('desktop:capture-screenshot'),
  getSystemIdleSeconds: () => ipcRenderer.invoke('desktop:get-system-idle-seconds'),
  getActiveWindowContext: () => ipcRenderer.invoke('desktop:get-active-window-context'),
  revealWindow: () => ipcRenderer.invoke('desktop:reveal-window'),
  restoreWindow: () => ipcRenderer.invoke('desktop:restore-window'),
  setTrackingState: (active, idleThresholdSeconds) => ipcRenderer.invoke('desktop:set-tracking-state', { active, idleThresholdSeconds }),
  onIdleThresholdReached: (listener) => {
    if (typeof listener !== 'function') {
      return () => {};
    }

    const handler = (_event, payload) => listener(payload);
    ipcRenderer.on('desktop:idle-threshold-reached', handler);

    return () => {
      ipcRenderer.removeListener('desktop:idle-threshold-reached', handler);
    };
  },
  showNotification: (title, body) => ipcRenderer.invoke('desktop:show-notification', { title, body }),
});
