import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Subplebbit as SubplebbitType, useAccount, useAccountSubplebbits, useSubplebbits, useSubplebbitStats } from '@plebbit/plebbit-react-hooks';
import styles from './subplebbits.module.css';
import Sidebar from '../../components/sidebar';
import SubscribeButton from '../../components/subscribe-button';
import { getFormattedTimeDuration, getFormattedTimeAgo } from '../../lib/utils/time-utils';
import { isSubplebbitsView, isSubplebbitsSubscriberView, isSubplebbitsModeratorView, isSubplebbitsAdminView, isSubplebbitsOwnerView } from '../../lib/utils/view-utils';
import { useDefaultSubplebbitAddresses } from '../../lib/utils/addresses-utils';
import { RoleLabel } from '../../components/post/label/label';

interface SubplebbitProps {
  index?: number;
  subplebbit: SubplebbitType | undefined;
}

const Tabs = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isInSubplebbitsSubscriberView = isSubplebbitsSubscriberView(location.pathname);
  const isInSubplebbitsModeratorView = isSubplebbitsModeratorView(location.pathname);
  const isInSubplebbitsAdminView = isSubplebbitsAdminView(location.pathname);
  const isInSubplebbitsOwnerView = isSubplebbitsOwnerView(location.pathname);

  return (
    <div className={styles.subplebbitsTabs}>
      <Link to='/communities/subscriber' className={isInSubplebbitsSubscriberView ? styles.selected : styles.choice}>
        {t('subscriber')}
      </Link>
      <span className={styles.separator}>|</span>
      <Link to='/communities/moderator' className={isInSubplebbitsModeratorView ? styles.selected : styles.choice}>
        {t('moderator')}
      </Link>
      <span className={styles.separator}>|</span>
      <Link to='/communities/admin' className={isInSubplebbitsAdminView ? styles.selected : styles.choice}>
        {t('admin')}
      </Link>
      <span className={styles.separator}>|</span>
      <Link to='/communities/owner' className={isInSubplebbitsOwnerView ? styles.selected : styles.choice}>
        {t('owner')}
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
  const isInSubplebbitsSubscriberView = isSubplebbitsSubscriberView(location.pathname);
  const isInSubplebbitsModeratorView = isSubplebbitsModeratorView(location.pathname);
  const isInSubplebbitsAdminView = isSubplebbitsAdminView(location.pathname);
  const isInSubplebbitsOwnerView = isSubplebbitsOwnerView(location.pathname);

  const infobarText = useMemo(() => {
    if (isInSubplebbitsSubscriberView) {
      return subscriptions.length === 0 ? t('not_subscribed') : t('below_subscribed');
    } else if (isInSubplebbitsModeratorView || isInSubplebbitsAdminView || isInSubplebbitsOwnerView) {
      return Object.keys(accountSubplebbits).length > 0 ? t('below_moderator_access') : t('not_moderator');
    } else {
      return <Trans i18nKey='join_communities_notice' values={{ join: t('join'), leave: t('leave') }} components={{ 1: <code />, 2: <code /> }} />;
    }
  }, [t, subscriptions.length, accountSubplebbits, isInSubplebbitsSubscriberView, isInSubplebbitsModeratorView, isInSubplebbitsAdminView, isInSubplebbitsOwnerView]);

  return <div className={styles.infobar}>{infobarText}</div>;
};

const Subplebbit = ({ subplebbit }: SubplebbitProps) => {
  const { t } = useTranslation();
  const { address, createdAt, description, roles, shortAddress, settings, suggested, title, updatedAt } = subplebbit || {};

  const [showDescription, setShowDescription] = useState(false);
  const buttonType = showDescription ? 'closeButton' : 'textButton';
  const toggleExpanded = () => setShowDescription(!showDescription);

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
  const { allActiveUserCount, hourActiveUserCount } = useSubplebbitStats({ subplebbitAddress: address });
  const onlineNotice = t('users_online', { count: hourActiveUserCount });
  const offlineNotice = updatedAt && t('posts_last_synced', { dateAgo: getFormattedTimeAgo(updatedAt) });
  const onlineStatus = isOnline ? onlineNotice : offlineNotice;

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
        <div className={styles.tagline}>
          {description && <span className={`${styles.expandButton} ${styles[buttonType]}`} onClick={toggleExpanded} />}
          <span>
            {t('members_count', { count: allActiveUserCount })}, {t('community_for', { date: getFormattedTimeDuration(createdAt) })}
            <div className={styles.subplebbitPreferences}>
              {(userRole || isUserOwner) && (
                <span className={styles.roleLabel}>
                  <RoleLabel role={userRole || 'owner'} />
                </span>
              )}
              <Link to={`/p/${address}/settings`}>{t('settings')}</Link>
              <span className={styles.onlineLine}>
                {/* <span className={`${styles.onlineIndicator} ${isOnline ? styles.online : styles.offline}`} title={isOnline ? t('online') : t('offline')} /> */}
                {/* <span className={`${styles.onlineStatus} ${isOnline ? styles.green : styles.red}`}>{isOnline ? t('online') : t('offline')}</span> */}
                <span>{onlineStatus}</span>
              </span>
            </div>
          </span>
        </div>
        {description && showDescription && <div className={styles.description}>{description}</div>}
      </div>
    </div>
  );
};

const AccountSubplebbits = ({ viewRole }: { viewRole: string }) => {
  const { accountSubplebbits } = useAccountSubplebbits();
  const account = useAccount();

  const filteredSubplebbits = useMemo(() => {
    return Object.values(accountSubplebbits).filter((subplebbit) => {
      const userRole = (subplebbit as any).roles?.[account?.author?.address]?.role;
      return userRole === viewRole;
    });
  }, [accountSubplebbits, account, viewRole]);

  return filteredSubplebbits.map((subplebbit, index) => <Subplebbit key={index} subplebbit={subplebbit} />);
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
  const isInSubplebbitsSubscriberView = isSubplebbitsSubscriberView(location.pathname);
  const isInSubplebbitsModeratorView = isSubplebbitsModeratorView(location.pathname);
  const isInSubplebbitsAdminView = isSubplebbitsAdminView(location.pathname);
  const isInSubplebbitsOwnerView = isSubplebbitsOwnerView(location.pathname);
  const isInSubplebbitsView =
    isSubplebbitsView(location.pathname) && !isInSubplebbitsSubscriberView && !isInSubplebbitsModeratorView && !isInSubplebbitsAdminView && !isInSubplebbitsOwnerView;

  let viewRole = 'subscriber';
  if (isInSubplebbitsModeratorView) {
    viewRole = 'moderator';
  } else if (isInSubplebbitsAdminView) {
    viewRole = 'admin';
  } else if (isInSubplebbitsOwnerView) {
    viewRole = 'owner';
  }

  return (
    <div className={styles.content}>
      <div className={styles.sidebar}>
        <Sidebar />
      </div>
      {(isInSubplebbitsSubscriberView || isInSubplebbitsModeratorView || isInSubplebbitsAdminView || isInSubplebbitsOwnerView) && <Tabs />}
      <Infobar />
      {isInSubplebbitsView && <ApprovedSubplebbits />}
      {(isInSubplebbitsModeratorView || isInSubplebbitsAdminView || isInSubplebbitsOwnerView) && <AccountSubplebbits viewRole={viewRole} />}
      {isInSubplebbitsSubscriberView && <SubscriberSubplebbits />}
    </div>
  );
};

export default Subplebbits;
