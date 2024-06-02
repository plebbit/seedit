import { useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useBlock, useFeed, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { Virtuoso, VirtuosoHandle, StateSnapshot } from 'react-virtuoso';
import { useTranslation } from 'react-i18next';
import styles from '../home/home.module.css';
import LoadingEllipsis from '../../components/loading-ellipsis';
import NewerPostsButton from '../../components/newer-posts-button';
import Post from '../../components/post';
import Sidebar from '../../components/sidebar';
import useFeedStateString from '../../hooks/use-feed-state-string';
import useTimeFilter, { TimeFilterKey } from '../../hooks/use-time-filter';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

const Subplebbit = () => {
  const { t } = useTranslation();
  const params = useParams();
  const subplebbitAddress = params.subplebbitAddress;
  const subplebbitAddresses = useMemo(() => [subplebbitAddress], [subplebbitAddress]) as string[];

  const sortType = params?.sortType || 'hot';
  const timeFilterName = (params.timeFilterName as TimeFilterKey) || 'all';
  const { timeFilter } = useTimeFilter(sortType, timeFilterName);
  const { feed, hasMore, loadMore, reset, subplebbitAddressesWithNewerPosts } = useFeed({ subplebbitAddresses, sortType, filter: timeFilter });

  const { subplebbit, error } = useSubplebbit({ subplebbitAddress });
  const { createdAt, description, roles, rules, shortAddress, started, title, updatedAt, settings } = subplebbit || {};

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

  let isOnline = updatedAt && updatedAt > Date.now() / 1000 - 60 * 30;
  const isSubCreatedButNotYetPublished = typeof createdAt === 'number' && !updatedAt;

  const { blocked } = useBlock({ address: subplebbitAddress });

  useEffect(() => {
    document.title = title ? title : shortAddress || subplebbitAddress;
  }, [title, shortAddress, subplebbitAddress]);

  const Footer = () => {
    let footerContent;

    if (feed.length === 0 && isOnline) {
      if (blocked) {
        footerContent = t('you_blocked_community');
      } else {
        footerContent = t('no_posts');
      }
    } else if (feed.length === 0 && started && isSubCreatedButNotYetPublished) {
      footerContent = t('no_posts');
    } else if (hasMore) {
      footerContent = loadingString;
    } else {
      return;
    }

    return <div className={styles.footer}>{footerContent}</div>;
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
        <Sidebar
          address={subplebbitAddress}
          createdAt={createdAt}
          description={description}
          isSubCreatedButNotYetPublished={started && isSubCreatedButNotYetPublished}
          roles={roles}
          rules={rules}
          title={title}
          updatedAt={updatedAt}
          settings={settings}
        />
      </div>
      <div className={styles.feed}>
        <NewerPostsButton reset={reset} subplebbitAddressesWithNewerPosts={subplebbitAddressesWithNewerPosts} />
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

export default Subplebbit;
