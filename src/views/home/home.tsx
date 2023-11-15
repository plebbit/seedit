import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Virtuoso, VirtuosoHandle, StateSnapshot } from 'react-virtuoso';
import { useFeed } from '@plebbit/plebbit-react-hooks';
import { Trans, useTranslation } from 'react-i18next';
import styles from './home.module.css';
import LoadingEllipsis from '../../components/loading-ellipsis';
import Post from '../../components/post';
import useDefaultSubplebbitAddresses from '../../hooks/use-default-subplebbit-addresses';
import useFeedStateString from '../../hooks/use-feed-state-string';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

const NoPosts = () => 'no posts';

const Home = () => {
  const subplebbitAddresses = useDefaultSubplebbitAddresses();
  const sortType = useParams<{ sortType: string }>().sortType || 'hot';
  const { feed, hasMore, loadMore } = useFeed({ subplebbitAddresses, sortType });
  const { t } = useTranslation();
  let loadingStateString = useFeedStateString(subplebbitAddresses) || t('loading');

  const loadingString = (
    <div className={styles.stateString}>
      {subplebbitAddresses.length === 0 ? (
        <div>
          <Trans
            i18nKey='no_communities_found'
            components={[<a href='https://github.com/plebbit/temporary-default-subplebbits'>https://github.com/plebbit/temporary-default-subplebbits</a>]}
          />
          <br />
          {t('connect_community_notice')}
        </div>
      ) : (
        <LoadingEllipsis string={loadingStateString} />
      )}
    </div>
  );

  useEffect(() => {
    document.title = `${t('home')} - seedit`;
  }, [t]);

  let Footer;
  if (feed?.length === 0) {
    Footer = NoPosts;
  }
  if (hasMore || subplebbitAddresses.length === 0) {
    Footer = () => loadingString;
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
