import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Author, useAccount, useComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import styles from './comment-tools.module.css';
import EditMenu from './edit-menu';
import HideMenu from './hide-menu';
import ModMenu from './mod-menu';
import ShareMenu from './share-menu';
import { DeletedLabel, FailedLabel, PendingLabel, RemovedLabel, SpoilerLabel } from '../label';
import { isInboxView } from '../../../lib/utils/view-utils';

interface CommentToolsProps {
  author?: Author;
  cid: string;
  deleted?: boolean;
  failed?: boolean;
  hasLabel?: boolean;
  index?: number;
  isAuthor?: boolean;
  isMod?: boolean;
  isReply?: boolean;
  isSingleReply?: boolean;
  parentCid?: string;
  removed?: boolean;
  replyCount?: number;
  spoiler?: boolean;
  subplebbitAddress: string;
  showReplyForm?: () => void;
}

const PostTools = ({ author, cid, hasLabel, index, isAuthor, isMod, subplebbitAddress, replyCount = 0 }: CommentToolsProps) => {
  const { t } = useTranslation();
  const validReplyCount = isNaN(replyCount) ? 0 : replyCount;
  const commentCount = validReplyCount === 0 ? t('post_no_comments') : `${validReplyCount} ${validReplyCount === 1 ? t('post_comment') : t('post_comments')}`;

  return (
    <>
      <li className={`${styles.button} ${!hasLabel ? styles.firstButton : ''}`}>
        <Link to={cid ? `/p/${subplebbitAddress}/c/${cid}` : `/profile/${index}`}>{commentCount}</Link>
      </li>
      <ShareMenu cid={cid} subplebbitAddress={subplebbitAddress} />
      <li className={styles.button}>
        <span>{t('save')}</span>
      </li>
      {isAuthor && <EditMenu cid={cid} />}
      <HideMenu author={author} cid={cid} isMod={isMod} subplebbitAddress={subplebbitAddress} />
      <li className={`${styles.button} ${styles.crosspostButton}`}>
        <span>{t('crosspost')}</span>
      </li>
      {isMod ? (
        <ModMenu cid={cid} />
      ) : (
        <li className={`${styles.button} ${styles.reportButton}`}>
          <span>{t('report')}</span>
        </li>
      )}
    </>
  );
};

const ReplyTools = ({ author, cid, hasLabel, index, isAuthor, isMod, showReplyForm, subplebbitAddress }: CommentToolsProps) => {
  const { t } = useTranslation();

  return (
    <>
      <li className={`${styles.button} ${!hasLabel ? styles.firstButton : ''}`}>
        <Link to={cid ? `/p/${subplebbitAddress}/c/${cid}` : `/profile/${index}`}>permalink</Link>
      </li>
      <ShareMenu cid={cid} subplebbitAddress={subplebbitAddress} />
      <li className={styles.button}>
        <span>{t('save')}</span>
      </li>
      {isAuthor && <EditMenu cid={cid} />}
      <HideMenu author={author} cid={cid} isMod={isMod} subplebbitAddress={subplebbitAddress} />
      <li className={!cid ? styles.hideReply : styles.button}>
        <span onClick={() => cid && showReplyForm?.()}>{t('reply_reply')}</span>
      </li>
      {isMod ? (
        <ModMenu cid={cid} />
      ) : (
        <li className={`${styles.button} ${styles.reportButton}`}>
          <span>{t('report')}</span>
        </li>
      )}
    </>
  );
};

const SingleReplyTools = ({ author, cid, hasLabel, index, isAuthor, isMod, parentCid, showReplyForm, subplebbitAddress }: CommentToolsProps) => {
  const { t } = useTranslation();
  const comment = useComment({ commentCid: parentCid });

  return (
    <>
      <li className={`${styles.button} ${!hasLabel ? styles.firstButton : ''}`}>
        <Link to={cid ? `/p/${subplebbitAddress}/c/${cid}` : `/profile/${index}`}>permalink</Link>
      </li>
      <li className={styles.button}>
        <span>{t('save')}</span>
      </li>
      {isAuthor && <EditMenu cid={cid} />}
      <li className={styles.button}>
        <Link to={cid ? `/p/${subplebbitAddress}/c/${parentCid}` : `/profile/${index}`}>{t('context')}</Link>
      </li>
      <li className={styles.button}>
        <Link to={cid ? `/p/${subplebbitAddress}/c/${parentCid}` : `/profile/${index}`}>
          {t('full_comments')} ({comment?.replyCount || 0})
        </Link>
      </li>
      <HideMenu author={author} cid={cid} isMod={isMod} subplebbitAddress={subplebbitAddress} />
      <li className={!cid ? styles.hideReply : styles.button}>
        <span onClick={() => cid && showReplyForm?.()}>{t('reply_reply')}</span>
      </li>
      {isMod ? (
        <ModMenu cid={cid} />
      ) : (
        <li className={`${styles.button} ${styles.reportButton}`}>
          <span>{t('report')}</span>
        </li>
      )}
    </>
  );
};

const CommentToolsLabel = ({ cid, deleted, failed, isReply, removed, spoiler }: CommentToolsProps) => {
  const pending = cid === undefined && !isReply && !failed;

  return (
    <>
      {spoiler && <SpoilerLabel />}
      {pending && <PendingLabel />}
      {failed && <FailedLabel />}
      {deleted && <DeletedLabel />}
      {removed && <RemovedLabel />}
    </>
  );
};

const CommentTools = ({
  author,
  cid,
  deleted,
  failed,
  hasLabel = false,
  index,
  isReply,
  isSingleReply,
  parentCid,
  removed,
  replyCount,
  spoiler,
  subplebbitAddress,
  showReplyForm,
}: CommentToolsProps) => {
  const account = useAccount();
  const isAuthor = account?.author?.address === author?.address;
  const authorRole = useSubplebbit({ subplebbitAddress })?.roles?.[account?.author?.address]?.role;
  const isMod = authorRole === 'admin' || authorRole === 'owner' || authorRole === 'moderator';
  const isInInboxView = isInboxView(useLocation().pathname);

  return (
    <ul className={`${styles.buttons} ${isReply && !isInInboxView ? styles.buttonsReply : ''} ${hasLabel ? styles.buttonsLabel : ''}`}>
      <CommentToolsLabel cid={cid} deleted={deleted} failed={failed} isReply={isReply} removed={removed} spoiler={spoiler} subplebbitAddress={subplebbitAddress} />
      {isReply ? (
        isSingleReply ? (
          <SingleReplyTools
            author={author}
            cid={cid}
            hasLabel={hasLabel}
            index={index}
            isAuthor={isAuthor}
            isMod={isMod}
            parentCid={parentCid}
            showReplyForm={showReplyForm}
            subplebbitAddress={subplebbitAddress}
          />
        ) : (
          <ReplyTools
            author={author}
            cid={cid}
            hasLabel={hasLabel}
            index={index}
            isAuthor={isAuthor}
            isMod={isMod}
            parentCid={parentCid}
            showReplyForm={showReplyForm}
            subplebbitAddress={subplebbitAddress}
          />
        )
      ) : (
        <PostTools
          author={author}
          cid={cid}
          hasLabel={hasLabel}
          index={index}
          isAuthor={isAuthor}
          isMod={isMod}
          subplebbitAddress={subplebbitAddress}
          replyCount={replyCount}
        />
      )}
    </ul>
  );
};

export default CommentTools;
