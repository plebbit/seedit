import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './search-bar.module.css';

const SearchBar = () => {
  const searchBarRef = useRef<HTMLFormElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isInCommunitySearch, setIsInCommunitySearch] = useState(false);
  const placeholder = isInCommunitySearch ? t('search') : `"community.eth" ${t('or')} "12D3KooW..."`;
  const [showExpando, setShowExpando] = useState(false);

  const handleInputFocus = () => {
    setShowExpando(true);
  };

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
        <input type='text' placeholder={placeholder} ref={searchInputRef} onFocus={handleInputFocus} />
        <input type='submit' value='' />
      </form>
      <div className={`${styles.infobar} ${showExpando ? styles.slideDown : styles.slideUp}`}>
        <label>
          <input type='checkbox' checked={!isInCommunitySearch} onChange={() => setIsInCommunitySearch(false)} />
          search a community address
        </label>
        <label>
          <input type='checkbox' checked={isInCommunitySearch} onChange={() => setIsInCommunitySearch(true)} />
          search a post in this feed
        </label>
      </div>
    </div>
  );
};

export default SearchBar;
