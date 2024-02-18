import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAccount } from '@plebbit/plebbit-react-hooks';
import { getShortAddress } from '@plebbit/plebbit-js';
import styles from './topbar.module.css';
import { useDefaultSubplebbitAddresses } from '../../lib/utils/addresses-utils';
import useTimeFilter, { TimeFilterKey } from '../../hooks/use-time-filter';
import { isAllView, isHomeView, isSubplebbitView } from '../../lib/utils/view-utils';

const sortTypes = ['hot', 'new', 'active', 'controversialAll', 'topAll'];

const TopBar = () => {
  const account = useAccount();
  const subplebbitAddresses = useDefaultSubplebbitAddresses();
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
  const subscriptions = account?.subscriptions;
  const isinAllView = isAllView(location.pathname);
  const isInHomeView = isHomeView(location.pathname, params);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);
  const homeButtonClass = isInHomeView ? styles.selected : styles.choice;

  const sortType = params?.sortType || 'hot';
  const { timeFilterNames } = useTimeFilter();
  const timeFilterName = params.timeFilterName as TimeFilterKey;
  const { currentFilterName } = useTimeFilter(sortType, timeFilterName);
  const selectedTimeFilter = isInSubplebbitView ? params.timeFilterName || 'all' : currentFilterName;

  const [isSubsDropdownOpen, setIsSubsDropdownOpen] = useState(false);
  const toggleSubsDropdown = () => setIsSubsDropdownOpen(!isSubsDropdownOpen);
  const subsDropdownRef = useRef<HTMLDivElement>(null);
  const subsdropdownItemsRef = useRef<HTMLDivElement>(null);
  const subsDropdownClass = isSubsDropdownOpen ? styles.visible : styles.hidden;

  const [isSortsDropdownOpen, setIsSortsDropdownOpen] = useState(false);
  const toggleSortsDropdown = () => setIsSortsDropdownOpen(!isSortsDropdownOpen);
  const sortsDropdownRef = useRef<HTMLDivElement>(null);
  const sortsdropdownItemsRef = useRef<HTMLDivElement>(null);
  const sortsDropdownClass = isSortsDropdownOpen ? styles.visible : styles.hidden;

  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const toggleFilterDropdown = () => setIsFilterDropdownOpen(!isFilterDropdownOpen);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const filterdropdownItemsRef = useRef<HTMLDivElement>(null);
  const filterDropdownClass = isFilterDropdownOpen ? styles.visible : styles.hidden;

  const sortLabels = [t('hot'), t('new'), t('active'), t('controversial'), t('top')];
  const selectedSortType = params.sortType || 'hot';

  const getTimeFilterLink = (timeFilterName: string) => {
    return isInSubplebbitView
      ? `/p/${params.subplebbitAddress}/${selectedSortType}/${timeFilterName}`
      : isinAllView
      ? `p/all/${selectedSortType}/${timeFilterName}`
      : `/${selectedSortType}/${timeFilterName}`;
  };

  const getSelectedSortLabel = () => {
    const index = sortTypes.indexOf(selectedSortType);
    return index >= 0 ? sortLabels[index] : '';
  };

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      const target = event.target as Node;

      const isOutsideSubs =
        subsDropdownRef.current && !subsDropdownRef.current.contains(target) && subsdropdownItemsRef.current && !subsdropdownItemsRef.current.contains(target);
      const isOutsideSorts =
        sortsDropdownRef.current && !sortsDropdownRef.current.contains(target) && sortsdropdownItemsRef.current && !sortsdropdownItemsRef.current.contains(target);
      const isOutsideFilter =
        filterDropdownRef.current && !filterDropdownRef.current.contains(target) && filterdropdownItemsRef.current && !filterdropdownItemsRef.current.contains(target);

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
    [subsDropdownRef, subsdropdownItemsRef, sortsDropdownRef, sortsdropdownItemsRef, filterDropdownRef, filterdropdownItemsRef],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  let homeLink = '/';
  let allLink = '/p/all';

  if (timeFilterName && !isInSubplebbitView) {
    homeLink += `${selectedSortType}/${timeFilterName}`;
    allLink += `/${selectedSortType}/${timeFilterName}`;
  }

  return (
    <div className={styles.headerArea}>
      <div className={styles.widthClip}>
        <div className={`${styles.dropdown} ${styles.subsDropdown}`} ref={subsDropdownRef} onClick={toggleSubsDropdown}>
          <span className={styles.selectedTitle}>{t('my_communities')}</span>
          <div className={`${styles.dropChoices} ${styles.subsDropChoices} ${subsDropdownClass}`} ref={subsdropdownItemsRef}>
            {subscriptions?.map((subscription: string, index: number) => (
              <Link key={index} to={`/p/${subscription}`} className={styles.dropdownItem}>
                {getShortAddress(subscription)}
              </Link>
            ))}
            <Link to='/communities/vote' className={`${styles.dropdownItem} ${styles.defaultCommunities}`}>
              {t('default_communities')}
            </Link>
            <Link to='/communities/subscriber' className={`${styles.dropdownItem} ${styles.editSubscriptions}`}>
              {t('edit_subscriptions')}
            </Link>
          </div>
        </div>
        <div className={styles.dropdown} ref={sortsDropdownRef} onClick={toggleSortsDropdown}>
          <span className={styles.selectedTitle}>{getSelectedSortLabel()}</span>
          <div className={`${styles.dropChoices} ${styles.sortsDropChoices} ${sortsDropdownClass}`} ref={sortsdropdownItemsRef}>
            {sortTypes.map((sortType, index) => {
              let dropdownLink = isInSubplebbitView ? `/p/${params.subplebbitAddress}/${sortType}` : isinAllView ? `/p/all/${sortType}` : sortType;
              if (timeFilterName) {
                dropdownLink += `/${timeFilterName}`;
              }
              return (
                <Link to={dropdownLink} key={index} className={styles.dropdownItem}>
                  {sortLabels[index]}
                </Link>
              );
            })}
          </div>
        </div>
        <div className={styles.dropdown} ref={filterDropdownRef} onClick={toggleFilterDropdown}>
          <span className={styles.selectedTitle}>{selectedTimeFilter}</span>
          <div className={`${styles.dropChoices} ${styles.filterDropChoices} ${filterDropdownClass}`} ref={filterdropdownItemsRef}>
            {timeFilterNames.map((timeFilterName, index) => (
              <Link to={getTimeFilterLink(timeFilterName)} key={index} className={styles.dropdownItem}>
                {timeFilterNames[index]}
              </Link>
            ))}
          </div>
        </div>
        <div className={styles.srList}>
          <ul className={styles.srBar}>
            <li>
              <Link to={homeLink} className={`${styles.homeButton} ${homeButtonClass}`}>
                {t('home')}
              </Link>
            </li>
            <li>
              <span className={styles.separator}>-</span>
              <Link to={allLink} className={isinAllView ? styles.selected : styles.choice}>
                {t('all')}
              </Link>
            </li>
            <span className={styles.separator}> | </span>
            {subplebbitAddresses?.map((address, index) => (
              <li key={index}>
                {index !== 0 && <span className={styles.separator}>-</span>}
                <Link to={`/p/${address}`} className={params.subplebbitAddress === address ? styles.selected : styles.choice}>
                  {address}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Link to='/communities/vote' className={styles.moreLink}>
          {t('more')} »
        </Link>
      </div>
    </div>
  );
};

export default TopBar;
