import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './search-bar.module.css';

interface SearchBarProps {
  isActive?: boolean;
  toggleVisible?: () => void;
}

const SearchBar = ({ isActive, toggleVisible }: SearchBarProps) => {
  const searchBarRef = useRef<HTMLFormElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (searchBarRef.current && event.target instanceof Node && !searchBarRef.current.contains(event.target)) {
        toggleVisible && toggleVisible();
      }
    },
    [toggleVisible, searchBarRef],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    if (isActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isActive]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const searchInput = searchInputRef.current?.value;
    if (searchInput) {
      toggleVisible && toggleVisible();
      searchInputRef.current.value = '';
      navigate(`/p/${searchInput}`);
    }
  };

  return (
    <form className={styles.searchBar} ref={searchBarRef} onSubmit={handleSearchSubmit}>
      <input type='text' placeholder={`"community.eth" ${t('or')} "12D3KooW..."`} ref={searchInputRef} />
      <input type='submit' value='' />
    </form>
  );
};

export default SearchBar;
