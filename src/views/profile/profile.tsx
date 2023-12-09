import { useEffect, useMemo, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { StateSnapshot, Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { useAccount, useAccountComments, useAccountVotes, useComments } from '@plebbit/plebbit-react-hooks';
import styles from './profile.module.css';
import Post from '../../components/post';
import AuthorSidebar from '../../components/author-sidebar';
import { isDownvotedView, isUpvotedView } from '../../lib/utils/view-utils';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

const Profile = () => {
  const account = useAccount();
  const location = useLocation();
  const params = useParams();
  let { accountComments } = useAccountComments();
  accountComments = [...accountComments].reverse();
  const { accountVotes } = useAccountVotes();
  const isUpvoted = isUpvotedView(location.pathname);
  const isDownvoted = isDownvotedView(location.pathname);

  const upvotedCommentCids = useMemo(() => accountVotes?.filter((vote) => vote.vote === 1).map((vote) => vote.commentCid) || [], [accountVotes]);

  const downvotedCommentCids = useMemo(() => accountVotes?.filter((vote) => vote.vote === -1).map((vote) => vote.commentCid) || [], [accountVotes]);

  const { comments: upvotedComments } = useComments({ commentCids: upvotedCommentCids });
  const { comments: downvotedComments } = useComments({ commentCids: downvotedCommentCids });

  const virtuosoData = isUpvoted ? upvotedComments : isDownvoted ? downvotedComments : accountComments;

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
      <div className={styles.sidebar}>
        <AuthorSidebar />
      </div>
      {account && !accountComments.length ? (
        'no posts'
      ) : (
        <Virtuoso
          increaseViewportBy={{ bottom: 1200, top: 600 }}
          totalCount={accountComments?.length || 0}
          data={virtuosoData}
          itemContent={(index, post) => post && <Post index={index} post={post} />}
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
