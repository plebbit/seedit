import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Comment, useAccount, useAccountComment, useComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import findTopParentCidOfReply from '../../lib/utils/cid-utils';
import { sortByBest } from '../../lib/utils/post-utils';
import { isPendingPostView, isPostContextView } from '../../lib/utils/view-utils';
import useReplies from '../../hooks/use-replies';
import useStateString from '../../hooks/use-state-string';
import LoadingEllipsis from '../../components/loading-ellipsis';
import Reply from '../../components/reply';
import ReplyForm from '../../components/reply-form';
import PostComponent from '../../components/post';
import Sidebar from '../../components/sidebar';
import styles from './post-page.module.css';
import _ from 'lodash';
import Over18Warning from '../../components/over-18-warning';
import { useIsBroadlyNsfwSubplebbit } from '../../hooks/use-is-broadly-nsfw-subplebbit';
import useContentOptionsStore from '../../stores/use-content-options-store';

const PendingPost = ({ commentIndex }: { commentIndex?: number }) => {
  const post = useAccountComment({ commentIndex });
  const navigate = useNavigate();

  // in pending page, redirect to post view when post.cid is received
  useEffect(() => {
    if (post?.cid && post?.subplebbitAddress) {
      navigate(`/p/${post?.subplebbitAddress}/c/${post?.cid}`, { replace: true });
    }
  }, [post?.cid, post?.subplebbitAddress, navigate]);

  return <PostComponent post={post} />;
};

type SortDropdownProps = {
  sortBy: string;
  onSortChange: (sort: string) => void;
};

