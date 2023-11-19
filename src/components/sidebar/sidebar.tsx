import { useSubplebbitStats } from '@plebbit/plebbit-react-hooks';
import styles from './sidebar.module.css';
import { Link, useLocation } from 'react-router-dom';
import { getFormattedTime } from '../../lib/utils/time-utils';
import { isAboutView } from '../../lib/utils/view-utils';

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
  const offlineNotice = 'community owner last seen ' + getFormattedTime(updatedAt);
  const onlineStatus = isOnline ? onlineNotice : offlineNotice;
  const location = useLocation();
  const isAbout = isAboutView(location.pathname);

  return (
    <div className={`${isAbout ? styles.about : styles.sidebar}`}>
      <div className={styles.titleBox}>
        <Link className={styles.title} to={`/p/${address}`}>
          {title || shortAddress}
        </Link>
        {title && <div className={styles.address}>p/{address}</div>}
        <span className={`${styles.subscribeButton} ${styles.joinButton}`}>join</span>
        <span className={styles.subscribers}>{allActiveUserCount} readers</span>
        <div className={styles.onlineLine}>
          <span className={`${styles.onlineIndicator} ${isOnline ? styles.online : styles.offline}`} />
          <span>{onlineStatus}</span>
        </div>
        <div className={styles.description}>{description}</div>
        <div className={styles.bottom}>
          created by{' '}
          <Link to={`/u/user.eth}`} onClick={(e) => e.preventDefault()}>
            u/user.eth
          </Link>
          <span className={styles.age}> a community for {getFormattedTime(createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
