import { Fragment, useEffect, useMemo, useState } from 'react';
import { Comment, useAccountComment, useAuthorAddress, useAuthorAvatar, useBlock, useComment, useEditedComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { flattenCommentsPages } from '@plebbit/plebbit-react-hooks/dist/lib/utils';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './reply.module.css';
import useReplies from '../../hooks/use-replies';
import { CommentMediaInfo, getCommentMediaInfoMemoized, getHasThumbnail } from '../../lib/utils/media-utils';
import { getFormattedTimeAgo } from '../../lib/utils/time-utils';
import LoadingEllipsis from '../loading-ellipsis/';
import Expando from '../post/expando/';
import ExpandButton from '../post/expand-button/';
import Thumbnail from '../post/thumbnail/';
import Flair from '../post/flair/';
import Label from '../post/label/';
import CommentTools from '../post/comment-tools';
import ReplyForm from '../reply-form';
import useDownvote from '../../hooks/use-downvote';
import useStateString from '../../hooks/use-state-string';
import useUpvote from '../../hooks/use-upvote';
import { isInboxView, isPostContextView } from '../../lib/utils/view-utils';
import { getShortAddress } from '@plebbit/plebbit-js';
import Markdown from '../markdown';

interface ReplyAuthorProps {
  address: string;
  authorRole: string;
  cid: string;
  displayName: string;
  imageUrl: string | undefined;
  shortAuthorAddress: string | undefined;
}

const ReplyAuthor = ({ address, authorRole, cid, displayName, imageUrl, shortAuthorAddress }: ReplyAuthorProps) => {
  const isAuthorOwner = authorRole === 'owner';
  const isAuthorAdmin = authorRole === 'admin';
  const isAuthorModerator = authorRole === 'moderator';
  const authorRoleInitial = (isAuthorOwner && 'O') || (isAuthorAdmin && 'A') || (isAuthorModerator && 'M') || '';
  const moderatorClass = `${isAuthorOwner ? styles.owner : isAuthorAdmin ? styles.admin : isAuthorModerator ? styles.moderator : ''}`;

  return (
    <>
      {imageUrl && (
        <span className={styles.authorAvatar}>
          <img src={imageUrl} alt='avatar' />
        </span>
      )}
      {displayName && (
        <Link to={`/u/${address}/c/${cid}`} className={`${styles.author} ${moderatorClass}`}>
          {displayName}{' '}
        </Link>
      )}
      <Link to={`/u/${address}/c/${cid}`} className={`${styles.author} ${moderatorClass}`}>
        {displayName ? `u/${shortAuthorAddress}` : shortAuthorAddress}
      </Link>
      {authorRole && (
        <span className={styles.moderatorBrackets}>
          {' '}
          [
          <span className={moderatorClass} title={authorRole}>
            {authorRoleInitial}
          </span>
          ]
        </span>
      )}
    </>
  );
};

interface ReplyMediaProps {
  commentMediaInfo: CommentMediaInfo;
  content: string;
  expanded: boolean;
  hasThumbnail: boolean;
  link: string;
  linkHeight: number;
  linkWidth: number;
  toggleExpanded: () => void;
}

const ReplyMedia = ({ commentMediaInfo, content, expanded, hasThumbnail, link, linkHeight, linkWidth, toggleExpanded }: ReplyMediaProps) => {
  return (
    <>
      {hasThumbnail && (
        <Thumbnail
          commentMediaInfo={commentMediaInfo}
          expanded={expanded}
          isReply={true}
          link={link}
          linkHeight={linkHeight}
          linkWidth={linkWidth}
          toggleExpanded={toggleExpanded}
        />
      )}
      {commentMediaInfo?.type === 'iframe' && (
        <ExpandButton commentMediaInfo={commentMediaInfo} content={content} expanded={expanded} hasThumbnail={hasThumbnail} link={link} toggleExpanded={toggleExpanded} />
      )}
      {link && (commentMediaInfo?.type === 'iframe' || commentMediaInfo?.type === 'webpage') && (
        <>
          <a href={link} target='_blank' rel='noopener noreferrer'>
            ({link})
          </a>
          <br />
          <br />
        </>
      )}
      {expanded && link && (
        <Expando commentMediaInfo={commentMediaInfo} content={content} expanded={expanded} link={link} showContent={false} toggleExpanded={toggleExpanded} />
      )}
    </>
  );
};

type ParentLinkProps = {
  address?: string;
  cid?: string;
  commentCid?: string;
  markedAsRead?: boolean;
  postCid?: string;
  shortAddress?: string;
  subplebbitAddress?: string;
  timestamp?: number;
};

const ParentLink = ({ postCid }: ParentLinkProps) => {
  const parent = useComment({ commentCid: postCid });
  const { author, cid, content, title, subplebbitAddress } = parent || {};
  const { t } = useTranslation();
  const postTitle = (title?.length > 300 ? title?.slice(0, 300) + '...' : title) || (content?.length > 300 ? content?.slice(0, 300) + '...' : content);

  return (
    <div className={styles.parent}>
      <Link to={`/p/${subplebbitAddress}/c/${cid}`} className={styles.parentLink}>
        {postTitle}{' '}
      </Link>
      {t('post_by')}{' '}
      <Link to={`/u/${author?.shortAddress}/c/${cid}`} className={styles.parentAuthor}>
        u/{author?.shortAddress}{' '}
      </Link>
      {t('via')}{' '}
      <Link to={`/p/${subplebbitAddress}`} className={styles.parentSubplebbit}>
        p/{subplebbitAddress}
      </Link>
    </div>
  );
};

const InboxParentLink = ({ commentCid }: ParentLinkProps) => {
  const { t } = useTranslation();
  const inboxComment = useComment({ commentCid });
  const { postCid, parentCid } = inboxComment || {};
  const parent = useComment({ commentCid: inboxComment?.postCid });
  const { cid, content, title, subplebbitAddress } = parent || {};
  const postTitle = (title?.length > 300 ? title?.slice(0, 300) + '...' : title) || (content?.length > 300 ? content?.slice(0, 300) + '...' : content);

  const isInboxCommentReply = postCid !== parentCid;
  const isInboxPostReply = postCid === parentCid;

  return (
    <div className={styles.inboxParentLinkWrapper}>
      <span className={styles.inboxParentLinkSubject}>{isInboxCommentReply ? t('comment_reply') : isInboxPostReply ? t('post_reply') : ''}</span>
      <Link to={`/p/${subplebbitAddress}/c/${cid}`} className={styles.inboxParentLink}>
        {postTitle}
      </Link>
    </div>
  );
};

const InboxParentInfo = ({ address, cid, markedAsRead, shortAddress, subplebbitAddress, timestamp }: ParentLinkProps) => {
  const { t } = useTranslation();
  const shortSubplebbitAddress = subplebbitAddress ? (subplebbitAddress.includes('.') ? subplebbitAddress : getShortAddress(subplebbitAddress)) : '';

  return (
    <>
      <div className={`${styles.inboxParentInfo} ${markedAsRead ? styles.inboxParentRead : styles.inboxParentUnread}`}>
        {t('from')}{' '}
        <Link to={`/u/${address}/c/${cid}`} className={styles.inboxParentAuthor}>
          u/{shortAddress}{' '}
        </Link>
        {t('via')}{' '}
        <Link to={`/p/${subplebbitAddress}`} className={styles.inboxParentSubplebbit}>
          p/{shortSubplebbitAddress}{' '}
        </Link>
        {t('sent')} {timestamp && getFormattedTimeAgo(timestamp)}
      </div>
      <div className={styles.inboxParentInfoButton}>{t('show_parent')}</div>
    </>
  );
};

interface ReplyProps {
  cidOfReplyWithContext?: string;
  depth?: number;
  index?: number;
  isNotification?: boolean;
  isSingleComment?: boolean;
  isSingleReply?: boolean;
  reply: Comment | undefined;
}

const Reply = ({ cidOfReplyWithContext, depth = 0, isSingleComment, isSingleReply, isNotification = false, reply = {} }: ReplyProps) => {
  // handle pending mod or author edit
  const { editedComment: editedPost } = useEditedComment({ comment: reply });
  if (editedPost) {
    reply = editedPost;
  }
  const {
    author,
    cid,
    content,
    deleted,
    downvoteCount,
    flair,
    link,
    linkHeight,
    linkWidth,
    markedAsRead,
    pinned,
    parentCid,
    postCid,
    reason,
    removed,
    spoiler,
    state,
    subplebbitAddress,
    timestamp,
    upvoteCount,
  } = reply || {};
  const subplebbit = useSubplebbit({ subplebbitAddress });

  const { blocked, unblock } = useBlock({ address: cid });
  const [collapsed, setCollapsed] = useState(blocked);
  useEffect(() => {
    if (blocked) {
      setCollapsed(true);
    }
  }, [blocked]);
  const handleCollapseButton = () => {
    if (blocked) {
      unblock();
    }
    setCollapsed(!collapsed);
  };

  const authorRole = subplebbit?.roles?.[author?.address]?.role;
  const { shortAuthorAddress } = useAuthorAddress({ comment: reply });
  const { imageUrl } = useAuthorAvatar({ author });
  const replies = useReplies(reply);
  const [expanded, setExpanded] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const toggleExpanded = () => setExpanded(!expanded);
  const showReplyForm = () => setIsReplying(true);
  const hideReplyForm = () => setIsReplying(false);
  const commentMediaInfo = getCommentMediaInfoMemoized(reply);
  const hasThumbnail = getHasThumbnail(commentMediaInfo, link);
  const { t } = useTranslation();
  let score = upvoteCount - downvoteCount || 1;
  if ((upvoteCount === 0 && downvoteCount === 0) || (upvoteCount === 1 && downvoteCount === 0)) {
    score = 1;
  }
  const scoreString = score === 1 ? t('reply_score_singular') : t('reply_score_plural', { count: score });
  const contentString = removed ? `[${t('removed')}]` : content;
  const stateString = useStateString(reply);
  const loadingString = stateString && <span className={styles.stateString}>{stateString !== 'Failed' ? <LoadingEllipsis string={stateString} /> : ''}</span>;

  const [upvoted, upvote] = useUpvote(reply);
  const [downvoted, downvote] = useDownvote(reply);

  const stateLabel = (
    <span className={styles.stateLabel}>
      {state === 'failed' && <Label color='red' text={t('failed')} />}
      {cid === undefined && state !== 'failed' && <Label color='yellow' text={t('pending')} />}
    </span>
  );

  const unnestedReplies = useMemo(() => flattenCommentsPages(reply.replies), [reply.replies]);
  const childrenCount = unnestedReplies.length;
  const childrenString = childrenCount === 1 ? t('child', { childrenCount }) : t('children', { childrenCount });

  const pendingReply = useAccountComment({ commentIndex: reply?.index });
  const parentOfPendingReply = useComment({ commentCid: pendingReply?.parentCid });

  const location = useLocation();
  const params = useParams();
  const isInInboxView = isInboxView(location.pathname);
  const isInPostContextView = isPostContextView(location.pathname, params);

  return (
    <div className={styles.reply}>
      {isSingleReply && !isInInboxView && <ParentLink postCid={cid ? postCid : parentOfPendingReply?.postCid} />}
      {isInInboxView && <InboxParentLink commentCid={cid} />}
      <div className={`${!isSingleReply ? styles.replyWrapper : styles.singleReplyWrapper} ${depth > 0 && styles.nested}`}>
        {!collapsed && (
          <div className={styles.midcol}>
            <div className={`${styles.arrow} ${upvoted ? styles.upvoted : styles.arrowUp}`} onClick={() => cid && upvote()} />
            <div className={`${styles.arrow} ${downvoted ? styles.downvoted : styles.arrowDown}`} onClick={() => cid && downvote()} />
          </div>
        )}
        <div className={`${isNotification && !markedAsRead ? styles.unreadNotification : ''}`}>
          <div className={`${styles.entry} ${collapsed && styles.collapsedEntry}`}>
            {!isInInboxView && (
              <p className={styles.tagline}>
                <span className={styles.expand} onClick={handleCollapseButton}>
                  [{collapsed ? '+' : '–'}]
                </span>
                <ReplyAuthor
                  address={author?.address}
                  authorRole={authorRole}
                  cid={cid}
                  displayName={author?.displayName}
                  imageUrl={imageUrl}
                  shortAuthorAddress={shortAuthorAddress}
                />
                <span className={styles.score}>{scoreString}</span> <span className={styles.time}>{getFormattedTimeAgo(timestamp)}</span>{' '}
                {pinned && <span className={styles.pinned}>- {t('stickied_comment')}</span>}
                {collapsed && <span className={styles.children}> ({childrenString})</span>}
                {stateLabel}{' '}
                {!collapsed && flair && (
                  <>
                    {' '}
                    <Flair flair={flair} />
                  </>
                )}
                {state === 'pending' && loadingString}
              </p>
            )}
            {isInInboxView && (
              <InboxParentInfo
                address={author?.address}
                cid={cid}
                markedAsRead={markedAsRead}
                shortAddress={author?.shortAddress}
                subplebbitAddress={subplebbitAddress}
                timestamp={timestamp}
              />
            )}
            {!collapsed && (
              <div className={`${styles.usertext} ${cid && commentMediaInfo && (isSingleComment || cidOfReplyWithContext === cid) ? styles.highlightMedia : ''}`}>
                {commentMediaInfo && !removed && (
                  <ReplyMedia
                    commentMediaInfo={commentMediaInfo}
                    content={content}
                    expanded={expanded}
                    hasThumbnail={hasThumbnail}
                    link={link}
                    linkHeight={linkHeight}
                    linkWidth={linkWidth}
                    toggleExpanded={toggleExpanded}
                  />
                )}
                <div className={`${styles.md} ${cid && (isSingleComment || cidOfReplyWithContext === cid) ? styles.highlightContent : ''}`}>
                  <Markdown content={contentString} />
                  {reason && (
                    <div className={styles.modReason}>
                      <br />
                      <img alt='mod' src='assets/mod.png' /> {t('reason')}: {reason}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {!collapsed && (
            <div className={isInInboxView && markedAsRead ? styles.addMargin : ''}>
              <CommentTools
                author={author}
                cid={cid}
                deleted={deleted}
                isReply={true}
                isSingleReply={isSingleReply}
                index={reply?.index}
                parentCid={parentCid}
                postCid={postCid}
                removed={removed}
                replyCount={replies.length}
                spoiler={spoiler}
                subplebbitAddress={subplebbitAddress}
                showReplyForm={showReplyForm}
              />
              {isReplying && <ReplyForm cid={cid} isReplyingToReply={true} hideReplyForm={hideReplyForm} />}
              {!isSingleReply &&
                replies.map((reply, index) => {
                  return (
                    <Fragment key={`${index}-${reply.cid}`}>
                      {!depth || depth < 9 ? (
                        <Reply
                          key={`${index}${reply.cid}`}
                          reply={reply}
                          depth={(depth || 0) + 1}
                          cidOfReplyWithContext={isInPostContextView ? params?.commentCid : undefined}
                        />
                      ) : (
                        <div className={styles.continueThisThread}>
                          <Link to={`/p/${subplebbitAddress}/c/${cid}`}>{t('continue_thread')}</Link>
                        </div>
                      )}
                    </Fragment>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reply;
