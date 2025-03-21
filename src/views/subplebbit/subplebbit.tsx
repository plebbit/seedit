import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAccountComments, useBlock, useFeed, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { Virtuoso, VirtuosoHandle, StateSnapshot } from 'react-virtuoso';
import { Trans, useTranslation } from 'react-i18next';
import styles from '../home/home.module.css';
import LoadingEllipsis from '../../components/loading-ellipsis';
import Post from '../../components/post';
import Sidebar from '../../components/sidebar';
import { useFeedStateString } from '../../hooks/use-state-string';
import useTimeFilter from '../../hooks/use-time-filter';
import { usePinnedPostsStore } from '../../stores/use-pinned-posts-store';
import { useIsBroadlyNsfwSubplebbit } from '../../hooks/use-is-broadly-nsfw-subplebbit';
import useContentOptionsStore from '../../stores/use-content-options-store';
import Over18Warning from '../../components/over-18-warning';
import { sortTypes } from '../../constants/sortTypes';
import useFeedResetStore from '../../stores/use-feed-reset-store';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

interface FooterProps {
  subplebbitAddresses: string[];
  subplebbitAddress: string;
  feedLength: number;
  isOnline: boolean;
  started: boolean;
  isSubCreatedButNotYetPublished: boolean;
  error: Error | null;
  hasMore: boolean;
  subplebbitAddressesWithNewerPosts: string[];
  timeFilterName: string;
  reset: () => void;
}

const Footer = ({
  subplebbitAddresses,
  subplebbitAddress,
  feedLength,
  isOnline,
  started,
  isSubCreatedButNotYetPublished,
  error,
  hasMore,
  subplebbitAddressesWithNewerPosts,
  timeFilterName,
  reset,
}: FooterProps) => {
  const { t } = useTranslation();
  let footerFirstLine;
  let footerSecondLine;
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

  const { blocked, unblock, block } = useBlock({ address: subplebbitAddress });
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const handleBlock = () => {
    if (blocked) {
      unblock();
    } else {
      block();
    }
    setShowBlockConfirm(false);
    reset();
  };

  if (blocked) {
    footerFirstLine = t('you_blocked_community');
    footerSecondLine = (
      <>
        {showBlockConfirm ? (
          <span className={styles.blockConfirm}>
            {t('are_you_sure')}{' '}
            <span className={styles.confirmButton} onClick={handleBlock}>
              {t('yes')}
            </span>
            {' / '}
            <span className={styles.cancelButton} onClick={() => setShowBlockConfirm(false)}>
              {t('no')}
            </span>
          </span>
        ) : (
          <span className={styles.blockSub} onClick={() => setShowBlockConfirm(true)}>
            {blocked ? t('unblock_community') : t('block_community')}
          </span>
        )}
      </>
    );
  } else if (feedLength === 0 && isOnline && started && !isSubCreatedButNotYetPublished) {
    footerFirstLine = t('no_posts');
  } else if (feedLength === 0 || !isOnline) {
    footerFirstLine = loadingString;
  } else if (hasMore) {
    footerFirstLine = loadingString;
  }

  if (subplebbitAddressesWithNewerPosts.length > 0 && !blocked) {
    footerSecondLine = (
      <div className={styles.stateString}>
        <Trans
          i18nKey='newer_posts_available'
          values={{ timeFilterName }}
          components={{
            1: (
              <span
                className={styles.link}
                onClick={() => {
                  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                  setTimeout(() => {
                    reset();
                  }, 300);
                }}
              />
            ),
          }}
        />
      </div>
    );
  } else if (timeFilterName !== 'all' && !blocked) {
    footerSecondLine = (
      <div className={styles.morePostsSuggestion}>
        <Trans
          i18nKey='show_all_instead'
          values={{ timeFilterName }}
          components={{
            1: <Link to={`/p/${subplebbitAddress}`} />,
          }}
        />
      </div>
    );
  }

  return (
    <div className={styles.footer}>
      {footerFirstLine && (
        <>
          {footerFirstLine}
          <br />
          <br />
        </>
      )}
      {footerSecondLine}
    </div>
  );
};

