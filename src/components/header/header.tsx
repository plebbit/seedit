import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import styles from './header.module.css';
import useTheme from '../../hooks/use-theme';
import AccountBar from './account-bar';
import { useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';

const sortTypes = ['/hot', '/new', '/active', '/controversialAll', '/topAll'];

const Header = () => {
  const [theme] = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const { sortType } = useParams<{ sortType: string }>();
  const { subplebbitAddress, commentCid } = useParams();
  const [selectedSortType, setSelectedSortType] = useState(sortType || '/topMonth');
  const sortLabels = [t('header_hot'), t('header_new'), t('header_active'), t('header_controversial'), t('header_top')];
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const { title, shortAddress } = subplebbit || {};
  const isSubplebbitView = location.pathname.startsWith(`/p/${subplebbitAddress}`);
  const isPostView = location.pathname.startsWith(`/p/${subplebbitAddress}/c/${commentCid}`);
  const isHomeView = location.pathname === `/` || sortTypes.includes(location.pathname);
  const isSubmitView = location.pathname === `/submit`;
  const isSubplebbitSubmitView = location.pathname === `/p/${subplebbitAddress}/submit`;

  const handleSelect = (choice: string) => {
    setSelectedSortType(choice);
  };

  useEffect(() => {
    if (sortType) {
      setSelectedSortType('/' + sortType);
    } else {
      setSelectedSortType('/hot');
    }
  }, [sortType]);

  const sortItems = sortTypes.map((choice, index) => (
    <li key={choice}>
      <Link to={choice} className={selectedSortType === choice ? styles.selected : styles.choice} onClick={() => handleSelect(choice)}>
        {sortLabels[index]}
      </Link>
    </li>
  ));

  const commentsButton = <li><Link to={`/p/${subplebbitAddress}/c/${commentCid}`}>{t('header_comments')}</Link></li>
  let tabs;

  if (isPostView) {
    tabs = commentsButton;
  } else if (isHomeView) {
    tabs = sortItems;
  }

  const subplebbitTitle = <Link to={`/p/${subplebbitAddress}`} onClick={(e) => {e.preventDefault();}}>{title || shortAddress}</Link>;
  let headerTitle;

  if (isSubplebbitSubmitView) {
    headerTitle = <>{subplebbitTitle}: SUBMIT</>;
  } else if (isPostView || isSubplebbitView) {
    headerTitle = subplebbitTitle;
  } else if (isSubmitView) {
    headerTitle = "SUBMIT";
  }

  return (
    <div className={styles.header}>
      <AccountBar />
      <div className={styles.container}>
        <Link to='/' style={{ all: 'unset', cursor: 'pointer' }}>
          <img className={styles.logo} src='/assets/logo/seedit.png' alt='logo' />
          <img src={`${process.env.PUBLIC_URL}/assets/logo/seedit-text-${theme === 'dark' ? 'dark' : 'light'}.svg`} className={styles.logoText} alt='logo' />
        </Link>
        <div className={styles.tabs}>
          <span className={styles.pageName}>
            {headerTitle}
          </span>
          <ul className={styles.tabMenu}>
            {tabs}
            <li className={styles.about} >
              <Link to='/about' className={styles.choice} onClick={(event) => event.preventDefault()}>
                {t('header_about')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;
