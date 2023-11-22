import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getShortAddress } from '@plebbit/plebbit-js';
import { Role, useSubplebbitStats } from '@plebbit/plebbit-react-hooks';
import styles from './sidebar.module.css';
import { getFormattedDate, getFormattedDuration, getFormattedTimeAgo } from '../../lib/utils/time-utils';
import { findSubplebbitCreator } from '../../lib/utils/user-utils';
import { isAboutView, isHomeView, isPostView } from '../../lib/utils/view-utils';
import SubscribeButton from '../subscribe-button';

interface sidebarProps {
  address?: string | undefined;
  cid?: string;
  createdAt?: number;
  description?: string;
  downvoteCount?: number;
  roles?: Record<string, Role>;
  rules?: string[];
  shortAddress?: string | undefined;
  timestamp?: number;
  title?: string;
  updatedAt?: number;
  upvoteCount?: number;
}

const Sidebar = ({
  address,
  cid,
  createdAt,
  description,
  downvoteCount = 0,
  roles,
  rules,
  shortAddress,
  timestamp = 0,
  title,
  updatedAt,
  upvoteCount = 0,
}: sidebarProps) => {
  const { i18n } = useTranslation();
  const { language } = i18n;
  const { allActiveUserCount, hourActiveUserCount } = useSubplebbitStats({ subplebbitAddress: address });
  const isOnline = updatedAt && updatedAt > Date.now() / 1000 - 60 * 30;
  const onlineNotice = hourActiveUserCount + ' users here now';
  const offlineNotice = updatedAt && 'community node last seen ' + getFormattedTimeAgo(updatedAt);
  const onlineStatus = isOnline ? onlineNotice : offlineNotice;
  const location = useLocation();
  const params = useParams();
  const isAbout = isAboutView(location.pathname);
  const isHome = isHomeView(location.pathname);
  const isPost = isPostView(location.pathname, params);
  const subplebbitCreator = findSubplebbitCreator(roles);
  const creatorAddress = subplebbitCreator === 'anonymous' ? 'anonymous' : `u/${getShortAddress(subplebbitCreator)}`;
  const rolesList = roles ? Object.entries(roles).map(([address, { role }]) => ({ address, role })) : [];
  const submitRoute = isHome ? '/submit' : `/p/${address}/submit`;
  const postScore = upvoteCount - downvoteCount;
  const totalVotes = upvoteCount + downvoteCount;
  const upvotePercentage = totalVotes > 0 ? Math.round((upvoteCount / totalVotes) * 100) : 0;
  const postDate = getFormattedDate(timestamp, language);

  const rulesList = (
    <div className={styles.rules}>
      <strong>Rules</strong>
      <ol className={styles.rulesList}>
        {rules?.map((rule, index) => (
          <>
            <li key={index}>
              {rule}
            </li>
          </>
        ))}
      </ol>
    </div>
  );

  const moderatorsList = (
    <div className={styles.list}>
      <div className={styles.listTitle}>MODERATORS</div>
      <ul className={`${styles.listContent} ${styles.modsList}`}>
        {rolesList.map(({ address }, index) => (
          <li key={index}>u/{getShortAddress(address)}</li>
        ))}
        <li className={styles.listMore}>about moderation team »</li>
      </ul>
    </div>
  );

  const postInfo = (
    <div className={styles.postInfo}>
      <div className={styles.postDate}>
        <span>this post was submitted on {postDate}</span>
      </div>
      <div className={styles.postScore}>
        <span className={styles.postScoreNumber}>{postScore} </span>
        <span className={styles.postScoreWord}>point{postScore !== 1 ? 's' : ''}</span> ({upvotePercentage}% upvoted)
      </div>
      <div className={styles.shareLink}>
        share link: <input type='text' value={`https://seedit.eth.limo/#/p/${address}/c/${cid}`} readOnly={true} />
      </div>
    </div>
  );

  return (
    <div className={`${isAbout ? styles.about : styles.sidebar}`}>
      <form className={styles.searchBar}>
        <input type='text' placeholder='search' onSubmit={(e) => e.preventDefault()} />
        <input type='submit' value='' />
      </form>
      {isPost && postInfo}
      <Link to={submitRoute}>
        <div className={styles.largeButton}>
          Submit a new post
          <div className={styles.nub} />
        </div>
      </Link>
      <Link to='/communities/create' onClick={(e) => e.preventDefault()}>
        <div className={styles.largeButton}>
          Create your own community
          <div className={styles.nub} />
        </div>
      </Link>
      {!isHome && (
        <div className={styles.titleBox}>
          <Link className={styles.title} to={`/p/${address}`}>
            {shortAddress}
          </Link>
          <div className={styles.subscribeContainer}>
            <SubscribeButton address={address} />
            <span className={styles.subscribers}>{allActiveUserCount} readers</span>
          </div>
          <div className={styles.onlineLine}>
            <span className={`${styles.onlineIndicator} ${isOnline ? styles.online : styles.offline}`} />
            <span>{onlineStatus}</span>
          </div>
          {description && <div>
            {title && <div className={styles.descriptionTitle}><strong>{title}</strong></div>}
            <div className={styles.description}>{description}</div>
          </div>}
          {rules && rulesList}
          <div className={styles.bottom}>
            created by{' '}
            <Link to={`/u/user.eth`} onClick={(e) => e.preventDefault()}>
              {creatorAddress}
            </Link>
            {createdAt && <span className={styles.age}> a community for {getFormattedDuration(createdAt)}</span>}
          </div>
        </div>
      )}
      {roles && moderatorsList}
    </div>
  );
};

export default Sidebar;
