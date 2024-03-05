import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Author, useAccount, useComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import styles from './comment-tools.module.css';
import EditMenu from './edit-menu';
import HideMenu from './hide-menu';
import ModMenu from './mod-menu';
import ShareMenu from './share-menu';
import { isInboxView } from '../../../lib/utils/view-utils';

interface CommentToolsProps {
  author?: Author;
  cid: string;
  failed?: boolean;
  hasLabel?: boolean;
  index?: number;
  isAuthor?: boolean;
  isMod?: boolean;
  isReply?: boolean;
  isSingleReply?: boolean;
  parentCid?: string;
  postCid?: string;
  replyCount?: number;
  spoiler?: boolean | undefined;
  subplebbitAddress: string;
  showCommentEditForm?: () => void;
  showReplyForm?: () => void;
}

interface ModOrReportButtonProps {
  cid: string;
  isAuthor: boolean | undefined;
  isMod: boolean | undefined;
}

const ModOrReportButton = ({ cid, isAuthor, isMod }: ModOrReportButtonProps) => {
  const { t } = useTranslation();

  return isMod ? (
    <ModMenu cid={cid} />
  ) : (
    !isAuthor && (
      <li className={`${styles.button} ${styles.reportButton}`}>
        <span>{t('report')}</span>
      </li>
    )
  );
};

const PostTools = ({
  author,
  cid,
  failed,
  hasLabel,
  index,
  isAuthor,
  isMod,
  subplebbitAddress,
  replyCount = 0,
  showCommentEditForm,
  spoiler = false,
}: CommentToolsProps) => {
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

  const commentCountButton = failed ? <span>{commentCount}</span> : <Link to={cid ? `/p/${subplebbitAddress}/c/${cid}` : `/profile/${index}`}>{commentCount}</Link>;

  return (
    <>
      <li className={`${styles.button} ${!hasLabel ? styles.firstButton : ''}`} onClick={() => cid && handlePostClick?.()}>
        {commentCountButton}
      </li>
      <ShareMenu cid={cid} subplebbitAddress={subplebbitAddress} />
      {/* TODO: Implement save functionality
        <li className={styles.button}>
          <span>{t('save')}</span>
        </li> 
      */}
      {isAuthor && <EditMenu cid={cid} showCommentEditForm={showCommentEditForm} spoiler={spoiler} />}
      <HideMenu author={author} cid={cid} isMod={isMod} subplebbitAddress={subplebbitAddress} />
      {/* TODO: Implement crosspost functionality
        <li className={`${styles.button} ${styles.crosspostButton}`}>
          <span>{t('crosspost')}</span>
        </li> 
      */}
      <ModOrReportButton cid={cid} isAuthor={isAuthor} isMod={isMod} />
    </>
  );
};

const ReplyTools = ({
  author,
  cid,
  failed,
  hasLabel,
  index,
  isAuthor,
  isMod,
  showReplyForm,
  subplebbitAddress,
  showCommentEditForm,
  spoiler = false,
}: CommentToolsProps) => {
  const { t } = useTranslation();

  const permalink = failed ? <span>permalink</span> : <Link to={cid ? `/p/${subplebbitAddress}/c/${cid}` : `/profile/${index}`}>permalink</Link>;

  return (
    <>
      <li className={`${styles.button} ${!hasLabel ? styles.firstButton : ''}`}>{permalink}</li>
      <ShareMenu cid={cid} subplebbitAddress={subplebbitAddress} />
      {/* TODO: Implement save functionality
        <li className={styles.button}>
          <span>{t('save')}</span>
        </li> 
      */}
      {isAuthor && <EditMenu cid={cid} showCommentEditForm={showCommentEditForm} spoiler={spoiler} />}
      <HideMenu author={author} cid={cid} isMod={isMod} subplebbitAddress={subplebbitAddress} />
      <li className={!cid ? styles.hideReply : styles.button}>
        <span onClick={() => cid && showReplyForm?.()}>{t('reply_reply')}</span>
      </li>
      <ModOrReportButton cid={cid} isAuthor={isAuthor} isMod={isMod} />
    </>
  );
};

