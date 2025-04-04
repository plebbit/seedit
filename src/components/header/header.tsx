import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAccount, useAccountComment } from '@plebbit/plebbit-react-hooks';
import Plebbit from '@plebbit/plebbit-js/dist/browser/index.js';
import useSubplebbitsStore from '@plebbit/plebbit-react-hooks/dist/stores/subplebbits';
import { sortTypes } from '../../constants/sort-types';
import { sortLabels } from '../../constants/sort-labels';
import {
  getAboutLink,
  isAllView,
  isAllAboutView,
  isAuthorView,
  isAuthorCommentsView,
  isAuthorSubmittedView,
  isCreateSubplebbitView,
  isHomeAboutView,
  isHomeView,
  isInboxView,
  isModView,
  isPendingPostView,
  isPostPageView,
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
  isSettingsContentOptionsView,
  isSettingsPlebbitOptionsView,
  isSubplebbitAboutView,
  isDomainView,
  isPostPageAboutView,
} from '../../lib/utils/view-utils';
import useContentOptionsStore from '../../stores/use-content-options-store';
import useNotFoundStore from '../../stores/use-not-found-store';
import { useIsBroadlyNsfwSubplebbit } from '../../hooks/use-is-broadly-nsfw-subplebbit';
import useTheme from '../../hooks/use-theme';
import useWindowWidth from '../../hooks/use-window-width';
import SubscribeButton from '../subscribe-button';
import styles from './header.module.css';

const AboutButton = () => {
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const aboutLink = getAboutLink(location.pathname, params);
  const isInHomeAboutView = isHomeAboutView(location.pathname);
  const isInPostPageAboutView = isPostPageAboutView(location.pathname, params);
  const isInSubplebbitAboutView = isSubplebbitAboutView(location.pathname, params);

  return (
    <li className={`${styles.about} ${isInHomeAboutView || isInSubplebbitAboutView || isInPostPageAboutView ? styles.selected : styles.choice}`}>
      <Link to={aboutLink}>{t('about')}</Link>
    </li>
  );
};

const CommentsButton = () => {
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const isInPostPageView = isPostPageView(location.pathname, params);
  const isInPendingPostView = isPendingPostView(location.pathname, params);
  const isInHomeAboutView = isHomeAboutView(location.pathname);
  const isInPostPageAboutView = isPostPageAboutView(location.pathname, params);

  return (
    <li className={(isInPostPageView || isInPendingPostView) && !isInHomeAboutView && !isInPostPageAboutView ? styles.selected : styles.choice}>
      <Link to={`/p/${params.subplebbitAddress}/c/${params.commentCid}`} onClick={(e) => isInPendingPostView && e.preventDefault()}>
        {t('comments')}
      </Link>
    </li>
  );
};

const SortItems = () => {
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const isInHomeAboutView = isHomeAboutView(location.pathname);
  const isInPostPageAboutView = isPostPageAboutView(location.pathname, params);
  const isInSubplebbitAboutView = isSubplebbitAboutView(location.pathname, params);
  const isInAllView = isAllView(location.pathname);
  const isInModView = isModView(location.pathname);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);
  const [selectedSortType, setSelectedSortType] = useState(params.sortType || '/hot');
  const timeFilterName = params.timeFilterName;

  useEffect(() => {
    if (isInHomeAboutView || isInSubplebbitAboutView || isInPostPageAboutView) {
      setSelectedSortType('');
    } else if (params.sortType) {
      setSelectedSortType(params.sortType);
    } else {
      setSelectedSortType('hot');
    }
  }, [params.sortType, isInHomeAboutView, isInSubplebbitAboutView, isInPostPageAboutView]);

  return sortTypes.map((sortType, index) => {
    let sortLink = isInSubplebbitView ? `/p/${params.subplebbitAddress}/${sortType}` : isInAllView ? `p/all/${sortType}` : isInModView ? `p/mod/${sortType}` : sortType;
    if (timeFilterName) {
      sortLink = sortLink + `/${timeFilterName}`;
    }
    return (
      <li key={sortType} className={selectedSortType === sortType ? styles.selected : styles.choice}>
        <Link to={sortLink} onClick={() => setSelectedSortType(sortType)}>
          {t(sortLabels[index])}
        </Link>
      </li>
    );
  });
};

