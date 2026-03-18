/// <reference types="vite/client" />

interface DesktopTrackerBridge {
  onIdleThresholdReached: (listener: (payload: {
    idleSeconds: number;
    thresholdSeconds: number;
    detectedAt: string;
  }) => void) => (() => void);
  captureScreenshot: () => Promise<string | null>;
  getSystemIdleSeconds: () => Promise<number>;
  getActiveWindowContext: () => Promise<{
    app: string | null;
    title: string | null;
    url: string | null;
  } | null>;
  revealWindow: () => Promise<boolean>;
  restoreWindow: () => Promise<void>;
  setTrackingState: (active: boolean, idleThresholdSeconds?: number) => Promise<{
    active: boolean;
    idleThresholdSeconds: number;
  }>;
  showNotification: (title: string, body: string) => Promise<void>;
}

interface AppRuntimeConfig {
  VITE_API_URL?: string;
  VITE_WEB_APP_URL?: string;
  VITE_DESKTOP_DOWNLOAD_URL?: string;
  VITE_DESKTOP_DOWNLOAD_LABEL?: string;
}

interface Window {
  desktopTracker?: DesktopTrackerBridge;
  __APP_CONFIG__?: AppRuntimeConfig;
}
