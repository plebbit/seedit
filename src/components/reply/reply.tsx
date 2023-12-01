import { useEffect, useRef, useState } from 'react';
import { Comment, useAuthorAddress, useSubplebbit } from '@plebbit/plebbit-react-hooks';
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
import PostTools from '../post/post-tools';
import ReplyForm from '../reply-form';
import useDownvote from '../../hooks/use-downvote';
import useReply from '../../hooks/use-reply';
import useStateString from '../../hooks/use-state-string';
import useUpvote from '../../hooks/use-upvote';

interface ReplyProps {
  depth: number;
  key: string;
  reply: Comment;
}

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

const Reply = ({ reply, depth }: ReplyProps) => {
  const { cid, content, downvoteCount, flair, link, linkHeight, linkWidth, removed, spoiler, subplebbitAddress, timestamp, upvoteCount } = reply || {};
  const subplebbit = useSubplebbit({ subplebbitAddress });

  const isAuthorOwner = subplebbit?.roles?.[reply.author.address]?.role === 'owner';
  const isAuthorAdmin = subplebbit?.roles?.[reply.author.address]?.role === 'admin';
  const isAuthorModerator = subplebbit?.roles?.[reply.author.address]?.role === 'moderator';
  const moderatorClass = `${isAuthorOwner ? styles.owner : isAuthorAdmin ? styles.admin : isAuthorModerator ? styles.moderator : ''}`;

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
  const { setContent, resetContent, replyIndex, publishReply } = useReply(reply);
  const stateString = useStateString(reply);
  const loadingString = stateString && <span className={styles.stateString}>{stateString !== 'Failed' ? <LoadingEllipsis string={stateString} /> : ''}</span>;

  const textRef = useRef<HTMLTextAreaElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const spoilerRef = useRef<HTMLInputElement>(null);

  const [readyToPublish, setReadyToPublish] = useState(false);
  const [upvoted, upvote] = useUpvote(reply);
  const [downvoted, downvote] = useDownvote(reply);

  const onPublish = () => {
    const currentContent = textRef.current?.value || '';
    if (!currentContent.trim()) {
      alert(`missing content`);
      return;
    }
    setContent(textRef.current?.value || undefined, urlRef.current?.value || undefined, spoilerRef.current?.checked || false);
    setReadyToPublish(true);
  };

  useEffect(() => {
    if (readyToPublish) {
      publishReply();
      hideReplyForm();
      setReadyToPublish(false);
    }
  }, [readyToPublish, publishReply]);

  useEffect(() => {
    if (typeof replyIndex === 'number') {
      resetContent();
    }
  }, [replyIndex, resetContent]);

  const stateLabel = (
    <span className={styles.stateLabel}>
      {stateString === 'Failed' && <FailedLabel />}
      {cid === undefined && stateString !== 'Failed' && <PendingLabel />}
    </span>
  );

  return (
    <div className={styles.reply}>
      <div className={`${styles.replyWrapper} ${depth > 1 && styles.nested}`}>
        <div className={styles.midcol}>
          <div className={`${styles.arrow} ${upvoted ? styles.upvoted : styles.arrowUp}`} onClick={() => cid && upvote()} />
          <div className={`${styles.arrow} ${downvoted ? styles.downvoted : styles.arrowDown}`} onClick={() => cid && downvote()} />
        </div>
        <div className={styles.entry}>
          <p className={styles.tagline}>
            <span className={styles.expand}>[–]</span>
            {reply?.author?.displayName && (
              <span className={`${styles.author} ${moderatorClass}`}>{reply?.author?.displayName}</span>
            )}
            <Link
              to={`/u/${shortAuthorAddress}`}
              onClick={(e) => {
                e.preventDefault();
              }}
              className={`${styles.author} ${moderatorClass}`}
            >
              {reply?.author?.displayName ? `u/${shortAuthorAddress}` : shortAuthorAddress}
            </Link>
            {(isAuthorOwner || isAuthorAdmin || isAuthorModerator) && (
              <span className={styles.moderatorBrackets}>
                [
                <span className={moderatorClass} title={subplebbit?.roles?.[reply.author.address]?.role}>
                  {(isAuthorOwner && 'O') || (isAuthorAdmin && 'A') || (isAuthorModerator && 'M')}
                </span>
                ]{' '}
              </span>
            )}
            <span className={styles.score}>{scoreString}</span> <span className={styles.time}>{getFormattedTimeAgo(timestamp)}</span>
            {stateLabel}
            {flair && (
              <>
                {' '}
                <Flair flair={flair} />
              </>
            )}
            {loadingString}
          </p>
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
        </div>
        <PostTools
          cid={reply.cid}
          isReply={true}
          replyCount={replies.length}
          spoiler={spoiler}
          subplebbitAddress={reply.subplebbitAddress}
          showReplyForm={showReplyForm}
        />
        {isReplying && (
          <ReplyForm isReplyingToReply={true} onPublish={onPublish} hideReplyForm={hideReplyForm} spoilerRef={spoilerRef} textRef={textRef} urlRef={urlRef} />
        )}
        {replies.map((reply, index) => (
          <Reply key={`${index}${reply.cid}`} reply={reply} depth={(reply.depth || 1) + 1} />
        ))}
      </div>
    </div>
  );
};

export default Reply;
