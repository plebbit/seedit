import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAccount } from '@plebbit/plebbit-react-hooks';
import { getShortAddress } from '@plebbit/plebbit-js';
import styles from './topbar.module.css';
import useDefaultSubplebbitAddresses from '../../hooks/use-default-subplebbit-addresses';
import { isHomeView, isSubplebbitView } from '../../lib/utils/view-utils';

const sortTypes = ['hot', 'new', 'active', 'controversialAll', 'topAll'];
const timeFilters = ['1h', '24h', '1w', '1m', '1y', 'all'];

const TopBar = () => {
  const account = useAccount();
  const subplebbitAddresses = useDefaultSubplebbitAddresses();
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
  const subscriptions = account?.subscriptions;
  const isHome = isHomeView(location.pathname);
  const isSubplebbit = isSubplebbitView(location.pathname, params);
  const homeButtonClass = isHome ? styles.selected : styles.choice;

  const [isSubsDropdownOpen, setIsSubsDropdownOpen] = useState(false);
  const toggleSubsDropdown = () => setIsSubsDropdownOpen(!isSubsDropdownOpen);
  const subsDropdownRef = useRef<HTMLDivElement>(null);
  const subsDropdownChoicesRef = useRef<HTMLDivElement>(null);
  const subsDropdownClass = isSubsDropdownOpen && subscriptions?.length ? styles.visible : styles.hidden;

  const [isSortsDropdownOpen, setIsSortsDropdownOpen] = useState(false);
  const toggleSortsDropdown = () => setIsSortsDropdownOpen(!isSortsDropdownOpen);
  const sortsDropdownRef = useRef<HTMLDivElement>(null);
  const sortsDropdownChoicesRef = useRef<HTMLDivElement>(null);
  const sortsDropdownClass = isSortsDropdownOpen ? styles.visible : styles.hidden;

  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const toggleFilterDropdown = () => setIsFilterDropdownOpen(!isFilterDropdownOpen);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownChoicesRef = useRef<HTMLDivElement>(null);
  const filterDropdownClass = isFilterDropdownOpen ? styles.visible : styles.hidden;

  const sortLabels = [t('header_hot'), t('header_new'), t('header_active'), t('header_controversial'), t('header_top')];
  const [selectedSortType, setSelectedSortType] = useState(params.sortType || '/hot');

  const getSelectedSortLabel = () => {
    const index = sortTypes.indexOf(selectedSortType);
    return index >= 0 ? sortLabels[index] : '';
  };

  useEffect(() => {
    if (params.sortType) {
      setSelectedSortType(params.sortType);
    } else {
      setSelectedSortType('hot');
    }
  }, [params.sortType, location.pathname]);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      const target = event.target as Node;

      const isOutsideSubs =
        subsDropdownRef.current && !subsDropdownRef.current.contains(target) && subsDropdownChoicesRef.current && !subsDropdownChoicesRef.current.contains(target);
      const isOutsideSorts =
        sortsDropdownRef.current && !sortsDropdownRef.current.contains(target) && sortsDropdownChoicesRef.current && !sortsDropdownChoicesRef.current.contains(target);
      const isOutsideFilter =
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(target) &&
        filterDropdownChoicesRef.current &&
        !filterDropdownChoicesRef.current.contains(target);

      if (isOutsideSubs) {
        setIsSubsDropdownOpen(false);
      }

      if (isOutsideSorts) {
        setIsSortsDropdownOpen(false);
      }

      if (isOutsideFilter) {
        setIsFilterDropdownOpen(false);
      }
    },
    [subsDropdownRef, subsDropdownChoicesRef, sortsDropdownRef, sortsDropdownChoicesRef, filterDropdownRef, filterDropdownChoicesRef],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div className={styles.headerArea}>
      <div className={styles.widthClip}>
        <div className={styles.dropdown} ref={subsDropdownRef} onClick={toggleSubsDropdown}>
          <span className={styles.selectedTitle}>{t('topbar_my_subs')}</span>
          <div className={`${styles.dropChoices} ${styles.subsDropChoices} ${subsDropdownClass}`} ref={subsDropdownChoicesRef}>
            {subscriptions?.map((subscription: string, index: number) => (
              <Link key={index} to={`/p/${subscription}`} className={styles.dropdownChoice}>
                {getShortAddress(subscription)}
              </Link>
            ))}
          </div>
        </div>
        <div className={styles.dropdown} ref={sortsDropdownRef} onClick={toggleSortsDropdown}>
          <span className={styles.selectedTitle}>{getSelectedSortLabel()}</span>
          <div className={`${styles.dropChoices} ${styles.sortsDropChoices} ${sortsDropdownClass}`} ref={sortsDropdownChoicesRef}>
            {sortTypes.map((choice, index) => (
              <Link to={isSubplebbit ? `/p/${params.subplebbitAddress}/${choice}` : choice} key={index} className={styles.dropdownChoice}>
                {sortLabels[index]}
              </Link>
            ))}
          </div>
        </div>
        <div className={styles.dropdown} ref={filterDropdownRef} onClick={toggleFilterDropdown}>
          <span className={styles.selectedTitle}>24H</span>
          <div className={`${styles.dropChoices} ${styles.filterDropChoices} ${filterDropdownClass}`} ref={filterDropdownChoicesRef}>
            {timeFilters.map((choice, index) => (
              <Link to={choice} key={index} className={styles.dropdownChoice}>
                {timeFilters[index]}
              </Link>
            ))}
          </div>
        </div>
        <div className={styles.srList}>
          <ul className={styles.srBar}>
            <li>
              <Link to='/' className={`${styles.homeButton} ${homeButtonClass}`}>
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
            {subplebbitAddresses?.map((address: string, index: number) => (
              <li key={index}>
                {index !== 0 && <span className={styles.separator}>-</span>}
                <Link to={`/p/${address}`} className={styles.choice}>
                  {address}
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
