import { useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useFeed, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { Virtuoso, VirtuosoHandle, StateSnapshot } from 'react-virtuoso';
import { useTranslation } from 'react-i18next';
import styles from './subplebbit.module.css';
import LoadingEllipsis from '../../components/loading-ellipsis';
import Post from '../../components/post';
import Sidebar from '../../components/sidebar';
import useFeedStateString from '../../hooks/use-feed-state-string';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

const NoPosts = () => 'no posts';

const Subplebbit = () => {
  const { t } = useTranslation();
  const params = useParams();
  const subplebbitAddress = params.subplebbitAddress;
  const subplebbitAddresses = useMemo(() => [subplebbitAddress], [subplebbitAddress]) as string[];
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const { createdAt, description, roles, shortAddress, state, title, updatedAt } = subplebbit || {};
  const sortType = useParams<{ sortType: string }>().sortType || 'hot';
  const { feed, hasMore, loadMore } = useFeed({ subplebbitAddresses, sortType });
  const loadingStateString = useFeedStateString(subplebbitAddresses) || t('loading');
  
  const loadingString = (
    <div className={styles.stateString}>
      {state === 'failed' ? state : <LoadingEllipsis string={loadingStateString} />}
    </div>
  );

  useEffect(() => {
    document.title = (title ? title : shortAddress) + ' - seedit';
  }, [title, shortAddress]);

  let Footer;
  if (feed?.length === 0) {
    Footer = NoPosts;
  }
  if (hasMore || subplebbitAddresses.length === 0) {
    Footer = () => loadingString;
  }

  const virtuosoRef = useRef<VirtuosoHandle | null>(null);

  useEffect(() => {
    const setLastVirtuosoState = () => {
      virtuosoRef.current?.getState((snapshot: StateSnapshot) => {
        if (snapshot?.ranges?.length) {
          lastVirtuosoStates[`${subplebbitAddress}`] = snapshot;
        }
      });
    };
    window.addEventListener('scroll', setLastVirtuosoState);
    return () => window.removeEventListener('scroll', setLastVirtuosoState);
  }, [subplebbitAddress]);

  const lastVirtuosoState = lastVirtuosoStates[`${subplebbitAddress}`];

  return (
    <div className={styles.content}>
      <div className={`${styles.sidebar}`}>
        <Sidebar address={subplebbitAddress} createdAt={createdAt} description={description} roles={roles} shortAddress={shortAddress} title={title} updatedAt={updatedAt} />
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
  );
};

export default Subplebbit;
