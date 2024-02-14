import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
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
const commitRef = process.env.REACT_APP_COMMIT_REF;
const isElectron = window.isElectron === true;

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
  settings?: any;
}

const RulesList = ({ rules }: { rules: string[] }) => {
  const { t } = useTranslation();
  const markdownRules = rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n');

  return (
    <div className={styles.rules}>
      <div className={styles.rulesTitle}>
        <strong>{t('rules')}</strong>
      </div>
      <Markdown content={markdownRules} />
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
        {t('share_link')}: <input type='text' value={`https://pleb.bz/p/${address}/c/${cid}`} readOnly={true} />
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

const downloadAppLink = (() => {
  const platform = navigator.platform;
  if (platform === 'Linux' || platform === 'Linux x86_64' || platform === 'Linux i686' || platform === 'Linux aarch64') {
    return `https://github.com/plebbit/seedit/releases/download/v${version}/seedit-${version}.AppImage`;
  } else if (platform === 'Win32' || platform === 'Win64' || platform === 'Windows') {
    return `https://github.com/plebbit/seedit/releases/download/v${version}/seedit.Portable.${version}.exe`;
  } else if (platform === 'MacIntel' || platform === 'Macintosh') {
    return `https://github.com/plebbit/seedit/releases/download/v${version}/seedit-${version}.dmg`;
  } else if (platform === 'Android') {
    return undefined;
  } else if (platform === 'iPhone' || platform === 'iPad') {
    return undefined;
  } else {
    return undefined;
  }
})();

const Sidebar = ({ address, cid, createdAt, description, downvoteCount = 0, roles, rules, timestamp = 0, title, updatedAt, upvoteCount = 0, settings }: sidebarProps) => {
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
  const submitRoute =
    isInHomeView || isInHomeAboutView || isInAllView ? '/submit' : isInPendingView ? `/p/${pendingPost?.subplebbitAddress}/submit` : `/p/${address}/submit`;

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

  const account = useAccount();
  const isModerator = roles?.[account.author?.address]?.role;
  const isOwner = !!settings;

  const isConnectedToRpc = !!account?.plebbitOptions.plebbitRpcClientsOptions;
  const navigate = useNavigate();
  const handleCreateCommunity = () => {
    // creating a community only works if the user is running a full node
    if (isElectron || isConnectedToRpc) {
      navigate('/communities/create');
    } else {
      alert(
        t('create_community_not_available', {
          desktopLink: 'https://github.com/plebbit/seedit/releases/latest',
          cliLink: 'https://github.com/plebbit/plebbit-cli',
          interpolation: { escapeValue: false },
        }),
      );
    }
  };

  return (
    <div className={`${isInAboutView ? styles.about : styles.sidebar}`}>
      <SearchBar />
      <div className={styles.searchBarSpacer} />
      {isInPostView && <PostInfo address={address} cid={cid} downvoteCount={downvoteCount} timestamp={timestamp} upvoteCount={upvoteCount} />}
      <Link to={submitRoute}>
        {/* TODO: add .largeButtonDisabled and disabledButtonDescription classnames for subs that don't accept posts */}
        <div className={styles.largeButton}>
          {t('submit_post')}
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
            <span className={`${styles.onlineIndicator} ${isOnline ? styles.online : styles.offline}`} title={isOnline ? t('online') : t('offline')} />
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
          {rules && rules.length > 0 && <RulesList rules={rules} />}
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
      {(isModerator || isOwner) && <ModerationTools address={address} />}
      {roles && <ModeratorsList roles={roles} />}
      <div className={styles.largeButton} onClick={handleCreateCommunity}>
        {t('create_your_community')}
        <div className={styles.nub} />
      </div>
      <div className={styles.footer}>
        <a className={styles.footerLogo} href='https://github.com/plebbit/seedit/releases/latest' target='_blank' rel='noopener noreferrer'>
          <img src='assets/logo/seedit.png' alt='seedit mascot' />
        </a>
        <div className={styles.footerLinks}>
          <ul>
            <li>
              <a href='https://plebbit.com' target='_blank' rel='noopener noreferrer'>
                {t('about')}
              </a>
              <span className={styles.footerSeparator}>|</span>
            </li>
            <li>
              <a href='https://twitter.com/getplebbit' target='_blank' rel='noopener noreferrer'>
                twitter
              </a>
              <span className={styles.footerSeparator}>|</span>
            </li>
            <li>
              <a href='https://t.me/plebbit' target='_blank' rel='noopener noreferrer'>
                telegram
              </a>
              <span className={styles.footerSeparator}>|</span>
            </li>
            <li>
              <a href='https://discord.gg/E7ejphwzGW' target='_blank' rel='noopener noreferrer'>
                discord
              </a>
            </li>
          </ul>
          <ul>
            <li>
              <a href='https://github.com/plebbit/seedit' target='_blank' rel='noopener noreferrer'>
                github
              </a>
              <span className={styles.footerSeparator}>|</span>
            </li>
            {downloadAppLink && (
              <li>
                <a href={downloadAppLink} target='_blank' rel='noopener noreferrer'>
                  {t('download_app')}
                </a>
                <span className={styles.footerSeparator}>|</span>
              </li>
            )}
            <li>
              <a href={`https://github.com/plebbit/seedit/releases/tag/v${version}`} target='_blank' rel='noopener noreferrer'>
                v{version}
              </a>
              {commitRef && (
                <>
                  {' '}
                  (
                  <a href={`https://github.com/plebbit/seedit/commit/${commitRef}`} target='_blank' rel='noopener noreferrer'>
                    {commitRef.slice(0, 7)}
                  </a>
                  )
                </>
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