const SingleReplyTools = ({
  author,
  cid,
  hasLabel,
  index,
  isAuthor,
  isMod,
  parentCid,
  postCid,
  showReplyForm,
  spoiler = false,
  subplebbitAddress,
  showCommentEditForm,
}: CommentToolsProps) => {
  const { t } = useTranslation();
  const comment = useComment({ commentCid: postCid });

  const hasContext = parentCid !== postCid;

  const permalinkButton = cid ? <Link to={cid ? `/p/${subplebbitAddress}/c/${cid}` : `/profile/${index}`}>permalink</Link> : <span>permalink</span>;

  const contextButton = cid ? (
    <Link to={cid ? (hasContext ? `/p/${subplebbitAddress}/c/${cid}/context` : `/p/${subplebbitAddress}/c/${cid}`) : `/profile/${index}`}>{t('context')}</Link>
  ) : (
    <span>{t('context')}</span>
  );

  const fullCommentsButton = cid ? (
    <Link to={cid ? `/p/${subplebbitAddress}/c/${postCid}` : `/profile/${index}`}>
      {t('full_comments')} ({comment?.replyCount || 0})
    </Link>
  ) : (
    <span>
      {t('full_comments')} ({comment?.replyCount || 0})
    </span>
  );

  return (
    <>
      <li className={`${styles.button} ${!hasLabel ? styles.firstButton : ''}`}>{permalinkButton}</li>
      {/* TODO: Implement save functionality
        <li className={styles.button}>
          <span>{t('save')}</span>
        </li> 
      */}
      {isAuthor && <EditMenu cid={cid} spoiler={spoiler} showCommentEditForm={showCommentEditForm} />}
      <li className={styles.button}>{contextButton}</li>
      <li className={styles.button}>{fullCommentsButton}</li>
      <HideMenu author={author} cid={cid} isMod={isMod} subplebbitAddress={subplebbitAddress} />
      <li className={!cid ? styles.hideReply : styles.button}>
        <span onClick={() => cid && showReplyForm?.()}>{t('reply_reply')}</span>
      </li>
      <ModOrReportButton cid={cid} isAuthor={isAuthor} isMod={isMod} />
    </>
  );
};

const CommentTools = ({
  author,
  cid,
  failed,
  hasLabel = false,
  index,
  isReply,
  isSingleReply,
  parentCid,
  postCid,
  replyCount,
  spoiler,
  subplebbitAddress,
  showCommentEditForm,
  showReplyForm,
}: CommentToolsProps) => {
  const account = useAccount();
  const isAuthor = account?.author?.address === author?.address;
  const authorRole = useSubplebbit({ subplebbitAddress })?.roles?.[account?.author?.address]?.role;
  const isMod = authorRole === 'admin' || authorRole === 'owner' || authorRole === 'moderator';
  const isInInboxView = isInboxView(useLocation().pathname);

  return (
    <ul className={`${styles.buttons} ${isReply && !isInInboxView ? styles.buttonsReply : ''} ${hasLabel ? styles.buttonsLabel : ''}`}>
      {isReply ? (
        isSingleReply ? (
          <SingleReplyTools
            author={author}
            cid={cid}
            failed={failed}
            hasLabel={hasLabel}
            index={index}
            isAuthor={isAuthor}
            isMod={isMod}
            parentCid={parentCid}
            postCid={postCid}
            showCommentEditForm={showCommentEditForm}
            showReplyForm={showReplyForm}
            spoiler={spoiler}
            subplebbitAddress={subplebbitAddress}
          />
        ) : (
          <ReplyTools
            author={author}
            cid={cid}
            failed={failed}
            hasLabel={hasLabel}
            index={index}
            isAuthor={isAuthor}
            isMod={isMod}
            showCommentEditForm={showCommentEditForm}
            showReplyForm={showReplyForm}
            spoiler={spoiler}
            subplebbitAddress={subplebbitAddress}
          />
        )
      ) : (
        <PostTools
          author={author}
          cid={cid}
          failed={failed}
          hasLabel={hasLabel}
          index={index}
          isAuthor={isAuthor}
          isMod={isMod}
          replyCount={replyCount}
          showCommentEditForm={showCommentEditForm}
          spoiler={spoiler}
          subplebbitAddress={subplebbitAddress}
        />
      )}
    </ul>
  );
};

export default CommentTools;
