import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Subplebbit as SubplebbitType, useAccount, useAccountSubplebbits, useSubplebbits, useSubplebbitStats } from '@plebbit/plebbit-react-hooks';
import styles from './subplebbits.module.css';
import { getFormattedTimeDuration } from '../../lib/utils/time-utils';
import {
  isSubplebbitsView,
  isSubplebbitsSubscriberView,
  isSubplebbitsModeratorView,
  isSubplebbitsAdminView,
  isSubplebbitsOwnerView,
  isSubplebbitsVoteView,
  isSubplebbitsVotePassingView,
  isSubplebbitsVoteRejectingView,
} from '../../lib/utils/view-utils';
import { useDefaultSubplebbitAddresses } from '../../hooks/use-default-subplebbits';
import Markdown from '../../components/markdown';
import Label from '../../components/post/label';
import Sidebar from '../../components/sidebar';
import SubscribeButton from '../../components/subscribe-button';
import _ from 'lodash';

interface SubplebbitProps {
  index?: number;
  subplebbit: SubplebbitType | undefined;
}

const MyCommunitiesTabs = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isInSubplebbitsSubscriberView = isSubplebbitsSubscriberView(location.pathname);
  const isInSubplebbitsModeratorView = isSubplebbitsModeratorView(location.pathname);
  const isInSubplebbitsAdminView = isSubplebbitsAdminView(location.pathname);
  const isInSubplebbitsOwnerView = isSubplebbitsOwnerView(location.pathname);
  const isInSubplebbitsView =
    isSubplebbitsView(location.pathname) && !isInSubplebbitsSubscriberView && !isInSubplebbitsModeratorView && !isInSubplebbitsAdminView && !isInSubplebbitsOwnerView;

  return (
    <div className={styles.subplebbitsTabs}>
      <Link to='/communities' className={isInSubplebbitsView ? styles.selected : styles.choice}>
        {t('all')}
      </Link>
      <span className={styles.separator}>|</span>
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

const VoteTabs = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isInSubplebbitsVoteView = isSubplebbitsVoteView(location.pathname);
  const isInSubplebbitsVotePassingView = isSubplebbitsVotePassingView(location.pathname);
  const isInSubplebbitsVoteRejectingView = isSubplebbitsVoteRejectingView(location.pathname);

  return (
    <div className={styles.subplebbitsTabs}>
      <Link to='/communities/vote' className={isInSubplebbitsVoteView ? styles.selected : styles.choice}>
        {t('all')}
      </Link>
      <span className={styles.separator}>|</span>
      <Link to='/communities/vote/passing' className={isInSubplebbitsVotePassingView ? styles.selected : styles.choice} onClick={(e) => e.preventDefault()}>
        {t('passing')}
      </Link>
      <span className={styles.separator}>|</span>
      <Link to='/communities/vote/rejecting' className={isInSubplebbitsVoteRejectingView ? styles.selected : styles.choice} onClick={(e) => e.preventDefault()}>
        {t('rejecting')}
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
  const { allActiveUserCount } = useSubplebbitStats({ subplebbitAddress: address });
  const isOnline = updatedAt && updatedAt > Date.now() / 1000 - 60 * 30;

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
              {updatedAt && !isOnline && <Label color='red' text={t('offline')} />}
              {(userRole || isUserOwner) && (
                <span className={styles.label}>
                  <Label color='green' text={userRole || 'owner'} />
                </span>
              )}
              <Link to={`/p/${address}/settings`}>{t('settings')}</Link>
            </div>
          </span>
        </div>
        {description && showDescription && (
          <div className={styles.description}>
            <Markdown content={description} />
          </div>
        )}
      </div>
    </div>
  );
};

const AccountSubplebbits = ({ viewRole }: { viewRole: string }) => {
  const account = useAccount();
  const { accountSubplebbits } = useAccountSubplebbits();

  const filteredSubplebbitsArray = useMemo(() => {
    return Object.values(accountSubplebbits).filter((subplebbit: any) => {
      const isUserOwner = subplebbit.settings !== undefined;
      const userRole = (subplebbit as any).roles?.[account?.author?.address]?.role;
      return isUserOwner || userRole === viewRole;
    });
  }, [accountSubplebbits, account, viewRole]);

  return filteredSubplebbitsArray.map((subplebbit, index) => <Subplebbit key={index} subplebbit={subplebbit} />);
};

