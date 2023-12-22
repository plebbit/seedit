import { useMemo, useState } from 'react';
import { Comment, useAccountComment, useAuthorAddress, useComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { flattenCommentsPages } from '@plebbit/plebbit-react-hooks/dist/lib/utils';
import { Link } from 'react-router-dom';
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
import { PendingLabel, FailedLabel } from '../post/label';
import CommentTools from '../post/comment-tools';
import ReplyForm from '../reply-form';
import useDownvote from '../../hooks/use-downvote';
import useStateString from '../../hooks/use-state-string';
import useUpvote from '../../hooks/use-upvote';

interface ReplyAuthorProps {
  address: string;
  authorRole: string;
  cid: string;
  displayName: string;
  shortAuthorAddress: string | undefined;
}

const ReplyAuthor = ({ address, authorRole, cid, displayName, shortAuthorAddress }: ReplyAuthorProps) => {
  const isAuthorOwner = authorRole === 'owner';
  const isAuthorAdmin = authorRole === 'admin';
  const isAuthorModerator = authorRole === 'moderator';
  const authorRoleInitial = (isAuthorOwner && 'O') || (isAuthorAdmin && 'A') || (isAuthorModerator && 'M') || '';
  const moderatorClass = `${isAuthorOwner ? styles.owner : isAuthorAdmin ? styles.admin : isAuthorModerator ? styles.moderator : ''}`;

  return (
    <>
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
  postCid: string;
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
      in{' '}
      <Link to={`/p/${subplebbitAddress}`} className={styles.parentSubplebbit}>
        p/{subplebbitAddress}
      </Link>
    </div>
  );
};

interface ReplyProps {
  depth?: number;
  index?: number;
  isNotification?: boolean;
  isSingle?: boolean;
  reply: Comment | undefined;
}

const Reply = ({ depth = 0, isSingle, isNotification = false, reply = {} }: ReplyProps) => {
  const {
    author,
    cid,
    content,
    downvoteCount,
    flair,
    link,
    linkHeight,
    linkWidth,
    markedAsRead,
    postCid,
    removed,
    spoiler,
    state,
    subplebbitAddress,
    timestamp,
    upvoteCount,
  } = reply || {};
  const subplebbit = useSubplebbit({ subplebbitAddress });

  const authorRole = subplebbit?.roles?.[reply.author?.address]?.role;
  const { shortAuthorAddress } = useAuthorAddress({ comment: reply });
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
      {state === 'failed' && <FailedLabel />}
      {cid === undefined && state !== 'failed' && <PendingLabel />}
    </span>
  );

  const [collapsed, setCollapsed] = useState(false);
  const unnestedReplies = useMemo(() => flattenCommentsPages(reply.replies), [reply.replies]);
  const childrenCount = unnestedReplies.length;
  const childrenString = childrenCount === 1 ? t('child', { childrenCount }) : t('children', { childrenCount });

  const pendingReply = useAccountComment({ commentIndex: reply?.index });
  const parentOfPendingReply = useComment({ commentCid: pendingReply?.parentCid });

  return (
    <div className={styles.reply}>
      {isSingle && <ParentLink postCid={cid ? postCid : parentOfPendingReply?.postCid} />}
      <div
        className={`${!isSingle ? styles.replyWrapper : styles.singleReplyWrapper} ${depth > 1 && styles.nested} ${
          isNotification && !markedAsRead ? styles.unreadNotification : ''
        }`}
      >
        {!collapsed && (
          <div className={styles.midcol}>
            <div className={`${styles.arrow} ${upvoted ? styles.upvoted : styles.arrowUp}`} onClick={() => cid && upvote()} />
            <div className={`${styles.arrow} ${downvoted ? styles.downvoted : styles.arrowDown}`} onClick={() => cid && downvote()} />
          </div>
        )}
        <div className={`${styles.entry} ${collapsed && styles.collapsedEntry}`}>
          <p className={styles.tagline}>
            <span className={styles.expand} onClick={() => setCollapsed(!collapsed)}>
              [{collapsed ? '+' : '–'}]
            </span>
            <ReplyAuthor address={author?.address} authorRole={authorRole} cid={cid} displayName={author.displayName} shortAuthorAddress={shortAuthorAddress} />
            <span className={styles.score}>{scoreString}</span> <span className={styles.time}>{getFormattedTimeAgo(timestamp)}</span>
            {collapsed && <span className={styles.children}> ({childrenString})</span>}
            {stateLabel}
            {!collapsed && flair && (
              <>
                {' '}
                <Flair flair={flair} />
              </>
            )}
            {state === 'pending' && loadingString}
          </p>
          {!collapsed && (
            <div className={styles.usertext}>
              {commentMediaInfo && (
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
              <div className={styles.md}>{contentString}</div>
            </div>
          )}
        </div>
        {!collapsed && (
          <>
            <CommentTools
              cid={reply.cid}
              isReply={true}
              isSingleReply={isSingle}
              index={reply?.index}
              parentCid={reply?.postCid}
              replyCount={replies.length}
              spoiler={spoiler}
              subplebbitAddress={reply.subplebbitAddress}
              showReplyForm={showReplyForm}
            />
            {isReplying && <ReplyForm cid={cid} isReplyingToReply={true} hideReplyForm={hideReplyForm} />}
            {!isSingle && replies.map((reply, index) => <Reply key={`${index}${reply.cid}`} reply={reply} depth={(reply.depth || 1) + 1} />)}
          </>
        )}
      </div>
    </div>
  );
};

export default Reply;
