import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Virtuoso, VirtuosoHandle, StateSnapshot } from 'react-virtuoso';
import { useAccount, useFeed } from '@plebbit/plebbit-react-hooks';
import { Trans, useTranslation } from 'react-i18next';
import styles from './home.module.css';
import LoadingEllipsis from '../../components/loading-ellipsis';
import Post from '../../components/post';
import Sidebar from '../../components/sidebar';
import useFeedStateString from '../../hooks/use-feed-state-string';
import useTimeFilter from '../../hooks/use-time-filter';
import useRedirectToDefaultSort from '../../hooks/use-redirect-to-default-sort';
import { useAutoSubscribe } from '../../hooks/use-auto-subscribe';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

const Footer = ({
  feedLength,
  hasMore,
  subplebbitAddresses,
  subplebbitAddressesWithNewerPosts,
  handleNewerPostsButtonClick,
  params,
  weeklyFeedLength,
  monthlyFeedLength,
  currentTimeFilterName,
}: any) => {
  const { t } = useTranslation();
  const loadingStateString = useFeedStateString(subplebbitAddresses) || t('looking_for_more_posts');

  let footerContent;

  if (feedLength === 0) {
    footerContent = t('no_posts');
  }

  if (hasMore || subplebbitAddresses.length > 0 || (subplebbitAddresses && subplebbitAddresses.length === 0)) {
    footerContent = (
      <>
        {subplebbitAddressesWithNewerPosts.length > 0 ? (
          <div className={styles.morePostsSuggestion}>
            <Trans
              i18nKey='newer_posts_available'
              components={{
                1: <span onClick={handleNewerPostsButtonClick} />,
              }}
            />
          </div>
        ) : weeklyFeedLength > feedLength ? (
          <div className={styles.morePostsSuggestion}>
            <Trans
              i18nKey='more_posts_last_week'
              values={{ currentTimeFilterName, count: feedLength }}
              components={{
                1: <Link to={'/' + (params?.sortType || 'hot') + '/1w'} />,
              }}
            />
          </div>
        ) : (
          monthlyFeedLength > feedLength && (
            <div className={styles.morePostsSuggestion}>
              <Trans
                i18nKey='more_posts_last_month'
                values={{ currentTimeFilterName, count: feedLength }}
                components={{
                  1: <Link to={'/' + (params?.sortType || 'hot') + '/1m'} />,
                }}
              />
            </div>
          )
        )}
        <div className={styles.stateString}>
          <LoadingEllipsis string={loadingStateString} />
        </div>
      </>
    );
  }
  return <div className={styles.footer}>{footerContent}</div>;
};

const Home = () => {
  useRedirectToDefaultSort();
  const { t } = useTranslation();
  const account = useAccount();
  const subplebbitAddresses = useAccount()?.subscriptions || [];
  const params = useParams<{ sortType?: string; timeFilterName?: string }>();
  const sortType = params?.sortType || 'hot';
  const { timeFilterName, timeFilterSeconds } = useTimeFilter();
  const { feed, hasMore, loadMore, reset, subplebbitAddressesWithNewerPosts } = useFeed({
    newerThan: timeFilterSeconds,
    postsPerPage: 10,
    sortType,
    subplebbitAddresses: subplebbitAddresses || [],
  });

  const { feed: weeklyFeed } = useFeed({ subplebbitAddresses, sortType, newerThan: 60 * 60 * 24 * 7 });
  const { feed: monthlyFeed } = useFeed({ subplebbitAddresses, sortType, newerThan: 60 * 60 * 24 * 30 });

  const handleNewerPostsButtonClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    setTimeout(() => {
      reset();
    }, 300);
  };

  const currentTimeFilterName = params.timeFilterName || timeFilterName;

  const virtuosoRef = useRef<VirtuosoHandle | null>(null);

  const { isCheckingSubscriptions } = useAutoSubscribe();

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

  const footerProps = {
    feedLength: feed?.length,
    hasMore,
    subplebbitAddresses,
    subplebbitAddressesWithNewerPosts,
    handleNewerPostsButtonClick,
    params,
    weeklyFeedLength: weeklyFeed.length,
    monthlyFeedLength: monthlyFeed.length,
    currentTimeFilterName,
  };

  return (
    <div>
      <div className={styles.content}>
        <div className={`${styles.sidebar}`}>
          <Sidebar />
        </div>
        {isCheckingSubscriptions ? (
          <div className={styles.feed}>
            <div className={styles.footer}>
              <LoadingEllipsis string={t('loading')} />
            </div>
          </div>
        ) : subplebbitAddresses.length > 0 ? (
          <div className={styles.feed}>
            <Virtuoso
              increaseViewportBy={{ bottom: 1200, top: 600 }}
              totalCount={feed?.length || 0}
              data={feed}
              itemContent={(index, post) => <Post index={index} post={post} />}
              useWindowScroll={true}
              components={{ Footer: (props) => <Footer {...props} {...footerProps} /> }}
              endReached={loadMore}
              ref={virtuosoRef}
              restoreStateFrom={lastVirtuosoState}
              initialScrollTop={lastVirtuosoState?.scrollTop}
            />
          </div>
        ) : (
          <div className={styles.noSubscriptions}>
            <br />
            <h1>{account?.author.displayName || account?.author.shortAddress}, this is your home on Seedit</h1>
            <div className={styles.squash}>
              When you find a community that you like, <strong>join with the</strong>
              <img src={'/assets/buttons/all_feed_subscribe.png'} alt='' />
            </div>
            <div className={styles.fakePost} />
            <div className={styles.findCommunities}>
              <Link to='/p/all/hot/1m'>find communities on p/all</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
