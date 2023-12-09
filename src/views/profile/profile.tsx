import { useEffect, useRef } from 'react';
import { StateSnapshot, Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { useAccount, useAccountComments } from '@plebbit/plebbit-react-hooks';
import styles from './profile.module.css';
import Post from '../../components/post';
import AuthorSidebar from '../../components/author-sidebar';
import { useParams } from 'react-router-dom';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

const Profile = () => {
  const account = useAccount();
  const params = useParams();
  let { accountComments } = useAccountComments();
  accountComments = [...accountComments].reverse();

  const virtuosoRef = useRef<VirtuosoHandle | null>(null);

  useEffect(() => {
    const setLastVirtuosoState = () =>
      virtuosoRef.current?.getState((snapshot: StateSnapshot) => {
        if (snapshot?.ranges?.length) {
          lastVirtuosoStates[account?.shortAddress + params.sortType] = snapshot;
        }
      });
    window.addEventListener('scroll', setLastVirtuosoState);
    return () => window.removeEventListener('scroll', setLastVirtuosoState);
  }, []);

  const lastVirtuosoState = lastVirtuosoStates?.[account?.shortAddress + params.sortType];

  return (
    <div className={styles.content}>
      <div className={styles.sidebar}>
        <AuthorSidebar />
      </div>
      {account && !accountComments.length ? (
        'no posts'
      ) : (
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
      )}
    </div>
  );
};

export default Profile;
