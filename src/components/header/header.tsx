import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Plebbit from '@plebbit/plebbit-js/dist/browser/index.js';
import { useAccount, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { sortTypes } from '../../app';
import {
  getSidebarLink,
  isSidebarView,
  isAllView,
  isAllSidebarView,
  isAuthorView,
  isAuthorCommentsView,
  isAuthorSubmittedView,
  isCreateSubplebbitView,
  isHomeSidebarView,
  isHomeView,
  isInboxView,
  isPendingView,
  isPostView,
  isProfileView,
  isProfileCommentsView,
  isProfileDownvotedView,
  isProfileSubmittedView,
  isProfileHiddenView,
  isSettingsView,
  isSubmitView,
  isSubplebbitView,
  isSubplebbitSettingsView,
  isSubplebbitSubmitView,
  isSubplebbitsView,
  isSubplebbitsSubscriberView,
  isSubplebbitsModeratorView,
  isSubplebbitsAdminView,
  isSubplebbitsVoteView,
  isSubplebbitsOwnerView,
  isProfileUpvotedView,
  isSettingsPlebbitOptionsView,
  isAboutView,
} from '../../lib/utils/view-utils';
import useNotFoundStore from '../../stores/use-not-found-store';
import useTheme from '../../hooks/use-theme';
import useWindowWidth from '../../hooks/use-window-width';
import styles from './header.module.css';
import SubscribeButton from '../subscribe-button';

const AboutButton = () => {
  const isInAboutView = isAboutView(useLocation().pathname);
  return (
    <li className={isInAboutView ? styles.selected : styles.choice}>
      <Link to={'/about'}>About</Link>
    </li>
  );
};

const SidebarButton = () => {
  const params = useParams();
  const location = useLocation();
  const aboutLink = getSidebarLink(location.pathname, params);
  const isInSidebarView = isSidebarView(location.pathname);
  const isInSubplebbitSubmitView = isSubplebbitSubmitView(location.pathname, params);

  return (
    <li className={`${styles.about} ${isInSidebarView ? styles.selected : styles.choice}`}>
      <Link to={aboutLink} className={isInSubplebbitSubmitView ? styles.singleAboutButton : ''}>
        ▶︎
      </Link>
    </li>
  );
};

const CommentsButton = () => {
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const isPost = isPostView(location.pathname, params);
  const isSidebar = isSidebarView(location.pathname);

  return (
    <li className={isPost && !isSidebar ? styles.selected : styles.choice}>
      <Link to={`/p/${params.subplebbitAddress}/c/${params.commentCid}`}>{t('comments')}</Link>
    </li>
  );
};

const SortItems = () => {
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const isInAboutView = isAboutView(location.pathname);
  const isInSidebarView = isSidebarView(location.pathname);
  const isInAllView = isAllView(location.pathname);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);
  const sortLabels = [t('hot'), t('new'), t('active'), t('controversial'), t('top')];
  const [selectedSortType, setSelectedSortType] = useState(params.sortType || '/hot');
  const timeFilterName = params.timeFilterName;

  useEffect(() => {
    if (isInAboutView || isInSidebarView) {
      setSelectedSortType('');
    } else if (params.sortType) {
      setSelectedSortType(params.sortType);
    } else {
      setSelectedSortType('hot');
    }
  }, [params.sortType, isInAboutView, isInSidebarView]);

  return sortTypes.map((sortType, index) => {
    let sortLink = isInSubplebbitView ? `/p/${params.subplebbitAddress}/${sortType}` : isInAllView ? `p/all/${sortType}` : sortType;
    if (timeFilterName) {
      sortLink = sortLink + `/${timeFilterName}`;
    }
    return (
      <li key={sortType} className={selectedSortType === sortType ? styles.selected : styles.choice}>
        <Link to={sortLink} onClick={() => setSelectedSortType(sortType)}>
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
  const isInSidebarView = isSidebarView(location.pathname);
  const isInAuthorView = isAuthorView(location.pathname);
  const isInAuthorCommentsView = isAuthorCommentsView(location.pathname, params);
  const isInAuthorSubmittedView = isAuthorSubmittedView(location.pathname, params);
  const isInProfileDownvotedView = isProfileDownvotedView(location.pathname);
  const isInProfileView = isProfileView(location.pathname);
  const isInProfileCommentsView = isProfileCommentsView(location.pathname);
  const isInProfileSubmittedView = isProfileSubmittedView(location.pathname);
  const isInProfileUpvotedView = isProfileUpvotedView(location.pathname);
  const isInProfileHiddenView = isProfileHiddenView(location.pathname);

  const authorRoute = `/u/${params.authorAddress}/c/${params.commentCid}`;
  const overviewSelectedClass =
    (isInProfileView || isInAuthorView) &&
    !isInSidebarView &&
    !isInProfileUpvotedView &&
    !isInProfileDownvotedView &&
    !isInProfileCommentsView &&
    !isInProfileSubmittedView &&
    !isInAuthorCommentsView &&
    !isInProfileHiddenView &&
    !isInAuthorSubmittedView
      ? styles.selected
      : styles.choice;

  return (
    <>
      <li className={overviewSelectedClass}>
        <Link to={isInAuthorView ? authorRoute : '/profile'}>{t('overview')}</Link>
      </li>
      <li className={isInProfileCommentsView || isInAuthorCommentsView ? styles.selected : styles.choice}>
        <Link to={isInAuthorView ? authorRoute + '/comments' : '/profile/comments'}>{t('comments')}</Link>
      </li>
      <li className={isInProfileSubmittedView || isInAuthorSubmittedView ? styles.selected : styles.choice}>
        <Link to={isInAuthorView ? authorRoute + '/submitted' : '/profile/submitted'}>{t('submitted')}</Link>
      </li>
      {isInProfileView && (
        <>
          <li className={isInProfileUpvotedView ? styles.selected : styles.choice}>
            <Link to='/profile/upvoted'>{t('upvoted')}</Link>
          </li>
          <li className={isInProfileDownvotedView ? styles.selected : styles.choice}>
            <Link to='/profile/downvoted'>{t('downvoted')}</Link>
          </li>
          <li className={isInProfileHiddenView ? styles.selected : styles.choice}>
            <Link to={'/profile/hidden'}>{t('hidden')}</Link>
          </li>
          {/* TODO: implement functionality from API once available
          <li>
            <Link to={'/'} className={styles.choice} onClick={(e) => e.preventDefault()}>
              {t('saved')}
            </Link>
          </li> */}
        </>
      )}
    </>
  );
};

const InboxHeaderTabs = () => {
  const { t } = useTranslation();

  return (
    <>
      <li className={styles.selected}>
        <Link to={'/inbox'}>{t('inbox')}</Link>
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
  const isInSubplebbitsVoteView = isSubplebbitsVoteView(location.pathname);
  const isInSubplebbitsView =
    isSubplebbitsView(location.pathname) &&
    !isInSubplebbitsSubscriberView &&
    !isInSubplebbitsModeratorView &&
    !isInSubplebbitsAdminView &&
    !isInSubplebbitsOwnerView &&
    !isInSubplebbitsVoteView;

  return (
    <>
      <li className={`${isInSubplebbitsVoteView ? styles.selected : styles.choice}`}>
        <Link to={'/communities/vote'}>{t('vote')}</Link>
      </li>
      <li
        className={
          isInSubplebbitsSubscriberView || isInSubplebbitsModeratorView || isInSubplebbitsAdminView || isInSubplebbitsOwnerView || isInSubplebbitsView
            ? styles.selected
            : styles.choice
        }
      >
        <Link to={'/communities'}>{t('my_communities')}</Link>
      </li>
    </>
  );
};

const SettingsHeaderTabs = () => {
  const { t } = useTranslation();
  const isInSettingsPlebbitOptionsView = isSettingsPlebbitOptionsView(useLocation().pathname);

  return (
    <>
      <li className={isInSettingsPlebbitOptionsView ? styles.choice : styles.selected}>
        <Link to={'/settings'}>{t('general')}</Link>
      </li>
      <li className={isInSettingsPlebbitOptionsView ? styles.selected : styles.choice}>
        <Link to={'/settings/plebbit-options'}>{t('plebbit_options')}</Link>
      </li>
    </>
  );
};

const HeaderTabs = () => {
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const isInAboutView = isAboutView(location.pathname);
  const isInAllView = isAllView(location.pathname);
  const isInAuthorView = isAuthorView(location.pathname);
  const isInHomeSidebarView = isHomeSidebarView(location.pathname);
  const isInHomeView = isHomeView(location.pathname);
  const isInInboxView = isInboxView(location.pathname);
  const isInPendingView = isPendingView(location.pathname, params);
  const isInPostView = isPostView(location.pathname, params);
  const isInProfileView = isProfileView(location.pathname);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);
  const isInSubplebbitSettingsView = isSubplebbitSettingsView(location.pathname, params);
  const isInSubplebbitSubmitView = isSubplebbitSubmitView(location.pathname, params);
  const isInSubplebbitsView = isSubplebbitsView(location.pathname);
  const isInCreateSubplebbitView = isCreateSubplebbitView(location.pathname);
  const isInSettingsView = isSettingsView(location.pathname);
  const isInSettingsPlebbitOptionsView = isSettingsPlebbitOptionsView(location.pathname);

  if (isInPostView) {
    return <CommentsButton />;
  } else if (isInHomeView || isInHomeSidebarView || (isInSubplebbitView && !isInSubplebbitSubmitView && !isInSubplebbitSettingsView) || isInAllView || isInAboutView) {
    return <SortItems />;
  } else if ((isInProfileView || isInAuthorView) && !isInPendingView) {
    return <AuthorHeaderTabs />;
  } else if (isInPendingView) {
    return <span className={styles.pageName}>{t('pending')}</span>;
  } else if (isInInboxView) {
    return <InboxHeaderTabs />;
  } else if (isInSubplebbitsView && !isInCreateSubplebbitView) {
    return <SubplebbitsHeaderTabs />;
  } else if (isInSettingsView || isInSettingsPlebbitOptionsView) {
    return <SettingsHeaderTabs />;
  }
  return null;
};

const HeaderTitle = ({ title, shortAddress }: { title: string; shortAddress: string }) => {
  const account = useAccount();
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const isInAllView = isAllView(location.pathname);
  const isInAuthorView = isAuthorView(location.pathname);
  const isInInboxView = isInboxView(location.pathname);
  const isInPostView = isPostView(location.pathname, params);
  const isInProfileView = isProfileView(location.pathname);
  const isInSettingsView = isSettingsView(location.pathname);
  const isInSettingsPlebbitOptionsView = isSettingsPlebbitOptionsView(location.pathname);
  const isInSubmitView = isSubmitView(location.pathname);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);
  const isInSubplebbitSubmitView = isSubplebbitSubmitView(location.pathname, params);
  const isInSubplebbitSettingsView = isSubplebbitSettingsView(location.pathname, params);
  const isInSubplebbitsView = isSubplebbitsView(location.pathname);
  const isInCreateSubplebbitView = isCreateSubplebbitView(location.pathname);
  const isInNotFoundView = useNotFoundStore((state) => state.isNotFound);

  const subplebbitTitle = <Link to={`/p/${params.subplebbitAddress}`}>{title || shortAddress}</Link>;
  const submitTitle = <span className={styles.submitTitle}>{t('submit')}</span>;
  const profileTitle = <Link to='/profile'>{account?.author?.shortAddress}</Link>;
  const authorTitle = <Link to={`/u/${params.authorAddress}/c/${params.commentCid}`}>{params.authorAddress && Plebbit.getShortAddress(params.authorAddress)}</Link>;

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
  } else if (isInSettingsView || isInSettingsPlebbitOptionsView) {
    return t('preferences');
  } else if (isInProfileView) {
    return profileTitle;
  } else if (isInAuthorView) {
    return authorTitle;
  } else if (isInInboxView) {
    return t('messages');
  } else if (isInCreateSubplebbitView) {
    return <span className={styles.lowercase}>{t('create_community')}</span>;
  } else if (isInSubplebbitsView) {
    return t('communities');
  } else if (isInNotFoundView) {
    return <span className={styles.lowercase}>{t('page_not_found')}</span>;
  } else if (isInAllView) {
    return t('all');
  }
  return null;
};

const Header = () => {
  const [theme] = useTheme();
  const location = useLocation();
  const params = useParams();
  const subplebbit = useSubplebbit({ subplebbitAddress: params.subplebbitAddress });
  const { suggested, title, shortAddress } = subplebbit || {};

  const isMobile = useWindowWidth() < 640;
  const isInAboutView = isAboutView(location.pathname);
  const isInSidebarView = isSidebarView(location.pathname);
  const isInAllSidebarView = isAllSidebarView(location.pathname);
  const isInAllView = isAllView(location.pathname);
  const isInAuthorView = isAuthorView(location.pathname);
  const isInHomeView = isHomeView(location.pathname);
  const isInHomeSidebarView = isHomeSidebarView(location.pathname);
  const isInInboxView = isInboxView(location.pathname);
  const isInPostView = isPostView(location.pathname, params);
  const isInProfileView = isProfileView(location.pathname);
  const isInSettingsView = isSettingsView(location.pathname);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);
  const isInSubmitView = isSubmitView(location.pathname);
  const isInSubplebbitSubmitView = isSubplebbitSubmitView(location.pathname, params);
  const isInSubplebbitSettingsView = isSubplebbitSettingsView(location.pathname, params);
  const isInNotFoundView = useNotFoundStore((state) => state.isNotFound);

  const hasFewTabs = isInPostView || isInSubmitView || isInSubplebbitSubmitView || isInSubplebbitSettingsView || isInSettingsView || isInInboxView || isInSettingsView;
  const hasStickyHeader =
    isInHomeView ||
    isInNotFoundView ||
    (isInSubplebbitView && !isInSubplebbitSubmitView && !isInSubplebbitSettingsView && !isInPostView && !isInSidebarView) ||
    (isInProfileView && !isInSidebarView) ||
    (isInAllView && !isInAllSidebarView) ||
    (isInAuthorView && !isInSidebarView);
  const logoSrc = isInSubplebbitView ? suggested?.avatarUrl : 'assets/logo/seedit.png';
  const logoIsAvatar = isInSubplebbitView && suggested?.avatarUrl;
  const logoLink = isInSubplebbitView ? `/p/${params.subplebbitAddress}` : isInProfileView ? '/profile' : '/';

  return (
    <div className={styles.header}>
      <div
        className={`${styles.container} ${hasFewTabs && styles.reducedHeight} ${isInSubmitView && !isInSubplebbitView && isMobile && styles.reduceSubmitPageHeight} ${
          hasStickyHeader && styles.increasedHeight
        }`}
      >
        <div className={styles.logoContainer}>
          <Link to={logoLink} className={styles.logoLink}>
            {(logoIsAvatar || (!isInSubplebbitView && !isInProfileView && !isInAuthorView)) && (
              <img className={`${logoIsAvatar ? styles.avatar : styles.logo}`} src={logoSrc} alt='' />
            )}
            {!isInSubplebbitView && !isInProfileView && !isInAuthorView && (
              <img src={`assets/logo/seedit-text-${theme === 'dark' ? 'dark' : 'light'}.svg`} className={styles.logoText} alt='' />
            )}
          </Link>
        </div>
        {!isInHomeView && !isInAboutView && (
          <span className={`${styles.pageName} ${!logoIsAvatar && styles.soloPageName}`}>
            <HeaderTitle title={title} shortAddress={shortAddress} />
          </span>
        )}
        {isInSubplebbitView && (
          <span className={styles.joinButton}>
            <SubscribeButton address={params.subplebbitAddress} />
          </span>
        )}
        {!isMobile && (
          <ul className={styles.tabMenu}>
            <HeaderTabs />
            {(isInSubplebbitView || isInSubplebbitSubmitView || isInPostView || isInProfileView || isInAuthorView) && <SidebarButton />}
            {(isInHomeView || isInAboutView) && <AboutButton />}
          </ul>
        )}
      </div>
      {isMobile && !isInSubplebbitSubmitView && (
        <ul className={`${styles.tabMenu} ${styles.tabs}`}>
          <HeaderTabs />
          {(isInHomeView || isInAboutView || isInHomeSidebarView) && <AboutButton />}
          {(isInHomeView || isInAllView || isInSidebarView || isInSubplebbitView || isInPostView || isInAboutView) && <SidebarButton />}
        </ul>
      )}
    </div>
  );
};

export default Header;
