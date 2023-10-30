import { FC } from 'react';
import styles from './post-tools.module.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PostToolsLabel from './post-tools-label';

interface PostToolsProps {
  cid: string;
  replyCount: number;
  spoiler?: boolean;
  subplebbitAddress: string;
}

const PostTools: FC<PostToolsProps> = ({ cid, replyCount, spoiler, subplebbitAddress }) => {
  const { t } = useTranslation();

  return (
    <ul className={styles.buttons}>
      {spoiler && <PostToolsLabel commentCid={cid} />}
      <li className={styles.first}>
        <Link to={`/p/${subplebbitAddress}/c/${cid}`}>
          {replyCount === 0 ? t('post_no_comments') : `${replyCount} ${replyCount === 1 ? t('post_comment') : t('post_comments')}`}
        </Link>
      </li>
      <li className={styles.button}>
        <span>{t('post_share')}</span>
      </li>
      <li className={styles.button}>
        <span>{t('post_save')}</span>
      </li>
      <li className={styles.button}>
        <span>{t('post_hide')}</span>
      </li>
      <li className={styles.button}>
        <span>{t('post_report')}</span>
      </li>
      <li className={styles.button}>
        <span>{t('post_crosspost')}</span>
      </li>
    </ul>
  );
};

export default PostTools;
