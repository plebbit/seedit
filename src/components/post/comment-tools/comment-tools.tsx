import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Author, useAccount, useComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import styles from './comment-tools.module.css';
import EditMenu from './edit-menu';
import HideMenu from './hide-menu';
import ModMenu from './mod-menu';
import ShareMenu from './share-menu';
import Label from '../label';
import { isInboxView } from '../../../lib/utils/view-utils';

interface CommentToolsProps {
  author?: Author;
  cid: string;
  deleted?: boolean;
  failed?: boolean;
  editState?: string;
  hasLabel?: boolean;
  index?: number;
  isAuthor?: boolean;
  isMod?: boolean;
  isReply?: boolean;
  isSingleReply?: boolean;
  parentCid?: string;
  postCid?: string;
  removed?: boolean;
  replyCount?: number;
  spoiler?: boolean;
  subplebbitAddress: string;
  showEditForm?: () => void;
  showReplyForm?: () => void;
}

const PostTools = ({ author, cid, hasLabel, index, isAuthor, isMod, subplebbitAddress, replyCount = 0, showEditForm }: CommentToolsProps) => {
  const { t } = useTranslation();
  const validReplyCount = isNaN(replyCount) ? 0 : replyCount;
  const commentCount = validReplyCount === 0 ? t('post_no_comments') : `${validReplyCount} ${validReplyCount === 1 ? t('post_comment') : t('post_comments')}`;

  // show gray dotted border around last clicked post
  const handlePostClick = () => {
    if (cid) {
      if (sessionStorage.getItem('lastClickedPost') === cid) {
        sessionStorage.removeItem('lastClickedPost');
      } else {
        sessionStorage.setItem('lastClickedPost', cid);
      }
    }
  };

  return (
    <>
      <li className={`${styles.button} ${!hasLabel ? styles.firstButton : ''}`} onClick={() => cid && handlePostClick?.()}>
        <Link to={cid ? `/p/${subplebbitAddress}/c/${cid}` : `/profile/${index}`}>{commentCount}</Link>
      </li>
      <ShareMenu cid={cid} subplebbitAddress={subplebbitAddress} />
      <li className={styles.button}>
        <span>{t('save')}</span>
      </li>
      {isAuthor && <EditMenu cid={cid} showEditForm={showEditForm} />}
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

const ReplyTools = ({ author, cid, hasLabel, index, isAuthor, isMod, showReplyForm, subplebbitAddress, showEditForm }: CommentToolsProps) => {
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
      {isAuthor && <EditMenu cid={cid} showEditForm={showEditForm} />}
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

const SingleReplyTools = ({ author, cid, hasLabel, index, isAuthor, isMod, parentCid, postCid, showReplyForm, subplebbitAddress, showEditForm }: CommentToolsProps) => {
  const { t } = useTranslation();
  const comment = useComment({ commentCid: postCid });

  const hasContext = parentCid !== postCid;

  return (
    <>
      <li className={`${styles.button} ${!hasLabel ? styles.firstButton : ''}`}>
        <Link to={cid ? `/p/${subplebbitAddress}/c/${cid}` : `/profile/${index}`}>permalink</Link>
      </li>
      <li className={styles.button}>
        <span>{t('save')}</span>
      </li>
      {isAuthor && <EditMenu cid={cid} showEditForm={showEditForm} />}
      <li className={styles.button}>
        <Link to={cid ? (hasContext ? `/p/${subplebbitAddress}/c/${cid}/context` : `/p/${subplebbitAddress}/c/${cid}`) : `/profile/${index}`}>{t('context')}</Link>
      </li>
      <li className={styles.button}>
        <Link to={cid ? `/p/${subplebbitAddress}/c/${postCid}` : `/profile/${index}`}>
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

const CommentToolsLabel = ({ cid, deleted, failed, editState, isReply, removed, spoiler }: CommentToolsProps) => {
  const { t } = useTranslation();
  const pending = cid === undefined && !isReply && !failed;
  const failedEdit = editState === 'failed';
  const pendingEdit = editState === 'pending';

  return (
    <>
      {spoiler && <Label color='black' text={t('spoiler')} />}
      {pending && <Label color='yellow' text={t('pending')} />}
      {failed && <Label color='red' text={t('failed')} />}
      {deleted && <Label color='red' text={t('deleted')} />}
      {removed && <Label color='red' text={t('removed')} />}
      {failedEdit && <Label color='red' text={t('failed_edit')} />}
      {pendingEdit && <Label color='yellow' text={t('pending_edit')} />}
    </>
  );
};

const CommentTools = ({
  author,
  cid,
  deleted,
  failed,
  editState,
  hasLabel = false,
  index,
  isReply,
  isSingleReply,
  parentCid,
  postCid,
  removed,
  replyCount,
  spoiler,
  subplebbitAddress,
  showEditForm,
  showReplyForm,
}: CommentToolsProps) => {
  const account = useAccount();
  const isAuthor = account?.author?.address === author?.address;
  const authorRole = useSubplebbit({ subplebbitAddress })?.roles?.[account?.author?.address]?.role;
  const isMod = authorRole === 'admin' || authorRole === 'owner' || authorRole === 'moderator';
  const isInInboxView = isInboxView(useLocation().pathname);

  return (
    <ul className={`${styles.buttons} ${isReply && !isInInboxView ? styles.buttonsReply : ''} ${hasLabel ? styles.buttonsLabel : ''}`}>
      <CommentToolsLabel
        cid={cid}
        deleted={deleted}
        failed={failed}
        editState={editState}
        isReply={isReply}
        removed={removed}
        spoiler={spoiler}
        subplebbitAddress={subplebbitAddress}
      />
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
            postCid={postCid}
            showEditForm={showEditForm}
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
            showEditForm={showEditForm}
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
          showEditForm={showEditForm}
          subplebbitAddress={subplebbitAddress}
          replyCount={replyCount}
        />
      )}
    </ul>
  );
};

export default CommentTools;
