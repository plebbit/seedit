import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Virtuoso, VirtuosoHandle, StateSnapshot } from 'react-virtuoso';
import { useFeed } from '@plebbit/plebbit-react-hooks';
import { Trans, useTranslation } from 'react-i18next';
import styles from '../home/home.module.css';
import LoadingEllipsis from '../../components/loading-ellipsis';
import Post from '../../components/post';
import Sidebar from '../../components/sidebar';
import { useDefaultSubplebbitAddresses } from '../../hooks/use-default-subplebbits';
import useFeedStateString from '../../hooks/use-feed-state-string';
import useTimeFilter from '../../hooks/use-time-filter';
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

  const feedStateString = useFeedStateString(subplebbitAddresses);
  const hasFeedLoaded = !!feed;
  const [isHovering, setIsHovering] = useState(false);
  const loadingStateString =
    !hasFeedLoaded || (feed.length === 0 && !(weeklyFeed.length > feed.length || monthlyFeed.length > feed.length)) ? t('loading_feed') : t('looking_for_more_posts');

  const handleNewerPostsButtonClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    setTimeout(() => {
      reset();
    }, 300);
  };

  const currentTimeFilterName = params.timeFilterName || timeFilterName;

  const documentTitle = _.capitalize(t('all')) + ' - Seedit';
  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

  const Footer = () => {
    let footerContent;

    if (feed.length === 0) {
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
          ) : weeklyFeed.length > feed.length ? (
            <div className={styles.morePostsSuggestion}>
              <Trans
                i18nKey='more_posts_last_week'
                values={{ currentTimeFilterName, count: feed.length }}
                components={{
                  1: <Link to={'/p/all/' + (params?.sortType || 'hot') + '/1w'} />,
                }}
              />
            </div>
          ) : (
            monthlyFeed.length > feed.length && (
              <div className={styles.morePostsSuggestion}>
                <Trans
                  i18nKey='more_posts_last_month'
                  values={{ currentTimeFilterName, count: feed.length }}
                  components={{
                    1: <Link to={'/p/all/' + (params?.sortType || 'hot') + '/1m'} />,
                  }}
                />
              </div>
            )
          )}
          <div className={styles.stateString} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
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
              <LoadingEllipsis string={isHovering ? feedStateString || loadingStateString : loadingStateString} />
            )}
          </div>
        </>
      );
    }
    return <div className={styles.footer}>{footerContent}</div>;
  };

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

export default All;
