import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './sort-dropdown.module.css';

const SortDropdown = () => {
  const sortLabels = ['new', 'old'];

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownChoicesRef = useRef<HTMLDivElement>(null);
  const dropChoicesClass = isDropdownOpen ? styles.dropChoicesVisible : styles.dropChoicesHidden;

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      dropdownChoicesRef.current &&
      !dropdownChoicesRef.current.contains(event.target as Node)
    ) {
      setIsDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div className={styles.content}>
      <span className={styles.dropdownTitle}>sorted by: </span>
      <div
        className={styles.dropdown}
        onClick={() => {
          setIsDropdownOpen(!isDropdownOpen);
        }}
        ref={dropdownRef}
      >
        <span className={styles.selected}>new</span>
      </div>
      <div className={`${styles.dropChoices} ${dropChoicesClass}`} ref={dropdownChoicesRef}>
        {sortLabels.map((filter: string, index: number) => (
          <div key={index} className={styles.filter} onClick={() => setIsDropdownOpen(false)}>
            {filter}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SortDropdown;
