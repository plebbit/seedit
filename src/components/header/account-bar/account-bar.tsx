import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from './account-bar.module.css';
import { useAccount } from '@plebbit/plebbit-react-hooks';

const AccountBar: FC = () => {
  const account = useAccount();
  const { t } = useTranslation();

  return (
    <div className={styles.header}>
      <span className={styles.user}>
        <Link to='/user' onClick={(e) => e.preventDefault()}>
          {account?.author.shortAddress}
        </Link>
      </span>
      <span className={styles.separator}>|</span>
      <Link
        to='/settings'
        className={styles.preferences}
        onClick={(e) => {e.preventDefault();}}
      >
        {t('account_bar_submit')}
      </Link>
      <span className={styles.separator}>|</span>
      <Link to='/settings' className={styles.preferences} onClick={(e) => e.preventDefault()}>
        {t('account_bar_preferences')}
      </Link>
    </div>
  );
};

export default AccountBar;
