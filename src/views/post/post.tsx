import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import styles from './post.module.css';
import Reply from '../../components/reply';
import ReplyForm from '../../components/reply-form';
import PostComponent from '../../components/post';
import { usePendingReplyCount } from '../../hooks/use-pending-replycount';
import useReplies from '../../hooks/use-replies';
import useReply from '../../hooks/use-reply';
import useStateString from '../../hooks/use-state-string';

const Post = () => {
  const { t } = useTranslation();
  const { commentCid } = useParams();
  const comment = useComment({ commentCid });
  const { replyCount, subplebbitAddress, title } = comment || {};
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const stateString = useStateString(comment);

  const replies = useReplies(comment).map((reply, index) => <Reply key={`${index}${reply.cid}`} reply={reply} />) || '';
  const { setContent, resetContent, replyIndex, publishReply } = useReply(comment);

  const postTitle = title?.slice(0, 40) || comment?.content?.slice(0, 40);
  const subplebbitTitle = subplebbit?.title || subplebbit?.shortAddress;

  const textRef = useRef<HTMLTextAreaElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const spoilerRef = useRef<HTMLInputElement>(null);

  const pendingReplyCount = usePendingReplyCount({ parentCommentCid: commentCid });
  const totalReplyCount = replyCount + pendingReplyCount;
  const commentCount = totalReplyCount === 0 ? t('no_comments') : totalReplyCount === 1 ? t('one_comment') : t('all_comments', { count: totalReplyCount });

  const [readyToPublish, setReadyToPublish] = useState(false);

  const onPublish = () => {
    const currentContent = textRef.current?.value || '';
    if (!currentContent.trim()) {
      alert(`missing content`);
      return;
    }
    setContent(textRef.current?.value || undefined, urlRef.current?.value || undefined, spoilerRef.current?.checked || false);
    setReadyToPublish(true);
  };

  useEffect(() => {
    if (readyToPublish) {
      publishReply();
      setReadyToPublish(false);
    }
  }, [readyToPublish, publishReply]);

  useEffect(() => {
    if (typeof replyIndex === 'number') {
      resetContent();
    }
  }, [replyIndex, resetContent]);

  useEffect(() => {
    document.title = `${postTitle || ''}${postTitle && subplebbitTitle ? ' - ' : ''}${subplebbitTitle || ''}${postTitle || subplebbitTitle ? ' - seedit' : 'seedit'}`;
  }, [postTitle, subplebbitTitle]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.post}>
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
          <ReplyForm onPublish={onPublish} spoilerRef={spoilerRef} textRef={textRef} urlRef={urlRef} />
        </div>
        {stateString && <div className={styles.stateString}>{stateString}</div>}
        <div className={styles.replies}>{replies}</div>
      </div>
    </div>
  );
};

export default Post;
