import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getShortAddress } from '@plebbit/plebbit-js';
import { useAccount, useAuthorAvatar, useComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import {
  getAboutLink,
  isAboutView,
  isAllView,
  isAllAboutView,
  isAuthorView,
  isAuthorCommentsView,
  isAuthorSubmittedView,
  isProfileDownvotedView,
  isHomeAboutView,
  isHomeView,
  isInboxView,
  isPendingView,
  isPostView,
  isProfileView,
  isProfileCommentsView,
  isProfileSubmittedView,
  isSettingsView,
  isSubmitView,
  isSubplebbitView,
  isSubplebbitSettingsView,
  isSubplebbitSubmitView,
  isSubplebbitsView,
  isSubplebbitsSubscriberView,
  isSubplebbitsModeratorView,
  isSubplebbitsAdminView,
  isSubplebbitsOwnerView,
  isProfileUpvotedView,
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
  const isInAboutView = isAboutView(location.pathname);
  const isInSubplebbitSubmitView = isSubplebbitSubmitView(location.pathname, params);

  return (
    <li className={styles.about}>
      <Link to={aboutLink} className={`${isInAboutView ? styles.selected : styles.choice}  ${isInSubplebbitSubmitView ? styles.singleAboutButton : ''}`}>
        {t('about')}
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
        {t('comments')}
      </Link>
    </li>
  );
};

const SortItems = () => {
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const isInAllView = isAllView(location.pathname);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);
  const sortLabels = [t('hot'), t('new'), t('active'), t('controversial'), t('top')];
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
    const sortLink = isInSubplebbitView ? `/p/${params.subplebbitAddress}/${choice}` : isInAllView ? `p/all/${choice}` : choice;

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
  const isInAboutView = isAboutView(location.pathname);
  const isInAuthorView = isAuthorView(location.pathname);
  const isInAuthorCommentsView = isAuthorCommentsView(location.pathname, params);
  const isInAuthorSubmittedView = isAuthorSubmittedView(location.pathname, params);
  const isInProfileDownvotedView = isProfileDownvotedView(location.pathname);
  const isInProfileView = isProfileView(location.pathname);
  const isInProfileCommentsView = isProfileCommentsView(location.pathname);
  const isInProfileSubmittedView = isProfileSubmittedView(location.pathname);
  const isInProfileUpvotedView = isProfileUpvotedView(location.pathname);

  const authorRoute = `/u/${params.authorAddress}/c/${params.commentCid}`;
  const overviewSelectedClass =
    (isInProfileView || isInAuthorView) &&
    !isInAboutView &&
    !isInProfileUpvotedView &&
    !isInProfileDownvotedView &&
    !isInProfileCommentsView &&
    !isInProfileSubmittedView &&
    !isInAuthorCommentsView &&
    !isInAuthorSubmittedView
      ? styles.selected
      : styles.choice;

  return (
    <>
      <li>
        <Link to={isInAuthorView ? authorRoute : '/profile'} className={overviewSelectedClass}>
          {t('overview')}
        </Link>
      </li>
      <li>
        <Link
          to={isInAuthorView ? authorRoute + '/comments' : '/profile/comments'}
          className={isInProfileCommentsView || isInAuthorCommentsView ? styles.selected : styles.choice}
        >
          {t('comments')}
        </Link>
      </li>
      <li>
        <Link
          to={isInAuthorView ? authorRoute + '/submitted' : '/profile/submitted'}
          className={isInProfileSubmittedView || isInAuthorSubmittedView ? styles.selected : styles.choice}
        >
          {t('submitted')}
        </Link>
      </li>
      {isInProfileView && (
        <>
          <li>
            <Link to='/profile/upvoted' className={isInProfileUpvotedView ? styles.selected : styles.choice}>
              {t('upvoted')}
            </Link>
          </li>
          <li>
            <Link to='/profile/downvoted' className={isInProfileDownvotedView ? styles.selected : styles.choice}>
              {t('downvoted')}
            </Link>
          </li>
          <li>
            <Link to={'/'} className={styles.choice} onClick={(e) => e.preventDefault()}>
              {t('hidden')}
            </Link>
          </li>
          <li>
            <Link to={'/'} className={styles.choice} onClick={(e) => e.preventDefault()}>
              {t('saved')}
            </Link>
          </li>
        </>
      )}
    </>
  );
};

