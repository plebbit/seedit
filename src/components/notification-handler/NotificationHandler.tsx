import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useNotifications } from '@plebbit/plebbit-react-hooks';
import useContentOptionsStore from '../../stores/use-content-options-store';
import { showLocalNotification } from '../../lib/push';

/**
 * This component handles listening for new notifications from the useNotifications hook
 * and triggering the platform-specific local notification display.
 * It doesn't render anything itself, but runs its logic via useEffect.
 */
export const NotificationHandler = () => {
  const { enableLocalNotifications } = useContentOptionsStore();
  const { notifications } = useNotifications(); // Use real hook
  const location = useLocation();
  const previousNotificationsRef = useRef(notifications); // Use ref based on real hook

  useEffect(() => {
    // Only proceed if notifications are enabled in settings
    if (!enableLocalNotifications) {
      return;
    }

    // Check for new notifications compared to the previous state
    const previousCids = new Set(previousNotificationsRef.current?.map((n) => n.cid) || []);
    const newNotifications = notifications?.filter((n) => !previousCids.has(n.cid)) || [];

    newNotifications.forEach((notification) => {
      // Basic check: don't notify if the user is already on the inbox page
      if (location.pathname.startsWith('/inbox')) {
        console.log('[NotificationHandler] Skipping notification, user is in inbox.', notification.cid);
        return;
      }

      // Construct the notification payload
      // TODO: Enhance title/body/URL based on notification type (reply, mention, etc.)
      const payload = {
        title: 'New Notification', // Generic title for now
        body: notification.text || 'You have a new notification.', // Use comment text or generic body
        url: `/p/${notification.subplebbitAddress}/c/${notification.cid}`, // Link directly to the comment
      };

      console.log('[NotificationHandler] Triggering notification:', payload);
      // Show the notification
      showLocalNotification(payload);
    });

    // Update the reference for the next comparison
    previousNotificationsRef.current = notifications;

    // Rerun when notifications, setting, or location changes
  }, [notifications, enableLocalNotifications, location.pathname]);

  return null; // This component doesn't render anything
};

// Optional: Default export if preferred
// export default NotificationHandler;
