import { Fragment, useEffect, useMemo, useState } from 'react';
import { Comment, useAccountComment, useAuthorAddress, useAuthorAvatar, useBlock, useComment, useEditedComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { flattenCommentsPages } from '@plebbit/plebbit-react-hooks/dist/lib/utils';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './reply.module.css';
import useReplies from '../../hooks/use-replies';
import { CommentMediaInfo, getCommentMediaInfoMemoized, getHasThumbnail } from '../../lib/utils/media-utils';
import { getFormattedTimeAgo } from '../../lib/utils/time-utils';
import CommentEditForm from '../comment-edit-form';
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
import Plebbit from '@plebbit/plebbit-js/dist/browser/index.js';
import Markdown from '../markdown';

interface ReplyAuthorProps {
  address: string;
  authorRole: string;
  cid: string;
  displayName: string;
  imageUrl: string | undefined;
  isAvatarDefined: boolean;
  shortAuthorAddress: string | undefined;
}

const ReplyAuthor = ({ address, authorRole, cid, displayName, imageUrl, isAvatarDefined, shortAuthorAddress }: ReplyAuthorProps) => {
  const isAuthorAdmin = authorRole === 'admin';
  const isAuthorOwner = authorRole === 'owner';
  const isAuthorModerator = authorRole === 'moderator';
  const authorRoleInitial = (isAuthorOwner && 'O') || (isAuthorAdmin && 'A') || (isAuthorModerator && 'M') || '';
  const moderatorClass = `${isAuthorOwner ? styles.owner : isAuthorAdmin ? styles.admin : isAuthorModerator ? styles.moderator : ''}`;
  const shortDisplayName = displayName?.length > 20 ? displayName?.slice(0, 20) + '...' : displayName;

  return (
    <>
      {isAvatarDefined && (
        <span className={styles.authorAvatar}>
          <img src={imageUrl} alt='' />
        </span>
      )}
      {displayName && (
        <Link to={`/u/${address}/c/${cid}`} className={`${styles.author} ${moderatorClass}`}>
          {shortDisplayName}{' '}
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
  parentCid?: string;
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

const InboxShowParentButton = ({ parentCid }: { parentCid: string | undefined }) => {
  const { t } = useTranslation();
  const [showParent, setShowParent] = useState(false);
  const parentComment = useComment({ commentCid: parentCid });
  const { content, subplebbitAddress } = parentComment || {};

  return showParent ? (
    <>
      <Expando content={content} expanded={true} showContent={true} />
      <Link className={styles.viewParentComment} to={`/p/${subplebbitAddress}/c/${parentCid}`}>
        {t('view_parent_comment')}
      </Link>
    </>
  ) : (
    <div className={styles.inboxParentInfoButton} onClick={() => setShowParent(true)}>
      {t('show_parent')}
    </div>
  );
};

const InboxParentInfo = ({ address, cid, markedAsRead, parentCid, postCid, shortAddress, subplebbitAddress, timestamp }: ParentLinkProps) => {
  const { t } = useTranslation();
  const shortSubplebbitAddress = subplebbitAddress ? (subplebbitAddress.includes('.') ? subplebbitAddress : Plebbit.getShortAddress(subplebbitAddress)) : '';

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
      {parentCid !== postCid && <InboxShowParentButton parentCid={parentCid} />}
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
  const { state: editState, editedComment } = useEditedComment({ comment: reply });
  if (editedComment) {
    reply = editedComment;
  }
  const {
    author,
    cid,
    content,
    deleted,
    downvoteCount,
    edit,
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

  const [showSpoiler, setShowSpoiler] = useState(false);

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
  const toggleExpanded = () => setExpanded(!expanded);

  const [isReplying, setIsReplying] = useState(false);
  const showReplyForm = () => setIsReplying(true);
  const hideReplyForm = () => setIsReplying(false);

  const [isEditing, setIsEditing] = useState(false);
  const showCommentEditForm = () => setIsEditing(true);
  const hideCommentEditForm = () => setIsEditing(false);

  const commentMediaInfo = getCommentMediaInfoMemoized(reply);
  const hasThumbnail = getHasThumbnail(commentMediaInfo, link);

  const { t } = useTranslation();
  let score = upvoteCount - downvoteCount || 1;
  if ((upvoteCount === 0 && downvoteCount === 0) || (upvoteCount === 1 && downvoteCount === 0)) {
    score = 1;
  }
  const scoreString = score === 1 ? t('reply_score_singular') : t('reply_score_plural', { count: score });
  const stateString = useStateString(reply);
  const loadingString = stateString && <span className={styles.stateString}>{stateString !== 'Failed' ? <LoadingEllipsis string={stateString} /> : ''}</span>;

  const [upvoted, upvote] = useUpvote(reply);
  const [downvoted, downvote] = useDownvote(reply);

  const stateLabel = (
    <span className={styles.stateLabel}>
      {state === 'failed' && <Label color='red' text={t('failed')} />}
      {cid === undefined && state !== 'failed' && <Label color='yellow' text={t('pending')} />}
      {editState === 'failed' && <Label color='red' text={t('failed_edit')} />}
      {editState === 'pending' && <Label color='yellow' text={t('pending_edit')} />}
      {deleted && <Label color='red' text={t('deleted')} />}
      {removed && <Label color='red' text={t('removed')} />}
      {spoiler && <Label color='black' text={t('spoiler')} />}
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
  const isInPostContextView = isPostContextView(location.pathname, params, location.search);

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
                  isAvatarDefined={!!author?.avatar}
                  shortAuthorAddress={shortAuthorAddress}
                />
                <span className={styles.score}>{scoreString}</span>{' '}
                <span className={styles.time}>
                  {getFormattedTimeAgo(timestamp)}
                  {edit && <span className={styles.timeEdited}> {t('edited_timestamp', { timestamp: getFormattedTimeAgo(edit.timestamp) })}</span>}
                </span>{' '}
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
                parentCid={parentCid}
                postCid={postCid}
                shortAddress={author?.shortAddress}
                subplebbitAddress={subplebbitAddress}
                timestamp={timestamp}
              />
            )}
            {!collapsed && (
              <div
                className={`${styles.usertext} ${cid && commentMediaInfo && (isSingleComment || cidOfReplyWithContext === cid) ? styles.highlightMedia : ''} ${
                  spoiler && !showSpoiler ? styles.hideSpoiler : ''
                }`}
                onClick={() => {
                  spoiler && !showSpoiler && setShowSpoiler(true);
                }}
              >
                <div className={spoiler && !showSpoiler ? styles.hideSpoiler : ''} />
                {commentMediaInfo && !(removed || deleted || (spoiler && !showSpoiler)) && (
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
                {isEditing ? (
                  <CommentEditForm commentCid={cid} hideCommentEditForm={hideCommentEditForm} />
                ) : (
                  <div className={`${styles.md} ${cid && (isSingleComment || cidOfReplyWithContext === cid) ? styles.highlightContent : ''}`}>
                    {spoiler && !showSpoiler && <div className={styles.showSpoilerButton}>{t('view_spoiler')}</div>}
                    {content &&
                      (removed ? (
                        <div className={styles.removedContent}>[{t('removed')}]</div>
                      ) : deleted ? (
                        <div className={styles.deletedContent}>[{t('deleted')}]</div>
                      ) : (
                        <Markdown content={content} />
                      ))}
                    {reason && (
                      <div className={styles.modReason}>
                        <br />
                        {t('mod_reason')}: {reason}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          {!collapsed && (
            <div className={isInInboxView && markedAsRead ? styles.addMargin : ''}>
              <CommentTools
                author={author}
                cid={cid}
                failed={state === 'failed'}
                isReply={true}
                isSingleReply={isSingleReply}
                index={reply?.index}
                parentCid={parentCid}
                postCid={postCid}
                replyCount={replies.length}
                subplebbitAddress={subplebbitAddress}
                showCommentEditForm={showCommentEditForm}
                showReplyForm={showReplyForm}
                spoiler={spoiler}
              />
              {isReplying && <ReplyForm cid={cid} isReplyingToReply={true} hideReplyForm={hideReplyForm} subplebbitAddress={subplebbitAddress} />}
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
