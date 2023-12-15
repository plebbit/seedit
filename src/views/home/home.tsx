import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Virtuoso, VirtuosoHandle, StateSnapshot } from 'react-virtuoso';
import { useAccount, useFeed } from '@plebbit/plebbit-react-hooks';
import { Trans, useTranslation } from 'react-i18next';
import styles from './home.module.css';
import LoadingEllipsis from '../../components/loading-ellipsis';
import Post from '../../components/post';
import Sidebar from '../../components/sidebar';
import { useDefaultSubplebbitAddresses } from '../../lib/utils/addresses-utils';
import useFeedStateString from '../../hooks/use-feed-state-string';
import useTimeFilter, { TimeFilterKey } from '../../hooks/use-time-filter';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

const NoPosts = () => 'no posts';

const Home = () => {
  const { t } = useTranslation();
  const account = useAccount();
  const defaultSubplebbitAddresses = useDefaultSubplebbitAddresses();
  const [subplebbitAddresses, setSubplebbitAddresses] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    if (defaultSubplebbitAddresses && account?.subscriptions) {
      setSubplebbitAddresses(defaultSubplebbitAddresses.concat(account.subscriptions));
    }
  }, [defaultSubplebbitAddresses, account?.subscriptions]);
  
  const params = useParams<{ sortType?: string; timeFilterName?: string }>();
  const sortType = params?.sortType || 'hot';
  const timeFilterName = (params.timeFilterName as TimeFilterKey) || 'all';
  const { timeFilter } = useTimeFilter(sortType, timeFilterName);

  const { feed, hasMore, loadMore } = useFeed({
    subplebbitAddresses: subplebbitAddresses || [],
    sortType,
    filter: timeFilter
  });
  
  let loadingStateString = useFeedStateString(subplebbitAddresses) || t('loading');

  const loadingString = (
    <div className={styles.stateString}>
      {subplebbitAddresses && subplebbitAddresses.length === 0 ? (
        <div>
          <Trans
            i18nKey='no_communities_found'
            components={[<a href='https://github.com/plebbit/temporary-default-subplebbits'>https://github.com/plebbit/temporary-default-subplebbits</a>]}
          />
          <br />
          {t('connect_community_notice')}
        </div>
      ) : (
        <LoadingEllipsis string={loadingStateString} />
      )}
    </div>
  );

  useEffect(() => {
    document.title = `${t('home')} - seedit`;
  }, [t]);

  let Footer;
  if (feed?.length === 0) {
    Footer = NoPosts;
  }
  if (hasMore || subplebbitAddresses && subplebbitAddresses.length === 0) {
    Footer = () => loadingString;
  }

  const virtuosoRef = useRef<VirtuosoHandle | null>(null);

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

export default Home;
