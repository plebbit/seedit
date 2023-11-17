import styles from './post-tools.module.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FailedLabel, PendingLabel, SpoilerLabel } from '../label';

interface PostToolsProps {
  cid: string;
  failed?: boolean;
  isReply?: boolean;
  replyCount: number;
  spoiler?: boolean;
  subplebbitAddress: string;
  showReplyForm?: () => void;
}

const PostTools = ({ cid, failed, isReply, replyCount, spoiler, subplebbitAddress, showReplyForm }: PostToolsProps) => {
  const { t } = useTranslation();
  const validReplyCount = isNaN(replyCount) ? 0 : replyCount;
  const commentCount = validReplyCount === 0 ? t('post_no_comments') : `${validReplyCount} ${validReplyCount === 1 ? t('post_comment') : t('post_comments')}`;
  const hasLabel = spoiler || (cid === undefined && !isReply);

  const postTools = (
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

  const replyTools = (
    <>
      <li className={`${styles.button} ${!hasLabel ? styles.firstButton : ''}`}>
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

  const label = (
    <span className={styles.label}>
      {spoiler && <SpoilerLabel />}
      {(cid === undefined && !isReply && !failed) && <PendingLabel />}
      {failed && <FailedLabel />}
    </span>
  );

  return (
    <ul className={`${styles.buttons} ${isReply ? styles.buttonsReply : ''} ${hasLabel ? styles.buttonsLabel : ''}`}>
      {hasLabel && label}
      {isReply ? replyTools : postTools}
    </ul>
  );
};

export default PostTools;