const AuthorHeaderTabs = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
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
  const location = useLocation();
  const isInSettingsPlebbitOptionsView = isSettingsPlebbitOptionsView(location.pathname);
  const isInSettingsContentOptionsView = isSettingsContentOptionsView(location.pathname);

  return (
    <>
      <li className={isInSettingsPlebbitOptionsView || isInSettingsContentOptionsView ? styles.choice : styles.selected}>
        <Link to={'/settings'}>{t('general')}</Link>
      </li>
      <li className={isInSettingsContentOptionsView ? styles.selected : styles.choice}>
        <Link to={'/settings/content-options'}>{t('content_options')}</Link>
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
  const isInAllView = isAllView(location.pathname);
  const isInAuthorView = isAuthorView(location.pathname);
  const isInDomainView = isDomainView(location.pathname);
  const isInHomeAboutView = isHomeAboutView(location.pathname);
  const isInPostPageAboutView = isPostPageAboutView(location.pathname, params);
  const isInHomeView = isHomeView(location.pathname);
  const isInInboxView = isInboxView(location.pathname);
  const isInModView = isModView(location.pathname);
  const isInPendingPostView = isPendingPostView(location.pathname, params);
  const isInPostPageView = isPostPageView(location.pathname, params);
  const isInProfileView = isProfileView(location.pathname);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);
  const isInSubplebbitSettingsView = isSubplebbitSettingsView(location.pathname, params);
  const isInSubplebbitSubmitView = isSubplebbitSubmitView(location.pathname, params);
  const isInSubplebbitsView = isSubplebbitsView(location.pathname);
  const isInCreateSubplebbitView = isCreateSubplebbitView(location.pathname);
  const isInSettingsView = isSettingsView(location.pathname);
  const isInSettingsContentOptionsView = isSettingsContentOptionsView(location.pathname);
  const isInSettingsPlebbitOptionsView = isSettingsPlebbitOptionsView(location.pathname);

  if (isInPostPageView || isInPendingPostView) {
    return <CommentsButton />;
  } else if (
    isInHomeView ||
    isInHomeAboutView ||
    isInPostPageAboutView ||
    (isInSubplebbitView && !isInSubplebbitSubmitView && !isInSubplebbitSettingsView) ||
    isInAllView ||
    isInModView ||
    isInDomainView
  ) {
    return <SortItems />;
  } else if (isInProfileView || isInAuthorView) {
    return <AuthorHeaderTabs />;
  } else if (isInPendingPostView) {
    return <span className={styles.pageName}>{t('pending')}</span>;
  } else if (isInInboxView) {
    return <InboxHeaderTabs />;
  } else if (isInSubplebbitsView && !isInCreateSubplebbitView) {
    return <SubplebbitsHeaderTabs />;
  } else if (isInSettingsView || isInSettingsPlebbitOptionsView || isInSettingsContentOptionsView) {
    return <SettingsHeaderTabs />;
  }
  return null;
};

