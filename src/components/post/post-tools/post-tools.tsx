import { useAccount, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import styles from './post-tools.module.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FailedLabel, PendingLabel, SpoilerLabel } from '../label';

interface PostToolsProps {
  cid: string;
  failed?: boolean;
  hasLabel?: boolean;
  isReply?: boolean;
  replyCount?: number;
  spoiler?: boolean;
  subplebbitAddress?: string;
  showReplyForm?: () => void;
}

const ModTools = () => {
  return (
    <li className={styles.button}>
      <span>moderate</span>
    </li>
  );
};

const ThreadTools = ({ cid, hasLabel, subplebbitAddress, replyCount = 0 }: PostToolsProps) => {
  const { t } = useTranslation();
  const validReplyCount = isNaN(replyCount) ? 0 : replyCount;
  const commentCount = validReplyCount === 0 ? t('post_no_comments') : `${validReplyCount} ${validReplyCount === 1 ? t('post_comment') : t('post_comments')}`;

  return (
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
};

const ReplyTools = ({ cid, hasLabel, showReplyForm }: PostToolsProps) => {
  const { t } = useTranslation();
  return (
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
      <li className={!cid ? styles.hideReply : styles.button}>
        <span onClick={() => cid && showReplyForm?.()}>{t('reply_reply')}</span>
      </li>
    </>
  );
};

const PostToolsLabel = ({ cid, failed, isReply, spoiler }: PostToolsProps) => {
  return (
    <span className={styles.label}>
      {spoiler && <SpoilerLabel />}
      {cid === undefined && !isReply && !failed && <PendingLabel />}
      {failed && <FailedLabel />}
    </span>
  );
};

const PostTools = ({ cid, failed, hasLabel = false, isReply, replyCount, spoiler, subplebbitAddress, showReplyForm }: PostToolsProps) => {
  const account = useAccount();
  const role = useSubplebbit({ subplebbitAddress })?.roles?.[account?.author?.address]?.role;
  const isMod = role === 'admin' || role === 'owner' || role === 'moderator';
  hasLabel = spoiler || (cid === undefined && !isReply);

  return (
    <ul className={`${styles.buttons} ${isReply ? styles.buttonsReply : ''} ${hasLabel ? styles.buttonsLabel : ''}`}>
      {hasLabel && <PostToolsLabel cid={cid} failed={failed} isReply={isReply} spoiler={spoiler} />}
      {isReply ? (
        <ReplyTools cid={cid} hasLabel={hasLabel} showReplyForm={showReplyForm} />
      ) : (
        <ThreadTools cid={cid} hasLabel={hasLabel} subplebbitAddress={subplebbitAddress} replyCount={replyCount} />
      )}
      {isMod && <ModTools />}
    </ul>
  );
};

export default PostTools;
