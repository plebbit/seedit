import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from './header.module.css';
import useTheme from '../../hooks/use-theme';
import AccountBar from './account-bar';
import { useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import useCurrentView from '../../hooks/use-current-view';

const sortTypes = ['/hot', '/new', '/active', '/controversialAll', '/topAll'];

const Header = () => {
  const [theme] = useTheme();
  const { t } = useTranslation();
  const { sortType, subplebbitAddress, commentCid } = useParams();
  const [selectedSortType, setSelectedSortType] = useState(sortType || '/hot');
  const sortLabels = [t('header_hot'), t('header_new'), t('header_active'), t('header_controversial'), t('header_top')];
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const { title, shortAddress } = subplebbit || {};
  const { isHomeView, isSubplebbitView, isPostView, isSubmitView, isSubplebbitSubmitView } = useCurrentView();

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

  const commentsButton = (
    <li>
      <Link to={`/p/${subplebbitAddress}/c/${commentCid}`} className={styles.selected}>{t('header_comments')}</Link>
    </li>
  );
  let headerTabs;

  if (isPostView) {
    headerTabs = commentsButton;
  } else if (isHomeView) {
    headerTabs = sortItems;
  }

  const subplebbitTitle = (
    <Link
      to={`/p/${subplebbitAddress}`}
      onClick={(e) => {
        e.preventDefault();
      }}
    >
      {title || shortAddress}
    </Link>
  );
  let headerTitle;
  const submitTitle = <span style={{textTransform: 'uppercase'}}>{t('submit')}</span>;

  if (isSubplebbitSubmitView) {
    headerTitle = <>{subplebbitTitle}: {submitTitle}</>;
  } else if (isPostView || isSubplebbitView) {
    headerTitle = subplebbitTitle;
  } else if (isSubmitView) {
    headerTitle = submitTitle;
  }

  return (
    <div className={styles.header}>
      <AccountBar />
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <Link to='/' style={{ all: 'unset', cursor: 'pointer' }}>
            <img className={styles.logo} src='/assets/logo/seedit.png' alt='logo' />
            <img src={`${process.env.PUBLIC_URL}/assets/logo/seedit-text-${theme === 'dark' ? 'dark' : 'light'}.svg`} className={styles.logoText} alt='logo' />
          </Link>
        </div>
        <div className={styles.tabs}>
          <span className={styles.pageName}>{headerTitle}</span>
          <ul className={styles.tabMenu}>
            {headerTabs}
            <li className={styles.about}>
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
