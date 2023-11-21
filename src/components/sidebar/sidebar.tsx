import { getShortAddress } from '@plebbit/plebbit-js';
import { Role, useSubplebbitStats } from '@plebbit/plebbit-react-hooks';
import styles from './sidebar.module.css';
import { Link, useLocation } from 'react-router-dom';
import { getFormattedDuration, getFormattedTimeAgo } from '../../lib/utils/time-utils';
import { findSubplebbitCreator } from '../../lib/utils/user-utils';
import { isAboutView } from '../../lib/utils/view-utils';
import SubscribeButton from '../subscribe-button/subscribe-button';

interface sidebarProps {
  address: string | undefined;
  createdAt: number;
  description?: string;
  roles?: Record<string, Role>;
  rules?: string[];
  shortAddress: string | undefined;
  title?: string;
  updatedAt: number;
}

const Sidebar = ({ address, createdAt, description, roles, rules, shortAddress, title, updatedAt }: sidebarProps) => {
  const { allActiveUserCount, hourActiveUserCount } = useSubplebbitStats({ subplebbitAddress: address });
  const isOnline = updatedAt > Date.now() / 1000 - 60 * 30;
  const onlineNotice = hourActiveUserCount + ' users here now';
  const offlineNotice = 'community node last seen ' + getFormattedTimeAgo(updatedAt);
  const onlineStatus = isOnline ? onlineNotice : offlineNotice;
  const location = useLocation();
  const isAbout = isAboutView(location.pathname);
  const subplebbitCreator = findSubplebbitCreator(roles);
  const creatorAddress = subplebbitCreator === 'anonymous' ? 'anonymous' : `u/${getShortAddress(subplebbitCreator)}`;
  const rolesList = roles ? Object.entries(roles).map(([address, { role }]) => ({ address, role })) : [];

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

  const rulesList = (
    <div className={styles.list}>
      <div className={styles.listTitle}>RULES</div>
      <ul className={`${styles.listContent} ${styles.rulesList}`}>
        {rules?.map((rule, index) => (
          <>
            <li key={index}>
              {index + 1}. {rule}
            </li>
            {index !== rules.length - 1 && <br />}
          </>
        ))}
        <li className={styles.listMore}>about community rules »</li>
      </ul>
    </div>
  );

  return (
    <div className={`${isAbout ? styles.about : styles.sidebar}`}>
      <Link to={`/p/${address}/submit`}>
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
      <div className={styles.titleBox}>
        <Link className={styles.title} to={`/p/${address}`}>
          {title || shortAddress}
        </Link>
        {title && <div className={styles.address}>p/{address}</div>}
        <div className={!title ? styles.subscribeContainer : ''}>
          <SubscribeButton address={address} />
          <span className={styles.subscribers}>{allActiveUserCount} readers</span>
        </div>
        <div className={styles.onlineLine}>
          <span className={`${styles.onlineIndicator} ${isOnline ? styles.online : styles.offline}`} />
          <span>{onlineStatus}</span>
        </div>
        <div className={styles.description}>{description}</div>
        <div className={styles.bottom}>
          created by{' '}
          <Link to={`/u/user.eth`} onClick={(e) => e.preventDefault()}>
            {creatorAddress}
          </Link>
          <span className={styles.age}> a community for {getFormattedDuration(createdAt)}</span>
        </div>
      </div>
      {rules && rulesList}
      {roles && moderatorsList}
    </div>
  );
};

export default Sidebar;
