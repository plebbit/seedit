import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Virtuoso, VirtuosoHandle, StateSnapshot } from 'react-virtuoso';
import { useFeed, Comment } from '@plebbit/plebbit-react-hooks';
import { commentMatchesPattern } from '../../lib/utils/pattern-utils';
import useFeedFiltersStore from '../../stores/use-feed-filters-store';
import { useDefaultSubplebbitAddresses } from '../../hooks/use-default-subplebbits';
import useTimeFilter from '../../hooks/use-time-filter';
import FeedFooter from '../../components/feed-footer';
import LoadingEllipsis from '../../components/loading-ellipsis';
import Post from '../../components/post';
import Sidebar from '../../components/sidebar';
import styles from '../home/home.module.css';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

const Domain = () => {
  const subplebbitAddresses = useDefaultSubplebbitAddresses();
  const params = useParams<{ domain?: string; sortType?: string; timeFilterName?: string }>();
  const domain = params?.domain;
  const sortType = params?.sortType || 'hot';
  const { timeFilterName, timeFilterSeconds } = useTimeFilter();
  const currentTimeFilterName = params.timeFilterName || timeFilterName || 'all';

  const { searchFilter, isSearching } = useFeedFiltersStore();
  const [showNoResults, setShowNoResults] = useState(false);
  const [searchAttemptCompleted, setSearchAttemptCompleted] = useState(false);

  const matchesDomain = useCallback(
    (comment: Comment) => {
      if (!domain || !comment?.link) return false;
      try {
        const url = new URL(comment.link);
        const hostname = url.hostname;

        if (hostname === domain) return true;

        return hostname.endsWith(`.${domain}`) || hostname === domain;
      } catch (e) {
        return false;
      }
    },
    [domain],
  );

  const feedOptions = useMemo(() => {
    const options: any = {
      newerThan: searchFilter ? 0 : timeFilterSeconds,
      sortType,
      subplebbitAddresses,
    };

    options.filter = (comment: Comment) => {
      const domainMatches = matchesDomain(comment);

      if (searchFilter) {
        return domainMatches && commentMatchesPattern(comment, searchFilter);
      }

      return domainMatches;
    };

    return options;
  }, [subplebbitAddresses, sortType, timeFilterSeconds, searchFilter, matchesDomain]);

  const { feed, hasMore, loadMore, reset, subplebbitAddressesWithNewerPosts } = useFeed(feedOptions);

  useEffect(() => {
    if (isSearching) {
      setSearchAttemptCompleted(false);
      setShowNoResults(false);
    } else if (searchFilter || domain) {
      setSearchAttemptCompleted(true);
    }
  }, [isSearching, searchFilter, domain]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if ((searchFilter || domain) && feed?.length === 0 && searchAttemptCompleted && !showNoResults) {
      timer = setTimeout(() => {
        setShowNoResults(true);
      }, 2000);
    } else if ((!searchFilter && !domain) || feed?.length > 0) {
      setShowNoResults(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchFilter, domain, feed?.length, searchAttemptCompleted, showNoResults]);

  // suggest the user to change time filter if there aren't enough posts
  const { feed: weeklyFeed } = useFeed({
    subplebbitAddresses,
    sortType,
    newerThan: 60 * 60 * 24 * 7,
    filter: matchesDomain,
  });

  const { feed: monthlyFeed } = useFeed({
    subplebbitAddresses,
    sortType,
    newerThan: 60 * 60 * 24 * 30,
    filter: matchesDomain,
  });

  const documentTitle = domain + ' - Seedit';
  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

  const virtuosoRef = useRef<VirtuosoHandle | null>(null);

  useEffect(() => {
    const setLastVirtuosoState = () => {
      virtuosoRef.current?.getState((snapshot: StateSnapshot) => {
        if (snapshot?.ranges?.length) {
          lastVirtuosoStates[sortType + currentTimeFilterName + 'domain'] = snapshot;
        }
      });
    };
    window.addEventListener('scroll', setLastVirtuosoState);
    return () => window.removeEventListener('scroll', setLastVirtuosoState);
  }, [sortType, currentTimeFilterName]);

  const lastVirtuosoState = lastVirtuosoStates?.[sortType + currentTimeFilterName + 'domain'];

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
    domain,
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
        ) : showNoResults ? (
          <div className={styles.feed}>
            <div className={styles.footer}>
              <div className={styles.stateString}>
                {searchFilter ? (
                  <span className={styles.noMatchesFound}>
                    No matches found for "{searchFilter}" on {domain}
                  </span>
                ) : (
                  <span className={styles.noMatchesFound}>No posts found from {domain}</span>
                )}
                <br />
                <br />
                <div className={styles.morePostsSuggestion}>
                  {searchFilter && (
                    <span
                      className={styles.link}
                      onClick={() => {
                        useFeedFiltersStore.getState().clearSearchFilter();
                        reset();
                      }}
                    >
                      Clear search
                    </span>
                  )}
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

export default Domain;
