const { app, BrowserWindow, Notification, desktopCapturer, ipcMain, powerMonitor, shell } = require('electron');
const path = require('path');
let activeWin = null;
let mainWindow = null;
let trackingActive = false;
let trackingIdleThresholdSeconds = 10;
let idleRevealTriggered = false;
let idleWatchInterval = null;

try {
  activeWin = require('active-win');
} catch {
  activeWin = null;
}

const DEFAULT_APP_URL = 'http://localhost:5173';
const APP_URL = process.env.APP_URL || DEFAULT_APP_URL;
const APP_ICON = process.platform === 'win32'
  ? path.join(__dirname, 'assets', 'icon.ico')
  : path.join(__dirname, 'assets', 'icon.png');
const APP_ID = 'com.carevance.tracker';

app.setName('CareVance Tracker');

if (process.platform === 'win32') {
  app.setAppUserModelId(APP_ID);
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 1024,
    minHeight: 720,
    icon: APP_ICON,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false,
    },
  });

  mainWindow.loadURL(APP_URL);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

const revealMainWindow = () => {
  const targetWindow = mainWindow && !mainWindow.isDestroyed()
    ? mainWindow
    : BrowserWindow.getAllWindows()[0];

  if (!targetWindow) {
    return false;
  }

  const prepareWindow = () => {
    if (targetWindow.isDestroyed()) {
      return;
    }

    if (targetWindow.isMinimized()) {
      targetWindow.restore();
    }

    if (targetWindow.isFullScreen()) {
      targetWindow.setFullScreen(false);
    }

    if (!targetWindow.isVisible()) {
      targetWindow.show();
    }

    if (!targetWindow.isMaximized()) {
      targetWindow.maximize();
    }

    targetWindow.setSkipTaskbar(false);
    targetWindow.setFocusable(true);
    if (typeof targetWindow.setVisibleOnAllWorkspaces === 'function') {
      targetWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    }
    targetWindow.setAlwaysOnTop(true, 'screen-saver', 1);
    targetWindow.flashFrame(true);
  };

  const bringToFront = () => {
    if (targetWindow.isDestroyed()) {
      return;
    }

    prepareWindow();
    app.focus();
    targetWindow.show();
    if (typeof targetWindow.moveTop === 'function') {
      targetWindow.moveTop();
    }
    targetWindow.focusOnWebView?.();
    targetWindow.focus();
    targetWindow.webContents.focus();
  };

  bringToFront();
  setTimeout(bringToFront, 100);
  setTimeout(bringToFront, 350);
  setTimeout(bringToFront, 900);

  setTimeout(() => {
    if (!targetWindow.isDestroyed()) {
      targetWindow.setAlwaysOnTop(false);
      targetWindow.flashFrame(false);
      if (typeof targetWindow.setVisibleOnAllWorkspaces === 'function') {
        targetWindow.setVisibleOnAllWorkspaces(false, { visibleOnFullScreen: true });
      }
    }
  }, 4000);

  return true;
};

const emitIdleThresholdReached = (payload) => {
  BrowserWindow.getAllWindows().forEach((windowInstance) => {
    if (windowInstance.isDestroyed()) {
      return;
    }

    windowInstance.webContents.send('desktop:idle-threshold-reached', payload);
  });
};

const syncIdleRevealState = () => {
  if (!trackingActive) {
    idleRevealTriggered = false;
    return;
  }

  const idleSeconds = powerMonitor.getSystemIdleTime();
  if (idleSeconds < trackingIdleThresholdSeconds) {
    idleRevealTriggered = false;
    return;
  }

  if (idleRevealTriggered) {
    return;
  }

  const targetWindow = mainWindow && !mainWindow.isDestroyed()
    ? mainWindow
    : BrowserWindow.getAllWindows()[0];
  const shouldReveal = targetWindow
    ? targetWindow.isMinimized() || !targetWindow.isVisible() || !targetWindow.isFocused()
    : false;

  if (shouldReveal) {
    revealMainWindow();
  }

  emitIdleThresholdReached({
    idleSeconds,
    thresholdSeconds: trackingIdleThresholdSeconds,
    detectedAt: new Date().toISOString(),
  });
  idleRevealTriggered = true;
};

ipcMain.handle('desktop:capture-screenshot', async () => {
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width: 1920, height: 1080 },
  });
  if (!sources.length) return null;
  return sources[0].thumbnail.toDataURL();
});

ipcMain.handle('desktop:get-system-idle-seconds', async () => {
  return powerMonitor.getSystemIdleTime();
});

ipcMain.handle('desktop:get-active-window-context', async () => {
  if (!activeWin) {
    return null;
  }

  try {
    const context = await activeWin();
    if (!context) return null;

    return {
      app: context.owner?.name || null,
      title: context.title || null,
      url: context.url || null,
    };
  } catch {
    return null;
  }
});

ipcMain.handle('desktop:restore-window', async () => {
  revealMainWindow();
});

ipcMain.handle('desktop:reveal-window', async () => {
  return revealMainWindow();
});

ipcMain.handle('desktop:set-tracking-state', async (_event, payload = {}) => {
  trackingActive = Boolean(payload.active);
  if (typeof payload.idleThresholdSeconds === 'number' && payload.idleThresholdSeconds > 0) {
    trackingIdleThresholdSeconds = payload.idleThresholdSeconds;
  }

  if (!trackingActive) {
    idleRevealTriggered = false;
  }

  return {
    active: trackingActive,
    idleThresholdSeconds: trackingIdleThresholdSeconds,
  };
});

ipcMain.handle('desktop:show-notification', async (_event, payload = {}) => {
  const title = typeof payload.title === 'string' && payload.title.trim()
    ? payload.title.trim()
    : 'CareVance Tracker';
  const body = typeof payload.body === 'string' && payload.body.trim()
    ? payload.body.trim()
    : 'Your timer has stopped. Start it again to continue tracking.';

  if (Notification.isSupported()) {
    const notification = new Notification({
      title,
      body,
      icon: APP_ICON,
      silent: false,
    });

    notification.on('click', () => {
      revealMainWindow();
    });

    notification.show();
    return;
  }

  revealMainWindow();
});

app.whenReady().then(() => {
  createWindow();
  idleWatchInterval = setInterval(syncIdleRevealState, 1000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (idleWatchInterval) {
    clearInterval(idleWatchInterval);
    idleWatchInterval = null;
  }
});
