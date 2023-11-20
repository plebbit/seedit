import { useSubplebbitStats } from '@plebbit/plebbit-react-hooks';
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
  roles?: {};
  shortAddress: string | undefined;
  title?: string;
  updatedAt: number;
}

const Sidebar = ({ address, createdAt, description, roles, shortAddress, title, updatedAt }: sidebarProps) => {
  const { allActiveUserCount, hourActiveUserCount } = useSubplebbitStats({ subplebbitAddress: address });
  const isOnline = updatedAt > Date.now() / 1000 - 60 * 30;
  const onlineNotice = hourActiveUserCount + ' users here now';
  const offlineNotice = 'community node last seen ' + getFormattedTimeAgo(updatedAt);
  const onlineStatus = isOnline ? onlineNotice : offlineNotice;
  const location = useLocation();
  const isAbout = isAboutView(location.pathname);
  const subplebbitCreator = findSubplebbitCreator(roles);
  const creatorAddress = subplebbitCreator === 'anonymous' ? 'anonymous' : `u/${subplebbitCreator}`;

  return (
    <div className={`${isAbout ? styles.about : styles.sidebar}`}>
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
    </div>
  );
};

export default Sidebar;
