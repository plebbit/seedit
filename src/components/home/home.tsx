import { FC, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Virtuoso, VirtuosoHandle, StateSnapshot } from 'react-virtuoso';
import { useFeed } from '@plebbit/plebbit-react-hooks';
import useDefaultSubplebbits from '../../hooks/use-default-subplebbits';
import Header from '../header';
import TopBar from '../topbar';
import styles from './home.module.css';
import FeedPost from '../feed-post';

type SnapshotType = StateSnapshot;

const lastVirtuosoStates: { [key: string]: SnapshotType } = {};

const NoPosts = () => 'no posts';

const Home: FC = () => {
  const subplebbitAddresses = useDefaultSubplebbits();
  const sortType = useParams<{ sortType: string }>().sortType || 'hot';
  const { feed, hasMore, loadMore } = useFeed({ subplebbitAddresses, sortType });
  const loadingStateString = 'loading...';

  let Footer;
  if (feed?.length === 0) {
    Footer = NoPosts;
  }
  if (hasMore || subplebbitAddresses.length === 0) {
    Footer = () => loadingStateString;
  }

  const virtuosoRef = useRef<VirtuosoHandle | null>(null);

  useEffect(() => {
    const setLastVirtuosoState = () => {
      virtuosoRef.current?.getState((snapshot: SnapshotType) => {
        if (snapshot?.ranges?.length) {
          lastVirtuosoStates[sortType] = snapshot;
        }
      });
    };
    window.addEventListener('scroll', setLastVirtuosoState);
    return () => window.removeEventListener('scroll', setLastVirtuosoState);
  }, [sortType]);

  const lastVirtuosoState = lastVirtuosoStates[sortType];

  return (
    <div>
      <TopBar />
      <Header />
      <div className={styles.content}>
        <Virtuoso
          increaseViewportBy={{ bottom: 600, top: 600 }}
          totalCount={feed?.length || 0}
          data={feed}
          itemContent={(index, post) => <FeedPost index={index} post={post} />}
          useWindowScroll={true}
          components={{ Footer }}
          endReached={loadMore}
          ref={virtuosoRef}
          restoreStateFrom={lastVirtuosoState}
          initialScrollTop={lastVirtuosoState?.scrollTop}
        />
      </div>
    </div>
  );
};

export default Home;