const SortDropdown = ({ sortBy, onSortChange }: SortDropdownProps) => {
  const { t } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownItems = ['best', 'new', 'old'];

  const handleGlobalClick = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setOpenDropdown(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [handleGlobalClick]);

  return (
    <div className={styles.spacer}>
      <span className={styles.dropdownTitle}>{t('reply_sorted_by')}: </span>
      <div
        ref={dropdownRef}
        className={styles.dropdown}
        onClick={(e) => {
          e.stopPropagation();
          setOpenDropdown(!openDropdown);
        }}
      >
        <span className={styles.selected}>{t(sortBy)}</span>
        {openDropdown && (
          <div className={styles.dropdownItems}>
            {dropdownItems.map((item) => (
              <div
                className={styles.dropdownItem}
                key={item}
                onClick={() => {
                  setOpenDropdown(false);
                  onSortChange(item);
                }}
              >
                {t(item)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Post = ({ post }: { post: Comment }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
  const isInPostContextView = isPostContextView(location.pathname, params, location.search);
  const { cid, deleted, depth, locked, removed, postCid, replyCount, state, subplebbitAddress, timestamp } = post || {};

  const [sortBy, setSortBy] = useState('best');
  const unsortedReplies = useReplies(post);
  const account = useAccount();

  const replies = useMemo(() => {
    const pinnedReplies = unsortedReplies.filter((reply) => reply.pinned);
    const unpinnedReplies = unsortedReplies.filter((reply) => !reply.pinned);

    const sortedPinnedReplies = [...pinnedReplies].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    let sortedUnpinnedReplies;
    if (sortBy === 'best') {
      const currentTime = Math.floor(Date.now() / 1000);

      const recentAccountReplies = unpinnedReplies.filter(
        (reply) => reply.author?.address === account?.author?.address && currentTime - (reply.timestamp || 0) <= 30 * 60,
      );
      const otherReplies = unpinnedReplies.filter((reply) => reply.author?.address !== account?.author?.address || currentTime - (reply.timestamp || 0) > 30 * 60);

      const sortedRecentAccountReplies = [...recentAccountReplies].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      const sortedOtherReplies = sortByBest(otherReplies);

      sortedUnpinnedReplies = [...sortedRecentAccountReplies, ...sortedOtherReplies];
    } else {
      sortedUnpinnedReplies = [...unpinnedReplies].sort((a, b) => {
        if (sortBy === 'new') {
          return (b.timestamp || 0) - (a.timestamp || 0);
        } else {
          // 'old'
          return (a.timestamp || 0) - (b.timestamp || 0);
        }
      });
    }

    return [...sortedPinnedReplies, ...sortedUnpinnedReplies];
  }, [unsortedReplies, sortBy, account?.author?.address]);

  const isSingleComment = post?.parentCid ? true : false;

  const commentCount = replyCount === 0 ? t('no_comments') : replyCount === 1 ? t('one_comment') : t('all_comments', { count: replyCount });
  const stateString = useStateString(post);

  const lockedState = deleted ? t('deleted') : locked ? t('locked') : removed ? t('removed') : '';

  const [isHovering, setIsHovering] = useState(false);

  return (
    <>
      {(deleted || locked || removed) && (
        <div className={styles.lockedInfobar}>
          <div className={styles.lockedInfobarText}>{t('post_locked_info', { state: _.lowerCase(lockedState) })}</div>
        </div>
      )}
      <PostComponent post={post} />
      {timestamp && (
        <div className={styles.replyArea}>
          {!isSingleComment && (
            <div className={styles.repliesTitle}>
              <span className={styles.title}>{replyCount !== undefined ? commentCount : `${t('loading_comments')}...`}</span>
            </div>
          )}
          <div className={styles.menuArea}>
            <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
            <div className={styles.spacer} />
            {!isSingleComment && subplebbitAddress && cid && <ReplyForm cid={cid} subplebbitAddress={subplebbitAddress} postCid={postCid} />}
          </div>
          {isSingleComment && (
            <div className={styles.singleCommentInfobar}>
              <div className={styles.singleCommentInfobarText}>{t('single_comment_notice')}</div>
              <div className={styles.singleCommentInfobarLink}>
                <Link to={`/p/${subplebbitAddress}/c/${postCid}`}>{t('single_comment_link')}</Link> →
              </div>
            </div>
          )}
          <div className={styles.replies}>
            {replies.length === 0 && replyCount !== undefined && !(isInPostContextView || isSingleComment) && (
              <div className={styles.noReplies}>{t('nothing_found')}</div>
            )}
            {isSingleComment ? (
              <Reply key={`singleComment-${cid}`} reply={post} depth={0} isSingleComment={true} />
            ) : (
              replies.map((reply, index) => <Reply key={`${index}${reply.cid}`} reply={reply} depth={depth} />)
            )}
          </div>
        </div>
      )}
      <span className={styles.loadingString} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
        {stateString && stateString !== 'Failed' ? (
          <div className={styles.stateString}>
            <LoadingEllipsis string={isHovering ? stateString : t('loading')} />
          </div>
        ) : (
          state === 'failed' && t('failed')
        )}
      </span>
    </>
  );
};

const PostWithContext = ({ post }: { post: Comment }) => {
  const { t } = useTranslation();
  const { deleted, locked, postCid, removed, state, subplebbitAddress } = post || {};

  const postComment = useComment({ commentCid: post?.postCid });
  const topParentCid = findTopParentCidOfReply(post.cid, postComment);
  const topParentComment = useComment({ commentCid: topParentCid || '' });

  const stateString = useStateString(post);

  return (
    <>
      {(deleted || locked || removed) && (
        <div className={styles.lockedInfobar}>
          <div className={styles.lockedInfobarText}>{t('post_locked_info', { state: deleted ? t('deleted') : locked ? t('locked') : removed ? t('removed') : '' })}</div>
        </div>
      )}
      <PostComponent post={post} />
      <div className={styles.replyArea}>
        <div className={styles.menuArea}>
          {stateString && stateString !== 'Failed' ? (
            <div className={styles.stateString}>
              <LoadingEllipsis string={stateString} />
            </div>
          ) : (
            state === 'failed' && t('failed')
          )}
        </div>
        <div className={styles.singleCommentInfobar}>
          <div className={styles.singleCommentInfobarText}>{t('single_comment_notice')}</div>
          <div className={styles.singleCommentInfobarLink}>
            <Link to={`/p/${subplebbitAddress}/c/${postCid}`}>{t('single_comment_link')}</Link> →
          </div>
        </div>
        <div className={styles.replies}>
          <Reply key={`contextComment-${topParentComment.cid}`} reply={topParentComment} depth={0} />
        </div>
      </div>
    </>
  );
};

const PostPage = () => {
  const params = useParams();
  const location = useLocation();
  const isInPendingPostView = isPendingPostView(location.pathname, params);
  const isInPostContextView = isPostContextView(location.pathname, params, location.search);

  const { commentCid, subplebbitAddress } = params;
  const post = useComment({ commentCid });
  const subplebbit = useSubplebbit({ subplebbitAddress });

  // over 18 warning for subplebbit with nsfw tag in multisub default list
  const { hasAcceptedWarning } = useContentOptionsStore();
  const isBroadlyNsfwSubplebbit = useIsBroadlyNsfwSubplebbit(subplebbitAddress || '');

  const postTitle = post.title?.slice(0, 40) || post?.content?.slice(0, 40);
  const subplebbitTitle = subplebbit?.title || subplebbit?.shortAddress;
  useEffect(() => {
    document.title = `${postTitle || ''}${postTitle && subplebbitTitle ? ' - ' : ''}${subplebbitTitle || ''}${postTitle || subplebbitTitle ? ' - Seedit' : 'Seedit'}`;
  }, [postTitle, subplebbitTitle]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return isBroadlyNsfwSubplebbit && !hasAcceptedWarning ? (
    <Over18Warning />
  ) : (
    <div className={styles.content}>
      <div className={styles.sidebar}>
        <Sidebar subplebbit={subplebbit} comment={post} settings={subplebbit?.settings} />
      </div>
      {isInPendingPostView && params?.accountCommentIndex ? (
        <PendingPost commentIndex={+params?.accountCommentIndex || undefined} />
      ) : isInPostContextView ? (
        <PostWithContext post={post} />
      ) : (
        <Post post={post} />
      )}
    </div>
  );
};

export default PostPage;
