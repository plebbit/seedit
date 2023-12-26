import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getShortAddress } from '@plebbit/plebbit-js';
import { useAccount, useAuthorAvatar, useComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import {
  getAboutLink,
  isAboutView,
  isAllView,
  isAuthorView,
  isAuthorCommentsView,
  isAuthorSubmittedView,
  isDownvotedView,
  isHomeView,
  isInboxView,
  isPostView,
  isSettingsView,
  isSubplebbitView,
  isSubmitView,
  isSubplebbitSubmitView,
  isPendingView,
  isProfileView,
  isProfileCommentsView,
  isProfileSubmittedView,
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
  const isHomePage = isHomeView(location.pathname, params);
  const isAboutPage = isAboutView(location.pathname);

  return (
    <li className={styles.about}>
      <Link
        to={aboutLink}
        className={`${isAboutPage ? styles.selected : styles.choice}`}
        onClick={(event) => {
          isHomePage && event.preventDefault();
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
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
  const isAboutPage = isAboutView(location.pathname);
  const isAuthorPage = isAuthorView(location.pathname);
  const isAuthorCommentsPage = isAuthorCommentsView(location.pathname, params);
  const isAuthorSubmittedPage = isAuthorSubmittedView(location.pathname, params);
  const isDownvotedPage = isDownvotedView(location.pathname);
  const isProfilePage = isProfileView(location.pathname);
  const isProfileCommentsPage = isProfileCommentsView(location.pathname);
  const isProfileSubmittedPage = isProfileSubmittedView(location.pathname);
  const isUpvotedPage = isUpvotedView(location.pathname);

  const authorRoute = `/u/${params.authorAddress}/c/${params.commentCid}`;
  const overviewSelectedClass =
    (isProfilePage || isAuthorPage) &&
    !isAboutPage &&
    !isUpvotedPage &&
    !isDownvotedPage &&
    !isProfileCommentsPage &&
    !isProfileSubmittedPage &&
    !isAuthorCommentsPage &&
    !isAuthorSubmittedPage
      ? styles.selected
      : styles.choice;

  return (
    <>
      <li>
        <Link to={isAuthorPage ? authorRoute : '/profile'} className={overviewSelectedClass}>
          overview
        </Link>
      </li>
      <li>
        <Link
          to={isAuthorPage ? authorRoute + '/comments' : '/profile/comments'}
          className={isProfileCommentsPage || isAuthorCommentsPage ? styles.selected : styles.choice}
        >
          {t('header_comments')}
        </Link>
      </li>
      <li>
        <Link
          to={isAuthorPage ? authorRoute + '/submitted' : '/profile/submitted'}
          className={isProfileSubmittedPage || isAuthorSubmittedPage ? styles.selected : styles.choice}
        >
          submitted
        </Link>
      </li>
      {isProfilePage && (
        <>
          <li>
            <Link to='/profile/upvoted' className={isUpvotedPage ? styles.selected : styles.choice}>
              upvoted
            </Link>
          </li>
          <li>
            <Link to='/profile/downvoted' className={isDownvotedPage ? styles.selected : styles.choice}>
              downvoted
            </Link>
          </li>
          <li>
            <Link to={'/'} className={styles.choice} onClick={(e) => e.preventDefault()}>
              hidden
            </Link>
          </li>
          <li>
            <Link to={'/'} className={styles.choice} onClick={(e) => e.preventDefault()}>
              saved
            </Link>
          </li>
        </>
      )}
    </>
  );
};

const InboxHeaderTabs = () => {
  return (
    <>
      <li>
        <Link to={'/inbox'} className={styles.selected}>
          inbox
        </Link>
      </li>
      {/* TODO: add tabs for messaging when available in the API */}
    </>
  );
};

const HeaderTabs = () => {
  const params = useParams();
  const location = useLocation();
  const isAllPage = isAllView(location.pathname);
  const isAuthorPage = isAuthorView(location.pathname);
  const isHomePage = isHomeView(location.pathname, params);
  const isInboxPage = isInboxView(location.pathname);
  const isPendingPage = isPendingView(location.pathname, params);
  const isPostPage = isPostView(location.pathname, params);
  const isProfilePage = isProfileView(location.pathname);
  const isSubplebbitPage = isSubplebbitView(location.pathname, params);
  const isSubplebbitSubmitPage = isSubplebbitSubmitView(location.pathname, params);

  if (isPostPage) {
    return <CommentsButton />;
  } else if (isHomePage || (isSubplebbitPage && !isSubplebbitSubmitPage) || isAllPage) {
    return <SortItems />;
  } else if ((isProfilePage || isAuthorPage) && !isPendingPage) {
    return <AuthorHeaderTabs />;
  } else if (isPendingPage) {
    return <span className={styles.pageName}>pending</span>;
  } else if (isInboxPage) {
    return <InboxHeaderTabs />;
  }
  return null;
};

const HeaderTitle = ({ title, shortAddress }: { title: string; shortAddress: string }) => {
  const account = useAccount();
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const isAuthorPage = isAuthorView(location.pathname);
  const isInboxPage = isInboxView(location.pathname);
  const isPostPage = isPostView(location.pathname, params);
  const isProfilePage = isProfileView(location.pathname);
  const isSubplebbitPage = isSubplebbitView(location.pathname, params);
  const isSubmitPage = isSubmitView(location.pathname);
  const isSubplebbitSubmitPage = isSubplebbitSubmitView(location.pathname, params);
  const isSettingsPage = isSettingsView(location.pathname);

  const subplebbitTitle = <Link to={`/p/${params.subplebbitAddress}`}>{title || shortAddress}</Link>;
  const submitTitle = <span className={styles.submitTitle}>{t('submit')}</span>;
  const profileTitle = <Link to='/profile'>{account?.author?.shortAddress}</Link>;
  const authorTitle = <Link to={`/u/${params.authorAddress}/c/${params.commentCid}`}>{params.authorAddress && getShortAddress(params.authorAddress)}</Link>;

  if (isSubplebbitSubmitPage) {
    return (
      <>
        {subplebbitTitle}: {submitTitle}
      </>
    );
  } else if (isPostPage || isSubplebbitPage) {
    return subplebbitTitle;
  } else if (isSubmitPage) {
    return submitTitle;
  } else if (isSettingsPage) {
    return t('preferences');
  } else if (isProfilePage) {
    return profileTitle;
  } else if (isAuthorPage) {
    return authorTitle;
  } else if (isInboxPage) {
    return 'message';
  }
  return null;
};

const Header = () => {
  const [theme] = useTheme();
  const location = useLocation();
  const params = useParams();
  const subplebbit = useSubplebbit({ subplebbitAddress: params.subplebbitAddress });
  const { suggested, title, shortAddress } = subplebbit || {};

  const isMobile = window.innerWidth < 768;
  const isAboutPage = isAboutView(location.pathname);
  const isAllPage = isAllView(location.pathname);
  const isAuthorPage = isAuthorView(location.pathname);
  const isHomePage = isHomeView(location.pathname, params);
  const isInboxPage = isInboxView(location.pathname);
  const isPostPage = isPostView(location.pathname, params);
  const isProfilePage = isProfileView(location.pathname);
  const isSettingsPage = isSettingsView(location.pathname);
  const isSubplebbitPage = isSubplebbitView(location.pathname, params);
  const isSubmitPage = isSubmitView(location.pathname);
  const isSubplebbitSubmitPage = isSubplebbitSubmitView(location.pathname, params);

  const account = useAccount();
  const authorComment = useComment({ commentCid: params?.commentCid });
  const author = isProfilePage ? account?.author : isAuthorPage ? authorComment?.author : null;
  const { imageUrl } = useAuthorAvatar({ author });

  const hasFewTabs = isPostPage || isSubmitPage || isSubplebbitSubmitPage || isSettingsPage || isInboxPage;
  const hasStickyHeader =
    isHomePage ||
    (isSubplebbitPage && !isSubplebbitSubmitPage && !isPostPage && !isAboutPage) ||
    (isProfilePage && !isAboutPage) ||
    isAllPage ||
    (isAuthorPage && !isAboutPage);
  const logoSrc = isSubplebbitPage ? suggested?.avatarUrl : isProfilePage ? imageUrl : 'assets/logo/seedit.png';
  const logoIsAvatar = (isSubplebbitPage && suggested?.avatarUrl) || (isProfilePage && imageUrl);
  const logoLink = isSubplebbitPage ? `/p/${params.subplebbitAddress}` : isProfilePage ? '/profile' : '/';

  return (
    <div className={styles.header}>
      <div className={`${styles.container} ${hasFewTabs && styles.reducedHeight} ${hasStickyHeader && styles.increasedHeight}`}>
        <div className={styles.logoContainer}>
          <Link to={logoLink} className={styles.logoLink}>
            {(logoIsAvatar || (!isSubplebbitPage && !isProfilePage && !isAuthorPage)) && (
              <img className={`${logoIsAvatar ? styles.avatar : styles.logo}`} src={logoSrc} alt='logo' />
            )}
            {!isSubplebbitPage && !isProfilePage && !isAuthorPage && (
              <img src={`assets/logo/seedit-text-${theme === 'dark' ? 'dark' : 'light'}.svg`} className={styles.logoText} alt='logo' />
            )}
          </Link>
        </div>
        {!isHomePage && !isAllPage && (
          <span className={`${styles.pageName} ${!logoIsAvatar && styles.soloPageName}`}>
            <HeaderTitle title={title} shortAddress={shortAddress} />
          </span>
        )}
        {isSubplebbitPage && !isAboutPage && (
          <span className={styles.joinButton}>
            <SubscribeButton address={params.subplebbitAddress} />
          </span>
        )}
        {!isMobile && (
          <div className={`${styles.tabs} ${hasFewTabs ? styles.fewTabs : ''}`}>
            <ul className={styles.tabMenu}>
              <HeaderTabs />
              {(isSubplebbitPage || isSubplebbitSubmitPage || isPostPage || isProfilePage || isAuthorPage) && <AboutButton />}
            </ul>
          </div>
        )}
      </div>
      {isMobile && (
        <div className={`${styles.tabs} ${hasFewTabs ? styles.fewTabs : ''}`}>
          <ul className={styles.tabMenu}>
            <HeaderTabs />
            {(isSubplebbitPage || isSubplebbitSubmitPage || isPostPage) && <AboutButton />}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Header;
