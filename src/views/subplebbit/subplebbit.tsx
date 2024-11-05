import { useEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAccountComments, useBlock, useFeed, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { Virtuoso, VirtuosoHandle, StateSnapshot } from 'react-virtuoso';
import { Trans, useTranslation } from 'react-i18next';
import styles from '../home/home.module.css';
import LoadingEllipsis from '../../components/loading-ellipsis';
import Post from '../../components/post';
import Sidebar from '../../components/sidebar';
import useFeedStateString from '../../hooks/use-feed-state-string';
import useTimeFilter from '../../hooks/use-time-filter';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

const Subplebbit = () => {
  const { t } = useTranslation();
  const params = useParams();
  const subplebbitAddress = params.subplebbitAddress;
  const subplebbitAddresses = useMemo(() => [subplebbitAddress], [subplebbitAddress]) as string[];

  const sortType = params?.sortType || 'hot';
  const timeFilterName = params.timeFilterName || 'all';
  const { timeFilterSeconds } = useTimeFilter();
  const { feed, hasMore, loadMore, reset, subplebbitAddressesWithNewerPosts } = useFeed({ subplebbitAddresses, sortType, newerThan: timeFilterSeconds });
  const { accountComments } = useAccountComments();

  // show account comments instantly in the feed once published (cid defined), instead of waiting for the feed to update
  const filteredComments = useMemo(
    () =>
      accountComments.filter((comment) => {
        const { cid, deleted, postCid, removed, state, timestamp } = comment || {};
        return (
          !deleted &&
          !removed &&
          timestamp > Date.now() / 1000 - 60 * 60 &&
          state === 'succeeded' &&
          cid &&
          cid === postCid &&
          comment?.subplebbitAddress === subplebbitAddress &&
          !feed.some((post) => post.cid === cid)
        );
      }),
    [accountComments, subplebbitAddress, feed],
  );

  // show newest account comment at the top of the feed but after pinned posts
  const combinedFeed = useMemo(() => {
    const newFeed = [...feed];
    const lastPinnedIndex = newFeed.map((post) => post.pinned).lastIndexOf(true);
    if (filteredComments.length > 0) {
      newFeed.splice(lastPinnedIndex + 1, 0, ...filteredComments);
    }
    return newFeed;
  }, [feed, filteredComments]);

  const { error } = useSubplebbit({ subplebbitAddress });
  const subplebbit = useSubplebbit({ subplebbitAddress });

  const { createdAt, shortAddress, started, title, updatedAt, settings } = subplebbit || {};

  const loadingStateString = useFeedStateString(subplebbitAddresses) || t('loading');
  const loadingString = (
    <>
      <div className={styles.stateString}>{loadingStateString === 'Failed' ? 'failed' : <LoadingEllipsis string={loadingStateString} />}</div>
      {error && (
        <div style={{ color: 'red' }}>
          <br />
          {error.message}
        </div>
      )}
    </>
  );

  let isOnline = updatedAt && updatedAt > Date.now() / 1000 - 60 * 60;
  const isSubCreatedButNotYetPublished = typeof createdAt === 'number' && !updatedAt;

  const { blocked } = useBlock({ address: subplebbitAddress });

  useEffect(() => {
    document.title = title ? title : shortAddress || subplebbitAddress;
  }, [title, shortAddress, subplebbitAddress]);

  const handleNewerPostsButtonClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    setTimeout(() => {
      reset();
    }, 300);
  };

  const Footer = () => {
    let footerFirstLine;
    let footerSecondLine;

    if (feed.length === 0 && isOnline && started && !isSubCreatedButNotYetPublished) {
      if (blocked) {
        footerFirstLine = t('you_blocked_community');
      } else {
        footerFirstLine = t('no_posts');
      }
    } else if (feed.length === 0 || !isOnline) {
      footerFirstLine = loadingString;
    } else if (hasMore) {
      footerFirstLine = loadingString;
    }

    if (subplebbitAddressesWithNewerPosts.length > 0) {
      footerSecondLine = (
        <div className={styles.stateString}>
          <Trans
            i18nKey='newer_posts_available'
            values={{ timeFilterName: params.timeFilterName }}
            components={{
              1: <span className={styles.link} onClick={handleNewerPostsButtonClick} />,
            }}
          />
        </div>
      );
    } else if (params.timeFilterName) {
      footerSecondLine = (
        <div className={styles.stateString}>
          <Trans
            i18nKey='show_all_instead'
            values={{ timeFilterName: params.timeFilterName }}
            components={{
              1: <Link to={`/p/${subplebbitAddress}`} />,
            }}
          />
        </div>
      );
    }

    return (
      <div className={styles.footer}>
        {footerFirstLine}
        {footerSecondLine}
      </div>
    );
  };

  const virtuosoRef = useRef<VirtuosoHandle | null>(null);

  useEffect(() => {
    const setLastVirtuosoState = () => {
      virtuosoRef.current?.getState((snapshot: StateSnapshot) => {
        if (snapshot?.ranges?.length) {
          lastVirtuosoStates[subplebbitAddress + sortType + timeFilterName] = snapshot;
        }
      });
    };
    window.addEventListener('scroll', setLastVirtuosoState);
    return () => window.removeEventListener('scroll', setLastVirtuosoState);
  }, [subplebbitAddress, sortType, timeFilterName]);

  const lastVirtuosoState = lastVirtuosoStates?.[subplebbitAddress + sortType + timeFilterName];

  return (
    <div className={styles.content}>
      <div className={styles.sidebar}>
        <Sidebar subplebbit={subplebbit} isSubCreatedButNotYetPublished={started && isSubCreatedButNotYetPublished} settings={settings} />
      </div>
      <div className={styles.feed}>
        <Virtuoso
          increaseViewportBy={{ bottom: 1200, top: 600 }}
          totalCount={combinedFeed?.length || 0}
          data={combinedFeed}
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

export default Subplebbit;
