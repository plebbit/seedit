import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './search-bar.module.css';
import { isHomeAboutView, isSubplebbitAboutView } from '../../lib/utils/view-utils';

interface SearchBarProps {
  isFocused?: boolean;
  onExpandoChange?: (expanded: boolean) => void;
}

const SearchBar = ({ isFocused = false, onExpandoChange }: SearchBarProps) => {
  const searchBarRef = useRef<HTMLFormElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isInCommunitySearch, setIsInCommunitySearch] = useState(false);
  const placeholder = isInCommunitySearch ? t('search') : `"community.eth/.sol" ${t('or')} "12D3KooW..."`;
  const [showExpando, setShowExpando] = useState(false);
  const location = useLocation();
  const params = useParams();
  const isInHomeAboutView = isHomeAboutView(location.pathname);
  const isInSubplebbitAboutView = isSubplebbitAboutView(location.pathname, params);

  const handleInputFocus = () => {
    setShowExpando(true);
  };

  useEffect(() => {
    if (isFocused) {
      searchInputRef.current?.focus();
    }
  }, [isFocused]);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowExpando(false);
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

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isInCommunitySearch) {
      return;
    }
    const searchInput = searchInputRef.current?.value;
    if (searchInput) {
      searchInputRef.current.value = '';
      navigate(`/p/${searchInput}`);
    }
  };

  useEffect(() => {
    onExpandoChange?.(showExpando);
  }, [showExpando, onExpandoChange]);

  return (
    <div ref={wrapperRef} className={`${styles.searchBarWrapper} ${isInHomeAboutView || isInSubplebbitAboutView ? styles.mobileInfobar : ''}`}>
      <form className={styles.searchBar} ref={searchBarRef} onSubmit={handleSearchSubmit}>
        <input
          type='text'
          autoCorrect='off'
          autoComplete='off'
          spellCheck='false'
          autoCapitalize='off'
          placeholder={placeholder}
          ref={searchInputRef}
          onFocus={handleInputFocus}
        />
        <input type='submit' value='' />
      </form>
      <div className={`${styles.infobar} ${showExpando ? styles.slideDown : styles.slideUp}`}>
        <label>
          <input type='checkbox' disabled checked={!isInCommunitySearch} onChange={() => setIsInCommunitySearch(false)} />
          {t('search_community_address')}
        </label>
        {/* <label>
          <input disabled type='checkbox' checked={isInCommunitySearch} onChange={() => setIsInCommunitySearch(true)} />
          {t('search_feed_post')}
        </label> */}
      </div>
    </div>
  );
};

export default SearchBar;
