import { FC, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import styles from './comments.module.css';
import Post from '../../post';
import useReplies from '../../../hooks/use-replies';
import Reply from '../../reply/reply';

const Comments: FC = () => {
  const { commentCid } = useParams();
  const comment = useComment({ commentCid });
  const { content, replyCount, subplebbitAddress, title } = comment || {};
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const replies = useReplies(comment).map((reply, index) => <Reply key={index} reply={reply} />) || '';
  const threadTitle = title?.slice(0, 40) || content?.slice(0, 40);
  const subplebbitTitle = subplebbit?.title || subplebbit?.shortAddress;
  const { t } = useTranslation();

  useEffect(() => {
    if (threadTitle || subplebbitTitle) {
      document.title = `${threadTitle} - ${subplebbitTitle} - seedit`;
    } else {
      document.title = 'seedit';
    }
  }, [threadTitle, subplebbitTitle]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.comments}>
      <Post post={comment} isComments={true} />
      <div className={styles.commentArea}>
        <div className={styles.commentsTitle}>
          <span className={styles.title}>{replyCount === 0 ? t('no_comments') : t('all_comments', { count: replyCount })}</span>
        </div>
        <div className={styles.menuArea}>
          <div className={styles.spacer}>
            <span className={styles.dropdownTitle}>{t('reply_sorted_by')}: </span>
            <div className={styles.dropdown}>
              <span className={styles.selected}>{t('reply_best')}</span>
            </div>
          </div>
          <div className={styles.mdContainer}>
            <div className={styles.md}>
              <textarea className={styles.textarea} />
            </div>
            <div className={styles.bottomArea}>
              <button className={styles.save}>{t('post_save')}</button>
            </div>
          </div>
        </div>
        <div className={styles.replies}>{replies}</div>
      </div>
    </div>
  );
};

export default Comments;
