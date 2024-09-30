import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './search-bar.module.css';

interface SearchBarProps {
  isFocused?: boolean;
}

const SearchBar = ({ isFocused = false }: SearchBarProps) => {
  const searchBarRef = useRef<HTMLFormElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isInCommunitySearch, setIsInCommunitySearch] = useState(false);
  const placeholder = isInCommunitySearch ? t('search') : `"community.eth/.sol" ${t('or')} "12D3KooW..."`;
  const [showExpando, setShowExpando] = useState(false);

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

  return (
    <div ref={wrapperRef}>
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
          <input type='checkbox' checked={!isInCommunitySearch} onChange={() => setIsInCommunitySearch(false)} />
          {t('search_community_address')}
        </label>
        <label>
          <input disabled type='checkbox' checked={isInCommunitySearch} onChange={() => setIsInCommunitySearch(true)} />
          {t('search_feed_post')}
        </label>
      </div>
    </div>
  );
};

export default SearchBar;
