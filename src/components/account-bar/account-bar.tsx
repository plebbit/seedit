import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { createAccount, setActiveAccount, useAccount, useAccounts } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import styles from './account-bar.module.css';
import { isSubplebbitView } from '../../lib/utils/view-utils';
import SearchBar from '../search-bar';

const AccountBar = () => {
  const account = useAccount();
  const { accounts } = useAccounts();
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
  const subplebbitAddress = params.subplebbitAddress;
  const isSubplebbit = isSubplebbitView(location.pathname, params);

  const [searchVisible, setSearchVisible] = useState(false);
  const toggleSearchVisible = () => setSearchVisible(!searchVisible);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const searchBarButtonRef = useRef<HTMLDivElement>(null);

  const [accountSelectVisible, setAccountSelectVisible] = useState(false);
  const toggleAccountSelectVisible = () => setAccountSelectVisible(!accountSelectVisible);
  const accountSelectRef = useRef<HTMLDivElement>(null);
  const accountSelectButtonRef = useRef<HTMLDivElement>(null);

  let submitLink;

  if (isSubplebbit) {
    submitLink = `/p/${subplebbitAddress}/submit`;
  } else {
    submitLink = '/submit';
  }

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      const target = event.target as Node;

      const isOutsideSearchBar =
        searchBarRef.current && !searchBarRef.current.contains(target) && searchBarButtonRef.current && !searchBarButtonRef.current.contains(target);
      const isOutsideAccountSelect =
        accountSelectRef.current && !accountSelectRef.current.contains(target) && accountSelectButtonRef.current && !accountSelectButtonRef.current.contains(target);

      if (isOutsideSearchBar) {
        setSearchVisible(false);
      }
      if (isOutsideAccountSelect) {
        setAccountSelectVisible(false);
      }
    },
    [searchBarRef, accountSelectRef],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const accountsOptions = accounts.map((account) => (
    <option key={account?.id} value={account?.name}>
      u/{account?.author?.shortAddress?.toLowerCase?.().substring(0, 8) || ''}
    </option>
  ));

  accountsOptions[accountsOptions.length] = (
    <option key='create' value='createAccount'>
      +create
    </option>
  );

  const onAccountSelectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'createAccount') {
      createAccount();
    } else {
      setActiveAccount(e.target.value);
    }
  };

  return (
    <div className={styles.content}>
      <span className={styles.user} ref={accountSelectRef}>
        <span onClick={toggleAccountSelectVisible} ref={accountSelectButtonRef}>
          {account?.author?.shortAddress}
        </span>
          {accountSelectVisible && (
        <span className={styles.accountSelect} ref={accountSelectRef}>
          <select className={styles.select} onChange={onAccountSelectChange} value={account?.name}>
            {accountsOptions}
          </select>
        </span>
      )}
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
        <span className={styles.iconButton} onClick={toggleSearchVisible} ref={searchBarButtonRef}>
          🔎
        </span>
        {searchVisible && (
          <div className={styles.searchBar} ref={searchBarRef}>
            <SearchBar />
          </div>
        )}
      </span>
      <span className={styles.separator}>|</span>
      <Link to='/settings' className={styles.textButton}>
        {t('preferences')}
      </Link>
    </div>
  );
};

export default AccountBar;
