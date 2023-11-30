import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { createAccount, setActiveAccount, useAccount, useAccounts } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import styles from './account-bar.module.css';
import { isSettingsView, isSubmitView, isSubplebbitView } from '../../lib/utils/view-utils';
import SearchBar from '../search-bar';

const AccountBar = () => {
  const account = useAccount();
  const { accounts } = useAccounts();
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
  const subplebbitAddress = params.subplebbitAddress;
  const isSubplebbit = isSubplebbitView(location.pathname, params);
  const isSubmit = isSubmitView(location.pathname);
  const isSettings = isSettingsView(location.pathname);

  const [searchVisible, setSearchVisible] = useState(false);
  const toggleSearchVisible = () => setSearchVisible(!searchVisible);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const searchBarButtonRef = useRef<HTMLDivElement>(null);

  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const toggleAccountDropdown = () => setIsAccountDropdownOpen(!isAccountDropdownOpen);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const accountDropdownChoicesRef = useRef<HTMLDivElement>(null);
  const accountDropdownClass = isAccountDropdownOpen ? styles.visible : styles.hidden;
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
      const isOutsideAccountDropdown =
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(target) &&
        accountDropdownChoicesRef.current &&
        !accountDropdownChoicesRef.current.contains(target);
      const isOutsideAccountSelectButton = accountSelectButtonRef.current && !accountSelectButtonRef.current.contains(target);

      if (isOutsideAccountSelectButton && isOutsideAccountDropdown) {
        setIsAccountDropdownOpen(false);
      }

      if (isOutsideSearchBar) {
        setSearchVisible(false);
      }
    },
    [searchBarRef, accountSelectButtonRef, accountDropdownRef, accountDropdownChoicesRef],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const accountDropdownOptions = accounts.map((account, index) => (
    <span key={index} className={styles.dropdownChoice} onClick={() => setActiveAccount(account?.name)}>
      {`u/${account?.author?.shortAddress}`}
    </span>
  ));

  accountDropdownOptions.push(
    <Link key='create' to='#' className={styles.dropdownChoice} onClick={() => createAccount()}>
      +create
    </Link>,
  );

  return (
    <div className={styles.content}>
      <span className={styles.user}>
        <Link to='/user.eth' onClick={(e) => e.preventDefault()}>
          {account?.author?.shortAddress}
        </Link>
        <span className={styles.userDropdownButton} ref={accountSelectButtonRef} onClick={toggleAccountDropdown} />
        {isAccountDropdownOpen && (
          <div className={`${styles.dropdown} ${accountDropdownClass}`} ref={accountDropdownRef}>
            <div className={`${styles.dropChoices} ${styles.accountDropChoices}`} ref={accountDropdownChoicesRef}>
              {accountDropdownOptions}
            </div>
          </div>
        )}
      </span>
      <span className={styles.submitButton}>
        <span className={styles.separator}>|</span>
        <Link to={submitLink} className={`${styles.textButton} ${isSubmit && styles.selectedTextButton}`}>
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
      <Link to='/settings' className={`${styles.textButton} ${isSettings && styles.selectedTextButton}`}>
        {t('preferences')}
      </Link>
    </div>
  );
};

export default AccountBar;
