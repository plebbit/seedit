import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import styles from './header.module.css';
import useTheme from '../../hooks/use-theme';
import AccountBar from './account-bar';
import { useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import { isHomeView, isPostView, isSubplebbitView, isSubmitView, isSubplebbitSubmitView } from '../../lib/utils/view-utils';

const sortTypes = ['/hot', '/new', '/active', '/controversialAll', '/topAll'];

const Header = () => {
  const [theme] = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
  const [selectedSortType, setSelectedSortType] = useState(params.sortType || '/hot');
  const sortLabels = [t('header_hot'), t('header_new'), t('header_active'), t('header_controversial'), t('header_top')];
  const subplebbit = useSubplebbit({ subplebbitAddress: params.subplebbitAddress });
  const { title, shortAddress } = subplebbit || {};
  const isHome = isHomeView(location.pathname);
  const isPost = isPostView(location.pathname, params);
  const isSubplebbit = isSubplebbitView(location.pathname, params);
  const isSubmit = isSubmitView(location.pathname);
  const isSubplebbitSubmit = isSubplebbitSubmitView(location.pathname, params);

  const handleSelect = (choice: string) => {
    setSelectedSortType(choice);
  };

  useEffect(() => {
    if (params.sortType) {
      setSelectedSortType('/' + params.sortType);
    } else {
      setSelectedSortType('/hot');
    }
  }, [params.sortType]);

  const sortItems = sortTypes.map((choice, index) => (
    <li key={choice}>
      <Link to={choice} className={selectedSortType === choice ? styles.selected : styles.choice} onClick={() => handleSelect(choice)}>
        {sortLabels[index]}
      </Link>
    </li>
  ));

  const commentsButton = (
    <li>
      <Link to={`/p/${params.subplebbitAddress}/c/${params.commentCid}`} className={styles.selected}>
        {t('header_comments')}
      </Link>
    </li>
  );
  let headerTabs;

  if (isPost) {
    headerTabs = commentsButton;
  } else if (isHome) {
    headerTabs = sortItems;
  }

  const subplebbitTitle = <Link to={`/p/${params.subplebbitAddress}`}>{title || shortAddress}</Link>;
  let headerTitle;
  const submitTitle = <span style={{ textTransform: 'uppercase' }}>{t('submit')}</span>;

  if (isSubplebbitSubmit) {
    headerTitle = (
      <>
        {subplebbitTitle}: {submitTitle}
      </>
    );
  } else if (isPost || isSubplebbit) {
    headerTitle = subplebbitTitle;
  } else if (isSubmit) {
    headerTitle = submitTitle;
  }

  return (
    <div className={styles.header}>
      <AccountBar />
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <Link to='/' style={{ all: 'unset', cursor: 'pointer' }}>
            <img className={styles.logo} src='/assets/logo/seedit.png' alt='logo' />
            <img src={`/assets/logo/seedit-text-${theme === 'dark' ? 'dark' : 'light'}.svg`} className={styles.logoText} alt='logo' />
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
