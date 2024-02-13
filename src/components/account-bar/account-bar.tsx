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
  const accountdropdownItemsRef = useRef<HTMLDivElement>(null);
  const accountDropdownClass = isAccountDropdownOpen ? styles.visible : styles.hidden;
  const accountSelectButtonRef = useRef<HTMLDivElement>(null);

  const unreadNotificationCount = account?.unreadNotificationCount ? ` ${account.unreadNotificationCount}` : '';
  const mailClass = unreadNotificationCount ? styles.mailIconUnread : styles.mailIconRead;

  let submitLink = '/submit';
  if (isSubplebbit) {
    submitLink = `/p/${subplebbitAddress}/submit`;
  }

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      const target = event.target as Node;

      const isOutsideSearchBar =
        searchBarRef.current && !searchBarRef.current.contains(target) && searchBarButtonRef.current && !searchBarButtonRef.current.contains(target);
      const isOutsideAccountDropdown =
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(target) &&
        accountdropdownItemsRef.current &&
        !accountdropdownItemsRef.current.contains(target);
      const isOutsideAccountSelectButton = accountSelectButtonRef.current && !accountSelectButtonRef.current.contains(target);

      if (isOutsideAccountSelectButton && isOutsideAccountDropdown) {
        setIsAccountDropdownOpen(false);
      }

      if (isOutsideSearchBar) {
        setSearchVisible(false);
      }
    },
    [searchBarRef, accountSelectButtonRef, accountDropdownRef, accountdropdownItemsRef],
  );

  const [isFocused, setIsFocused] = useState(false);
  useEffect(() => {
    if (searchVisible) {
      setIsFocused(true);
    }
  }, [searchVisible]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const accountDropdownOptions = accounts.map((account, index) => (
    <span key={index} className={styles.dropdownItem} onClick={() => setActiveAccount(account?.name)}>
      {`u/${account?.author?.shortAddress}`}
    </span>
  ));

  accountDropdownOptions.push(
    <Link key='create' to='#' className={styles.dropdownItem} onClick={() => createAccount()}>
      +{t('create')}
    </Link>,
  );

  return (
    <div className={styles.content}>
      <span className={styles.user}>
        <Link to='/profile'>{account?.author?.shortAddress}</Link>
        <span className={styles.userDropdownButton} ref={accountSelectButtonRef} onClick={toggleAccountDropdown} />
        {isAccountDropdownOpen && (
          <div className={`${styles.dropdown} ${accountDropdownClass}`} ref={accountDropdownRef}>
            <div className={`${styles.dropChoices} ${styles.accountDropChoices}`} ref={accountdropdownItemsRef}>
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
      <Link to='/inbox' className={styles.iconButton}>
        <span className={`${styles.mailIcon} ${mailClass}`} />
        {unreadNotificationCount && <span className={styles.mailUnreadCount}>{unreadNotificationCount}</span>}
      </Link>
      <span className={styles.searchButton}>
        <span className={styles.separator}>|</span>
        <span className={styles.iconButton} onClick={toggleSearchVisible} ref={searchBarButtonRef}>
          🔎
        </span>
        {searchVisible && (
          <div className={styles.searchBar} ref={searchBarRef}>
            <SearchBar isFocused={isFocused} />
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
