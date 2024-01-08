declare global {
  interface Electron {
    isElectron: boolean;
  }

  interface Window {
    STICKY_MENU_SCROLL_LISTENER: boolean;
    electron: Electron;
  }
}

export {};