const HeaderTitle = ({ title, shortAddress, pendingPostSubplebbitAddress }: { title: string; shortAddress: string; pendingPostSubplebbitAddress?: string }) => {
  const account = useAccount();
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const isInAllView = isAllView(location.pathname);
  const isInAuthorView = isAuthorView(location.pathname);
  const isInDomainView = isDomainView(location.pathname);
  const isInInboxView = isInboxView(location.pathname);
  const isInModView = isModView(location.pathname);
  const isInPendingPostView = isPendingPostView(location.pathname, params);
  const isInPostPageView = isPostPageView(location.pathname, params);
  const isInProfileView = isProfileView(location.pathname);
  const isInSettingsView = isSettingsView(location.pathname);
  const isInSettingsContentOptionsView = isSettingsContentOptionsView(location.pathname);
  const isInSettingsPlebbitOptionsView = isSettingsPlebbitOptionsView(location.pathname);
  const isInSubmitView = isSubmitView(location.pathname);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);
  const isInSubplebbitSubmitView = isSubplebbitSubmitView(location.pathname, params);
  const isInSubplebbitSettingsView = isSubplebbitSettingsView(location.pathname, params);
  const isInSubplebbitsView = isSubplebbitsView(location.pathname);
  const isInCreateSubplebbitView = isCreateSubplebbitView(location.pathname);
  const isInNotFoundView = useNotFoundStore((state) => state.isNotFound);

  const subplebbitAddress = params.subplebbitAddress;

  const { hideAdultCommunities, hideGoreCommunities, hideAntiCommunities, hideVulgarCommunities } = useContentOptionsStore();
  const hasUnhiddenAnyNsfwCommunity = !hideAdultCommunities || !hideGoreCommunities || !hideAntiCommunities || !hideVulgarCommunities;
  const isBroadlyNsfwSubplebbit = useIsBroadlyNsfwSubplebbit(subplebbitAddress || '');

  const subplebbitTitle = <Link to={`/p/${isInPendingPostView ? pendingPostSubplebbitAddress : subplebbitAddress}`}>{title || shortAddress}</Link>;
  const domainTitle = <Link to={`/domain/${params.domain}`}>{params.domain}</Link>;
  const submitTitle = <span className={styles.submitTitle}>{t('submit')}</span>;
  const profileTitle = <Link to='/profile'>{account?.author?.shortAddress}</Link>;
  const authorTitle = <Link to={`/u/${params.authorAddress}/c/${params.commentCid}`}>{params.authorAddress && Plebbit.getShortAddress(params.authorAddress)}</Link>;

  if (isBroadlyNsfwSubplebbit && !hasUnhiddenAnyNsfwCommunity) {
    return <span>{t('over_18')}</span>;
  } else if (isInSubplebbitSubmitView) {
    return (
      <>
        {subplebbitTitle}: {submitTitle}
      </>
    );
  } else if (isInSubplebbitSettingsView) {
    return (
      <>
        {subplebbitTitle}: <span className={styles.lowercase}>{t('community_settings')}</span>
      </>
    );
  } else if (isInSubmitView) {
    return submitTitle;
  } else if (isInSettingsView || isInSettingsPlebbitOptionsView || isInSettingsContentOptionsView) {
    return t('preferences');
  } else if (isInProfileView && !isInPendingPostView) {
    return profileTitle;
  } else if (isInPostPageView || isInPendingPostView || (isInSubplebbitView && !isInSubplebbitSettingsView)) {
    return subplebbitTitle;
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
  } else if (isInModView) {
    return <span className={styles.lowercase}>{t('communities_you_moderate')}</span>;
  } else if (isInDomainView) {
    return domainTitle;
  }
  return null;
};

