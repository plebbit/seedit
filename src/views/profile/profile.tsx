import { useEffect, useMemo, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { StateSnapshot, Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { useAccount, useAccountComments, useAccountVotes, useComments } from '@plebbit/plebbit-react-hooks';
import { isDownvotedView, isUpvotedView, isProfileCommentsView, isProfileSubmittedView } from '../../lib/utils/view-utils';
import styles from './profile.module.css';
import AuthorSidebar from '../../components/author-sidebar';
import Post from '../../components/post';
import Reply from '../../components/reply';
import SortDropdown from '../../components/sort-dropdown';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

const Profile = () => {
  const account = useAccount();
  const location = useLocation();
  const params = useParams();
  let { accountComments } = useAccountComments();
  accountComments = [...accountComments].reverse();
  const { accountVotes } = useAccountVotes();
  const isUpvotedPage = isUpvotedView(location.pathname);
  const isDownvotedPage = isDownvotedView(location.pathname);
  const isCommentsPage = isProfileCommentsView(location.pathname);
  const isSubmittedPage = isProfileSubmittedView(location.pathname);
  const isMobile = window.innerWidth < 768;

  const upvotedCommentCids = useMemo(() => accountVotes?.filter((vote) => vote.vote === 1).map((vote) => vote.commentCid) || [], [accountVotes]);
  const downvotedCommentCids = useMemo(() => accountVotes?.filter((vote) => vote.vote === -1).map((vote) => vote.commentCid) || [], [accountVotes]);
  const replyComments = useMemo(() => accountComments?.filter((comment) => comment.parentCid) || [], [accountComments]);
  const postComments = useMemo(() => accountComments?.filter((comment) => !comment.parentCid) || [], [accountComments]);

  const { comments: upvotedComments } = useComments({ commentCids: upvotedCommentCids });
  const { comments: downvotedComments } = useComments({ commentCids: downvotedCommentCids });

  let virtuosoData;
  if (isUpvotedPage) {
    virtuosoData = upvotedComments;
  } else if (isDownvotedPage) {
    virtuosoData = downvotedComments;
  } else if (isCommentsPage) {
    virtuosoData = replyComments;
  } else if (isSubmittedPage) {
    virtuosoData = postComments;
  } else {
    virtuosoData = accountComments;
  }

  const virtuosoRef = useRef<VirtuosoHandle | null>(null);

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

  const lastVirtuosoState = lastVirtuosoStates?.[account?.shortAddress + params.sortType];

  return (
    <div className={styles.content}>
      <div className={isMobile ? styles.sidebarMobile : styles.sidebarDesktop}>
        <AuthorSidebar />
      </div>
      <SortDropdown />
      {account && !accountComments.length ? (
        'no posts'
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
