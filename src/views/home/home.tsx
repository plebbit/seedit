import { FC, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Virtuoso, VirtuosoHandle, StateSnapshot } from 'react-virtuoso';
import { useFeed } from '@plebbit/plebbit-react-hooks';
import useDefaultSubplebbitAddresses from '../../hooks/use-default-subplebbit-addresses';
import styles from './home.module.css';
import Post from '../../components/post';
import useFeedStateString from '../../hooks/use-feed-state-string';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

const NoPosts = () => 'no posts';

const Home: FC = () => {
  const subplebbitAddresses = useDefaultSubplebbitAddresses();
  const sortType = useParams<{ sortType: string }>().sortType || 'hot';
  const { feed, hasMore, loadMore } = useFeed({ subplebbitAddresses, sortType });
  const loadingStateString = useFeedStateString(subplebbitAddresses) || 'loading...';

  useEffect(() => {
    document.title = `seedit`;
  }, []);

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
      virtuosoRef.current?.getState((snapshot: StateSnapshot) => {
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
      <div className={styles.content}>
        <Virtuoso
          increaseViewportBy={{ bottom: 1200, top: 600 }}
          totalCount={feed?.length || 0}
          data={feed}
          itemContent={(index, post) => <Post index={index} post={post} />}
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
