import { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Virtuoso, VirtuosoHandle, StateSnapshot } from 'react-virtuoso';
import { useAccount, useFeed } from '@plebbit/plebbit-react-hooks';
import { Trans, useTranslation } from 'react-i18next';
import styles from './home.module.css';
import FeedFooter from '../../components/feed-footer';
import LoadingEllipsis from '../../components/loading-ellipsis';
import Post from '../../components/post';
import Sidebar from '../../components/sidebar';
import useTimeFilter from '../../hooks/use-time-filter';
import useRedirectToDefaultSort from '../../hooks/use-redirect-to-default-sort';
import { useAutoSubscribe } from '../../hooks/use-auto-subscribe';
import { sortTypes } from '../../constants/sortTypes';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

type SubscriptionState = 'loading' | 'noSubscriptions' | 'hasSubscriptions';

const Home = () => {
  const { t } = useTranslation();
  const account = useAccount();
  const subplebbitAddresses = useMemo(() => account?.subscriptions || [], [account?.subscriptions]);
  const initialLoadCompleteRef = useRef(false);
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>('loading');
  const [hasCheckedSubscriptions, setHasCheckedSubscriptions] = useState(false);

  useRedirectToDefaultSort();
  const { isCheckingSubscriptions } = useAutoSubscribe();

  const params = useParams<{ sortType?: string; timeFilterName?: string }>();
  const sortType = sortTypes.includes(params?.sortType || '') ? params?.sortType : sortTypes[0];
  const navigate = useNavigate();

  useEffect(() => {
    if (params?.sortType && !sortTypes.includes(params.sortType)) {
      navigate('/not-found');
    }
  }, [params?.sortType, navigate]);

  const { timeFilterName, timeFilterSeconds } = useTimeFilter();
  const currentTimeFilterName = params.timeFilterName || timeFilterName || '1m';

  const { feed, hasMore, loadMore, reset, subplebbitAddressesWithNewerPosts } = useFeed({
    newerThan: timeFilterSeconds,
    postsPerPage: 10,
    sortType,
    subplebbitAddresses: subplebbitAddresses || [],
  });

  const { feed: weeklyFeed } = useFeed({ subplebbitAddresses, sortType, newerThan: 60 * 60 * 24 * 7 });
  const { feed: monthlyFeed } = useFeed({ subplebbitAddresses, sortType, newerThan: 60 * 60 * 24 * 30 });

  const virtuosoRef = useRef<VirtuosoHandle | null>(null);

  useEffect(() => {
    const setLastVirtuosoState = () => {
      virtuosoRef.current?.getState((snapshot: StateSnapshot) => {
        if (snapshot?.ranges?.length) {
          lastVirtuosoStates[sortType + timeFilterName + 'home'] = snapshot;
        }
      });
    };
    window.addEventListener('scroll', setLastVirtuosoState);
    return () => window.removeEventListener('scroll', setLastVirtuosoState);
  }, [sortType, timeFilterName]);

  const lastVirtuosoState = lastVirtuosoStates?.[sortType + timeFilterName + 'home'];

  useEffect(() => {
    document.title = `Seedit`;
  }, [t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      initialLoadCompleteRef.current = true;

      if (!isCheckingSubscriptions) {
        setHasCheckedSubscriptions(true);
        setSubscriptionState(subplebbitAddresses.length > 0 ? 'hasSubscriptions' : 'noSubscriptions');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isCheckingSubscriptions, subplebbitAddresses]);

  useEffect(() => {
    if (isCheckingSubscriptions) {
      setSubscriptionState('loading');
      return;
    }

    if (initialLoadCompleteRef.current) {
      setHasCheckedSubscriptions(true);
    }

    if (hasCheckedSubscriptions || initialLoadCompleteRef.current) {
      setSubscriptionState(subplebbitAddresses.length > 0 ? 'hasSubscriptions' : 'noSubscriptions');
    }
  }, [isCheckingSubscriptions, subplebbitAddresses, hasCheckedSubscriptions]);

  useEffect(() => {
    if (feed?.length > 0 && subscriptionState === 'loading') {
      setSubscriptionState('hasSubscriptions');
    }
  }, [feed, subscriptionState]);

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
        {subscriptionState === 'loading' && (!feed || feed.length === 0) ? (
          <div className={styles.feed}>
            <div className={styles.footer}>
              <LoadingEllipsis string={t('loading_feed')} />
            </div>
          </div>
        ) : subscriptionState === 'noSubscriptions' ? (
          <div className={styles.noSubscriptions}>
            <br />
            <Trans
              i18nKey='no_subscriptions_message'
              values={{ accountName: account?.author.displayName || account?.author.shortAddress }}
              components={{
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
              components={{ Footer: (props) => <FeedFooter {...props} {...footerProps} /> }}
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
