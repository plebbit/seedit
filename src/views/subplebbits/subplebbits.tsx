import { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Subplebbit as SubplebbitType, useAccount, useAccountSubplebbits, useSubplebbits, useSubplebbitStats } from '@plebbit/plebbit-react-hooks';
import styles from './subplebbits.module.css';
import Sidebar from '../../components/sidebar';
import SubscribeButton from '../../components/subscribe-button';
import { getFormattedTimeDuration, getFormattedTimeAgo } from '../../lib/utils/time-utils';
import {
  isSubplebbitsView,
  isSubplebbitsMineView,
  isSubplebbitsMineContributorView,
  isSubplebbitsMineSubscriberView,
  isSubplebbitsMineModeratorView,
} from '../../lib/utils/view-utils';
import { useDefaultSubplebbitAddresses } from '../../lib/utils/addresses-utils';

interface SubplebbitProps {
  index?: number;
  subplebbit: SubplebbitType | undefined;
}

const Tabs = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isInSubplebbitsMineSubscriberView = isSubplebbitsMineSubscriberView(location.pathname);
  const isInSubplebbitsMineContributorView = isSubplebbitsMineContributorView(location.pathname);
  const isInSubplebbitsMineModeratorView = isSubplebbitsMineModeratorView(location.pathname);

  return (
    <div className={styles.subplebbitsTabs}>
      <Link to='/communities/mine/subscriber' className={isInSubplebbitsMineSubscriberView ? styles.selected : styles.choice}>
        {t('subscriber')}
      </Link>
      <span className={styles.separator}>|</span>
      <Link
        to='/communities/mine/contributor'
        className={isInSubplebbitsMineContributorView ? styles.selected : styles.choice}
        onClick={(e) => e.preventDefault()} // TODO: enable after approving user is implemented in the API
      >
        {t('approved_user')}
      </Link>
      <span className={styles.separator}>|</span>
      <Link to='/communities/mine/moderator' className={isInSubplebbitsMineModeratorView ? styles.selected : styles.choice}>
        {t('moderator')}
      </Link>
    </div>
  );
};

const Infobar = () => {
  const account = useAccount();
  const { accountSubplebbits } = useAccountSubplebbits();
  const subscriptions = account?.subscriptions || [];
  const { t } = useTranslation();
  const location = useLocation();
  const isInSubplebbitsMineSubscriberView = isSubplebbitsMineSubscriberView(location.pathname);
  const isInSubplebbitsMineContributorView = isSubplebbitsMineContributorView(location.pathname);
  const isInSubplebbitsMineModeratorView = isSubplebbitsMineModeratorView(location.pathname);

  const infobarText = useMemo(() => {
    if (isInSubplebbitsMineSubscriberView) {
      return subscriptions.length === 0 ? 'you are not subscribed to any community.' : 'below are communities you have subscribed to.';
    } else if (isInSubplebbitsMineContributorView) {
      return 'below are the communities that you are an approved user on.';
    } else if (isInSubplebbitsMineModeratorView) {
      return Object.keys(accountSubplebbits).length > 0 ? 'below are the communities that you have moderator access to.' : 'you are not a moderator on any community.';
    } else {
      return (
        <>
          click the <code>{t('join')}</code> or <code>{t('leave')}</code> buttons to choose which communities appear on the home feed.
        </>
      );
    }
  }, [isInSubplebbitsMineSubscriberView, isInSubplebbitsMineContributorView, isInSubplebbitsMineModeratorView, t, subscriptions.length, accountSubplebbits]);

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
  const offlineNotice = updatedAt && t('posts_last_synced', { dateAgo: getFormattedTimeAgo(updatedAt) });

  useEffect(() => {
    document.title = `${t('communities')} - seedit`;
  }, [t]);

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
          <div className={styles.onlineIndicatorWrapper} title={isOnline ? t('online') : t('offline')}>
            <span className={`${styles.onlineIndicator} ${isOnline ? styles.online : styles.offline}`} />
          </div>
          <div className={styles.titleWrapper}>
            <Link to={`/p/${address}`}>
              p/{address?.includes('.') ? address : shortAddress}
              {title && `: ${title}`}
            </Link>
            <span className={styles.subscribeButton}>
              <SubscribeButton address={address} />
            </span>
          </div>
        </div>
        {description && <div className={styles.description}>{description}</div>}
        <div className={styles.tagline}>
          <span>
            {isOnline ? (
              <>
                {t('members_count', { count: allActiveUserCount })}, {t('community_for', { date: getFormattedTimeDuration(createdAt) })}
                <div className={styles.subplebbitPreferences}>
                  <Link to={`/p/${address}/settings`}>{t('settings')}</Link>
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

const AccountSubplebbits = () => {
  const { accountSubplebbits } = useAccountSubplebbits();
  const accountSubplebbitsArray = useMemo(() => Object.values(accountSubplebbits), [accountSubplebbits]);
  return accountSubplebbitsArray?.map((subplebbit, index) => <Subplebbit key={index} subplebbit={subplebbit} />);
};

const SubscriberSubplebbits = () => {
  const account = useAccount();
  const { subplebbits } = useSubplebbits({ subplebbitAddresses: account?.subscriptions || [] });
  const subplebbitsArray = useMemo(() => Object.values(subplebbits), [subplebbits]);
  return subplebbitsArray?.map((subplebbit, index) => <Subplebbit key={index} subplebbit={subplebbit} />);
};

const ApprovedSubplebbits = () => {
  const defaultSubplebbitAddresses = useDefaultSubplebbitAddresses();
  const { subplebbits } = useSubplebbits({ subplebbitAddresses: defaultSubplebbitAddresses || [] });
  const subplebbitsArray = useMemo(() => Object.values(subplebbits), [subplebbits]);
  return subplebbitsArray?.map((subplebbit, index) => <Subplebbit key={index} subplebbit={subplebbit} />);
};

const Subplebbits = () => {
  const location = useLocation();
  const isInSubplebbitsMineSubscriberView = isSubplebbitsMineSubscriberView(location.pathname);
  const isInSubplebbitsMineModeratorView = isSubplebbitsMineModeratorView(location.pathname);
  const isInSubplebbitsView = isSubplebbitsView(location.pathname) && !isInSubplebbitsMineSubscriberView && !isInSubplebbitsMineModeratorView;
  const isInSubplebbitsMineView = isSubplebbitsMineView(location.pathname);

  return (
    <div className={styles.content}>
      <div className={styles.sidebar}>
        <Sidebar />
      </div>
      {(isInSubplebbitsMineView || isInSubplebbitsMineModeratorView || isInSubplebbitsMineSubscriberView) && <Tabs />}
      <Infobar />
      {isInSubplebbitsView && <ApprovedSubplebbits />}
      {isInSubplebbitsMineModeratorView && <AccountSubplebbits />}
      {isInSubplebbitsMineSubscriberView && <SubscriberSubplebbits />}
    </div>
  );
};

export default Subplebbits;
