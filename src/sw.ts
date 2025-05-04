/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

// Precache all assets specified in the manifest
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Standard SW lifecycle methods
self.skipWaiting();
clientsClaim();

// Interface for the notification data expected from the main app
interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  url?: string; // URL to open on click
}

// Listen for messages from the client (main app)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const data: NotificationData = event.data.payload;
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || '/android-chrome-192x192.png', // Default icon
        data: { url: data.url }, // Pass URL to click handler
        tag: data.body + '_' + Date.now(), // Make the tag unique by adding a timestamp
      }),
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Close the notification

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const urlToOpen = event.notification.data?.url || '/';

      // Check if a window/tab matching the URL is already open
      for (const client of clientList) {
        // Use endsWith because client.url might have query params
        if (client.url.endsWith(urlToOpen) && 'focus' in client) {
          return client.focus(); // Focus the existing window/tab
        }
      }

      // If no matching window/tab is found, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    }),
  );
});
