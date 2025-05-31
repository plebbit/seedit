import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAccount, useNotifications } from '@plebbit/plebbit-react-hooks';
import useContentOptionsStore from '../../stores/use-content-options-store';
import { showLocalNotification } from '../../lib/push';

/**
 * This component handles listening for new notifications from the useNotifications hook
 * and triggering the platform-specific local notification display.
 * It doesn't render anything itself, but runs its logic via useEffect.
 */
const NotificationHandler = () => {
  const { enableLocalNotifications } = useContentOptionsStore();
  const { notifications } = useNotifications();

  const account = useAccount();
  const { unreadNotificationCount } = account || {};
  console.log(account, unreadNotificationCount);

  const location = useLocation();
  const previousNotificationsRef = useRef(notifications);

  useEffect(() => {
    // Only proceed if notifications are enabled in settings
    if (!enableLocalNotifications) {
      return;
    }

    // Check for new notifications compared to the previous state
    const previousCids = new Set(previousNotificationsRef.current?.map((n) => n.cid) || []);
    const newNotifications = notifications?.filter((n) => !previousCids.has(n.cid)) || [];

    newNotifications.forEach((notification) => {
      if (location.pathname.startsWith('/inbox')) {
        return;
      }

      // useNotifications only supports replies at the moment
      const payload = {
        id: notification.timestamp,
        icon: '/icon.png',
        title: `You received a reply`,
        body: `u/${notification.author.shortAddress} replied to your post in p/${notification.shortSubplebbitAddress}${
          notification.content ? `: ${notification.content.slice(0, 100).trim()}` : notification.link ? `: ${notification.link.slice(0, 100).trim()}` : ''
        }...`,
        url: `/#/p/${notification.subplebbitAddress}/c/${notification.cid}`,
      };

      showLocalNotification(payload);
    });

    // Update the reference for the next comparison
    previousNotificationsRef.current = notifications;

    // Rerun when notifications, setting, or location changes
  }, [notifications, enableLocalNotifications, location.pathname]);

  return null; // This component doesn't render anything
};

export default NotificationHandler;
