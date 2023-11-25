import { useEffect, useState, useRef } from 'react';
import styles from './time-filter.module.css';

const filters = [
  'past hour',
  'past 24 hours',
  'past week',
  'past month',
  'past year',
  'all time'
];

const TimeFilter = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropChoicesClass = isDropdownOpen ? styles.dropChoicesVisible : styles.dropChoicesHidden;

  const toggleClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.content}>
      <span className={styles.dropdownTitle}>
        links from:{' '}
      </span>
      <div className={styles.dropdown} onClick={toggleClick}>
        <span className={styles.selected}>past month</span>
      </div>
      <div className={`${styles.dropChoices} ${dropChoicesClass}`} ref={dropdownRef}>
        {filters.map((filter: string, index: number) => (
          <div key={index} className={styles.filter} onClick={() => setIsDropdownOpen(false)}>
            {filter}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TimeFilter;
