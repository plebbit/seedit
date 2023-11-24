import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAccount } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import styles from './account-bar.module.css';
import { isSubplebbitView } from '../../../lib/utils/view-utils';
import SearchBar from '../../search-bar';

const AccountBar = () => {
  const account = useAccount();
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
  const subplebbitAddress = params.subplebbitAddress;
  const [searchVisible, setSearchVisible] = useState(false);
  const toggleVisible = () => setSearchVisible(!searchVisible);
  let submitLink;
  const isSubplebbit = isSubplebbitView(location.pathname, params);

  if (isSubplebbit) {
    submitLink = `/p/${subplebbitAddress}/submit`;
  } else {
    submitLink = '/submit';
  }

  return (
    <>
      <div className={styles.header}>
        <span className={styles.user}>
          <Link to='/user' onClick={(e) => e.preventDefault()}>
            {account?.author?.shortAddress}
          </Link>
        </span>
        <span className={styles.submitButton}>
          <span className={styles.separator}>|</span>
          <Link to={submitLink} className={styles.textButton}>
            {t('submit')}
          </Link>
        </span>
        <span className={styles.separator}>|</span>
        <Link to='/settings' className={styles.iconButton} onClick={(e) => e.preventDefault()}>
          ✉️
        </Link>
        <span className={styles.searchButton}>
          <span className={styles.separator}>|</span>
          <span className={styles.iconButton} onClick={() => setSearchVisible(true)}>
            🔎
          </span>
        </span>
        <span className={styles.separator}>|</span>
        <Link to='/settings' className={styles.textButton}>
          {t('preferences')}
        </Link>
      </div>
      {searchVisible && (
        <div className={styles.searchBar}>
          <SearchBar isActive={searchVisible} toggleVisible={toggleVisible} />
        </div>
      )}
    </>
  );
};

export default AccountBar;