const InboxHeaderTabs = () => {
  const { t } = useTranslation();

  return (
    <>
      <li>
        <Link to={'/inbox'} className={styles.selected}>
          {t('inbox')}
        </Link>
      </li>
      {/* TODO: add tabs for messaging when available in the API */}
    </>
  );
};

const SubplebbitsHeaderTabs = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isInSubplebbitsSubscriberView = isSubplebbitsSubscriberView(location.pathname);
  const isInSubplebbitsModeratorView = isSubplebbitsModeratorView(location.pathname);
  const isInSubplebbitsAdminView = isSubplebbitsAdminView(location.pathname);
  const isInSubplebbitsOwnerView = isSubplebbitsOwnerView(location.pathname);
  const isInSubplebbitsView =
    isSubplebbitsView(location.pathname) && !isInSubplebbitsSubscriberView && !isInSubplebbitsModeratorView && !isInSubplebbitsAdminView && !isInSubplebbitsOwnerView;

  return (
    <>
      <li>
        <Link to={'/communities/vote'} className={`${isInSubplebbitsView ? styles.selected : styles.choice}`}>
          {t('vote')}
        </Link>
      </li>
      <li>
        <Link
          to={'/communities/subscriber'}
          className={
            isInSubplebbitsSubscriberView || isInSubplebbitsModeratorView || isInSubplebbitsAdminView || isInSubplebbitsOwnerView ? styles.selected : styles.choice
          }
        >
          {t('my_communities')}
        </Link>
      </li>
    </>
  );
};

const HeaderTabs = () => {
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const isInAllView = isAllView(location.pathname);
  const isInAuthorView = isAuthorView(location.pathname);
  const isInHomeAboutView = isHomeAboutView(location.pathname);
  const isInHomeView = isHomeView(location.pathname, params);
  const isInInboxView = isInboxView(location.pathname);
  const isInPendingView = isPendingView(location.pathname, params);
  const isInPostView = isPostView(location.pathname, params);
  const isInProfileView = isProfileView(location.pathname);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);
  const isInSubplebbitSettingsView = isSubplebbitSettingsView(location.pathname, params);
  const isInSubplebbitSubmitView = isSubplebbitSubmitView(location.pathname, params);
  const isInSubplebbitsView = isSubplebbitsView(location.pathname);

  if (isInPostView) {
    return <CommentsButton />;
  } else if (isInHomeView || isInHomeAboutView || (isInSubplebbitView && !isInSubplebbitSubmitView && !isInSubplebbitSettingsView) || isInAllView) {
    return <SortItems />;
  } else if ((isInProfileView || isInAuthorView) && !isInPendingView) {
    return <AuthorHeaderTabs />;
  } else if (isInPendingView) {
    return <span className={styles.pageName}>{t('pending')}</span>;
  } else if (isInInboxView) {
    return <InboxHeaderTabs />;
  } else if (isInSubplebbitsView) {
    return <SubplebbitsHeaderTabs />;
  }
  return null;
};

