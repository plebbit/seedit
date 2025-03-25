import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './search-bar.module.css';
import { isHomeAboutView, isPostPageAboutView } from '../../lib/utils/view-utils';
import useFeedFiltersStore from '../../stores/use-feed-filters-store';
import _ from 'lodash';
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
  const placeholder = isInCommunitySearch ? 'enter a keyword or pattern' : 'enter any community address';
  const [showExpando, setShowExpando] = useState(false);
  const location = useLocation();
  const params = useParams();
  const isInHomeAboutView = isHomeAboutView(location.pathname);
  const isInPostPageAboutView = isPostPageAboutView(location.pathname, params);
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

  const { setSearchFilter, clearSearchFilter, setIsSearching } = useFeedFiltersStore();
  const searchFilter = useFeedFiltersStore((state) => state.searchFilter);

  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isInCommunitySearch && searchFilter === '') {
      setInputValue('');
    }
  }, [searchFilter, isInCommunitySearch]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetSearchFilter = useCallback(
    _.debounce((text: string) => {
      if (text.trim()) {
        setSearchFilter(text);
      } else {
        clearSearchFilter();
      }
      setIsSearching(false);
    }, 300),
    [setSearchFilter, clearSearchFilter, setIsSearching],
  );

  useEffect(() => {
    if (isInCommunitySearch) {
      if (inputValue.trim()) {
        setIsSearching(true);
      } else {
        setIsSearching(false);
      }
      debouncedSetSearchFilter(inputValue);
    }

    return () => {
      debouncedSetSearchFilter.cancel();
    };
  }, [inputValue, debouncedSetSearchFilter, isInCommunitySearch, setIsSearching]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (isInCommunitySearch) {
      setInputValue(value);
      if (value.trim()) {
        setIsSearching(true);
      } else {
        setIsSearching(false);
        clearSearchFilter();
      }
    } else {
      setInputValue(value);
    }
  };

  return (
    <div ref={wrapperRef} className={`${styles.searchBarWrapper} ${isInHomeAboutView || isInPostPageAboutView ? styles.mobileInfobar : ''}`}>
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
          onChange={handleSearchChange}
          value={inputValue}
        />
        <input type='submit' value='' />
      </form>
      <div className={`${styles.infobar} ${showExpando ? styles.slideDown : styles.slideUp}`}>
        <label>
          <input
            type='checkbox'
            checked={!isInCommunitySearch}
            onChange={() => {
              setIsInCommunitySearch(false);
              setIsSearching(false);
              clearSearchFilter();
            }}
          />
          Go to a community
        </label>
        <label>
          <input type='checkbox' checked={isInCommunitySearch} onChange={() => setIsInCommunitySearch(true)} />
          {t('search_feed_post')}
        </label>
      </div>
    </div>
  );
};

export default SearchBar;
