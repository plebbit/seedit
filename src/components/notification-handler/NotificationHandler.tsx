import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useNotifications } from '@plebbit/plebbit-react-hooks';
import useContentOptionsStore from '../../stores/use-content-options-store';
import { showLocalNotification } from '../../lib/push';

/**
 * Listens for new notifications from useNotifications and triggers platform-specific
 * local notification display if enabled in settings.
 * Does not render any UI itself.
 */
export const NotificationHandler = () => {
  const { enableLocalNotifications } = useContentOptionsStore();
  const { notifications } = useNotifications();
  const location = useLocation();
  const previousNotificationsRef = useRef(notifications);

  useEffect(() => {
    if (!enableLocalNotifications) {
      return;
    }

    const previousCids = new Set(previousNotificationsRef.current?.map((n) => n.cid) || []);
    const newNotifications = notifications?.filter((n) => !previousCids.has(n.cid)) || [];

    newNotifications.forEach((notification) => {
      // Don't notify if the user is already viewing the inbox
      if (location.pathname.startsWith('/inbox')) {
        console.log('[NotificationHandler] Skipping notification, user is in inbox.', notification.cid);
        return;
      }

      // TODO: Enhance title/body/URL based on notification type (reply vs mention etc.)
      const payload = {
        title: 'New Notification', // Generic title for now
        body: notification.text || 'You have a new notification.', // Fallback body
        url: `/p/${notification.subplebbitAddress}/c/${notification.cid}`, // Link to comment
      };

      console.log('[NotificationHandler] Triggering notification:', payload);
      showLocalNotification(payload);
    });

    previousNotificationsRef.current = notifications;

    // Dependencies ensure this runs when relevant state changes,
    // including location to re-evaluate the inbox check.
  }, [notifications, enableLocalNotifications, location.pathname]);

  return null;
};

// Optional: Default export if preferred
// export default NotificationHandler;
