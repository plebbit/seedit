import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAccount } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import styles from './sticky-header.module.css';
import SearchBar from '../search-bar';
import { isSubplebbitView } from '../../lib/utils/view-utils';

const sortTypes = ['hot', 'new', 'active', 'controversialAll', 'topAll'];
const timeFilters = ['1h', '24h', '1w', '1m', '1y', 'all'];

const StickyHeader = () => {
  const { t } = useTranslation();
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);
  const toggleSearchBar = () => setIsSearchBarOpen(!isSearchBarOpen);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const account = useAccount();
  const { shortAddress } = account?.author || {};
  const accountAddress = shortAddress?.length > 12 ? shortAddress?.slice(0, 12) + '...' : shortAddress;
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const isSubplebbit = isSubplebbitView(location.pathname, params);
  const sortLabels = [t('header_hot'), t('header_new'), t('header_active'), t('header_controversial'), t('header_top')];
  const [selectedSortType, setSelectedSortType] = useState(params.sortType || '/hot');

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSortType = e.target.value;
    let newPath;

    if (isSubplebbit) {
      newPath = `/p/${params.subplebbitAddress}/${selectedSortType}`;
    } else {
      newPath = `/${selectedSortType}`;
    }

    navigate(newPath);
  };

  useEffect(() => {
    if (params.sortType) {
      setSelectedSortType(params.sortType);
    } else {
      setSelectedSortType('hot');
    }
  }, [params.sortType, location.pathname]);

  useEffect(() => {
    const menuElement = document.getElementById('sticky-menu');
    if (menuElement) {
      menuElement.classList.add(styles.hidden); // Initially hide the menu
    }
  }, []);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsSearchBarOpen(false);
      }
    },
    [wrapperRef],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div ref={wrapperRef}>
      <div className={styles.content} id='sticky-menu'>
        <span className={styles.button}>
          <Link to='/'>{t('topbar_home')}</Link>
        </span>
        <span className={styles.separator}>|</span>
        <span className={styles.button}>
          <Link to='/' onClick={(e) => e.preventDefault()}>
            {t('topbar_all')}
          </Link>
        </span>
        <span className={styles.separator}>|</span>
        <span className={`${styles.button} ${styles.icon}`} onClick={toggleSearchBar}>
          🔎
        </span>
        <span className={styles.separator}>|</span>
        <span className={styles.button}>
          <select className={styles.select} value={selectedSortType} onChange={handleSelect}>
            {sortTypes.map((choice, index) => (
              <option key={index} value={choice}>
                {sortLabels[index]}
              </option>
            ))}
          </select>
        </span>
        <span className={styles.separator}>|</span>
        <span className={styles.button}>
          <select className={styles.select}>
            {timeFilters.map((choice, index) => (
              <option key={`${choice}-${index}`} value={choice}>
                {choice}
              </option>
            ))}
          </select>
        </span>
        <span className={styles.separator}>|</span>
        <span className={`${styles.button} ${styles.icon}`}>✉️</span>
        <span className={styles.separator}>|</span>
        <span className={styles.button}>
          <select className={styles.select}>
            <option value=''>u/{accountAddress}</option>
            <option value=''>+create</option>
          </select>
        </span>
        <span className={styles.separator}>|</span>
        <span className={`${styles.button} ${styles.icon}`}>
          <Link to='/settings'>⚙️</Link>
        </span>
      </div>
      {isSearchBarOpen && (
        <div className={styles.searchBar}>
          <SearchBar />
        </div>
      )}
    </div>
  );
};

// sticky menu animation
// will trigger more than once with hot reloading during development
if (!window.STICKY_MENU_SCROLL_LISTENER) {
  window.STICKY_MENU_SCROLL_LISTENER = true;

  const scrollRange = 50; // the animation css px range in stickyMenuAnimation, must also edit css animation 100%: {top}
  let currentScrollInRange = 0,
    previousScroll = 0;

  window.addEventListener('scroll', () => {
    // find difference between current and last scroll position
    const currentScroll = window.scrollY;

    // Get the menu element
    const menuElement = document.getElementById('sticky-menu');
    if (!menuElement) {
      return;
    }

    if (currentScroll >= 100) {
      menuElement.classList.remove(styles.hidden); // Show menu
    }

    // Automatically hide menu if the user is within 100px of the top
    if (currentScroll < 100) {
      menuElement.style.animationDelay = '-1s';
      return;
    }

    const scrollDifference = currentScroll - previousScroll;
    previousScroll = currentScroll;

    // find new current scroll in range
    const previousScrollInRange = currentScrollInRange;
    currentScrollInRange += scrollDifference;
    if (currentScrollInRange > scrollRange) {
      currentScrollInRange = scrollRange;
    } else if (currentScrollInRange < 0) {
      currentScrollInRange = 0;
    }
    // no changes
    if (currentScrollInRange === previousScrollInRange) {
      return;
    }

    // control progress of the animation using negative animation-delay (0 to -1s)
    const animationPercent = currentScrollInRange / scrollRange;
    menuElement.style.animationDelay = animationPercent * -1 + 's';
  });
}

export default StickyHeader;
