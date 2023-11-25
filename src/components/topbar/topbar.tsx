import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAccount } from '@plebbit/plebbit-react-hooks';
import { getShortAddress } from '@plebbit/plebbit-js';
import styles from './topbar.module.css';
import useDefaultSubplebbitAddresses from '../../hooks/use-default-subplebbit-addresses';
import { isHomeView } from '../../lib/utils/view-utils';

const TopBar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const account = useAccount();
  const subplebbitAddresses = useDefaultSubplebbitAddresses();
  const { t } = useTranslation();
  const location = useLocation();

  const subscriptions = account?.subscriptions;
  const ethFilteredAddresses = subplebbitAddresses.filter((address: string) => address.endsWith('.eth'));
  const dropChoicesClass = isDropdownOpen && subscriptions?.length ? styles.dropChoicesVisible : styles.dropChoicesHidden;
  const isHome = isHomeView(location.pathname);
  const homeButtonClass = isHome ? styles.selected : styles.choice;

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div className={styles.headerArea}>
      <div className={styles.widthClip}>
        <div className={styles.dropdown} ref={dropdownRef}>
          <span
            className={styles.selectedTitle}
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen);
            }}
          >
            {t('topbar_my_subs')}
          </span>
        </div>
        <div className={`${styles.dropChoices} ${dropChoicesClass}`}>
          {subscriptions?.map((subscription: string, index: number) => (
            <Link key={index} to={`/p/${subscription}`} className={styles.subscription} onClick={() => setIsDropdownOpen(false)}>
              {getShortAddress(subscription)}
            </Link>
          ))}
        </div>
        <div className={styles.srList}>
          <ul className={styles.srBar}>
            <li>
              <Link to='/' className={homeButtonClass}>
                {t('topbar_home')}
              </Link>
            </li>
            <li>
              <span className={styles.separator}>-</span>
              <Link to='/p/all' className={styles.choice} onClick={(event) => event.preventDefault()}>
                {t('topbar_all')}
              </Link>
            </li>
          </ul>
          <span className={styles.separator}>  |  </span>
          <ul className={styles.srBar}>
            {ethFilteredAddresses?.map((address: string, index: number) => (
              <li key={index}>
                {index !== 0 && <span className={styles.separator}>-</span>}
                <Link to={`/p/${address}`} className={styles.choice}>
                  {address.slice(0, -4)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Link to='#' className={styles.moreLink}>
          {t('topbar_edit')} »
        </Link>
      </div>
    </div>
  );
};

export default TopBar;
