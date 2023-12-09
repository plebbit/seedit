import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getShortAddress } from '@plebbit/plebbit-js';
import { useAccount, useAuthorAvatar, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import {
  getAboutLink,
  isAboutView,
  isAllView,
  isAuthorView,
  isDownvotedView,
  isHomeView,
  isInboxView,
  isPostView,
  isSettingsView,
  isSubplebbitView,
  isSubmitView,
  isSubplebbitSubmitView,
  isProfileView,
  isUpvotedView,
} from '../../lib/utils/view-utils';
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
  const isAll = isAllView(location.pathname);
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

  return sortTypes.map((choice, index) => {
    const sortLink = isSubplebbit ? `/p/${params.subplebbitAddress}/${choice}` : isAll ? `p/all/${choice}` : choice;

    return (
      <li key={choice}>
        <Link to={sortLink} className={selectedSortType === choice ? styles.selected : styles.choice} onClick={() => handleSelect(choice)}>
          {sortLabels[index]}
        </Link>
      </li>
    );
  });
};

const AuthorHeaderTabs = () => {
  const location = useLocation();
  const params = useParams();
  const isAbout = isAboutView(location.pathname);
  const isAuthor = isAuthorView(location.pathname);
  const isDownvote = isDownvotedView(location.pathname);
  const isProfile = isProfileView(location.pathname);
  const isUpvote = isUpvotedView(location.pathname);

  const overviewLink = isAuthor ? `/u/${params.authorAddress}/c/${params.commentCid}` : '/profile';
  const overviewSelectedClass = (isProfile || isAuthor) && !isAbout && !isUpvote && !isDownvote ? styles.selected : styles.choice;

  return (
    <>
      <li>
        <Link to={overviewLink} className={overviewSelectedClass}>
          overview
        </Link>
      </li>
      <li>
        <Link to={overviewLink} className={styles.choice}>
          comments
        </Link>
      </li>
      <li>
        <Link to={overviewLink} className={styles.choice}>
          submitted
        </Link>
      </li>
      {isProfile && (
        <>
          <li>
            <Link to='/profile/upvoted' className={isUpvote ? styles.selected : styles.choice}>
              upvoted
            </Link>
          </li>
          <li>
            <Link to='/profile/downvoted' className={isDownvote ? styles.selected : styles.choice}>
              downvoted
            </Link>
          </li>
          <li>
            <Link to={overviewLink} className={styles.choice}>
              hidden
            </Link>
          </li>
          <li>
            <Link to={overviewLink} className={styles.choice}>
              saved
            </Link>
          </li>
        </>
      )}
    </>
  );
};

const HeaderTabs = () => {
  const params = useParams();
  const location = useLocation();
  const isAll = isAllView(location.pathname);
  const isAuthor = isAuthorView(location.pathname);
  const isHome = isHomeView(location.pathname, params);
  const isPost = isPostView(location.pathname, params);
  const isProfile = isProfileView(location.pathname);
  const isSubplebbit = isSubplebbitView(location.pathname, params);
  const isSubplebbitSubmit = isSubplebbitSubmitView(location.pathname, params);

  if (isPost) {
    return <CommentsButton />;
  } else if (isHome || (isSubplebbit && !isSubplebbitSubmit) || isAll) {
    return <SortItems />;
  } else if (isProfile || isAuthor) {
    return <AuthorHeaderTabs />;
  }
  return null;
};

const HeaderTitle = ({ title, shortAddress }: { title: string; shortAddress: string }) => {
  const account = useAccount();
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const isAuthor = isAuthorView(location.pathname);
  const isPost = isPostView(location.pathname, params);
  const isProfile = isProfileView(location.pathname);
  const isSubplebbit = isSubplebbitView(location.pathname, params);
  const isSubmit = isSubmitView(location.pathname);
  const isSubplebbitSubmit = isSubplebbitSubmitView(location.pathname, params);
  const isSettings = isSettingsView(location.pathname);

  const subplebbitTitle = <Link to={`/p/${params.subplebbitAddress}`}>{title || shortAddress}</Link>;
  const submitTitle = <span className={styles.submitTitle}>{t('submit')}</span>;
  const profileTitle = <Link to='/profile'>{account?.author?.shortAddress}</Link>;
  const authorTitle = <Link to={`/u/${params.authorAddress}/c/${params.commentCid}`}>{params.authorAddress && getShortAddress(params.authorAddress)}</Link>;

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
    return profileTitle;
  } else if (isAuthor) {
    return authorTitle;
  }
  return null;
};

