import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAccount, useAccountSubplebbits } from '@plebbit/plebbit-react-hooks';
import Plebbit from '@plebbit/plebbit-js/dist/browser/index.js';
import styles from './topbar.module.css';
import { useDefaultSubplebbitAddresses } from '../../hooks/use-default-subplebbits';
import useTimeFilter from '../../hooks/use-time-filter';
import { isAllView, isHomeView, isModView, isSubplebbitView } from '../../lib/utils/view-utils';

const sortTypes = ['hot', 'new', 'active', 'controversialAll', 'topAll'];
const isElectron = window.isElectron === true;

const TopBar = () => {
  const account = useAccount();
  const subplebbitAddresses = useDefaultSubplebbitAddresses();
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
  const subscriptions = account?.subscriptions;
  const isinAllView = isAllView(location.pathname);
  const isInHomeView = isHomeView(location.pathname);
  const isInModView = isModView(location.pathname);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);
  const homeButtonClass = isInHomeView ? styles.selected : styles.choice;

  const { accountSubplebbits } = useAccountSubplebbits();
  const accountSubplebbitAddresses = Object.keys(accountSubplebbits);

  const { timeFilterName, timeFilterNames } = useTimeFilter();
  const selectedTimeFilter = timeFilterName || (isInSubplebbitView ? 'all' : timeFilterName);

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
      : isInModView
      ? `/p/mod/${selectedSortType}/${timeFilterName}`
      : `/${selectedSortType}/${timeFilterName}`;
  };

  const getSelectedSortLabel = () => {
    const index = sortTypes.indexOf(selectedSortType);
    return index >= 0 ? sortLabels[index] : sortLabels[0];
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

  const isConnectedToRpc = !!account?.plebbitOptions.plebbitRpcClientsOptions;
  const navigate = useNavigate();
  const handleCreateCommunity = () => {
    // creating a community only works if the user is running a full node
    if (isElectron || isConnectedToRpc) {
      navigate('/communities/create');
    } else {
      alert(
        t('create_community_not_available', {
          desktopLink: 'https://github.com/plebbit/seedit/releases/latest',
          cliLink: 'https://github.com/plebbit/plebbit-cli',
          interpolation: { escapeValue: false },
        }),
      );
    }
  };

  return (
    <div className={styles.headerArea}>
      <div className={styles.widthClip}>
        <div className={`${styles.dropdown} ${styles.subsDropdown}`} ref={subsDropdownRef} onClick={toggleSubsDropdown}>
          <span className={styles.selectedTitle}>{t('my_communities')}</span>
          <div className={`${styles.dropChoices} ${styles.subsDropChoices} ${subsDropdownClass}`} ref={subsdropdownItemsRef}>
            {subscriptions?.map((subscription: string, index: number) => (
              <Link key={index} to={`/p/${subscription}`} className={styles.dropdownItem}>
                {Plebbit.getShortAddress(subscription)}
              </Link>
            ))}
            <span onClick={handleCreateCommunity} className={`${styles.dropdownItem} ${styles.myCommunitiesItemButtonDotted}`}>
              {t('create_community')}
            </span>
            <Link to='/communities' className={`${styles.dropdownItem} ${styles.myCommunitiesItemButton}`}>
              {t('my_communities')}
            </Link>
            <Link to='/communities/vote' className={`${styles.dropdownItem} ${styles.myCommunitiesItemButton}`}>
              {t('default_communities')}
            </Link>
            <Link to='/communities/subscriber' className={`${styles.dropdownItem} ${styles.myCommunitiesItemButton}`}>
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
            {timeFilterNames.slice(0, -1).map((timeFilterName, index) => (
              <Link to={getTimeFilterLink(timeFilterName)} key={index} className={styles.dropdownItem}>
                {timeFilterNames[index]}
              </Link>
            ))}
          </div>
        </div>
        <div className={styles.srList}>
          <ul className={styles.srBar}>
            <li>
              <Link to='/' className={`${styles.homeButton} ${homeButtonClass}`}>
                {t('home')}
              </Link>
            </li>
            <li>
              <span className={styles.separator}>-</span>
              <Link to='/p/all' className={isinAllView ? styles.selected : styles.choice}>
                {t('all')}
              </Link>
            </li>
            {accountSubplebbitAddresses.length > 0 && (
              <li>
                <span className={styles.separator}>-</span>
                <Link to='/p/mod' className={isInModView ? styles.selected : styles.choice}>
                  {t('mod')}
                </Link>
              </li>
            )}
            <span className={styles.separator}> | </span>
            {subplebbitAddresses?.map((address, index) => {
              const displayAddress = address.endsWith('.eth') ? address.slice(0, -4) : address.endsWith('.sol') ? address.slice(0, -4) : address;
              return (
                <li key={index}>
                  {index !== 0 && <span className={styles.separator}>-</span>}
                  <Link to={`/p/${address}`} className={params.subplebbitAddress === address ? styles.selected : styles.choice}>
                    {displayAddress}
                  </Link>
                </li>
              );
            })}
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
