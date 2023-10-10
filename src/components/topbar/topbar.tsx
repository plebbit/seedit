import { FC, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import style from './topbar.module.css';
import { useAccount } from '@plebbit/plebbit-react-hooks';
import useDefaultSubplebbits from '../../hooks/use-default-subplebbits';

const TopBar: FC = () => {
  const [isClicked, setIsClicked] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const account = useAccount();
  const subscriptions = account?.subscriptions;
  const subplebbitAddresses = useDefaultSubplebbits();
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
    <div className={style.headerArea}>
      <div className={style.widthClip}>
        <div className={style.dropdown} ref={dropdownRef}>
          <span className={style.selectedTitle} onClick={toggleClick}>
            my subseedits
          </span>
        </div>
        <div className={style.dropChoices} style={{ display: isClicked ? 'block' : 'none' }}>
          {subscriptions?.map((subscription: string, index: number) => (
            <Link key={index} to={`p/${subscription}`} className={style.choice} onClick={(event) => event.preventDefault()}>
              {subscription}
            </Link>
          ))}
        </div>
        <div className={style.srList}>
          <ul className={style.srBar}>
            <li>
              <Link to='/' className={style.selected}>
                home
              </Link>
            </li>
            <li>
              <span className={style.separator}>-</span>
              <Link to='/p/all' className={style.choice} onClick={(event) => event.preventDefault()}>
                all
              </Link>
            </li>
          </ul>
          <span style={{ cursor: 'default' }} className={style.separator}>
              |  
          </span>
          <ul className={style.srBar}>
            {ethFilteredAddresses?.map((address: string, index: number) => (
              <li key={index}>
                {index !== 0 && <span className={style.separator}>-</span>}
                <Link to={`p/${address}`} className={style.choice} onClick={(event) => event.preventDefault()}>
                  {address.slice(0, -4)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Link to='#' className={style.moreLink}>
          edit »
        </Link>
      </div>
    </div>
  );
};

export default TopBar;
