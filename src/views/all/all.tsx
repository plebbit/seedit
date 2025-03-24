import { useEffect, useRef, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Virtuoso, VirtuosoHandle, StateSnapshot } from 'react-virtuoso';
import { useFeed } from '@plebbit/plebbit-react-hooks';
import { commentMatchesPattern } from '../../lib/utils/pattern-utils';
import useFeedFiltersStore from '../../stores/use-feed-filters-store';
import { useDefaultSubplebbitAddresses } from '../../hooks/use-default-subplebbits';
import useTimeFilter from '../../hooks/use-time-filter';
import FeedFooter from '../../components/feed-footer';
import LoadingEllipsis from '../../components/loading-ellipsis';
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
  const currentTimeFilterName = params.timeFilterName || timeFilterName || '1m';

  const { searchFilter, isSearching } = useFeedFiltersStore();
  const [showNoResults, setShowNoResults] = useState(false);
  const [searchAttemptCompleted, setSearchAttemptCompleted] = useState(false);

  const feedOptions = useMemo(() => {
    const options: any = {
      newerThan: searchFilter ? 0 : timeFilterSeconds,
      sortType,
      subplebbitAddresses,
    };

    if (searchFilter) {
      options.filter = (comment: Comment) => {
        if (!searchFilter.trim()) return true;
        return commentMatchesPattern(comment, searchFilter);
      };
      options.filterKey = `search-filter-${searchFilter}`;
    }

    return options;
  }, [subplebbitAddresses, sortType, timeFilterSeconds, searchFilter]);

  const { feed, hasMore, loadMore, reset, subplebbitAddressesWithNewerPosts } = useFeed(feedOptions);

  useEffect(() => {
    if (isSearching) {
      setSearchAttemptCompleted(false);
      setShowNoResults(false);
    } else if (searchFilter) {
      setSearchAttemptCompleted(true);
    }
  }, [isSearching, searchFilter]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (searchFilter && feed?.length === 0 && searchAttemptCompleted && !showNoResults) {
      timer = setTimeout(() => {
        setShowNoResults(true);
      }, 2000);
    } else if (!searchFilter || feed?.length > 0) {
      setShowNoResults(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchFilter, feed?.length, searchAttemptCompleted, showNoResults]);

  const { t } = useTranslation();

  // suggest the user to change time filter if there aren't enough posts
  const { feed: weeklyFeed } = useFeed({ subplebbitAddresses, sortType, newerThan: 60 * 60 * 24 * 7 });
  const { feed: monthlyFeed } = useFeed({ subplebbitAddresses, sortType, newerThan: 60 * 60 * 24 * 30 });

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
    currentTimeFilterName: searchFilter ? 'all' : currentTimeFilterName,
    reset,
    searchFilter,
    isSearching,
    showNoResults,
  };

  return (
    <div>
      <div className={styles.content}>
        <div className={`${styles.sidebar}`}>
          <Sidebar />
        </div>
        {isSearching ? (
          <div className={styles.feed}>
            <div className={styles.footer}>
              <div className={styles.stateString}>
                <LoadingEllipsis string='searching' />
              </div>
            </div>
          </div>
        ) : showNoResults && searchFilter ? (
          <div className={styles.feed}>
            <div className={styles.footer}>
              <div className={styles.stateString}>
                <span className={styles.noMatchesFound}>No matches found for "{searchFilter}"</span>
                <br />
                <br />
                <div className={styles.morePostsSuggestion}>
                  <span
                    className={styles.link}
                    onClick={() => {
                      useFeedFiltersStore.getState().clearSearchFilter();
                      reset();
                    }}
                  >
                    Clear search
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default All;
