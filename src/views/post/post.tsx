import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import styles from './post.module.css';
import LoadingEllipsis from '../../components/loading-ellipsis';
import Reply from '../../components/reply';
import ReplyForm from '../../components/reply-form';
import PostComponent from '../../components/post';
import Sidebar from '../../components/sidebar/';
import useReplies from '../../hooks/use-replies';
import useStateString from '../../hooks/use-state-string';

const Post = () => {
  const { t } = useTranslation();
  const { commentCid } = useParams();
  const comment = useComment({ commentCid });
  const { cid, downvoteCount, replyCount, subplebbitAddress, timestamp, title, upvoteCount } = comment || {};
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const { createdAt, description, roles, rules, updatedAt } = subplebbit || {};
  const stateString = useStateString(comment);

  const replies = useReplies(comment);

  const postTitle = title?.slice(0, 40) || comment?.content?.slice(0, 40);
  const subplebbitTitle = subplebbit?.title || subplebbit?.shortAddress;

  const commentCount = replyCount === 0 ? t('no_comments') : replyCount === 1 ? t('one_comment') : t('all_comments', { count: replyCount });

  const loadingString = stateString && <div className={styles.stateString}>{stateString !== 'failed' ? <LoadingEllipsis string={stateString} /> : stateString}</div>;

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
      <PostComponent post={comment} />
      <div className={styles.replyArea}>
        <div className={styles.repliesTitle}>
          <span className={styles.title}>{commentCount}</span>
        </div>
        <div className={styles.menuArea}>
          <div className={styles.spacer}>
            <span className={styles.dropdownTitle}>{t('reply_sorted_by')}: </span>
            <div className={styles.dropdown}>
              <span className={styles.selected}>{t('reply_best')}</span>
            </div>
          </div>
          <div className={styles.spacer} />
          <ReplyForm cid={cid} />
        </div>
        {loadingString && loadingString}
        <div className={styles.replies}>
          {replies.map((reply, index) => (
            <Reply key={`${index}${reply.cid}`} reply={reply} depth={comment.depth} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Post;
