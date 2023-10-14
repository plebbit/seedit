import { FC, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './header.module.css';
import useTheme from '../../hooks/use-theme';
import AccountBar from './account-bar';
import Theme from '../theme';

const choices = ['/hot', '/new', '/active', '/controversialAll', '/topAll'];

const Header: FC = () => {
  const { sortType } = useParams<{ sortType: string }>();
  const { t } = useTranslation();
  const [theme] = useTheme();
  const [selected, setSelected] = useState(sortType || '/topMonth');

  const logoSrc = theme === 'black' ? '/assets/logo/logo-dark.png' : '/assets/logo/logo-light.png';
  const labels = [t('header_hot'), t('header_new'), t('header_rising'), t('header_controversial'), t('header_top')];

  useEffect(() => {
    if (sortType) {
      setSelected('/' + sortType);
    } else {
      setSelected('/hot');
    }
  }, [sortType]);

  const handleSelect = (choice: string) => {
    setSelected(choice);
  };

  return (
    <div className={styles.header}>
      <div className={styles.headerBottomLeft}>
        <span className={styles.container}>
          <Link to='/' style={{ all: 'unset', cursor: 'pointer' }}>
            <img className={styles.logo} src='/assets/logo/seedit.png' alt='logo' />
            <img className={styles.logoText} src={logoSrc} alt='logo' />
          </Link>
          <ul className={styles.tabMenu}>
            {choices.map((choice, index) => (
              <li key={choice}>
                <Link to={choice} className={selected === choice ? styles.selected : styles.choice} onClick={() => handleSelect(choice)}>
                  {labels[index]}
                </Link>
              </li>
            ))}
            <li>
              <Link to='/wiki' className={styles.choice} onClick={(event) => event.preventDefault()}>
                wiki
              </Link>
            </li>
          </ul>
        </span>
        &nbsp;
      </div>
      <AccountBar />
      <div className={styles.temporary}>
        <Theme />
      </div>
    </div>
  );
};

export default Header;
