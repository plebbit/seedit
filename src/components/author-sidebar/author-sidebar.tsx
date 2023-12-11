import { useAccount, useAccountComments, useAccountSubplebbits, AccountSubplebbit } from '@plebbit/plebbit-react-hooks';
import { getShortAddress } from '@plebbit/plebbit-js';
import styles from './author-sidebar.module.css';
import { getFormattedDuration } from '../../lib/utils/time-utils';
import { Link, useLocation, useParams } from 'react-router-dom';
import { isAuthorView, isProfileView } from '../../lib/utils/view-utils';

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

const AuthorSidebar = () => {
  const account = useAccount();
  const { postScore, replyScore } = account?.karma || {};
  const { accountComments } = useAccountComments();
  const oldestCommentTimestamp = accountComments?.[0]?.timestamp || Date.now();
  const { accountSubplebbits } = useAccountSubplebbits();

  const location = useLocation();
  const params = useParams();
  const isAuthorPage = isAuthorView(location.pathname);
  const isProfilePage = isProfileView(location.pathname);
  const address = isAuthorPage ? params?.authorAddress : isProfilePage ? account?.author?.shortAddress : '';

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
          <span className={styles.age}>plebbitor for at least {getFormattedDuration(oldestCommentTimestamp)}</span>
        </div>
      </div>
      {Object.keys(accountSubplebbits).length > 0 && <ModeratorList accountSubplebbits={accountSubplebbits} />}
    </div>
  );
};

export default AuthorSidebar;
