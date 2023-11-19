import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import styles from './header.module.css';
import useTheme from '../../hooks/use-theme';
import AccountBar from './account-bar';
import { useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import { isAboutView, isHomeView, isPostView, isSubplebbitView, isSubmitView, isSubplebbitSubmitView } from '../../lib/utils/view-utils';

const sortTypes = ['hot', 'new', 'active', 'controversialAll', 'topAll'];

const Header = () => {
  const [theme] = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
  const [selectedSortType, setSelectedSortType] = useState(params.sortType || '/hot');
  const sortLabels = [t('header_hot'), t('header_new'), t('header_active'), t('header_controversial'), t('header_top')];
  const subplebbit = useSubplebbit({ subplebbitAddress: params.subplebbitAddress });
  const { title, shortAddress } = subplebbit || {};
  const isAbout = isAboutView(location.pathname);
  const isHome = isHomeView(location.pathname);
  const isPost = isPostView(location.pathname, params);
  const isSubplebbit = isSubplebbitView(location.pathname, params);
  const isSubmit = isSubmitView(location.pathname);
  const isSubplebbitSubmit = isSubplebbitSubmitView(location.pathname, params);
  const fewTabs = isPost || isSubmit || isSubplebbitSubmit;

  const handleSelect = (choice: string) => {
    setSelectedSortType(choice);
  };

  useEffect(() => {
    if (params.sortType) {
      setSelectedSortType(params.sortType);
    } else if (location.pathname.endsWith('/about')) {
      setSelectedSortType('');
    } else {
      setSelectedSortType('hot');
    }
  }, [params.sortType]);

  const sortItems = sortTypes.map((choice, index) => (
    <li key={choice}>
      <Link to={isSubplebbit ? `/p/${params.subplebbitAddress}/${choice}` : choice} className={selectedSortType === choice ? styles.selected : styles.choice} onClick={() => handleSelect(choice)}>
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
  } else if (isHome || (isSubplebbit && !isSubplebbitSubmit)) {
    headerTabs = sortItems;
  }

  const subplebbitTitle = <Link to={`/p/${params.subplebbitAddress}`}>{title || shortAddress}</Link>;
  let headerTitle;
  const submitTitle = <span className={styles.submitTitle}>{t('submit')}</span>;

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

  let aboutLink;

  if (isSubplebbit || isSubplebbitSubmit) {
    aboutLink = `/p/${params.subplebbitAddress}/about`;
  } else {
    aboutLink = '/about';
  }

  const aboutButton = (
    <li className={styles.about}>
      <Link to={aboutLink} className={`${isAbout ? styles.selected : styles.choice}`} onClick={(event) => {isHome && event.preventDefault()}}>
        {t('header_about')}
      </Link>
    </li>
  );

  return (
    <div className={styles.header}>
      <AccountBar />
      <div className={`${styles.container} ${fewTabs ? styles.reducedHeight : ''}`}>
        <div className={styles.logoContainer}>
          <Link to='/' className={styles.logoLink}>
            <img className={styles.logo} src='/assets/logo/seedit.png' alt='logo' />
            <img src={`/assets/logo/seedit-text-${theme === 'dark' ? 'dark' : 'light'}.svg`} className={styles.logoText} alt='logo' />
          </Link>
          <span className={`${isHome ? '' : styles.pageName}`}>{headerTitle}</span>
        </div>
        <div className={`${styles.tabs} ${fewTabs ? styles.fewTabs : ''}`}>
          <ul className={styles.tabMenu}>
            {headerTabs}
            {(isSubplebbit || isSubplebbitSubmit) && aboutButton}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;
