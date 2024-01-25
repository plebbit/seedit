import { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
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
import { RoleLabel } from '../../components/post/label/label';

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
      return subscriptions.length === 0 ? t('not_subscribed') : t('below_subscribed');
    } else if (isInSubplebbitsMineContributorView) {
      return t('below_approved_user');
    } else if (isInSubplebbitsMineModeratorView) {
      return Object.keys(accountSubplebbits).length > 0 ? t('below_moderator_access') : t('not_moderator');
    } else {
      return <Trans i18nKey='join_communities_notice' values={{ join: t('join'), leave: t('leave') }} components={{ 1: <code />, 2: <code /> }} />;
    }
  }, [isInSubplebbitsMineSubscriberView, isInSubplebbitsMineContributorView, isInSubplebbitsMineModeratorView, t, subscriptions.length, accountSubplebbits]);

  return <div className={styles.infobar}>{infobarText}</div>;
};

const Subplebbit = ({ subplebbit }: SubplebbitProps) => {
  const { t } = useTranslation();
  const { address, createdAt, description, roles, shortAddress, settings, suggested, title, updatedAt } = subplebbit || {};
  const { allActiveUserCount } = useSubplebbitStats({ subplebbitAddress: address });

  // subplebbit.settings is a private field that is only available to the owner of the subplebbit
  const isUserOwner = settings;
  const account = useAccount();
  const userRole = roles?.[account?.author?.address]?.role;

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
      {suggested?.avatarUrl && (
        <div className={styles.avatar}>
          <Link to={`/p/${address}`}>
            <img src={suggested?.avatarUrl} alt={address} />
          </Link>
        </div>
      )}
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
              </>
            ) : (
              offlineNotice
            )}
            <div className={styles.subplebbitPreferences}>
              {(userRole || isUserOwner) && (
                <span className={styles.roleLabel}>
                  <RoleLabel role={userRole || 'owner'} />
                </span>
              )}
              <Link to={`/p/${address}/settings`}>{t('settings')}</Link>
            </div>
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
