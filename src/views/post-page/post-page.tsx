import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Comment, useAccountComment, useComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import styles from './post-page.module.css';
import LoadingEllipsis from '../../components/loading-ellipsis';
import Reply from '../../components/reply';
import ReplyForm from '../../components/reply-form';
import PostComponent from '../../components/post';
import Sidebar from '../../components/sidebar';
import useReplies from '../../hooks/use-replies';
import useStateString from '../../hooks/use-state-string';
import { isPendingPostView, isPostContextView } from '../../lib/utils/view-utils';
import findTopParentCidOfReply from '../../lib/utils/cid-utils';
import _ from 'lodash';

const PendingPost = ({ commentIndex }: { commentIndex?: number }) => {
  const post = useAccountComment({ commentIndex });

  // in pending page, redirect to post view when post.cid is received
  const navigate = useNavigate();
  useEffect(() => {
    if (post?.cid && post?.subplebbitAddress) {
      navigate(`/p/${post?.subplebbitAddress}/c/${post?.cid}`, { replace: true });
    }
  }, [post?.cid, post?.subplebbitAddress, navigate]);

  return <PostComponent post={post} />;
};

const Post = ({ post }: { post: Comment }) => {
  const { t } = useTranslation();
  const { cid, deleted, depth, locked, removed, postCid, replyCount, state, subplebbitAddress, timestamp } = post || {};

  const replies = useReplies(post);

  const isSingleComment = post?.parentCid ? true : false;

  const commentCount = replyCount === 0 ? t('no_comments') : replyCount === 1 ? t('one_comment') : t('all_comments', { count: replyCount });
  const stateString = useStateString(post);

  const lockedState = deleted ? t('deleted') : locked ? t('locked') : removed ? t('removed') : '';

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
            <div className={styles.spacer}>
              <span className={styles.dropdownTitle}>{t('reply_sorted_by')}: </span>
              <div className={styles.dropdown}>
                <span className={styles.selected}>{t('reply_best')}</span>
              </div>
            </div>
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
            {replies.length === 0 && <div className={styles.noReplies}>{t('nothing_found')}</div>}
            {isSingleComment ? (
              <Reply key={`singleComment-${cid}`} reply={post} depth={0} isSingleComment={true} />
            ) : (
              replies.map((reply, index) => <Reply key={`${index}${reply.cid}`} reply={reply} depth={depth} />)
            )}
          </div>
        </div>
      )}
      <span className={styles.loadingString}>
        {stateString && stateString !== 'Failed' ? (
          <div className={styles.stateString}>
            <LoadingEllipsis string={stateString} />
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
          <div className={styles.spacer}>
            <span className={styles.dropdownTitle}>{t('reply_sorted_by')}: </span>
            <div className={styles.dropdown}>
              <span className={styles.selected}>{t('reply_best')}</span>
            </div>
          </div>
          <div className={styles.spacer} />
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

  const post = useComment({ commentCid: params?.commentCid });
  const subplebbit = useSubplebbit({ subplebbitAddress: params?.subplebbitAddress });

  const postTitle = post.title?.slice(0, 40) || post?.content?.slice(0, 40);
  const subplebbitTitle = subplebbit?.title || subplebbit?.shortAddress;
  useEffect(() => {
    document.title = `${postTitle || ''}${postTitle && subplebbitTitle ? ' - ' : ''}${subplebbitTitle || ''}${postTitle || subplebbitTitle ? ' - Seedit' : 'Seedit'}`;
  }, [postTitle, subplebbitTitle]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
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
