import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getShortAddress } from '@plebbit/plebbit-js';
import { useBlock, Role, useSubplebbitStats, useAccountComment } from '@plebbit/plebbit-react-hooks';
import styles from './sidebar.module.css';
import { getFormattedDate, getFormattedTimeDuration, getFormattedTimeAgo } from '../../lib/utils/time-utils';
import { findSubplebbitCreator } from '../../lib/utils/user-utils';
import { isAboutView, isAllView, isHomeView, isPendingView, isPostView, isSubplebbitsView } from '../../lib/utils/view-utils';
import SearchBar from '../search-bar';
import SubscribeButton from '../subscribe-button';

interface sidebarProps {
  address?: string | undefined;
  cid?: string;
  createdAt?: number;
  description?: string;
  downvoteCount?: number;
  roles?: Record<string, Role>;
  rules?: string[];
  timestamp?: number;
  title?: string;
  updatedAt?: number;
  upvoteCount?: number;
}

const RulesList = ({ rules }: { rules: string[] }) => {
  return (
    <div className={styles.rules}>
      <strong>Rules</strong>
      <ol className={styles.rulesList}>{rules?.map((rule, index) => <li key={index}>{rule}</li>)}</ol>
    </div>
  );
};

const ModeratorsList = ({ roles }: { roles: Record<string, Role> }) => {
  const { t } = useTranslation();
  const rolesList = roles ? Object.entries(roles).map(([address, { role }]) => ({ address, role })) : [];

  return (
    <div className={styles.list}>
      <div className={styles.listTitle}>{t('moderators')}</div>
      <ul className={`${styles.listContent} ${styles.modsList}`}>
        {rolesList.map(({ address }, index) => (
          <li key={index}>u/{getShortAddress(address)}</li>
        ))}
        <li className={styles.listMore}>{t('about_moderation')} »</li>
      </ul>
    </div>
  );
};

const PostInfo = ({ address, cid, downvoteCount = 0, timestamp = 0, upvoteCount = 0 }: sidebarProps) => {
  const { t, i18n } = useTranslation();
  const { language } = i18n;
  const postScore = upvoteCount - downvoteCount;
  const totalVotes = upvoteCount + downvoteCount;
  const upvotePercentage = totalVotes > 0 ? Math.round((upvoteCount / totalVotes) * 100) : 0;
  const postDate = getFormattedDate(timestamp, language);

  return (
    <div className={styles.postInfo}>
      <div className={styles.postDate}>
        <span>{t('post_submitted_on', { postDate: postDate })}</span>
      </div>
      <div className={styles.postScore}>
        <span className={styles.postScoreNumber}>{postScore} </span>
        <span className={styles.postScoreWord}>{postScore === 1 ? t('point') : t('points')}</span> ({upvotePercentage}% {t('upvoted')})
      </div>
      <div className={styles.shareLink}>
        {t('share_link')}: <input type='text' value={`https://seedit.eth.limo/#/p/${address}/c/${cid}`} readOnly={true} />
      </div>
    </div>
  );
};

const Sidebar = ({ address, cid, createdAt, description, downvoteCount = 0, roles, rules, timestamp = 0, title, updatedAt, upvoteCount = 0 }: sidebarProps) => {
  const { t } = useTranslation();
  const { allActiveUserCount, hourActiveUserCount } = useSubplebbitStats({ subplebbitAddress: address });
  const isOnline = updatedAt && updatedAt > Date.now() / 1000 - 60 * 30;
  const onlineNotice = t('users_online', { count: hourActiveUserCount });
  const offlineNotice = updatedAt && t('community_last_seen', { dateAgo: getFormattedTimeAgo(updatedAt) });
  const onlineStatus = isOnline ? onlineNotice : offlineNotice;

  const location = useLocation();
  const params = useParams();
  const isAboutPage = isAboutView(location.pathname);
  const isAllPage = isAllView(location.pathname);
  const isHomePage = isHomeView(location.pathname, params);
  const isPendingPage = isPendingView(location.pathname, params);
  const isPostPage = isPostView(location.pathname, params);
  const isSubplebbitsPage = isSubplebbitsView(location.pathname);

  const pendingPost = useAccountComment({ commentIndex: params?.accountCommentIndex as any });

  const subplebbitCreator = findSubplebbitCreator(roles);
  const creatorAddress = subplebbitCreator === 'anonymous' ? 'anonymous' : `${getShortAddress(subplebbitCreator)}`;
  const submitRoute = isHomePage || isAllPage ? '/submit' : isPendingPage ? `/p/${pendingPost?.subplebbitAddress}/submit` : `/p/${address}/submit`;

  const { blocked, unblock, block } = useBlock({ address });

  const blockConfirm = () => {
    if (blocked) {
      if (window.confirm(t('unblock_community_alert'))) {
        unblock();
      }
    } else if (!blocked) {
      if (window.confirm(t('block_community_alert'))) {
        block();
      }
    }
  };

  const alertCreateCommunity = () => {
    alert('Not available in this version. You can create a community with the CLI: https://github.com/plebbit/plebbit-cli');
  };

  return (
    <div className={`${isAboutPage ? styles.about : styles.sidebar}`}>
      <SearchBar />
      <div className={styles.searchBarSpacer} />
      {isPostPage && <PostInfo address={address} cid={cid} downvoteCount={downvoteCount} timestamp={timestamp} upvoteCount={upvoteCount} />}
      <Link to={submitRoute}>
        <div className={styles.largeButton}>
          {t('submit_post')}
          <div className={styles.nub} />
        </div>
      </Link>
      <Link to='/communities/create' onClick={(e) => e.preventDefault()}>
        <div className={styles.largeButton} onClick={alertCreateCommunity}>
          {t('create_community')}
          <div className={styles.nub} />
        </div>
      </Link>
      {!isHomePage && !isAllPage && !isPendingPage && !isSubplebbitsPage && (
        <div className={styles.titleBox}>
          <Link className={styles.title} to={`/p/${address}`}>
            {address}
          </Link>
          <div className={styles.subscribeContainer}>
            <SubscribeButton address={address} />
            <span className={styles.subscribers}>{t('members_count', { count: allActiveUserCount })}</span>
          </div>
          <div className={styles.onlineLine}>
            <span className={`${styles.onlineIndicator} ${isOnline ? styles.online : styles.offline}`} />
            <span>{onlineStatus}</span>
          </div>
          {description && (
            <div>
              {title && (
                <div className={styles.descriptionTitle}>
                  <strong>{title}</strong>
                </div>
              )}
              <div className={styles.description}>{description}</div>
            </div>
          )}
          {rules && <RulesList rules={rules} />}
          <div className={styles.bottom}>
            {t('created_by', { creatorAddress: '' })}
            <Link to={`/u/${creatorAddress}`} onClick={(e) => e.preventDefault()}>{`u/${creatorAddress}`}</Link>
            {createdAt && <span className={styles.age}> {t('community_for', { date: getFormattedTimeDuration(createdAt) })}</span>}
            <div className={styles.bottomButtons}>
              <span className={styles.blockSub} onClick={blockConfirm}>
                {blocked ? t('unblock_community') : t('block_community')}
              </span>
              <span className={styles.communitySettings}>
                <Link to={`/p/${address}/settings`}>{t('settings')}</Link>
              </span>
            </div>
          </div>
        </div>
      )}
      {roles && <ModeratorsList roles={roles} />}
    </div>
  );
};

export default Sidebar;
