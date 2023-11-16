import styles from './post-tools.module.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface PostToolsProps {
  cid: string;
  isReply?: boolean;
  replyCount: number;
  spoiler?: boolean;
  subplebbitAddress: string;
  showReplyForm?: () => void;
}

const SpoilerLabel = () => {
  const { t } = useTranslation();

  return (
    <li>
      <span className={`${styles.stamp} ${styles.stampSpoiler}`}>
        <span className={`${styles.content} ${styles.contentSpoiler}`}>{t('spoiler').toUpperCase()}</span>
      </span>
    </li>
  );
};

const PendingLabel = () => {
  const { t } = useTranslation();

  return (
    <li>
      <span className={`${styles.stamp} ${styles.stampPending}`}>
        <span className={`${styles.content} ${styles.contentPending}`}>{t('pending').toUpperCase()}</span>
      </span>
    </li>
  );
};

const PostTools = ({ cid, isReply, replyCount, spoiler, subplebbitAddress, showReplyForm }: PostToolsProps) => {
  const { t } = useTranslation();
  const validReplyCount = isNaN(replyCount) ? 0 : replyCount;
  const commentCount = validReplyCount === 0 ? t('post_no_comments') : `${validReplyCount} ${validReplyCount === 1 ? t('post_comment') : t('post_comments')}`;
  const hasLabel = spoiler || cid === undefined;

  const postLabels = (
    <>
      <li className={`${styles.button} ${!hasLabel ? styles.firstButton : ''}`}>
        <Link to={`/p/${subplebbitAddress}/c/${cid}`}>{commentCount}</Link>
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
    </>
  );

  const replyLabels = (
    <>
      <li className={`${styles.button} ${!spoiler ? styles.firstButton : ''}`}>
        <span>{t('reply_permalink')}</span>
      </li>
      <li className={styles.button}>
        <span>{t('reply_embed')}</span>
      </li>
      <li className={styles.button}>
        <span>{t('post_save')}</span>
      </li>
      <li className={styles.button}>
        <span>{t('post_report')}</span>
      </li>
      <li className={styles.button}>
        <span onClick={() => cid && showReplyForm?.()}>{t('reply_reply')}</span>
      </li>
    </>
  );

  return (
    <ul className={`${styles.buttons} ${isReply ? styles.buttonsReply : ''}`}>
      {spoiler && <SpoilerLabel />}
      {cid === undefined && <PendingLabel />}
      {isReply ? replyLabels : postLabels}
    </ul>
  );
};

export default PostTools;
