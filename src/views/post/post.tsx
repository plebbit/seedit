import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import styles from './post.module.css';
import PostComponent from '../../components/post';
import useReplies from '../../hooks/use-replies';
import Reply from '../../components/reply';
import useStateString from '../../hooks/use-state-string';
import { usePendingReplyCount } from '../../hooks/use-pending-replycount';

const Post = () => {
  const { commentCid } = useParams();
  const comment = useComment({ commentCid });
  const { content, replyCount, subplebbitAddress, title } = comment || {};
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const replies = useReplies(comment).map((reply, index) => <Reply key={`${index}${reply.cid}`} reply={reply} />) || '';
  const postTitle = title?.slice(0, 40) || content?.slice(0, 40);
  const subplebbitTitle = subplebbit?.title || subplebbit?.shortAddress;
  const { t } = useTranslation();
  const stateString = useStateString(comment);
  const commentCount = replyCount === 0 ? t('no_comments') : replyCount === 1 ? t('one_comment') : t('all_comments', { count: replyCount });

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
          <div className={styles.mdContainer}>
            <div className={styles.md}>
              <input className={styles.url} placeholder={`url (${t('optional')})`} />
              <span className={styles.spoiler}>
              {t('spoiler')}: <input type='checkbox' className={styles.checkbox} />
              </span>
              <textarea className={styles.textarea} placeholder={t('text')} />
            </div>
            <div className={styles.bottomArea}>
              <button className={styles.save}>{t('post_save')}</button>
            </div>
          </div>
        </div>
        {stateString && <div className={styles.stateString}>{stateString}</div>}
        <div className={styles.replies}>{replies}</div>
      </div>
    </div>
  );
};

export default Post;