const Header = () => {
  const account = useAccount();
  const { imageUrl } = useAuthorAvatar({ author: account?.author });
  const [theme] = useTheme();
  const location = useLocation();
  const params = useParams();
  const subplebbit = useSubplebbit({ subplebbitAddress: params.subplebbitAddress });
  const { suggested, title, shortAddress } = subplebbit || {};

  const isMobile = window.innerWidth < 768;
  const isAbout = isAboutView(location.pathname);
  const isAll = isAllView(location.pathname);
  const isAuthor = isAuthorView(location.pathname);
  const isHome = isHomeView(location.pathname, params);
  const isInbox = isInboxView(location.pathname);
  const isPost = isPostView(location.pathname, params);
  const isProfile = isProfileView(location.pathname);
  const isSettings = isSettingsView(location.pathname);
  const isSubplebbit = isSubplebbitView(location.pathname, params);
  const isSubmit = isSubmitView(location.pathname);
  const isSubplebbitSubmit = isSubplebbitSubmitView(location.pathname, params);

  const hasFewTabs = isPost || isSubmit || isSubplebbitSubmit || isSettings || isInbox;
  const hasStickyHeader = isHome || (isSubplebbit && !isSubplebbitSubmit && !isPost && !isAbout) || (isProfile && !isAbout) || isAll || (isAuthor && !isAbout);
  const logoSrc = isSubplebbit ? suggested?.avatarUrl : isProfile ? imageUrl : '/assets/logo/seedit.png';
  const logoIsAvatar = (isSubplebbit && suggested?.avatarUrl) || (isProfile && imageUrl);
  const logoLink = isSubplebbit ? `/p/${params.subplebbitAddress}` : isProfile ? '/profile' : '/';

  return (
    <div className={styles.header}>
      <div className={`${styles.container} ${hasFewTabs && styles.reducedHeight} ${hasStickyHeader && styles.increasedHeight}`}>
        <div className={styles.logoContainer}>
          <Link to={logoLink} className={styles.logoLink}>
            {(logoIsAvatar || (!isSubplebbit && !isProfile)) && <img className={`${logoIsAvatar ? styles.avatar : styles.logo}`} src={logoSrc} alt='logo' />}
            {!isSubplebbit && !isProfile && <img src={`/assets/logo/seedit-text-${theme === 'dark' ? 'dark' : 'light'}.svg`} className={styles.logoText} alt='logo' />}
          </Link>
        </div>
        {!isHome && !isAll && (
          <span className={`${styles.pageName} ${!logoIsAvatar && styles.soloPageName}`}>
            <HeaderTitle title={title} shortAddress={shortAddress} />
          </span>
        )}
        {isSubplebbit && !isAbout && (
          <span className={styles.joinButton}>
            <SubscribeButton address={params.subplebbitAddress} />
          </span>
        )}
        {!isMobile && (
          <div className={`${styles.tabs} ${hasFewTabs ? styles.fewTabs : ''}`}>
            <ul className={styles.tabMenu}>
              <HeaderTabs />
              {(isSubplebbit || isSubplebbitSubmit || isPost || isProfile || isAuthor) && <AboutButton />}
            </ul>
          </div>
        )}
      </div>
      {isMobile && (
        <div className={`${styles.tabs} ${hasFewTabs ? styles.fewTabs : ''}`}>
          <ul className={styles.tabMenu}>
            <HeaderTabs />
            {(isSubplebbit || isSubplebbitSubmit || isPost || isProfile || isAuthor) && <AboutButton />}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Header;