const SubscriberSubplebbits = () => {
  const account = useAccount();
  const { subplebbits } = useSubplebbits({ subplebbitAddresses: account?.subscriptions });
  const subplebbitsArray = useMemo(() => Object.values(subplebbits), [subplebbits]);
  return subplebbitsArray?.map((subplebbit, index) => <Subplebbit key={index} subplebbit={subplebbit} />);
};

const AllDefaultSubplebbits = () => {
  const subplebbitAddresses = useDefaultSubplebbitAddresses();
  const { subplebbits } = useSubplebbits({ subplebbitAddresses });
  const subplebbitsArray = useMemo(() => Object.values(subplebbits), [subplebbits]);
  return subplebbitsArray?.map((subplebbit, index) => <Subplebbit key={index} subplebbit={subplebbit} />);
};

const AllAccountSubplebbits = () => {
  const account = useAccount();
  const { accountSubplebbits } = useAccountSubplebbits();
  const accountSubplebbitAddresses = Object.keys(accountSubplebbits);
  const subscriptionsArray = account?.subscriptions ?? [];
  const uniqueAddresses = Array.from(new Set([...accountSubplebbitAddresses, ...subscriptionsArray]));
  const { subplebbits } = useSubplebbits({ subplebbitAddresses: uniqueAddresses });
  const subplebbitsArray = useMemo(() => Object.values(subplebbits ?? {}), [subplebbits]);
  return subplebbitsArray?.map((subplebbit, index) => <Subplebbit key={index} subplebbit={subplebbit} />);
};

const Subplebbits = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isInSubplebbitsSubscriberView = isSubplebbitsSubscriberView(location.pathname);
  const isInSubplebbitsModeratorView = isSubplebbitsModeratorView(location.pathname);
  const isInSubplebbitsAdminView = isSubplebbitsAdminView(location.pathname);
  const isInSubplebbitsOwnerView = isSubplebbitsOwnerView(location.pathname);
  const isInSubplebbitsVoteView = isSubplebbitsVoteView(location.pathname);
  const isInSubplebbitsView =
    isSubplebbitsView(location.pathname) &&
    !isInSubplebbitsSubscriberView &&
    !isInSubplebbitsModeratorView &&
    !isInSubplebbitsAdminView &&
    !isInSubplebbitsOwnerView &&
    !isInSubplebbitsVoteView;

  let viewRole = 'subscriber';
  if (isInSubplebbitsModeratorView) {
    viewRole = 'moderator';
  } else if (isInSubplebbitsAdminView) {
    viewRole = 'admin';
  } else if (isInSubplebbitsOwnerView) {
    viewRole = 'owner';
  }

  const documentTitle = useMemo(() => {
    let title = t('communities').charAt(0).toUpperCase() + t('communities').slice(1);
    if (isInSubplebbitsVoteView) {
      title += ` - ${_.startCase(t('vote'))}`;
    } else if (isInSubplebbitsSubscriberView) {
      title += ` - ${_.startCase(t('subscriber'))}`;
    } else if (isInSubplebbitsModeratorView) {
      title += ` - ${_.startCase(t('moderator'))}`;
    } else if (isInSubplebbitsAdminView) {
      title += ` - ${_.startCase(t('admin'))}`;
    } else if (isInSubplebbitsOwnerView) {
      title += ` - ${_.startCase(t('owner'))}`;
    } else if (isInSubplebbitsView) {
      title += ` - ${_.startCase(t('all'))}`;
    }
    return `${title} - Seedit`;
  }, [isInSubplebbitsSubscriberView, isInSubplebbitsModeratorView, isInSubplebbitsAdminView, isInSubplebbitsOwnerView, isInSubplebbitsView, isInSubplebbitsVoteView, t]);

  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

  return (
    <div className={styles.content}>
      <div className={styles.sidebar}>
        <Sidebar />
      </div>
      {isInSubplebbitsSubscriberView || isInSubplebbitsModeratorView || isInSubplebbitsAdminView || isInSubplebbitsOwnerView || isInSubplebbitsView ? (
        <MyCommunitiesTabs />
      ) : (
        <VoteTabs />
      )}
      <Infobar />
      {isInSubplebbitsVoteView && <AllDefaultSubplebbits />}
      {(isInSubplebbitsModeratorView || isInSubplebbitsAdminView || isInSubplebbitsOwnerView) && <AccountSubplebbits viewRole={viewRole} />}
      {isInSubplebbitsSubscriberView && <SubscriberSubplebbits />}
      {isInSubplebbitsView && <AllAccountSubplebbits />}
    </div>
  );
};

export default Subplebbits;
