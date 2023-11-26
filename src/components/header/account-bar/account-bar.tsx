import { useCallback, useEffect, useRef, useState } from 'react';
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
  let submitLink;
  const isSubplebbit = isSubplebbitView(location.pathname, params);
  const searchBarRef = useRef<HTMLDivElement>(null);

  if (isSubplebbit) {
    submitLink = `/p/${subplebbitAddress}/submit`;
  } else {
    submitLink = '/submit';
  }

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setSearchVisible(false);
      }
    },
    [searchBarRef],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

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
        <div className={styles.searchBar} ref={searchBarRef}>
          <SearchBar />
        </div>
      )}
    </>
  );
};

export default AccountBar;
