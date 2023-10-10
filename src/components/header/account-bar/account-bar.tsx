import { Link } from 'react-router-dom';
import styles from './account-bar.module.css';
import { useAccount } from '@plebbit/plebbit-react-hooks';

const AccountBar = () => {
  const account = useAccount();

  return (
    <div className={styles.header}>
      <span className={styles.user}>
        <Link to='/user' onClick={(e) => e.preventDefault()}>
          {account?.author.shortAddress}
        </Link>
      </span>
      <span className={styles.separator}>|</span>
      <Link to='/settings' className={styles.preferences} onClick={(e) => e.preventDefault()}>
        preferences
      </Link>
    </div>
  );
};

export default AccountBar;