const Subplebbit = () => {
  const params = useParams();
  const navigate = useNavigate();
  const subplebbitAddress = params?.subplebbitAddress || '';
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const { createdAt, error, shortAddress, started, title, updatedAt, settings } = subplebbit || {};
  const isOnline = updatedAt && updatedAt > Date.now() / 1000 - 60 * 60;
  const isSubCreatedButNotYetPublished = typeof createdAt === 'number' && !updatedAt;

  const subplebbitAddresses = useMemo(() => [subplebbitAddress], [subplebbitAddress]) as string[];
  const sortType = sortTypes.includes(params?.sortType || '') ? params?.sortType : sortTypes[0];

  useEffect(() => {
    if (params?.sortType && !sortTypes.includes(params.sortType)) {
      navigate('/not-found');
    }
  }, [params?.sortType, navigate]);

  const timeFilterName = params.timeFilterName || 'all';
  const { timeFilterSeconds } = useTimeFilter();
  const { feed, hasMore, loadMore, reset, subplebbitAddressesWithNewerPosts } = useFeed({ subplebbitAddresses, sortType, newerThan: timeFilterSeconds });

  // show account comments instantly in the feed once published (cid defined), instead of waiting for the feed to update
  const { accountComments } = useAccountComments();
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

  // reset the feed when a new account comment is published, so it shows instantly in the feed
  const setResetFunction = useFeedResetStore((state) => state.setResetFunction);
  useEffect(() => {
    setResetFunction(reset);
  }, [reset, setResetFunction, feed]);

  const resetTriggeredRef = useRef(false);

  useEffect(() => {
    if (filteredComments.length > 0 && !resetTriggeredRef.current) {
      reset();
      resetTriggeredRef.current = true;
    }
  }, [filteredComments, reset]);

  // show newest account comment at the top of the feed but after pinned posts
  const combinedFeed = useMemo(() => {
    const newFeed = [...feed];
    const lastPinnedIndex = newFeed.map((post) => post.pinned).lastIndexOf(true);
    if (filteredComments.length > 0) {
      newFeed.splice(lastPinnedIndex + 1, 0, ...filteredComments);
    }
    return newFeed;
  }, [feed, filteredComments]);

  // virtuoso footer to display feed loading state, error, unblock button and "newer posts available" button
  const footerProps: FooterProps = {
    subplebbitAddresses,
    subplebbitAddress,
    feedLength: feed.length || 0,
    isOnline,
    started,
    isSubCreatedButNotYetPublished,
    error: error || null,
    hasMore,
    subplebbitAddressesWithNewerPosts,
    timeFilterName: timeFilterName || '',
    reset,
  };

  // scrolling position state for virtuoso feed
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

  // track pinned posts count to start counting posts (numbered rank) after the pinned posts
  const { setPinnedPostsCount } = usePinnedPostsStore();
  useEffect(() => {
    if (feed) {
      const pinnedCount = feed.filter((post) => post.pinned).length;
      setPinnedPostsCount(pinnedCount);
    }
  }, [feed, setPinnedPostsCount]);

  // over 18 warning for subplebbit with nsfw tag in multisub default list
  const { hasAcceptedWarning } = useContentOptionsStore();
  const isBroadlyNsfwSubplebbit = useIsBroadlyNsfwSubplebbit(subplebbitAddress || '');

  // page title
  useEffect(() => {
    document.title = title ? title : shortAddress || subplebbitAddress;
  }, [title, shortAddress, subplebbitAddress]);

  return isBroadlyNsfwSubplebbit && !hasAcceptedWarning ? (
    <Over18Warning />
  ) : (
    <div className={styles.content}>
      <div className={styles.sidebar}>
        <Sidebar subplebbit={subplebbit} isSubCreatedButNotYetPublished={started && isSubCreatedButNotYetPublished} settings={settings} reset={reset} />
      </div>
      <div className={styles.feed}>
        <Virtuoso
          increaseViewportBy={{ bottom: 1200, top: 600 }}
          totalCount={combinedFeed?.length || 0}
          data={combinedFeed}
          itemContent={(index, post) => <Post index={index} post={post} />}
          useWindowScroll={true}
          components={{ Footer: (props) => <Footer {...props} {...footerProps} /> }}
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
