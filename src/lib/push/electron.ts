import type { LocalNotification } from './common';

// Define the dedicated Seedit IPC API exposed via preload
declare global {
  interface Window {
    seeditIpc?: {
      send: (channel: string, ...args: any[]) => void;
      // Add invoke/on if needed for seedit-specific IPC
    };
    // Keep existing electron definition if other parts of the app use it
    electron?: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
    };
  }
}

/**
 * Requests permission to display notifications in Electron.
 * On Electron, permission is implicitly granted, but we check if the API exists.
 */
export async function requestElectronNotificationPermission(): Promise<boolean> {
  // Check if the preload script successfully exposed the Seedit IPC API
  const supported = typeof window.seeditIpc?.send === 'function';
  if (!supported) {
    console.warn('Seedit Electron IPC for notifications not available.');
  }
  // We don't need to ask the user for permission like in the browser
  return supported;
}

/**
 * Shows a local notification via Electron IPC using the dedicated Seedit API.
 */
export async function showElectronLocalNotification(notification: Omit<LocalNotification, 'id'>): Promise<void> {
  if (window.seeditIpc?.send) {
    try {
      window.seeditIpc.send('show-notification', notification);
    } catch (error) {
      console.error('Error sending notification via Seedit IPC:', error);
    }
  } else {
    console.warn('Seedit Electron IPC send function not available.');
  }
}
