import { FC } from 'react';
import styles from './post-tools.module.css';
import { useComment } from '@plebbit/plebbit-react-hooks';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface PostToolsProps {
  commentCid: string;
}

const PostTools: FC<PostToolsProps> = ({ commentCid }) => {
  const comment = useComment({ commentCid });
  const subplebbitAddress = comment.subplebbitAddress;
  const { cid, replyCount } = comment;
  const { t } = useTranslation();

  return (
    <ul className={styles.buttons}>
      <li className={styles.first}>
        <Link to={`p/${subplebbitAddress}/c/${cid}`} onClick={(e) => e.preventDefault()}>
          {replyCount === 0 ? t('feed_post_no_comments') : `${replyCount} ${replyCount === 1 ? t('feed_post_comment') : t('feed_post_comments')}`}
        </Link>
      </li>
      <li className={styles.button}>
        <span>{t('feed_post_share')}</span>
      </li>
      <li className={styles.button}>
        <span>{t('feed_post_save')}</span>
      </li>
      <li className={styles.button}>
        <span>{t('feed_post_hide')}</span>
      </li>
      <li className={styles.button}>
        <span>{t('feed_post_report')}</span>
      </li>
      <li className={styles.button}>
        <span>{t('feed_post_crosspost')}</span>
      </li>
    </ul>
  );
};

export default PostTools;
