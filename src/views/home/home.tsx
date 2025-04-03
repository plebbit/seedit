import { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Virtuoso, VirtuosoHandle, StateSnapshot } from 'react-virtuoso';
import { useAccount, useFeed } from '@plebbit/plebbit-react-hooks';
import { Trans, useTranslation } from 'react-i18next';
import { commentMatchesPattern } from '../../lib/utils/pattern-utils';
import useFeedFiltersStore from '../../stores/use-feed-filters-store';
import { useAutoSubscribe } from '../../hooks/use-auto-subscribe';
import useTimeFilter from '../../hooks/use-time-filter';
import useRedirectToDefaultSort from '../../hooks/use-redirect-to-default-sort';
import FeedFooter from '../../components/feed-footer';
import LoadingEllipsis from '../../components/loading-ellipsis';
import Post from '../../components/post';
import Sidebar from '../../components/sidebar';
import { sortTypes } from '../../constants/sort-types';
import styles from './home.module.css';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

type SubscriptionState = 'loading' | 'noSubscriptions' | 'hasSubscriptions';

const Home = () => {
  const { t } = useTranslation();
  const account = useAccount();
  const subplebbitAddresses = useMemo(() => account?.subscriptions || [], [account?.subscriptions]);
  const { isCheckingSubscriptions } = useAutoSubscribe();

  const params = useParams<{ sortType?: string; timeFilterName?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const sortType = sortTypes.includes(params?.sortType || '') ? params?.sortType : sortTypes[0];
  const navigate = useNavigate();

  useRedirectToDefaultSort();

  useEffect(() => {
    if (params?.sortType && !sortTypes.includes(params.sortType)) {
      navigate('/not-found');
    }
  }, [params?.sortType, navigate]);

  const { timeFilterName, timeFilterSeconds } = useTimeFilter();
  const currentTimeFilterName = params.timeFilterName || timeFilterName || '1m';

  const { isSearching } = useFeedFiltersStore();
  const [showNoResults, setShowNoResults] = useState(false);
  const [searchAttemptCompleted, setSearchAttemptCompleted] = useState(false);

  const feedOptions = useMemo(() => {
    const options: any = {
      newerThan: searchQuery ? 0 : timeFilterSeconds,
      postsPerPage: 10,
      sortType,
      subplebbitAddresses: subplebbitAddresses || [],
    };

    if (searchQuery) {
      options.filter = (comment: Comment) => {
        if (!searchQuery.trim()) return true;
        return commentMatchesPattern(comment, searchQuery);
      };
      options.filterKey = `search-filter-${searchQuery}`;
    }

    return options;
  }, [subplebbitAddresses, sortType, timeFilterSeconds, searchQuery]);

  const { feed, hasMore, loadMore, reset, subplebbitAddressesWithNewerPosts } = useFeed(feedOptions);

  useEffect(() => {
    setShowNoResults(false);
    setSearchAttemptCompleted(false);
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery && !isSearching && !searchAttemptCompleted) {
      setSearchAttemptCompleted(true);
    }
  }, [searchQuery, isSearching, searchAttemptCompleted]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (searchQuery && feed?.length === 0 && searchAttemptCompleted) {
      timer = setTimeout(() => {
        setShowNoResults(true);
      }, 1500);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchQuery, feed?.length, searchAttemptCompleted]);

  const { feed: weeklyFeed } = useFeed({ subplebbitAddresses, sortType, newerThan: 60 * 60 * 24 * 7 });
  const { feed: monthlyFeed } = useFeed({ subplebbitAddresses, sortType, newerThan: 60 * 60 * 24 * 30 });

  const virtuosoRef = useRef<VirtuosoHandle | null>(null);

  useEffect(() => {
    const setLastVirtuosoState = () => {
      virtuosoRef.current?.getState((snapshot: StateSnapshot) => {
        if (snapshot?.ranges?.length) {
          lastVirtuosoStates[sortType + currentTimeFilterName + 'home' + searchQuery] = snapshot;
        }
      });
    };
    window.addEventListener('scroll', setLastVirtuosoState);
    return () => window.removeEventListener('scroll', setLastVirtuosoState);
  }, [sortType, currentTimeFilterName, searchQuery]);

  const lastVirtuosoState = lastVirtuosoStates?.[sortType + currentTimeFilterName + 'home' + searchQuery];

  useEffect(() => {
    document.title = `seedit`;
  }, [t]);

  const footerProps = {
    feedLength: feed?.length,
    hasFeedLoaded: !!feed,
    hasMore,
    subplebbitAddresses,
    subplebbitAddressesWithNewerPosts,
    weeklyFeedLength: weeklyFeed.length,
    monthlyFeedLength: monthlyFeed.length,
    currentTimeFilterName: searchQuery ? 'all' : currentTimeFilterName,
    reset,
    searchQuery: searchQuery,
    isSearching,
    showNoResults,
    onClearSearch: () => {
      setSearchParams((prev) => {
        prev.delete('q');
        return prev;
      });
      reset();
    },
  };

  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>('loading');
  const initialLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [safeToShowNoSubscriptions, setSafeToShowNoSubscriptions] = useState(false);

  useEffect(() => {
    return () => {
      if (initialLoadTimeoutRef.current) {
        clearTimeout(initialLoadTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isCheckingSubscriptions) {
      setSafeToShowNoSubscriptions(false);
      return;
    }

    if (!isCheckingSubscriptions && !safeToShowNoSubscriptions) {
      initialLoadTimeoutRef.current = setTimeout(() => {
        setSafeToShowNoSubscriptions(true);
      }, 800);
    }

    return () => {
      if (initialLoadTimeoutRef.current) {
        clearTimeout(initialLoadTimeoutRef.current);
      }
    };
  }, [isCheckingSubscriptions, safeToShowNoSubscriptions]);

  useEffect(() => {
    if (searchQuery) {
      setSubscriptionState('hasSubscriptions');
      return;
    }

    if (subplebbitAddresses.length > 0 || feed?.length > 0) {
      setSubscriptionState('hasSubscriptions');
      return;
    }

    if (isCheckingSubscriptions || feed === undefined) {
      setSubscriptionState('loading');
      return;
    }

    if (!isCheckingSubscriptions && feed?.length === 0 && subplebbitAddresses.length === 0 && safeToShowNoSubscriptions) {
      setSubscriptionState('noSubscriptions');
    } else {
      setSubscriptionState('loading');
    }
  }, [isCheckingSubscriptions, subplebbitAddresses, feed, safeToShowNoSubscriptions, searchQuery]);

  return (
    <div>
      <div className={styles.content}>
        <div className={`${styles.sidebar}`}>
          <Sidebar />
        </div>
        {subscriptionState === 'loading' && !searchQuery ? (
          <div className={styles.feed}>
            <div className={styles.footer}>
              <LoadingEllipsis string={t('loading_feed')} />
            </div>
          </div>
        ) : subscriptionState === 'noSubscriptions' && !searchQuery ? (
          <div className={styles.noSubscriptions}>
            <br />
            <Trans
              i18nKey='no_subscriptions_message'
              values={{ accountName: account?.author.displayName || account?.author.shortAddress }}
              components={{
                // eslint-disable-next-line jsx-a11y/heading-has-content
                1: <h1 key='no_subscriptions_message_1' />,
                2: <div className={styles.squash} key='no_subscriptions_message_2' />,
                3: <span className={styles.joinWithThe} key='no_subscriptions_message_3' />,
                4: <img src={'/assets/buttons/all_feed_subscribe.png'} alt='' key='no_subscriptions_message_4' />,
              }}
            />
            <div className={styles.fakePost} />
            <div className={styles.findCommunities}>
              <Link to='/p/all/hot/1m'>{t('find_communities')}</Link>
            </div>
          </div>
        ) : (
          <div className={styles.feed}>
            <Virtuoso
              increaseViewportBy={{ bottom: 1200, top: 1200 }}
              totalCount={feed?.length || 0}
              data={feed}
              itemContent={(index, post) => <Post index={index} post={post} />}
              useWindowScroll={true}
              components={{
                Footer: () => <FeedFooter {...footerProps} />,
              }}
              endReached={loadMore}
              ref={virtuosoRef}
              restoreStateFrom={lastVirtuosoState}
              initialScrollTop={lastVirtuosoState?.scrollTop}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
