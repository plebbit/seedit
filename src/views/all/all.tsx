import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Virtuoso, VirtuosoHandle, StateSnapshot } from 'react-virtuoso';
import { useFeed } from '@plebbit/plebbit-react-hooks';
import { Trans, useTranslation } from 'react-i18next';
import styles from '../home/home.module.css';
import LoadingEllipsis from '../../components/loading-ellipsis';
import Post from '../../components/post';
import Sidebar from '../../components/sidebar';
import { useDefaultSubplebbitAddresses } from '../../lib/utils/addresses-utils';
import useFeedStateString from '../../hooks/use-feed-state-string';
import useTimeFilter, { TimeFilterKey } from '../../hooks/use-time-filter';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

const All = () => {
  const subplebbitAddresses = useDefaultSubplebbitAddresses();
  const params = useParams<{ sortType?: string; timeFilterName?: string }>();
  const sortType = params?.sortType || 'hot';
  const timeFilterName = params.timeFilterName as TimeFilterKey;
  const { timeFilter } = useTimeFilter(sortType, timeFilterName);
  const { feed, hasMore, loadMore } = useFeed({ subplebbitAddresses, sortType, filter: timeFilter });
  const { t } = useTranslation();
  let loadingStateString = useFeedStateString(subplebbitAddresses) || t('loading');

  const loadingString = (
    <div className={styles.stateString}>
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
        <LoadingEllipsis string={loadingStateString} />
      )}
    </div>
  );

  useEffect(() => {
    document.title = `p/all - seedit`;
  }, [t]);

  const Footer = () => {
    let footerContent;

    if (feed.length === 0) {
      footerContent = t('no_posts');
    }

    if (hasMore || subplebbitAddresses.length === 0) {
      footerContent = loadingString;
    }

    return <div className={styles.footer}>{footerContent}</div>;
  };

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

export default All;
