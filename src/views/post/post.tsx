import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAccountComment, useComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import styles from './post.module.css';
import LoadingEllipsis from '../../components/loading-ellipsis';
import Reply from '../../components/reply';
import ReplyForm from '../../components/reply-form';
import PostComponent from '../../components/post';
import Sidebar from '../../components/sidebar/';
import useReplies from '../../hooks/use-replies';
import useStateString from '../../hooks/use-state-string';
import { isPendingView } from '../../lib/utils/view-utils';

const Post = () => {
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const isInPendingView = isPendingView(location.pathname, params);
  const comment = useComment({ commentCid: params?.commentCid });
  const pendingPost = useAccountComment({ commentIndex: params?.accountCommentIndex as any });
  const post = isInPendingView ? pendingPost : comment;
  const isSingleComment = comment?.parentCid ? true : false;

  // in pending page, redirect to post view when post.cid is received
  const navigate = useNavigate();
  useEffect(() => {
    if (post?.cid && post?.subplebbitAddress) {
      navigate(`/p/${post?.subplebbitAddress}/c/${post?.cid}`, { replace: true });
    }
  }, [post?.cid, post?.subplebbitAddress, navigate]);

  const { cid, downvoteCount, postCid, replyCount, subplebbitAddress, timestamp, title, upvoteCount } = comment || {};
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const { createdAt, description, roles, rules, updatedAt } = subplebbit || {};

  const replies = useReplies(comment);
  const commentCount = replyCount === 0 ? t('no_comments') : replyCount === 1 ? t('one_comment') : t('all_comments', { count: replyCount });
  const stateString = useStateString(comment);
  const loadingString = stateString && <div className={styles.stateString}>{stateString !== 'failed' ? <LoadingEllipsis string={stateString} /> : stateString}</div>;

  const postTitle = title?.slice(0, 40) || comment?.content?.slice(0, 40);
  const subplebbitTitle = subplebbit?.title || subplebbit?.shortAddress;
  useEffect(() => {
    document.title = `${postTitle || ''}${postTitle && subplebbitTitle ? ' - ' : ''}${subplebbitTitle || ''}${postTitle || subplebbitTitle ? ' - seedit' : 'seedit'}`;
  }, [postTitle, subplebbitTitle]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.content}>
      <div className={styles.sidebar}>
        <Sidebar
          address={subplebbitAddress}
          cid={cid}
          createdAt={createdAt}
          description={description}
          downvoteCount={downvoteCount}
          roles={roles}
          rules={rules}
          timestamp={timestamp}
          title={subplebbit?.title}
          updatedAt={updatedAt}
          upvoteCount={upvoteCount}
        />
      </div>
      {post?.locked && (
        <div className={styles.lockedInfobar}>
          <div className={styles.lockedInfobarText}>{t('post_locked_info')}</div>
        </div>
      )}
      <PostComponent post={post} />
      {!isInPendingView && (
        <div className={styles.replyArea}>
          {!isSingleComment && (
            <div className={styles.repliesTitle}>
              <span className={styles.title}>{commentCount}</span>
            </div>
          )}
          <div className={styles.menuArea}>
            <div className={styles.spacer}>
              <span className={styles.dropdownTitle}>{t('reply_sorted_by')}: </span>
              <div className={styles.dropdown}>
                <span className={styles.selected}>{t('reply_best')}</span>
              </div>
            </div>
            <div className={styles.spacer} />
            {!isSingleComment && <ReplyForm cid={cid} />}
            {loadingString && loadingString}
          </div>
          {isSingleComment && (
            <div className={styles.singleCommentInfobar}>
              <div className={styles.singleCommentInfobarText}>you are viewing a single comment's thread</div>
              <div className={styles.singleCommentInfobarLink}>
                <Link to={`/p/${subplebbitAddress}/c/${postCid}`}>view the rest of the comments</Link> →
              </div>
            </div>
          )}
          <div className={styles.replies}>
            {isSingleComment && <Reply key={`singleComment-${comment.cid}`} reply={comment} depth={0} isSingleComment={true} />}
            {!isSingleComment && replies.map((reply, index) => <Reply key={`${index}${reply.cid}`} reply={reply} depth={comment.depth} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