const Header = () => {
  const { t } = useTranslation();
  const [theme] = useTheme();
  const location = useLocation();
  const params = useParams();
  const subplebbit = useSubplebbitsStore((state) => state.subplebbits[params?.subplebbitAddress as string]);
  const { suggested, title, shortAddress } = subplebbit || {};

  const commentIndex = params?.accountCommentIndex ? parseInt(params?.accountCommentIndex) : undefined;
  const accountComment = useAccountComment({ commentIndex });
  const pendingPostSubplebbitAddress = accountComment?.subplebbitAddress && Plebbit.getShortAddress(accountComment?.subplebbitAddress);

  const isMobile = useWindowWidth() < 640;
  const isInAllAboutView = isAllAboutView(location.pathname);
  const isInAllView = isAllView(location.pathname);
  const isInAuthorView = isAuthorView(location.pathname);
  const isInDomainView = isDomainView(location.pathname);
  const isInHomeView = isHomeView(location.pathname);
  const isInHomeAboutView = isHomeAboutView(location.pathname);
  const isInInboxView = isInboxView(location.pathname);
  const isInModView = isModView(location.pathname);
  const isInPostPageView = isPostPageView(location.pathname, params);
  const isInPostPageAboutView = isPostPageAboutView(location.pathname, params);
  const isInPendingPostView = isPendingPostView(location.pathname, params);
  const isInProfileView = isProfileView(location.pathname);
  const isInSettingsView = isSettingsView(location.pathname);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);
  const isInSubplebbitAboutView = isSubplebbitAboutView(location.pathname, params);
  const isInSubmitView = isSubmitView(location.pathname);
  const isInSubplebbitSubmitView = isSubplebbitSubmitView(location.pathname, params);
  const isInSubplebbitSettingsView = isSubplebbitSettingsView(location.pathname, params);
  const isInNotFoundView = useNotFoundStore((state) => state.isNotFound);

  const hasFewTabs =
    isInPostPageView || isInSubmitView || isInSubplebbitSubmitView || isInSubplebbitSettingsView || isInSettingsView || isInInboxView || isInSettingsView;
  const hasStickyHeader =
    isInHomeView ||
    isInNotFoundView ||
    (isInSubplebbitView &&
      !isInSubplebbitSubmitView &&
      !isInSubplebbitSettingsView &&
      !isInPostPageView &&
      !isInHomeAboutView &&
      !isInSubplebbitAboutView &&
      !isInPostPageAboutView) ||
    (isInProfileView && !isInHomeAboutView) ||
    (isInAllView && !isInAllAboutView) ||
    (isInModView && !isInHomeAboutView) ||
    (isInDomainView && !isInHomeAboutView) ||
    (isInAuthorView && !isInHomeAboutView);

  const subplebbitAddress = params.subplebbitAddress;

  const contentOptionsStore = useContentOptionsStore();
  const hasUnhiddenAnyNsfwCommunity =
    !contentOptionsStore.hideAdultCommunities ||
    !contentOptionsStore.hideGoreCommunities ||
    !contentOptionsStore.hideAntiCommunities ||
    !contentOptionsStore.hideVulgarCommunities;
  const isBroadlyNsfwSubplebbit = useIsBroadlyNsfwSubplebbit(subplebbitAddress || '');

  const logoIsAvatar = isInSubplebbitView && suggested?.avatarUrl && !(isBroadlyNsfwSubplebbit && !hasUnhiddenAnyNsfwCommunity);
  const logoSrc = logoIsAvatar ? suggested?.avatarUrl : 'assets/logo/seedit.png';
  const logoLink = '/';

  const mobileSubmitButtonRoute =
    isInHomeView || isInHomeAboutView || isInAllView || isInModView || isInDomainView
      ? '/submit'
      : isInPendingPostView
      ? `/p/${accountComment?.subplebbitAddress}/submit`
      : subplebbitAddress
      ? `/p/${subplebbitAddress}/submit`
      : '/submit';

  return (
    <div className={styles.header}>
      <div
        className={`${styles.container} ${hasFewTabs && styles.reducedHeight} ${
          isInSubmitView && isInSubplebbitSubmitView && !isInSubplebbitView && isMobile && styles.reduceSubmitPageHeight
        } ${hasStickyHeader && styles.increasedHeight}`}
      >
        <div className={styles.logoContainer}>
          <Link to={logoLink} className={styles.logoLink}>
            {(logoIsAvatar || (!isInSubplebbitView && !isInProfileView && !isInAuthorView) || !logoIsAvatar) && (
              <img className={`${logoIsAvatar ? styles.avatar : styles.logo}`} src={logoSrc} alt='' />
            )}
            {((!isInSubplebbitView && !isInProfileView && !isInAuthorView) || !logoIsAvatar) && (
              <img src={`assets/logo/seedit-text-${theme === 'dark' ? 'dark' : 'light'}.svg`} className={styles.logoText} alt='' />
            )}
          </Link>
        </div>
        {!isInHomeView && !isInHomeAboutView && !isInModView && !isInAllView && (
          <span className={`${styles.pageName} ${!logoIsAvatar && styles.soloPageName}`}>
            <HeaderTitle
              title={title}
              shortAddress={shortAddress || (isInPendingPostView && pendingPostSubplebbitAddress)}
              pendingPostSubplebbitAddress={accountComment?.subplebbitAddress}
            />
          </span>
        )}
        {(isInModView || isInAllView) && (
          <div className={`${styles.pageName} ${styles.allOrModPageName}`}>
            <HeaderTitle title={title} shortAddress={shortAddress} />
          </div>
        )}
        {!isMobile && !(isBroadlyNsfwSubplebbit && !hasUnhiddenAnyNsfwCommunity) && (
          <ul className={styles.tabMenu}>
            <HeaderTabs />
            {(isInHomeView || isInHomeAboutView) && <AboutButton />}
          </ul>
        )}
      </div>
      {isMobile && !isInSubplebbitSubmitView && !(isBroadlyNsfwSubplebbit && !hasUnhiddenAnyNsfwCommunity) && (
        <ul className={`${styles.tabMenu} ${isInProfileView ? styles.horizontalScroll : ''}`}>
          <HeaderTabs />
          {(isInHomeView || isInHomeAboutView || isInSubplebbitView || isInHomeAboutView || isInPostPageView) && <AboutButton />}
          {!isInSubmitView && !isInSettingsView && (
            <li>
              <Link to={mobileSubmitButtonRoute} className={styles.submitButton}>
                {t('submit')}
              </Link>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default Header;
