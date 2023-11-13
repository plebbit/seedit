import { useTranslation } from 'react-i18next';
import { Link, useLocation, useParams } from 'react-router-dom';
import styles from './account-bar.module.css';
import { useAccount } from '@plebbit/plebbit-react-hooks';

const AccountBar = () => {
  const account = useAccount();
  const { t } = useTranslation();
  const location = useLocation();
  const { subplebbitAddress } = useParams();
  let submitLink;

  if (location.pathname.startsWith(`/p/${subplebbitAddress}/`)) {
    submitLink = `/p/${subplebbitAddress}/submit`;
  } else {
    submitLink = '/submit';
  }

  return (
    <div className={styles.header}>
      <span className={styles.user}>
        <Link to='/user' onClick={(e) => e.preventDefault()}>
          {account?.author?.shortAddress}
        </Link>
      </span>
      <span className={styles.separator}>|</span>
      <Link to={submitLink} className={styles.textButton}>
        {t('submit')}
      </Link>
      <span className={styles.separator}>|</span>
      <Link to='/settings' className={styles.iconButton} onClick={(e) => e.preventDefault()}>
        ✉️
      </Link>
      <span className={styles.separator}>|</span>
      <Link to='/settings' className={styles.iconButton} onClick={(e) => e.preventDefault()}>
        🔎
      </Link>
      <span className={styles.separator}>|</span>
      <Link to='/settings' className={styles.textButton}>
        {t('preferences')}
      </Link>
    </div>
  );
};

export default AccountBar;
