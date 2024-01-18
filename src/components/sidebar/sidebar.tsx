import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getShortAddress } from '@plebbit/plebbit-js';
import { useAccount, useBlock, Role, useSubplebbitStats, useAccountComment } from '@plebbit/plebbit-react-hooks';
import styles from './sidebar.module.css';
import { getFormattedDate, getFormattedTimeDuration, getFormattedTimeAgo } from '../../lib/utils/time-utils';
import { findSubplebbitCreator } from '../../lib/utils/user-utils';
import { isAboutView, isAllView, isHomeAboutView, isHomeView, isPendingView, isPostView, isSubplebbitSettingsView, isSubplebbitsView } from '../../lib/utils/view-utils';
import Markdown from '../markdown';
import SearchBar from '../search-bar';
import SubscribeButton from '../subscribe-button';
import packageJson from '../../../package.json';
const { version } = packageJson;
const commitRef = process?.env?.REACT_APP_COMMIT_REF ? ` ${process.env.REACT_APP_COMMIT_REF.slice(0, 7)}` : '';

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

const ModerationTools = ({ address }: sidebarProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
  const isInSubplebbitSettingsView = isSubplebbitSettingsView(location.pathname, params);

  return (
    <div className={styles.list}>
      <div className={styles.listTitle}>{t('moderation_tools')}</div>
      <ul className={`${styles.listContent} ${styles.modsList}`}>
        <li className={`${styles.moderationTool} ${isInSubplebbitSettingsView ? styles.selectedTool : ''}`}>
          <Link className={styles.communitySettingsTool} to={`/p/${address}/settings`}>
            {t('community_settings')}
          </Link>
        </li>
      </ul>
    </div>
  );
};

const Sidebar = ({ address, cid, createdAt, description, downvoteCount = 0, roles, rules, timestamp = 0, title, updatedAt, upvoteCount = 0 }: sidebarProps) => {
  const { t } = useTranslation();
  const { allActiveUserCount, hourActiveUserCount } = useSubplebbitStats({ subplebbitAddress: address });
  const isOnline = updatedAt && updatedAt > Date.now() / 1000 - 60 * 30;
  const onlineNotice = t('users_online', { count: hourActiveUserCount });
  const offlineNotice = updatedAt && t('posts_last_synced', { dateAgo: getFormattedTimeAgo(updatedAt) });
  const onlineStatus = isOnline ? onlineNotice : offlineNotice;

  const location = useLocation();
  const params = useParams();
  const isInAboutView = isAboutView(location.pathname);
  const isInAllView = isAllView(location.pathname);
  const isInHomeAboutView = isHomeAboutView(location.pathname);
  const isInHomeView = isHomeView(location.pathname, params);
  const isInPendingView = isPendingView(location.pathname, params);
  const isInPostView = isPostView(location.pathname, params);
  const isInSubplebbitsView = isSubplebbitsView(location.pathname);

  const pendingPost = useAccountComment({ commentIndex: params?.accountCommentIndex as any });

  const subplebbitCreator = findSubplebbitCreator(roles);
  const creatorAddress = subplebbitCreator === 'anonymous' ? 'anonymous' : `${getShortAddress(subplebbitCreator)}`;
  const submitRoute = isInHomeView || isInAllView ? '/submit' : isInPendingView ? `/p/${pendingPost?.subplebbitAddress}/submit` : `/p/${address}/submit`;

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

  const account = useAccount();
  const isModerator = roles?.[account.author?.address]?.role;

  return (
    <div className={`${isInAboutView ? styles.about : styles.sidebar}`}>
      <SearchBar />
      <div className={styles.searchBarSpacer} />
      {isInPostView && <PostInfo address={address} cid={cid} downvoteCount={downvoteCount} timestamp={timestamp} upvoteCount={upvoteCount} />}
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
      {!isInHomeView && !isInHomeAboutView && !isInAllView && !isInPendingView && !isInSubplebbitsView && (
        <div className={styles.titleBox}>
          <Link className={styles.title} to={`/p/${address}`}>
            {address}
          </Link>
          <div className={styles.subscribeContainer}>
            <span className={styles.subscribeButton}>
              <SubscribeButton address={address} />
            </span>
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
              <div className={styles.description}>
                <Markdown content={description} />
              </div>
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
            </div>
          </div>
        </div>
      )}
      {isModerator && <ModerationTools address={address} />}
      {roles && <ModeratorsList roles={roles} />}
      <div className={styles.footer}>
        <ul>
          <li className={styles.footerTitle}>about</li>
          <li>
            <a href='https://plebbit.com' target='_blank' rel='noopener noreferrer'>
              plebbit
            </a>
          </li>
          <li>
            <a href='https://github.com/plebbit/seedit' target='_blank' rel='noopener noreferrer'>
              github
            </a>
          </li>
          <li>
            <a href='https://twitter.com/getplebbit' target='_blank' rel='noopener noreferrer'>
              twitter
            </a>
          </li>
          <li>
            <a href='https://t.me/telegram' target='_blank' rel='noopener noreferrer'>
              telegram
            </a>
          </li>
        </ul>
        <div className={styles.desktopAd}>
          <a className={styles.desktopAdMascot} href='https://github.com/plebbit/seedit/releases/latest' target='_blank' rel='noopener noreferrer'>
            <img src='icon.png' alt='seedit mascot' />
          </a>
          <span className={styles.desktopAdSubtitle}>
            <br />
            ...each community's data needs to be seeded.
            <br />
            ...use the desktop app to seed it automatically!
          </span>
        </div>
        <div className={`${styles.version} ${commitRef ? styles.unstable : ''}`}>
          <a href='https://github.com/plebbit/seedit/releases/latest' target='_blank' rel='noopener noreferrer'>
            seedit {commitRef ? 'dev build (unstable) ' + commitRef : window.electron && window.electron.isElectron ? 'desktop' : 'web'} v{version} - GPL 2.0
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