const HeaderTitle = ({ title, shortAddress }: { title: string; shortAddress: string }) => {
  const account = useAccount();
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const isInAuthorView = isAuthorView(location.pathname);
  const isInInboxView = isInboxView(location.pathname);
  const isInPostView = isPostView(location.pathname, params);
  const isInProfileView = isProfileView(location.pathname);
  const isInSettingsView = isSettingsView(location.pathname);
  const isInSubmitView = isSubmitView(location.pathname);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);
  const isInSubplebbitSubmitView = isSubplebbitSubmitView(location.pathname, params);
  const isInSubplebbitSettingsView = isSubplebbitSettingsView(location.pathname, params);
  const isInSubplebbitsView = isSubplebbitsView(location.pathname);

  const subplebbitTitle = <Link to={`/p/${params.subplebbitAddress}`}>{title || shortAddress}</Link>;
  const submitTitle = <span className={styles.submitTitle}>{t('submit')}</span>;
  const profileTitle = <Link to='/profile'>{account?.author?.shortAddress}</Link>;
  const authorTitle = <Link to={`/u/${params.authorAddress}/c/${params.commentCid}`}>{params.authorAddress && getShortAddress(params.authorAddress)}</Link>;

  if (isInSubplebbitSubmitView) {
    return (
      <>
        {subplebbitTitle}: {submitTitle}
      </>
    );
  } else if (isInPostView || (isInSubplebbitView && !isInSubplebbitSettingsView)) {
    return subplebbitTitle;
  } else if (isInSubplebbitSettingsView) {
    return (
      <>
        {subplebbitTitle}: <span className={styles.lowercase}>{t('community_settings')}</span>
      </>
    );
  } else if (isInSubmitView) {
    return submitTitle;
  } else if (isInSettingsView) {
    return t('preferences');
  } else if (isInProfileView) {
    return profileTitle;
  } else if (isInAuthorView) {
    return authorTitle;
  } else if (isInInboxView) {
    return t('messages');
  } else if (isInSubplebbitsView) {
    return t('communities');
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
  const isInAboutView = isAboutView(location.pathname);
  const isInAllAboutView = isAllAboutView(location.pathname);
  const isInAllView = isAllView(location.pathname);
  const isInAuthorView = isAuthorView(location.pathname);
  const isInHomeView = isHomeView(location.pathname, params);
  const isInInboxView = isInboxView(location.pathname);
  const isInPostView = isPostView(location.pathname, params);
  const isInProfileView = isProfileView(location.pathname);
  const isInSettingsView = isSettingsView(location.pathname);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);
  const isInSubmitView = isSubmitView(location.pathname);
  const isInSubplebbitSubmitView = isSubplebbitSubmitView(location.pathname, params);
  const isInSubplebbitSettingsView = isSubplebbitSettingsView(location.pathname, params);

  const account = useAccount();
  const authorComment = useComment({ commentCid: params?.commentCid });
  const author = isInProfileView ? account?.author : isInAuthorView ? authorComment?.author : null;
  const { imageUrl } = useAuthorAvatar({ author });

  const hasFewTabs = isInPostView || isInSubmitView || isInSubplebbitSubmitView || isInSubplebbitSettingsView || isInSettingsView || isInInboxView;
  const hasStickyHeader =
    isInHomeView ||
    (isInSubplebbitView && !isInSubplebbitSubmitView && !isInSubplebbitSettingsView && !isInPostView && !isInAboutView) ||
    (isInProfileView && !isInAboutView) ||
    (isInAllView && !isInAllAboutView) ||
    (isInAuthorView && !isInAboutView);
  const logoSrc = isInSubplebbitView ? suggested?.avatarUrl : isInProfileView ? imageUrl : 'assets/logo/seedit.png';
  const logoIsAvatar = (isInSubplebbitView && suggested?.avatarUrl) || (isInProfileView && imageUrl);
  const logoLink = isInSubplebbitView ? `/p/${params.subplebbitAddress}` : isInProfileView ? '/profile' : '/';

  return (
    <div className={styles.header}>
      <div className={`${styles.container} ${hasFewTabs && styles.reducedHeight} ${hasStickyHeader && styles.increasedHeight}`}>
        <div className={styles.logoContainer}>
          <Link to={logoLink} className={styles.logoLink}>
            {(logoIsAvatar || (!isInSubplebbitView && !isInProfileView && !isInAuthorView)) && (
              <img className={`${logoIsAvatar ? styles.avatar : styles.logo}`} src={logoSrc} alt='logo' />
            )}
            {!isInSubplebbitView && !isInProfileView && !isInAuthorView && (
              <img src={`assets/logo/seedit-text-${theme === 'dark' ? 'dark' : 'light'}.svg`} className={styles.logoText} alt='logo' />
            )}
          </Link>
        </div>
        {!isInHomeView && !isInAllView && (
          <span className={`${styles.pageName} ${!logoIsAvatar && styles.soloPageName}`}>
            <HeaderTitle title={title} shortAddress={shortAddress} />
          </span>
        )}
        {isInSubplebbitView && !isInAboutView && (
          <span className={styles.joinButton}>
            <SubscribeButton address={params.subplebbitAddress} />
          </span>
        )}
        {!isMobile && (
          <div className={`${styles.tabs} ${hasFewTabs ? styles.fewTabs : ''}`}>
            <ul className={styles.tabMenu}>
              <HeaderTabs />
              {(isInSubplebbitView || isInSubplebbitSubmitView || isInPostView || isInProfileView || isInAuthorView) && <AboutButton />}
            </ul>
          </div>
        )}
      </div>
      {isMobile && (
        <div className={`${styles.tabs} ${hasFewTabs ? styles.fewTabs : ''}`}>
          <ul className={styles.tabMenu}>
            <HeaderTabs />
            {(isInHomeView || isInAllView || isInAboutView || isInSubplebbitView || isInSubplebbitSubmitView || isInPostView) && <AboutButton />}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Header;
