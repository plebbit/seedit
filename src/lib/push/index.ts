import { Capacitor } from '@capacitor/core';
import type { LocalNotification } from './common';
import { requestWebNotificationPermission, showWebLocalNotification } from './web';
import { requestNativeNotificationPermission, showNativeLocalNotification, initializeNativeNotificationListeners } from './native';
import { requestElectronNotificationPermission, showElectronLocalNotification } from './electron';

// --- Platform Detection ---

const isElectron = typeof window.seeditIpc?.send === 'function';
const isNativePlatform = Capacitor.isNativePlatform();
const isWebPlatform = !isNativePlatform && !isElectron;

let notificationIdCounter = Date.now(); // Simple counter for unique IDs

// --- Initialization ---

/**
 * Initializes platform-specific notification listeners (currently only needed for Capacitor).
 * Should be called once when the app starts.
 */
export function initializeNotificationSystem(): void {
  if (isNativePlatform) {
    initializeNativeNotificationListeners();
  }
  console.log('Notification system initialized for platform:', isNativePlatform ? 'Native' : isElectron ? 'Electron' : 'Web');
}

// --- Permissions ---

/**
 * Requests permission to show notifications based on the current platform.
 * Must be called from a user interaction context (e.g., button click).
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (isNativePlatform) {
    return requestNativeNotificationPermission();
  }
  if (isElectron) {
    // Permission is implicit, just check if IPC is working
    return requestElectronNotificationPermission();
  }
  if (isWebPlatform) {
    return requestWebNotificationPermission();
  }
  console.warn('Notification permission request: Unknown platform.');
  return false;
}

// --- Showing Notifications ---

/**
 * Shows a local notification using the appropriate platform API.
 */
export async function showLocalNotification(notificationData: Omit<LocalNotification, 'id'>): Promise<void> {
  // Generate a unique ID required by Capacitor
  const id = notificationIdCounter++;
  const platformNotification = { ...notificationData, id };

  console.log('Attempting to show notification:', platformNotification);

  if (isNativePlatform) {
    return showNativeLocalNotification(platformNotification);
  }
  if (isElectron) {
    // Electron doesn't need the ID, but doesn't hurt to pass it
    return showElectronLocalNotification(platformNotification);
  }
  if (isWebPlatform) {
    // Service Worker doesn't need the ID, but doesn't hurt to pass it
    return showWebLocalNotification(platformNotification);
  }

  console.warn('Show notification: Unknown platform.');
}
