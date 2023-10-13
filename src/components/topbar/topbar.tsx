import { FC, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './topbar.module.css';
import { useAccount } from '@plebbit/plebbit-react-hooks';
import useDefaultSubplebbits from '../../hooks/use-default-subplebbits';

const TopBar: FC = () => {
  const [isClicked, setIsClicked] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const account = useAccount();
  const subplebbitAddresses = useDefaultSubplebbits();
  const { t } = useTranslation();

  const subscriptions = account?.subscriptions;
  const ethFilteredAddresses = subplebbitAddresses.filter((address: string) => address.endsWith('.eth'));

  const toggleClick = () => {
    setIsClicked(!isClicked);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsClicked(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.headerArea}>
      <div className={styles.widthClip}>
        <div className={styles.dropdown} ref={dropdownRef}>
          <span className={styles.selectedTitle} onClick={toggleClick}>
            {t('topbar_my_subs')}
          </span>
        </div>
        <div className={styles.dropChoices} style={{ display: isClicked ? 'block' : 'none' }}>
          {subscriptions?.map((subscription: string, index: number) => (
            <Link key={index} to={`p/${subscription}`} className={styles.choice} onClick={(event) => event.preventDefault()}>
              {subscription}
            </Link>
          ))}
        </div>
        <div className={styles.srList}>
          <ul className={styles.srBar}>
            <li>
              <Link to='/' className={styles.selected}>
                {t('topbar_home')}
              </Link>
            </li>
            <li>
              <span className={styles.separator}>-</span>
              <Link to='/p/all' className={styles.choice} onClick={(event) => event.preventDefault()}>
                {t('topbar_all')}
              </Link>
            </li>
          </ul>
          <span style={{ cursor: 'default' }} className={styles.separator}>
              |  
          </span>
          <ul className={styles.srBar}>
            {ethFilteredAddresses?.map((address: string, index: number) => (
              <li key={index}>
                {index !== 0 && <span className={styles.separator}>-</span>}
                <Link to={`p/${address}`} className={styles.choice} onClick={(event) => event.preventDefault()}>
                  {address.slice(0, -4)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Link to='#' className={styles.moreLink}>
          {t('topbar_edit')} »
        </Link>
      </div>
    </div>
  );
};

export default TopBar;
