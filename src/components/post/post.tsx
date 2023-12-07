import { useState } from 'react';
import styles from './post.module.css';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuthorAddress, Comment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import { isPendingView, isPostView, isSubplebbitView } from '../../lib/utils/view-utils';
import { getCommentMediaInfoMemoized, getHasThumbnail } from '../../lib/utils/media-utils';
import { getHostname } from '../../lib/utils/url-utils';
import { getFormattedTimeAgo } from '../../lib/utils/time-utils';
import ExpandButton from './expand-button';
import Expando from './expando';
import Flair from './flair';
import PostTools from './post-tools';
import Thumbnail from './thumbnail';
import useDownvote from '../../hooks/use-downvote';
import { usePendingReplyCount } from '../../hooks/use-pending-replycount';
import useUpvote from '../../hooks/use-upvote';

interface PostAuthorProps {
  authorRole: string;
  displayName: string;
  shortAddress: string;
  shortAuthorAddress: string | undefined;
  authorAddressChanged: boolean;
}

const PostAuthor = ({ authorRole, displayName, shortAddress, shortAuthorAddress, authorAddressChanged }: PostAuthorProps) => {
  const isAuthorOwner = authorRole === 'owner';
  const isAuthorAdmin = authorRole === 'admin';
  const isAuthorModerator = authorRole === 'moderator';
  const moderatorClass = `${isAuthorOwner ? styles.owner : isAuthorAdmin ? styles.admin : isAuthorModerator ? styles.moderator : ''}`;
  const authorRoleInitial = (isAuthorOwner && 'O') || (isAuthorAdmin && 'A') || (isAuthorModerator && 'M') || '';

  return (
    <>
      {displayName && <span className={`${styles.displayName} ${moderatorClass}`}>{displayName} </span>}
      <Link className={`${styles.authorAddressWrapper} ${moderatorClass}`} to={`u/${shortAuthorAddress}`} onClick={(e) => e.preventDefault()}>
        <span className={styles.authorAddressHidden}>u/{shortAddress || shortAuthorAddress}</span>
        <span className={`${styles.authorAddressVisible} ${authorAddressChanged && styles.authorAddressChanged}`}>u/{shortAuthorAddress}</span>
      </Link>
      {authorRole && (
        <span>
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

interface PostProps {
  index?: number;
  post: Comment;
}

const Post = ({ post, index }: PostProps) => {
  const { author, cid, content, downvoteCount, flair, link, linkHeight, linkWidth, pinned, replyCount, state, subplebbitAddress, timestamp, title, upvoteCount } =
    post || {};
  const { displayName, shortAddress } = author || {};
  const { shortAuthorAddress, authorAddressChanged } = useAuthorAddress({ comment: post });
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();

  const authorRole = subplebbit?.roles?.[post.author.address]?.role;

  const isPost = isPostView(location.pathname, params);
  const isPending = isPendingView(location.pathname, params);
  const isSubplebbit = isSubplebbitView(location.pathname, params);
  const isInPostView = isPost || isPending;
  const [isExpanded, setIsExpanded] = useState(isInPostView);
  const toggleExpanded = () => setIsExpanded(!isExpanded);
  const [upvoted, upvote] = useUpvote(post);
  const [downvoted, downvote] = useDownvote(post);

  const commentMediaInfo = getCommentMediaInfoMemoized(post);
  const hasThumbnail = getHasThumbnail(commentMediaInfo, link);
  const linkUrl = getHostname(link);

  const postScore = upvoteCount === 0 && downvoteCount === 0 ? '•' : upvoteCount - downvoteCount || '•';
  const postTitle = (title?.length > 300 ? title?.slice(0, 300) + '...' : title) || (content?.length > 300 ? content?.slice(0, 300) + '...' : content);

  const pendingReplyCount = usePendingReplyCount({ parentCommentCid: cid });
  const totalReplyCount = replyCount + pendingReplyCount;

  const linkClass = `${isInPostView ? (link ? styles.externalLink : styles.internalLink) : styles.link} ${pinned ? styles.pinnedLink : ''}`;

  return (
    <div className={styles.container} key={index}>
      <div className={styles.row}>
        <div className={styles.leftcol}>
          <div className={styles.midcol}>
            <div className={styles.arrowWrapper}>
              <div className={`${styles.arrowCommon} ${upvoted ? styles.upvoted : styles.arrowUp}`} onClick={() => cid && upvote()} />
            </div>
            <div className={styles.score}>{postScore}</div>
            <div className={styles.arrowWrapper}>
              <div className={`${styles.arrowCommon} ${downvoted ? styles.downvoted : styles.arrowDown}`} onClick={() => cid && downvote()} />
            </div>
          </div>
          {hasThumbnail && !isInPostView && (
            <Thumbnail
              cid={cid}
              commentMediaInfo={commentMediaInfo}
              isReply={false}
              link={link}
              linkHeight={linkHeight}
              linkWidth={linkWidth}
              subplebbitAddress={subplebbitAddress}
            />
          )}
        </div>
        <div className={styles.entry}>
          <div className={styles.topMatter}>
            <p className={styles.title}>
              {isInPostView && link ? (
                <a href={link} className={linkClass} target='_blank' rel='noopener noreferrer'>
                  {postTitle}
                </a>
              ) : (
                <Link className={linkClass} to={`/p/${subplebbitAddress}/c/${cid}`}>
                  {postTitle}
                </Link>
              )}
              {flair && (
                <>
                  {' '}
                  <Flair flair={flair} />
                </>
              )}{' '}
              {linkUrl && (
                <span className={styles.domain}>
                  (
                  <a href={link} target='_blank' rel='noopener noreferrer'>
                    {linkUrl}
                  </a>
                  )
                </span>
              )}
            </p>
            {!isInPostView && (
              <ExpandButton
                commentMediaInfo={commentMediaInfo}
                content={content}
                expanded={isExpanded}
                hasThumbnail={hasThumbnail}
                link={link}
                toggleExpanded={toggleExpanded}
              />
            )}
            <p className={styles.tagline}>
              {t('post_submitted')} {getFormattedTimeAgo(timestamp)} {t('post_by')}{' '}
              <PostAuthor
                authorRole={authorRole}
                displayName={displayName}
                shortAddress={shortAddress}
                shortAuthorAddress={shortAuthorAddress}
                authorAddressChanged={authorAddressChanged}
              />
              {!isSubplebbit && (
                <>
                   {t('post_to')}
                  <Link className={styles.subplebbit} to={`/p/${subplebbitAddress}`}>
                    {' '}
                    p/{subplebbit?.shortAddress || subplebbitAddress}
                  </Link>
                </>
              )}
              {pinned && <span className={styles.announcement}> - {t('announcement')}</span>}
            </p>
            <PostTools cid={cid} failed={state === 'failed'} replyCount={totalReplyCount} subplebbitAddress={subplebbitAddress} />
          </div>
        </div>
      </div>
      <Expando commentMediaInfo={commentMediaInfo} content={content} expanded={isExpanded} link={link} showContent={true} />
    </div>
  );
};

export default Post;
