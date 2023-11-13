import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAccount } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import styles from './account-bar.module.css';

const AccountBar = () => {
  const account = useAccount();
  const { t } = useTranslation();
  const location = useLocation();
  const { subplebbitAddress } = useParams();
  const [searchHidden, setSearchHidden] = useState(true);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  let submitLink;

  if (location.pathname.startsWith(`/p/${subplebbitAddress}/`)) {
    submitLink = `/p/${subplebbitAddress}/submit`;
  } else {
    submitLink = '/submit';
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (searchBarRef.current && event.target instanceof Node && !searchBarRef.current.contains(event.target)) {
      setSearchHidden(true);
    }
  };
  
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!searchHidden && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchHidden]);

  return (
    <>
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
        <span className={styles.iconButton} onClick={() => setSearchHidden(false)}>
          🔎
        </span>
        <span className={styles.separator}>|</span>
        <Link to='/settings' className={styles.textButton}>
          {t('preferences')}
        </Link>
      </div>
      <div className={styles.searchBar} style={{visibility: searchHidden ? 'hidden' : 'visible'}} ref={searchBarRef}>
        <input type='text' placeholder={`"community.eth" ${t('or')} "12D3KooW..."`} ref={searchInputRef} />
        <input type='submit' value='' />
      </div>
    </>
  );
};

export default AccountBar;
