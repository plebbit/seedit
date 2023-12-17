import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Author, useAccount, useComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { getShareLink } from '../../../lib/utils/url-utils';
import styles from './comment-tools.module.css';
import HideTools from './hide-tools';
import { FailedLabel, PendingLabel, SpoilerLabel } from '../label';
import ModTools from './mod-tools';

interface CommentToolsProps {
  author?: Author;
  cid: string;
  failed?: boolean;
  hasLabel?: boolean;
  isReply?: boolean;
  isSingleReply?: boolean;
  parentCid?: string;
  replyCount?: number;
  spoiler?: boolean;
  subplebbitAddress: string;
  showReplyForm?: () => void;
}

const PostTools = ({ author, cid, hasLabel, subplebbitAddress, replyCount = 0 }: CommentToolsProps) => {
  const { t } = useTranslation();
  const validReplyCount = isNaN(replyCount) ? 0 : replyCount;
  const commentCount = validReplyCount === 0 ? t('post_no_comments') : `${validReplyCount} ${validReplyCount === 1 ? t('post_comment') : t('post_comments')}`;
  const [hasShared, setHasShared] = useState(false);

  useEffect(() => {
    if (hasShared) {
      setTimeout(() => setHasShared(false), 2000);
    }
  }, [hasShared]);

  return (
    <>
      <li className={`${styles.button} ${!hasLabel ? styles.firstButton : ''}`}>
        <Link to={`/p/${subplebbitAddress}/c/${cid}`}>{commentCount}</Link>
      </li>
      <li className={`${!hasShared ? styles.button : styles.text}`}>
        <span
          onClick={() => {
            setHasShared(true);
            getShareLink(subplebbitAddress, cid);
          }}
        >
          {hasShared ? 'link copied' : t('post_share')}
        </span>
      </li>
      <li className={styles.button}>
        <span>{t('post_save')}</span>
      </li>
      <HideTools author={author} cid={cid} subplebbitAddress={subplebbitAddress} />
      <li className={styles.button}>
        <span>{t('post_report')}</span>
      </li>
      <li className={styles.button}>
        <span>{t('post_crosspost')}</span>
      </li>
    </>
  );
};

const ReplyTools = ({ cid, hasLabel, showReplyForm }: CommentToolsProps) => {
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

const SingleReplyTools = ({ hasLabel, parentCid, subplebbitAddress }: CommentToolsProps) => {
  const { t } = useTranslation();
  const comment = useComment({ commentCid: parentCid });

  return (
    <>
      <li className={`${styles.button} ${!hasLabel ? styles.firstButton : ''}`}>
        <span>{t('reply_permalink')}</span>
      </li>
      <li className={styles.button}>
        <span>{t('post_save')}</span>
      </li>
      <li className={styles.button}>
        <span>context</span>
      </li>
      <li className={styles.button}>
        <Link to={`/p/${subplebbitAddress}/c/${parentCid}`}>full comments ({comment?.replyCount || 0})</Link>
      </li>
      <li className={styles.button}>
        <span>{t('post_report')}</span>
      </li>
    </>
  );
};

const CommentToolsLabel = ({ cid, failed, isReply, spoiler }: CommentToolsProps) => {
  return (
    <span className={styles.label}>
      {spoiler && <SpoilerLabel />}
      {cid === undefined && !isReply && !failed && <PendingLabel />}
      {failed && <FailedLabel />}
    </span>
  );
};

const CommentTools = ({
  author,
  cid,
  failed,
  hasLabel = false,
  isReply,
  isSingleReply,
  parentCid,
  replyCount,
  spoiler,
  subplebbitAddress,
  showReplyForm,
}: CommentToolsProps) => {
  const account = useAccount();
  const authorRole = useSubplebbit({ subplebbitAddress })?.roles?.[account?.author?.address]?.role;
  const isMod = authorRole === 'admin' || authorRole === 'owner' || authorRole === 'moderator';
  hasLabel = spoiler || (cid === undefined && !isReply);

  return (
    <ul className={`${styles.buttons} ${isReply ? styles.buttonsReply : ''} ${hasLabel ? styles.buttonsLabel : ''}`}>
      {hasLabel && <CommentToolsLabel cid={cid} failed={failed} isReply={isReply} spoiler={spoiler} subplebbitAddress={subplebbitAddress} />}
      {isReply ? (
        isSingleReply ? (
          <SingleReplyTools cid={cid} hasLabel={hasLabel} parentCid={parentCid} subplebbitAddress={subplebbitAddress} />
        ) : (
          <ReplyTools cid={cid} hasLabel={hasLabel} showReplyForm={showReplyForm} subplebbitAddress={subplebbitAddress} />
        )
      ) : (
        <PostTools author={author} cid={cid} hasLabel={hasLabel} subplebbitAddress={subplebbitAddress} replyCount={replyCount} />
      )}
      {isMod && <ModTools cid={cid} />}
    </ul>
  );
};

export default CommentTools;
