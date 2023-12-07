import { useAccount, useAccountComments, useAccountSubplebbits, AccountSubplebbit } from '@plebbit/plebbit-react-hooks';
import { getShortAddress } from '@plebbit/plebbit-js';
import styles from './profile-sidebar.module.css';
import { getFormattedDuration } from '../../../lib/utils/time-utils';
import { Link } from 'react-router-dom';

interface ModeratorListProps {
  accountSubplebbits: AccountSubplebbit[];
}

const ModeratorList = ({ accountSubplebbits }: ModeratorListProps) => {
  const accountSubplebbitAddresses = Object.keys(accountSubplebbits);

  return (
    <div className={styles.modList}>
      <div className={styles.modListTitle}>moderator of</div>
      <ul className={`${styles.modListContent} ${styles.modsList}`}>
        {accountSubplebbitAddresses.map((address, index) => (
          <li key={index}>
            <Link to={`/p/${address}`}>p/{getShortAddress(address)}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ProfileSidebar = () => {
  const account = useAccount();
  const { accountComments } = useAccountComments();
  const { accountSubplebbits } = useAccountSubplebbits();
  const oldestCommentTimestamp = accountComments?.[0]?.timestamp || Date.now();
  const { address } = account?.author || {};
  const { postScore, replyScore } = account?.karma || {};

  return (
    <div className={styles.sidebar}>
      <div className={styles.titleBox}>
        <div className={styles.title}>{address}</div>
        <div>
          <span className={styles.karma}>{postScore}</span> post karma
        </div>
        <div>
          <span className={styles.karma}>{replyScore}</span> comment karma
        </div>
        <div className={styles.bottom}>
          <span className={styles.age}>plebbitor for {getFormattedDuration(oldestCommentTimestamp)}</span>
        </div>
      </div>
      {Object.keys(accountSubplebbits).length > 0 && <ModeratorList accountSubplebbits={accountSubplebbits} />}
    </div>
  );
};

export default ProfileSidebar;
