import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useLocation, useParams } from 'react-router-dom';
import { StateSnapshot, Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { useAccount, useAccountComments, useAccountVotes, useComments } from '@plebbit/plebbit-react-hooks';
import { isProfileDownvotedView, isProfileUpvotedView, isProfileCommentsView, isProfileSubmittedView, isProfileHiddenView } from '../../lib/utils/view-utils';
import useWindowWidth from '../../hooks/use-window-width';
import AuthorSidebar from '../../components/author-sidebar';
import Post from '../../components/post';
import Reply from '../../components/reply';
import styles from './profile.module.css';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};
const sortTypes: string[] = ['new', 'old'];

type SortDropdownProps = {
  onSortChange: (sortType: string) => void;
};

const SortDropdown = ({ onSortChange }: SortDropdownProps) => {
  const { t } = useTranslation();
  const sortLabels: string[] = sortTypes.map((sortType) => t(sortType));
  const [selectedSort, setSelectedSort] = useState<string>(sortTypes[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownItemsRef = useRef<HTMLDivElement>(null);
  const dropChoicesClass = isDropdownOpen ? styles.dropChoicesVisible : styles.dropChoicesHidden;

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      dropdownItemsRef.current &&
      !dropdownItemsRef.current.contains(event.target as Node)
    ) {
      setIsDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleSortChange = (sortType: string) => {
    setSelectedSort(sortType);
    setIsDropdownOpen(false);
    onSortChange(sortType);
  };

  return (
    <div className={styles.sortDropdown}>
      <span className={styles.dropdownTitle}>{t('sorted_by')}: </span>
      <div className={styles.dropdown} onClick={() => setIsDropdownOpen(!isDropdownOpen)} ref={dropdownRef}>
        <span className={styles.selected}>{t(selectedSort)}</span>
      </div>
      <div className={`${styles.dropChoices} ${dropChoicesClass}`} ref={dropdownItemsRef}>
        {sortLabels.map((label, index) => (
          <div key={index} className={styles.filter} onClick={() => handleSortChange(sortTypes[index])}>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

const pageSize = 10;

const Profile = () => {
  const { t } = useTranslation();
  const account = useAccount();
  const location = useLocation();
  const params = useParams();
  const isMobile = useWindowWidth() < 640;

  const [activeTab, setActiveTab] = useState('overview');
  const [currentPage, setCurrentPage] = useState(1);

  const isInProfileUpvotedView = isProfileUpvotedView(location.pathname);
  const isInProfileDownvotedView = isProfileDownvotedView(location.pathname);
  const isInProfileHiddenView = isProfileHiddenView(location.pathname);
  const isInCommentsView = isProfileCommentsView(location.pathname);
  const isInSubmittedView = isProfileSubmittedView(location.pathname);

  useEffect(() => {
    if (isInProfileUpvotedView) setActiveTab('upvoted');
    else if (isInProfileDownvotedView) setActiveTab('downvoted');
    else if (isInProfileHiddenView) setActiveTab('hidden');
    else if (isInCommentsView) setActiveTab('comments');
    else if (isInSubmittedView) setActiveTab('submitted');
    else setActiveTab('overview');

    setCurrentPage(1); // Reset page when changing tabs
  }, [isInProfileUpvotedView, isInProfileDownvotedView, isInProfileHiddenView, isInCommentsView, isInSubmittedView]);

  const { accountComments } = useAccountComments();
  const { accountVotes } = useAccountVotes();

  const postComments = useMemo(() => accountComments?.filter((comment) => !comment.parentCid) || [], [accountComments]);
  const replyComments = useMemo(() => accountComments?.filter((comment) => comment.parentCid) || [], [accountComments]);

  const upvotedCommentCids = useMemo(() => {
    const allUpvotedCids = accountVotes?.filter((vote) => vote.vote === 1).map((vote) => vote.commentCid) || [];
    return allUpvotedCids.slice(0, currentPage * pageSize);
  }, [accountVotes, currentPage]);

  const downvotedCommentCids = useMemo(() => {
    const allDownvotedCids = accountVotes?.filter((vote) => vote.vote === -1).map((vote) => vote.commentCid) || [];
    return allDownvotedCids.slice(0, currentPage * pageSize);
  }, [accountVotes, currentPage]);

  const hiddenCommentCids = useMemo(() => {
    const allHiddenCids = Object.keys(account?.blockedCids ?? {});
    return allHiddenCids.slice(0, currentPage * pageSize);
  }, [account?.blockedCids, currentPage]);

  const { hasMoreUpvoted, hasMoreDownvoted, hasMoreHidden } = useMemo(() => {
    const allUpvotedCids = accountVotes?.filter((vote) => vote.vote === 1).map((vote) => vote.commentCid) || [];
    const allDownvotedCids = accountVotes?.filter((vote) => vote.vote === -1).map((vote) => vote.commentCid) || [];
    const allHiddenCids = Object.keys(account?.blockedCids ?? {});

    return {
      hasMoreUpvoted: currentPage * pageSize < allUpvotedCids.length,
      hasMoreDownvoted: currentPage * pageSize < allDownvotedCids.length,
      hasMoreHidden: currentPage * pageSize < allHiddenCids.length,
    };
  }, [accountVotes, account?.blockedCids, currentPage]);

  const hasMore = useMemo(() => {
    if (isInProfileUpvotedView) return hasMoreUpvoted;
    if (isInProfileDownvotedView) return hasMoreDownvoted;
    if (isInProfileHiddenView) return hasMoreHidden;
    return false;
  }, [hasMoreUpvoted, hasMoreDownvoted, hasMoreHidden, isInProfileUpvotedView, isInProfileDownvotedView, isInProfileHiddenView]);

  const { comments: upvotedComments } = useComments({ commentCids: upvotedCommentCids });
  const { comments: downvotedComments } = useComments({ commentCids: downvotedCommentCids });
  const { comments: hiddenComments } = useComments({ commentCids: hiddenCommentCids });

  const [sortType, setSortType] = useState('new');
  const handleSortChange = (newSortType: string) => {
    setSortType(newSortType);
    setCurrentPage(1);
  };

  const comments = useMemo(() => {
    let selectedComments;
    switch (activeTab) {
      case 'upvoted':
        selectedComments = upvotedComments;
        break;
      case 'downvoted':
        selectedComments = downvotedComments;
        break;
      case 'hidden':
        selectedComments = hiddenComments;
        break;
      case 'comments':
        selectedComments = replyComments;
        break;
      case 'submitted':
        selectedComments = postComments;
        break;
      case 'overview':
      default:
        selectedComments = [...postComments, ...replyComments];
    }

    // Sort comments
    selectedComments.sort((a, b) => (sortType === 'new' ? b!.timestamp - a!.timestamp : a!.timestamp - b!.timestamp));

    return selectedComments;
  }, [activeTab, upvotedComments, downvotedComments, hiddenComments, replyComments, postComments, sortType]);

  const loadMore = useCallback(() => {
    console.log('LoadMore called, current page:', currentPage);
    setCurrentPage((prevPage) => {
      const newPage = prevPage + 1;
      console.log('Setting new page:', newPage);
      return newPage;
    });
  }, [currentPage]);

  const profileTitle = account?.author?.displayName ? `${account?.author?.displayName} (u/${account?.author?.shortAddress})` : `u/${account?.author?.shortAddress}`;
  useEffect(() => {
    document.title = profileTitle + ' - Seedit';
  }, [t, profileTitle]);

  // save last virtuoso state on each scroll
  const virtuosoRef = useRef<VirtuosoHandle | null>(null);
  const lastVirtuosoState = lastVirtuosoStates?.[account?.shortAddress + params.sortType];
  useEffect(() => {
    const setLastVirtuosoState = () =>
      virtuosoRef.current?.getState((snapshot: StateSnapshot) => {
        if (snapshot?.ranges?.length) {
          lastVirtuosoStates[account?.shortAddress + params.sortType] = snapshot;
        }
      });
    window.addEventListener('scroll', setLastVirtuosoState);
    return () => window.removeEventListener('scroll', setLastVirtuosoState);
  }, [account?.shortAddress, params.sortType]);

  // only show infobar on first profile access
  const showInfobarRef = useRef(false);
  useEffect(() => {
    const wasProfileAccessed = localStorage.getItem('wasProfileAccessed');
    if (!wasProfileAccessed) {
      showInfobarRef.current = true;
      localStorage.setItem('wasProfileAccessed', 'true');
    }
  }, []);

  const infobar = showInfobarRef.current && (
    <div className={styles.infobar}>
      <Trans i18nKey='profile_info' values={{ shortAddress: account?.author?.shortAddress }} components={{ 1: <Link to='/settings' /> }} />
    </div>
  );

  return (
    <div className={styles.content}>
      {isMobile && infobar}
      <div className={isMobile ? styles.sidebarMobile : styles.sidebarDesktop}>
        <AuthorSidebar />
        {!isMobile && infobar}
      </div>
      <SortDropdown onSortChange={handleSortChange} />
      {account && comments.length === 0 ? (
        <div>{t('no_posts')}</div>
      ) : (
        <Virtuoso
          increaseViewportBy={{ bottom: 1200, top: 600 }}
          data={comments}
          totalCount={comments.length}
          itemContent={(index, post) =>
            post?.parentCid ? <Reply key={post?.cid} index={index} isSingleReply={true} reply={post} /> : <Post key={post?.cid} index={index} post={post} />
          }
          endReached={hasMore ? loadMore : undefined}
          useWindowScroll={true}
          ref={virtuosoRef}
          restoreStateFrom={lastVirtuosoState}
          initialScrollTop={lastVirtuosoState?.scrollTop}
        />
      )}
    </div>
  );
};

export default Profile;
