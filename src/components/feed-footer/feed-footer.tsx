import { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { isAllView, isModView } from '../../lib/utils/view-utils';
import { useFeedStateString } from '../../hooks/use-state-string';
import LoadingEllipsis from '../loading-ellipsis';
import styles from './feed-footer.module.css';

interface FeedFooterProps {
  feedLength: number;
  hasFeedLoaded: boolean;
  hasMore: boolean;
  subplebbitAddresses: string[];
  subplebbitAddressesWithNewerPosts: string[];
  weeklyFeedLength: number;
  monthlyFeedLength: number;
  currentTimeFilterName: string;
  reset: () => void;
  searchQuery?: string;
  isSearching?: boolean;
  showNoResults?: boolean;
  onClearSearch?: () => void;
}

const FeedFooter = ({
  feedLength,
  hasFeedLoaded,
  hasMore,
  subplebbitAddresses,
  subplebbitAddressesWithNewerPosts,
  weeklyFeedLength,
  monthlyFeedLength,
  currentTimeFilterName,
  reset,
  searchQuery,
  isSearching,
  showNoResults,
  onClearSearch,
}: FeedFooterProps) => {
  let footerContent;
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const isInModView = isModView(location.pathname);
  const isInAllView = isAllView(location.pathname);

  const handleNewerPostsButtonClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    setTimeout(() => {
      reset();
    }, 300);
  };

  const feedStateString = useFeedStateString(subplebbitAddresses);
  const loadingStateString =
    useFeedStateString(subplebbitAddresses) ||
    (!hasFeedLoaded || (feedLength === 0 && !(weeklyFeedLength > feedLength || monthlyFeedLength > feedLength)) ? t('loading_feed') : t('looking_for_more_posts'));

  // Add state to track initial loading
  const [hasFetchedSubplebbitAddresses, setHasFetchedSubplebbitAddresses] = useState(false);

  // Set hasInitialized after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasFetchedSubplebbitAddresses(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!hasFetchedSubplebbitAddresses) {
    footerContent = <LoadingEllipsis string={t('loading_feed')} />;
  }

  // Handle search state
  if (isSearching) {
    footerContent = (
      <div className={styles.stateString}>
        <LoadingEllipsis string={t('searching')} />
      </div>
    );
  } else if (showNoResults && searchQuery) {
    footerContent = (
      <div className={styles.stateString}>
        <span className={styles.noMatchesFound}>{t('no_matches_found_for', { query: searchQuery })}</span>
        <br />
        <br />
        <div className={styles.morePostsSuggestion}>
          <span className={styles.link} onClick={onClearSearch}>
            {t('clear_search')}
          </span>
        </div>
      </div>
    );
  } else if (searchQuery && feedLength > 0) {
    // When search results are found
    footerContent = (
      <div className={styles.stateString}>
        <span className={styles.searchResults}>{t('found_n_results_for', { count: feedLength, query: searchQuery })}</span>
        <br />
        <br />
        <div className={styles.morePostsSuggestion}>
          <span className={styles.link} onClick={onClearSearch}>
            {t('clear_search')}
          </span>
        </div>
      </div>
    );
  } else if (feedLength === 0 && !isSearching && !searchQuery && !(weeklyFeedLength > feedLength || monthlyFeedLength > feedLength)) {
    footerContent = t('no_posts');
  } else if (hasMore || subplebbitAddresses.length > 0 || (subplebbitAddresses && subplebbitAddresses.length === 0)) {
    // Only show newer posts/weekly/monthly suggestions when not searching
    footerContent = (
      <>
        {subplebbitAddressesWithNewerPosts.length > 0 && !searchQuery ? (
          <div className={styles.morePostsSuggestion}>
            <Trans
              i18nKey='newer_posts_available'
              components={{
                1: <span key='newer-posts-span' onClick={handleNewerPostsButtonClick} />,
              }}
            />
          </div>
        ) : weeklyFeedLength > feedLength && !searchQuery ? (
          <div className={styles.morePostsSuggestion}>
            <Trans
              i18nKey='more_posts_last_week'
              values={{ currentTimeFilterName, count: feedLength }}
              components={{
                1: <Link key='weekly-posts-link' to={(isInModView ? '/p/mod/' : isInAllView ? '/p/all/' : '/') + (params?.sortType || 'hot') + '/1w'} />,
              }}
            />
          </div>
        ) : (
          monthlyFeedLength > feedLength &&
          !searchQuery && (
            <div className={styles.morePostsSuggestion}>
              <Trans
                i18nKey='more_posts_last_month'
                values={{ currentTimeFilterName, count: feedLength }}
                components={{
                  1: <Link key='monthly-posts-link' to={(isInModView ? '/p/mod/' : isInAllView ? '/p/all/' : '/') + (params?.sortType || 'hot') + '/1m'} />,
                }}
              />
            </div>
          )
        )}
        <div className={styles.stateString}>
          {subplebbitAddresses.length === 0 ? (
            isInModView ? (
              <div className={styles.notModerator}>{t('not_moderator')}</div>
            ) : (
              <div>
                <Trans
                  i18nKey='no_communities_found'
                  components={[<a href='https://github.com/plebbit/temporary-default-subplebbits'>https://github.com/plebbit/temporary-default-subplebbits</a>]}
                />
                <br />
                {t('connect_community_notice')}
              </div>
            )
          ) : !searchQuery ? (
            <LoadingEllipsis string={feedStateString || loadingStateString} />
          ) : null}
        </div>
      </>
    );
  }
  return <div className={styles.footer}>{footerContent}</div>;
};

export default FeedFooter;
