import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { isAboutView, isHomeView, isPostView, isSubplebbitView, isSubmitView, isSubplebbitSubmitView } from '../../lib/utils/view-utils';
import useTheme from '../../hooks/use-theme';
import styles from './header.module.css';
import AccountBar from './account-bar';
import SubscribeButton from '../subscribe-button';

const sortTypes = ['hot', 'new', 'active', 'controversialAll', 'topAll'];

const Header = () => {
  const [theme] = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
  const [selectedSortType, setSelectedSortType] = useState(params.sortType || '/hot');
  const sortLabels = [t('header_hot'), t('header_new'), t('header_active'), t('header_controversial'), t('header_top')];
  const subplebbit = useSubplebbit({ subplebbitAddress: params.subplebbitAddress });
  const { suggested, title, shortAddress } = subplebbit || {};
  const isAbout = isAboutView(location.pathname);
  const isHome = isHomeView(location.pathname);
  const isPost = isPostView(location.pathname, params);
  const isSubplebbit = isSubplebbitView(location.pathname, params);
  const isSubmit = isSubmitView(location.pathname);
  const isSubplebbitSubmit = isSubplebbitSubmitView(location.pathname, params);
  const fewTabs = isPost || isSubmit || isSubplebbitSubmit;
  const logoSrc = isSubplebbit ? suggested?.avatarUrl : '/assets/logo/seedit.png';
  const logoIsAvatar = isSubplebbit && suggested?.avatarUrl;

  const handleSelect = (choice: string) => {
    setSelectedSortType(choice);
  };

  useEffect(() => {
    if (location.pathname.endsWith('/about')) {
      setSelectedSortType('');
    } else if (params.sortType) {
      setSelectedSortType(params.sortType);
    } else {
      setSelectedSortType('hot');
    }
  }, [params.sortType, location.pathname]);

  const sortItems = sortTypes.map((choice, index) => (
    <li key={choice}>
      <Link
        to={isSubplebbit ? `/p/${params.subplebbitAddress}/${choice}` : choice}
        className={selectedSortType === choice ? styles.selected : styles.choice}
        onClick={() => handleSelect(choice)}
      >
        {sortLabels[index]}
      </Link>
    </li>
  ));

  const commentsButton = (
    <li>
      <Link to={`/p/${params.subplebbitAddress}/c/${params.commentCid}`} className={isPost && !isAbout ? styles.selected : styles.choice}>
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

  if (isPost) {
    aboutLink = `/p/${params.subplebbitAddress}/c/${params.commentCid}/about`;
  } else if (isSubplebbit || isSubplebbitSubmit) {
    aboutLink = `/p/${params.subplebbitAddress}/about`;
  } else {
    aboutLink = '/about';
  }

  const aboutButton = (
    <li className={styles.about}>
      <Link
        to={aboutLink}
        className={`${isAbout ? styles.selected : styles.choice}`}
        onClick={(event) => {
          isHome && event.preventDefault();
        }}
      >
        {t('header_about')}
      </Link>
    </li>
  );

  return (
    <div className={styles.header}>
      <AccountBar />
      <div className={`${styles.container} ${fewTabs ? styles.reducedHeight : ''}`}>
        <div className={styles.logoContainer}>
          <Link to={logoIsAvatar ? `/p/${params.subplebbitAddress}` : '/'} className={styles.logoLink}>
            {(logoIsAvatar || !isSubplebbit) && <img className={`${logoIsAvatar ? styles.avatar : styles.logo}`} src={logoSrc} alt='logo' />}
            {!isSubplebbit && !suggested?.avatarUrl && (
              <img src={`/assets/logo/seedit-text-${theme === 'dark' ? 'dark' : 'light'}.svg`} className={styles.logoText} alt='logo' />
            )}
          </Link>
        </div>
        {!isHome && <span className={`${styles.pageName} ${!logoIsAvatar && styles.soloPageName}`}>{headerTitle}</span>}
        {isSubplebbit && !isAbout && (
          <span className={styles.joinButton}>
            <SubscribeButton address={params.subplebbitAddress} />
          </span>
        )}
        <div className={`${styles.tabs} ${fewTabs ? styles.fewTabs : ''}`}>
          <ul className={styles.tabMenu}>
            {headerTabs}
            {(isSubplebbit || isSubplebbitSubmit || isPost) && aboutButton}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;
