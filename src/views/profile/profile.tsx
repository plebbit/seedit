import { useEffect, useRef } from 'react';
import { StateSnapshot, Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { useAccount, useAccountComments } from '@plebbit/plebbit-react-hooks';
import styles from './profile.module.css';
import Post from '../../components/post';
import ProfileSidebar from './profile-sidebar';

let lastVirtuosoState: StateSnapshot | undefined;

const Profile = () => {
  const account = useAccount();
  let { accountComments } = useAccountComments();
  accountComments = [...accountComments].reverse();

  const virtuosoRef = useRef<VirtuosoHandle | null>(null);

  useEffect(() => {
    const setLastVirtuosoState = () =>
      virtuosoRef.current?.getState((snapshot: StateSnapshot) => {
        if (snapshot?.ranges?.length) {
          lastVirtuosoState = snapshot;
        }
      });
    window.addEventListener('scroll', setLastVirtuosoState);
    return () => window.removeEventListener('scroll', setLastVirtuosoState);
  }, []);

  if (account && !accountComments.length) {
    return 'no posts';
  }

  return (
    <div className={styles.content}>
      <div className={styles.sidebar}>
        <ProfileSidebar />
      </div>
      <Virtuoso
        increaseViewportBy={{ bottom: 1200, top: 600 }}
        totalCount={accountComments?.length || 0}
        data={accountComments}
        itemContent={(index, post) => <Post index={index} post={post} />}
        useWindowScroll={true}
        ref={virtuosoRef}
        restoreStateFrom={lastVirtuosoState}
        initialScrollTop={lastVirtuosoState?.scrollTop}
      />
    </div>
  );
};

export default Profile;
