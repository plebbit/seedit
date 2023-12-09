import { useEffect, useRef } from 'react';
import { StateSnapshot, Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { useAccount, useNotifications } from '@plebbit/plebbit-react-hooks';
import styles from './inbox.module.css';
import Post from '../../components/post';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

const Inbox = () => {
  const account = useAccount();
  const { unreadNotificationCount } = account || {};
  const { notifications, markAsRead } = useNotifications();

  const virtuosoRef = useRef<VirtuosoHandle | null>(null);

  useEffect(() => {
    const setLastVirtuosoState = () =>
      virtuosoRef.current?.getState((snapshot) => {
        // TODO: not sure if checking for empty snapshot.ranges works for all scenarios
        if (snapshot?.ranges?.length) {
          lastVirtuosoStates[unreadNotificationCount] = snapshot;
        }
      });
    window.addEventListener('scroll', setLastVirtuosoState);
    // clean listener on unmount
    return () => window.removeEventListener('scroll', setLastVirtuosoState);
  }, [unreadNotificationCount]);

  const lastVirtuosoState = lastVirtuosoStates?.[unreadNotificationCount];

  if (account && !notifications.length) {
    return 'empty';
  }

  return (
    <div>
      <button onClick={markAsRead} disabled={!unreadNotificationCount} className={styles.markAsReadButton}>
        mark as read
      </button>
      <Virtuoso
        increaseViewportBy={{ bottom: 1200, top: 600 }}
        totalCount={notifications?.length || 0}
        data={notifications}
        itemContent={(index, notification) => (
          <div className={notification.markedAsRead === false ? styles.unreadNotification : styles.readNotification}>
            <Post index={index} post={notification} />
          </div>
        )}
        useWindowScroll={true}
        ref={virtuosoRef}
        restoreStateFrom={lastVirtuosoState}
        initialScrollTop={lastVirtuosoState?.scrollTop}
      />
    </div>
  );
};

export default Inbox;
