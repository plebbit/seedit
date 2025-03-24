import { Fragment, useEffect, useMemo } from 'react';
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
import { useDefaultSubplebbitAddresses, useDefaultSubplebbitTags } from '../../hooks/use-default-subplebbits';
import { useDefaultSubplebbits } from '../../hooks/use-default-subplebbits';
import useIsMobile from '../../hooks/use-is-mobile';
import useIsSubplebbitOffline from '../../hooks/use-is-subplebbit-offline';
import Markdown from '../../components/markdown';
import Label from '../../components/post/label';
import Sidebar from '../../components/sidebar';
import SubscribeButton from '../../components/subscribe-button';
import { nsfwTags } from '../../constants/nsfwTags';
import _ from 'lodash';

interface SubplebbitProps {
  index?: number;
  subplebbit: SubplebbitType;
  tags?: string[];
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
      <Link
        to='/communities/vote/passing'
        className={isInSubplebbitsVotePassingView ? styles.selected : styles.choice}
        onClick={(e) => {
          e.preventDefault();
          alert('This feature is not available yet.');
        }}
        style={{ cursor: 'not-allowed' }}
      >
        {t('passing')}
      </Link>
      <span className={styles.separator}>|</span>
      <Link
        to='/communities/vote/rejecting'
        className={isInSubplebbitsVoteRejectingView ? styles.selected : styles.choice}
        onClick={(e) => {
          e.preventDefault();
          alert('This feature is not available yet.');
        }}
        style={{ cursor: 'not-allowed' }}
      >
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
  const defaultSubplebbits = useDefaultSubplebbits();
  const validTags = useDefaultSubplebbitTags(defaultSubplebbits);

  const isInSubplebbitsSubscriberView = isSubplebbitsSubscriberView(location.pathname);
  const isInSubplebbitsModeratorView = isSubplebbitsModeratorView(location.pathname);
  const isInSubplebbitsAdminView = isSubplebbitsAdminView(location.pathname);
  const isInSubplebbitsOwnerView = isSubplebbitsOwnerView(location.pathname);

  // Add tag check
  const urlTag = location.pathname.includes('/tag/') ? location.pathname.split('/').pop() : undefined;
  const currentTag = urlTag && validTags.includes(urlTag) ? urlTag : undefined;

  // Get base path without tag
  const basePath = location.pathname.split('/tag/')[0];

  let mainInfobarText;
  if (isInSubplebbitsSubscriberView) {
    mainInfobarText = subscriptions.length === 0 ? t('not_subscribed') : t('below_subscribed');
  } else if (isInSubplebbitsModeratorView || isInSubplebbitsAdminView || isInSubplebbitsOwnerView) {
    mainInfobarText = Object.keys(accountSubplebbits).length > 0 ? t('below_moderator_access') : t('not_moderator');
  } else {
    mainInfobarText = (
      <Trans i18nKey='join_communities_notice' values={{ join: t('join'), leave: t('leave') }} components={{ 1: <code key='join' />, 2: <code key='leave' /> }} />
    );
  }

  return (
    <>
      <div className={styles.infobar}>
        <div>{mainInfobarText}</div>
      </div>
      {currentTag && (
        <div className={styles.infobar}>
          {t('filtering_by_tag', { tag: currentTag })} —{' '}
          <Link className={styles.undoLink} to={basePath}>
            {t('undo')}
          </Link>
        </div>
      )}
    </>
  );
};

