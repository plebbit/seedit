import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAccount, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { getAboutLink, isAboutView, isHomeView, isPostView, isSettingsView, isSubplebbitView, isSubmitView, isSubplebbitSubmitView, isProfileView } from '../../lib/utils/view-utils';
import useTheme from '../../hooks/use-theme';
import styles from './header.module.css';
import SubscribeButton from '../subscribe-button';

const sortTypes = ['hot', 'new', 'active', 'controversialAll', 'topAll'];

const AboutButton = () => {
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const aboutLink = getAboutLink(location.pathname, params);
  const isHome = isHomeView(location.pathname, params);
  const isAbout = isAboutView(location.pathname);

  return (
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
};

const CommentsButton = () => {
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const isPost = isPostView(location.pathname, params);
  const isAbout = isAboutView(location.pathname);

  return (
    <li>
      <Link to={`/p/${params.subplebbitAddress}/c/${params.commentCid}`} className={isPost && !isAbout ? styles.selected : styles.choice}>
        {t('header_comments')}
      </Link>
    </li>
  );
};

const SortItems = () => {
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const isSubplebbit = isSubplebbitView(location.pathname, params);
  const sortLabels = [t('header_hot'), t('header_new'), t('header_active'), t('header_controversial'), t('header_top')];
  const [selectedSortType, setSelectedSortType] = useState(params.sortType || '/hot');

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

  return sortTypes.map((choice, index) => (
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
};

const ProfileHeaderTabs = () => {

  return (
    <>
      <li>
        <Link to='/' className={styles.selected} onClick={(e) => e.preventDefault()}>overview</Link>
      </li>
      <li>
        <Link to='/' className={styles.choice} onClick={(e) => e.preventDefault()}>comments</Link>
      </li>
      <li>
        <Link to='/' className={styles.choice} onClick={(e) => e.preventDefault()}>submitted</Link>
      </li>
    </>
  );
}

const HeaderTabs = () => {
  const params = useParams();
  const location = useLocation();
  const isHome = isHomeView(location.pathname, params);
  const isPost = isPostView(location.pathname, params);
  const isProfile = isProfileView(location.pathname);
  const isSubplebbit = isSubplebbitView(location.pathname, params);
  const isSubplebbitSubmit = isSubplebbitSubmitView(location.pathname, params);

  if (isPost) {
    return <CommentsButton />;
  } else if (isHome || (isSubplebbit && !isSubplebbitSubmit)) {
    return <SortItems />;
  } else if (isProfile) {
    return <ProfileHeaderTabs />;
  }
  return null;
};

const HeaderTitle = ({ title, shortAddress }: { title: string; shortAddress: string }) => {
  const account = useAccount();
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const isPost = isPostView(location.pathname, params);
  const isProfile = isProfileView(location.pathname);
  const isSubplebbit = isSubplebbitView(location.pathname, params);
  const isSubmit = isSubmitView(location.pathname);
  const isSubplebbitSubmit = isSubplebbitSubmitView(location.pathname, params);
  const isSettings = isSettingsView(location.pathname);

  const subplebbitTitle = <Link to={`/p/${params.subplebbitAddress}`}>{title || shortAddress}</Link>;
  const submitTitle = <span className={styles.submitTitle}>{t('submit')}</span>;

  if (isSubplebbitSubmit) {
    return (
      <>
        {subplebbitTitle}: {submitTitle}
      </>
    );
  } else if (isPost || isSubplebbit) {
    return subplebbitTitle;
  } else if (isSubmit) {
    return submitTitle;
  } else if (isSettings) {
    return t('preferences');
  } else if (isProfile) {
    return account?.author?.shortAddress;
  }
  return null;
};

const Header = () => {
  const [theme] = useTheme();
  const location = useLocation();
  const params = useParams();
  const subplebbit = useSubplebbit({ subplebbitAddress: params.subplebbitAddress });
  const { suggested, title, shortAddress } = subplebbit || {};

  const isAbout = isAboutView(location.pathname);
  const isHome = isHomeView(location.pathname, params);
  const isPost = isPostView(location.pathname, params);
  const isProfile = isProfileView(location.pathname);
  const isSettings = isSettingsView(location.pathname);
  const isSubplebbit = isSubplebbitView(location.pathname, params);
  const isSubmit = isSubmitView(location.pathname);
  const isSubplebbitSubmit = isSubplebbitSubmitView(location.pathname, params);

  const hasFewTabs = isPost || isSubmit || isSubplebbitSubmit || isSettings;
  const hasStickyHeader = isHome || (isSubplebbit && !isSubplebbitSubmit && !isPost && !isAbout) || isProfile;
  const logoSrc = isSubplebbit ? suggested?.avatarUrl : '/assets/logo/seedit.png';
  const logoIsAvatar = isSubplebbit && suggested?.avatarUrl;

  return (
    <div className={styles.header}>
      <div className={`${styles.container} ${hasFewTabs && styles.reducedHeight} ${hasStickyHeader && styles.increasedHeight}`}>
        <div className={styles.logoContainer}>
          <Link to={logoIsAvatar ? `/p/${params.subplebbitAddress}` : '/'} className={styles.logoLink}>
            {(logoIsAvatar || !isSubplebbit) && <img className={`${logoIsAvatar ? styles.avatar : styles.logo}`} src={logoSrc} alt='logo' />}
            {!isSubplebbit && !suggested?.avatarUrl && (
              <img src={`/assets/logo/seedit-text-${theme === 'dark' ? 'dark' : 'light'}.svg`} className={styles.logoText} alt='logo' />
            )}
          </Link>
        </div>
        {!isHome && (
          <span className={`${styles.pageName} ${!logoIsAvatar && styles.soloPageName}`}>
            <HeaderTitle title={title} shortAddress={shortAddress} />
          </span>
        )}
        {isSubplebbit && !isAbout && (
          <span className={styles.joinButton}>
            <SubscribeButton address={params.subplebbitAddress} />
          </span>
        )}
        <div className={`${styles.tabs} ${hasFewTabs ? styles.fewTabs : ''}`}>
          <ul className={styles.tabMenu}>
            <HeaderTabs />
            {(isSubplebbit || isSubplebbitSubmit || isPost) && <AboutButton />}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;
