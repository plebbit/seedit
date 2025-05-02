declare global {
  interface Window {
    STICKY_MENU_SCROLL_LISTENER: boolean;
    isElectron: boolean;
  }
}

declare global {
  interface Window {
    electronApi?: {
      isElectron: boolean;
      getNotificationStatus: () => Promise<'granted' | 'denied' | 'not-determined'>;
      getPlatform: () => Promise<NodeJS.Platform>;
      testNotification: () => Promise<{ success: boolean; reason?: string }>;
    };
  }
}

export {};
