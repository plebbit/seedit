import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Virtuoso, VirtuosoHandle, StateSnapshot } from 'react-virtuoso';
import { useFeed } from '@plebbit/plebbit-react-hooks';
import { Trans, useTranslation } from 'react-i18next';
import styles from './home.module.css';
import LoadingEllipsis from '../../components/loading-ellipsis';
import Post from '../../components/post';
import Sidebar from '../../components/sidebar';
import { useDefaultAndSubscriptionsSubplebbitAddresses } from '../../hooks/use-default-subplebbits';
import useFeedStateString from '../../hooks/use-feed-state-string';
import useTimeFilter from '../../hooks/use-time-filter';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

const Home = () => {
  const { t } = useTranslation();
  const subplebbitAddresses = useDefaultAndSubscriptionsSubplebbitAddresses();
  const params = useParams<{ sortType?: string; timeFilterName?: string }>();
  const sortType = params?.sortType || 'hot';
  const { timeFilterName, timeFilterSeconds } = useTimeFilter();
  const { feed, hasMore, loadMore, reset, subplebbitAddressesWithNewerPosts } = useFeed({
    newerThan: timeFilterSeconds,
    postsPerPage: 10,
    sortType,
    subplebbitAddresses: subplebbitAddresses || [],
  });

  // suggest the user to change time filter if there aren't enough posts
  const { feed: weeklyFeed } = useFeed({ subplebbitAddresses, sortType, newerThan: 60 * 60 * 24 * 7 });
  const { feed: monthlyFeed } = useFeed({ subplebbitAddresses, sortType, newerThan: 60 * 60 * 24 * 30 });

  const loadingStateString = useFeedStateString(subplebbitAddresses) || t('loading');

  const handleNewerPostsButtonClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    setTimeout(() => {
      reset();
    }, 300);
  };

  const currentTimeFilterName = params.timeFilterName || timeFilterName;

  const Footer = () => {
    let footerContent;
    if (feed.length === 0) {
      footerContent = t('no_posts');
    }
    if (hasMore || (subplebbitAddresses && subplebbitAddresses.length === 0)) {
      footerContent = (
        <>
          {subplebbitAddressesWithNewerPosts.length > 0 ? (
            <div className={styles.stateString}>
              <Trans
                i18nKey='newer_posts_available'
                components={{
                  1: <span onClick={handleNewerPostsButtonClick} />,
                }}
              />
            </div>
          ) : (
            showMorePostsSuggestion &&
            monthlyFeed.length > feed.length &&
            (weeklyFeed.length > feed.length ? (
              <div className={styles.stateString}>
                <Trans
                  i18nKey='more_posts_last_week'
                  values={{ currentTimeFilterName }}
                  components={{
                    1: <Link to={'/' + (params?.sortType || 'hot') + '/1w'} />,
                  }}
                />
              </div>
            ) : (
              <div className={styles.stateString}>
                <Trans
                  i18nKey='more_posts_last_month'
                  values={{ currentTimeFilterName }}
                  components={{
                    1: <Link to={'/' + (params?.sortType || 'hot') + '/1m'} />,
                  }}
                />
              </div>
            ))
          )}
          <div className={styles.stateString}>
            <LoadingEllipsis string={loadingStateString} />
          </div>
        </>
      );
    }
    return <div className={styles.footer}>{footerContent}</div>;
  };

  const virtuosoRef = useRef<VirtuosoHandle | null>(null);
  const [showMorePostsSuggestion, setShowMorePostsSuggestion] = useState(false);

  useEffect(() => {
    const setLastVirtuosoState = () => {
      virtuosoRef.current?.getState((snapshot: StateSnapshot) => {
        if (snapshot?.ranges?.length) {
          lastVirtuosoStates[sortType + timeFilterName] = snapshot;
        }
      });
    };
    window.addEventListener('scroll', setLastVirtuosoState);
    return () => window.removeEventListener('scroll', setLastVirtuosoState);
  }, [sortType, timeFilterName]);

  const lastVirtuosoState = lastVirtuosoStates?.[sortType + timeFilterName];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMorePostsSuggestion(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.title = `Seedit`;
  }, [t]);

  return (
    <div>
      <div className={styles.content}>
        <div className={`${styles.sidebar}`}>
          <Sidebar />
        </div>
        <div className={styles.feed}>
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
    </div>
  );
};

export default Home;
