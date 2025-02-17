import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Virtuoso, VirtuosoHandle, StateSnapshot } from 'react-virtuoso';
import { useFeed } from '@plebbit/plebbit-react-hooks';
import { useDefaultSubplebbitAddresses } from '../../hooks/use-default-subplebbits';
import useTimeFilter from '../../hooks/use-time-filter';
import FeedFooter from '../../components/feed-footer';
import Post from '../../components/post';
import Sidebar from '../../components/sidebar';
import styles from '../home/home.module.css';
import _ from 'lodash';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

const All = () => {
  const subplebbitAddresses = useDefaultSubplebbitAddresses();
  const params = useParams<{ sortType?: string; timeFilterName?: string }>();
  const sortType = params?.sortType || 'hot';
  const { timeFilterName, timeFilterSeconds } = useTimeFilter();
  const { feed, hasMore, loadMore, reset, subplebbitAddressesWithNewerPosts } = useFeed({ subplebbitAddresses, sortType, newerThan: timeFilterSeconds });
  const { t } = useTranslation();

  // suggest the user to change time filter if there aren't enough posts
  const { feed: weeklyFeed } = useFeed({ subplebbitAddresses, sortType, newerThan: 60 * 60 * 24 * 7 });
  const { feed: monthlyFeed } = useFeed({ subplebbitAddresses, sortType, newerThan: 60 * 60 * 24 * 30 });

  const currentTimeFilterName = params.timeFilterName || timeFilterName || 'all';

  const documentTitle = _.capitalize(t('all')) + ' - Seedit';
  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

  const virtuosoRef = useRef<VirtuosoHandle | null>(null);

  useEffect(() => {
    const setLastVirtuosoState = () => {
      virtuosoRef.current?.getState((snapshot: StateSnapshot) => {
        if (snapshot?.ranges?.length) {
          lastVirtuosoStates[sortType + timeFilterName + 'all'] = snapshot;
        }
      });
    };
    window.addEventListener('scroll', setLastVirtuosoState);
    return () => window.removeEventListener('scroll', setLastVirtuosoState);
  }, [sortType, timeFilterName]);

  const lastVirtuosoState = lastVirtuosoStates?.[sortType + timeFilterName + 'all'];

  const footerProps = {
    feedLength: feed?.length,
    hasFeedLoaded: !!feed,
    hasMore,
    subplebbitAddresses,
    subplebbitAddressesWithNewerPosts,
    weeklyFeedLength: weeklyFeed.length,
    monthlyFeedLength: monthlyFeed.length,
    currentTimeFilterName,
    reset,
  };

  return (
    <div>
      <div className={styles.content}>
        <div className={`${styles.sidebar}`}>
          <Sidebar />
        </div>
        <Virtuoso
          increaseViewportBy={{ bottom: 1200, top: 600 }}
          totalCount={feed?.length || 0}
          data={feed}
          itemContent={(index, post) => <Post index={index} post={post} />}
          useWindowScroll={true}
          components={{ Footer: () => <FeedFooter {...footerProps} /> }}
          endReached={loadMore}
          ref={virtuosoRef}
          restoreStateFrom={lastVirtuosoState}
          initialScrollTop={lastVirtuosoState?.scrollTop}
        />
      </div>
    </div>
  );
};

export default All;
