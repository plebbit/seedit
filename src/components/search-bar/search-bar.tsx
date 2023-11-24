import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./search-bar.module.css";

interface SearchBarProps {
  isVisible?: boolean;
  toggleVisible?: () => void;
}

const SearchBar = ({ isVisible, toggleVisible }: SearchBarProps) => {
  const [searchVisible, setSearchVisible] = useState(isVisible);
  const searchBarRef = useRef<HTMLFormElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchVisible]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const searchInput = searchInputRef.current?.value;
    if (searchInput) {
      toggleVisible && toggleVisible();
      searchInputRef.current.value = '';
      navigate(`/p/${searchInput}`);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (searchBarRef.current && event.target instanceof Node && !searchBarRef.current.contains(event.target)) {
      toggleVisible && toggleVisible();
    }
  };

  return (
    <form className={`${styles.searchBar} ${!searchVisible ? styles.searchBarHidden : styles.searchBarVisible}`} ref={searchBarRef} onSubmit={handleSearchSubmit}>
      <input type='text' placeholder={`"community.eth" ${t('or')} "12D3KooW..."`} ref={searchInputRef} />
      <input type='submit' value='' />
    </form>
  );
}

export default SearchBar;
