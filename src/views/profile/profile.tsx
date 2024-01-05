import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { StateSnapshot, Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { useAccount, useAccountComments, useAccountVotes, useComments } from '@plebbit/plebbit-react-hooks';
import { isProfileDownvotedView, isProfileUpvotedView, isProfileCommentsView, isProfileSubmittedView } from '../../lib/utils/view-utils';
import { useTranslation } from 'react-i18next';
import styles from './profile.module.css';
import AuthorSidebar from '../../components/author-sidebar';
import Post from '../../components/post';
import Reply from '../../components/reply';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};
const sortTypes: string[] = ['new', 'old'];

type SortDropdownProps = {
  onSortChange: (sortType: string) => void;
};

const SortDropdown: React.FC<SortDropdownProps> = ({ onSortChange }) => {
  const { t } = useTranslation();
  const sortLabels: string[] = sortTypes.map((sortType) => t(sortType));
  const [selectedSort, setSelectedSort] = useState<string>(sortTypes[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownChoicesRef = useRef<HTMLDivElement>(null);
  const dropChoicesClass = isDropdownOpen ? styles.dropChoicesVisible : styles.dropChoicesHidden;

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      dropdownChoicesRef.current &&
      !dropdownChoicesRef.current.contains(event.target as Node)
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
      <div className={`${styles.dropChoices} ${dropChoicesClass}`} ref={dropdownChoicesRef}>
        {sortLabels.map((label, index) => (
          <div key={index} className={styles.filter} onClick={() => handleSortChange(sortTypes[index])}>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

const Profile = () => {
  const { t } = useTranslation();
  const account = useAccount();
  const location = useLocation();
  const params = useParams();
  let { accountComments } = useAccountComments();
  accountComments = [...accountComments].reverse();
  const { accountVotes } = useAccountVotes();
  const isInProfileUpvotedView = isProfileUpvotedView(location.pathname);
  const isInProfileDownvotedView = isProfileDownvotedView(location.pathname);
  const isInCommentsView = isProfileCommentsView(location.pathname);
  const isInSubmittedView = isProfileSubmittedView(location.pathname);
  const isMobile = window.innerWidth < 768;

  // get comments for upvoted/downvoted/comments/submitted pages
  const upvotedCommentCids = useMemo(() => accountVotes?.filter((vote) => vote.vote === 1).map((vote) => vote.commentCid) || [], [accountVotes]);
  const downvotedCommentCids = useMemo(() => accountVotes?.filter((vote) => vote.vote === -1).map((vote) => vote.commentCid) || [], [accountVotes]);
  const replyComments = useMemo(() => accountComments?.filter((comment) => comment.parentCid) || [], [accountComments]);
  const postComments = useMemo(() => accountComments?.filter((comment) => !comment.parentCid) || [], [accountComments]);
  const { comments: upvotedComments } = useComments({ commentCids: upvotedCommentCids });
  const { comments: downvotedComments } = useComments({ commentCids: downvotedCommentCids });

  const [sortType, setSortType] = useState('new');
  const handleSortChange = (newSortType: string) => {
    setSortType(newSortType);
  };

  const comments = useMemo(() => {
    if (isInProfileUpvotedView) {
      return upvotedComments;
    } else if (isInProfileDownvotedView) {
      return downvotedComments;
    } else if (isInCommentsView) {
      return replyComments;
    } else if (isInSubmittedView) {
      return postComments;
    } else {
      return accountComments;
    }
  }, [
    isInProfileUpvotedView,
    isInProfileDownvotedView,
    isInCommentsView,
    isInSubmittedView,
    upvotedComments,
    downvotedComments,
    replyComments,
    postComments,
    accountComments,
  ]);

  const virtuosoData = useMemo(() => {
    let sortedData = [...comments];
    if (sortType === 'new') {
      sortedData.sort((a, b) => b!.timestamp - a!.timestamp);
    } else {
      sortedData.sort((a, b) => a!.timestamp - b!.timestamp);
    }
    return sortedData;
  }, [sortType, comments]);

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

  return (
    <div className={styles.content}>
      <div className={isMobile ? styles.sidebarMobile : styles.sidebarDesktop}>
        <AuthorSidebar />
      </div>
      <SortDropdown onSortChange={handleSortChange} />
      {account && !accountComments.length ? (
        t('no_posts')
      ) : (
        <Virtuoso
          increaseViewportBy={{ bottom: 1200, top: 600 }}
          totalCount={accountComments?.length || 0}
          data={virtuosoData}
          itemContent={(index, post) => {
            const isReply = post?.parentCid;
            return !isReply ? <Post index={index} post={post} /> : <Reply index={index} isSingle={true} reply={post} />;
          }}
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