const Subplebbit = ({ subplebbit, tags, index }: SubplebbitProps) => {
  const { t } = useTranslation();
  const { address, createdAt, description, roles, shortAddress, settings, suggested, title } = subplebbit || {};

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
  const { isOffline, isOnlineStatusLoading, offlineTitle } = useIsSubplebbitOffline(subplebbit);

  const isNsfw = tags?.some((tag) => nsfwTags.includes(tag));

  const isMobile = useIsMobile();
  const descriptionText =
    description &&
    (isMobile
      ? description.length > 100
        ? description.slice(0, 100) + '...'
        : description
      : description.length > 400
      ? description.slice(0, 400) + '...'
      : description);

  return (
    <div className={styles.subplebbit}>
      <div className={styles.row}>
        {!isMobile && <div className={styles.rank}>{(index ?? 0) + 1}</div>}
        <div className={styles.leftcol}>
          <div className={styles.midcol}>
            <div className={styles.arrowWrapper}>
              <div
                className={`${styles.arrowCommon} ${upvoted ? styles.upvoted : styles.arrowUp}`}
                style={{ cursor: 'not-allowed' }}
                onClick={(e) => {
                  e.preventDefault();
                  alert('This feature is not available yet.');
                }}
              />
            </div>
            <div className={styles.score}>{postScore}</div>
            <div className={styles.arrowWrapper}>
              <div
                className={`${styles.arrowCommon} ${downvoted ? styles.downvoted : styles.arrowDown}`}
                style={{ cursor: 'not-allowed' }}
                onClick={(e) => {
                  e.preventDefault();
                  alert('This feature is not available yet.');
                }}
              />
            </div>
          </div>
          <div className={`${styles.avatar} ${!suggested?.avatarUrl ? styles.defaultAvatar : ''}`}>
            <Link to={`/p/${address}`}>
              <img src={suggested?.avatarUrl || 'assets/logo/seedit.png'} alt={address} />
            </Link>
          </div>
        </div>
        <div className={styles.entry}>
          <div className={styles.title}>
            <div className={styles.titleWrapper}>
              <Link to={`/p/${address}`}>
                p/{address?.includes('.') ? address : shortAddress}
                {title && `: ${title}`}
              </Link>
            </div>
          </div>
          <div className={styles.tagline}>
            {t('members_count', { count: allActiveUserCount })}, {t('community_for', { date: getFormattedTimeDuration(createdAt) })}
            <div className={styles.taglineSecondLine}>
              <span className={styles.subscribeButton}>
                <SubscribeButton address={address} />
              </span>
              {(userRole || isUserOwner) && (
                <Link to={`/p/${address}/settings`}>
                  <span className={styles.moderatorIcon} title={userRole || 'owner'} />
                </Link>
              )}
              {isOffline && !isOnlineStatusLoading && <Label color='red' title={offlineTitle} text={t('offline')} />}
              {isNsfw && <Label color='red' title={t('nsfw')} text={t('nsfw')} />}
              {tags && tags.length > 0 && (
                <span className={styles.tags}>
                  {tags.map((tag, index) => (
                    <Fragment key={tag}>
                      <Link to={`/communities/vote/tag/${tag}`}>{tag}</Link>
                    </Fragment>
                  ))}
                </span>
              )}
            </div>
          </div>
          {description && (
            <div className={styles.description}>
              <Markdown content={descriptionText} />
            </div>
          )}
        </div>
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
  return subplebbitsArray?.map((subplebbit, index) => subplebbit && <Subplebbit key={index} subplebbit={subplebbit} />).filter(Boolean);
};

const AllDefaultSubplebbits = () => {
  const defaultSubplebbits = useDefaultSubplebbits();
  const subplebbitAddresses = useDefaultSubplebbitAddresses();
  const pathname = useLocation().pathname;
  const validTags = useDefaultSubplebbitTags(defaultSubplebbits);

  const urlTag = pathname.includes('/tag/') ? pathname.split('/').pop() : undefined;
  const currentTag = urlTag && validTags.includes(urlTag) ? urlTag : undefined;

  const { subplebbits } = useSubplebbits({ subplebbitAddresses });
  const subplebbitsArray = useMemo(() => Object.values(subplebbits), [subplebbits]);

  return subplebbitsArray
    ?.map((subplebbit, index) => {
      if (subplebbit === undefined) return null;
      const tags = defaultSubplebbits.find((defaultSub) => defaultSub.address === subplebbit.address)?.tags;
      if (currentTag && !tags?.includes(currentTag)) return null;
      return <Subplebbit key={index} subplebbit={subplebbit} tags={tags} index={index} />;
    })
    .filter(Boolean);
};

const AllAccountSubplebbits = () => {
  const account = useAccount();
  const { accountSubplebbits } = useAccountSubplebbits();
  const accountSubplebbitAddresses = Object.keys(accountSubplebbits);
  const subscriptionsArray = account?.subscriptions ?? [];
  const uniqueAddresses = Array.from(new Set([...accountSubplebbitAddresses, ...subscriptionsArray]));
  const { subplebbits } = useSubplebbits({ subplebbitAddresses: uniqueAddresses });
  const subplebbitsArray = useMemo(() => Object.values(subplebbits ?? {}), [subplebbits]);
  return subplebbitsArray?.map((subplebbit, index) => subplebbit && <Subplebbit key={index} subplebbit={subplebbit} />).filter(Boolean);
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
