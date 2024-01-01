import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Subplebbit as SubplebbitType, useAccountSubplebbits, useSubplebbitStats } from '@plebbit/plebbit-react-hooks';
import styles from './subplebbits.module.css';
import Sidebar from '../../components/sidebar';
import SubscribeButton from '../../components/subscribe-button';
import { getFormattedTimeDuration, getFormattedTimeAgo } from '../../lib/utils/time-utils';
import { isSubplebbitsMineContributorView, isSubplebbitsMineSubscriberView, isSubplebbitsMineModeratorView } from '../../lib/utils/view-utils';

interface SubplebbitProps {
  subplebbit: SubplebbitType;
}

const Tabs = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isSubplebbitsMineSubscriberPage = isSubplebbitsMineSubscriberView(location.pathname);
  const isSubplebbitsMineContributorPage = isSubplebbitsMineContributorView(location.pathname);
  const isSubplebbitsMineModeratorPage = isSubplebbitsMineModeratorView(location.pathname);

  return (
    <div className={styles.subplebbitsTabs}>
      <Link to='/communities/mine/subscriber' className={isSubplebbitsMineSubscriberPage ? styles.selected : styles.choice}>
        subscriber
      </Link>
      <span className={styles.separator}>|</span>
      <Link to='/communities/mine/contributor' className={isSubplebbitsMineContributorPage ? styles.selected : styles.choice}>
        approved user
      </Link>
      <span className={styles.separator}>|</span>
      <Link to='/communities/mine/moderator' className={isSubplebbitsMineModeratorPage ? styles.selected : styles.choice}>
        {t('moderator')}
      </Link>
    </div>
  );
};

const Infobar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isSubplebbitsMineSubscriberPage = isSubplebbitsMineSubscriberView(location.pathname);
  const isSubplebbitsMineContributorPage = isSubplebbitsMineContributorView(location.pathname);
  const isSubplebbitsMineModeratorPage = isSubplebbitsMineModeratorView(location.pathname);

  const infobarText = useMemo(() => {
    if (isSubplebbitsMineSubscriberPage) {
      return 'below are communities you have subscribed to.';
    } else if (isSubplebbitsMineContributorPage) {
      return 'below are the communities that you are an approved user on.';
    } else if (isSubplebbitsMineModeratorPage) {
      return 'below are the communities that you have moderator access to.';
    } else {
      return (
        <>
          click the <code>{t('join')}</code> or <code>{t('leave')}</code> buttons to choose which communities appear on the home feed.
        </>
      );
    }
  }, [isSubplebbitsMineSubscriberPage, isSubplebbitsMineContributorPage, isSubplebbitsMineModeratorPage, t]);

  return <div className={styles.infobar}>{infobarText}</div>;
};

const Subplebbit = ({ subplebbit }: SubplebbitProps) => {
  const { t } = useTranslation();
  const { address, createdAt, description, shortAddress, title, updatedAt } = subplebbit || {};
  const { allActiveUserCount } = useSubplebbitStats({ subplebbitAddress: address });

  // TODO: make arrows functional when token voting is implemented in the API
  const upvoted = false;
  const downvoted = false;
  const upvoteCount = 0;
  const downvoteCount = 0;

  const postScore = upvoteCount === 0 && downvoteCount === 0 ? '•' : upvoteCount - downvoteCount || '•';
  const isOnline = updatedAt && updatedAt > Date.now() / 1000 - 60 * 30;
  const offlineNotice = updatedAt && t('community_last_seen', { dateAgo: getFormattedTimeAgo(updatedAt) });

  return (
    <div className={styles.subplebbit}>
      <div className={styles.midcol}>
        <div className={styles.midcol}>
          <div className={styles.arrowWrapper}>
            <div className={`${styles.arrowCommon} ${upvoted ? styles.upvoted : styles.arrowUp}`} />
          </div>
          <div className={styles.score}>{postScore}</div>
          <div className={styles.arrowWrapper}>
            <div className={`${styles.arrowCommon} ${downvoted ? styles.downvoted : styles.arrowDown}`} />
          </div>
        </div>
      </div>
      <div className={styles.entry}>
        <div className={styles.title}>
          <span className={`${styles.onlineIndicator} ${isOnline ? styles.online : styles.offline}`} />
          <Link to={`/p/${address}`}>
            p/{address.includes('.') ? address : shortAddress}
            {title && `: ${title}`}
          </Link>
          <span className={styles.subscribeButton}>
            <SubscribeButton address={address} />
          </span>
        </div>
        {description && <div className={styles.description}>{description}</div>}
        <div className={styles.tagline}>
          <span>
            {isOnline ? (
              <>
                {t('members_count', { count: allActiveUserCount })}, {t('community_for', { date: getFormattedTimeDuration(createdAt) })}
                <div className={styles.subplebbitPreferences}>
                  <Link to={`/p/${address}/settings`} onClick={(e) => e.preventDefault()}>
                    {t('preferences')}
                  </Link>
                </div>
              </>
            ) : (
              offlineNotice
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

const Subplebbits = () => {
  const { accountSubplebbits } = useAccountSubplebbits();
  const accountSubplebbitsArray = useMemo(() => Object.values(accountSubplebbits), [accountSubplebbits]);

  return (
    <div className={styles.content}>
      <div className={`${styles.sidebar}`}>
        <Sidebar />
      </div>
      <Tabs />
      <Infobar />
      {accountSubplebbitsArray?.map((subplebbit) => <Subplebbit subplebbit={subplebbit} />)}
    </div>
  );
};

export default Subplebbits;
