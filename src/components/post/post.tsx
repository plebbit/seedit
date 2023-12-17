import { useState } from 'react';
import styles from './post.module.css';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Comment, useAuthorAddress, useBlock, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import { isPendingView, isPostView, isSubplebbitView } from '../../lib/utils/view-utils';
import { getCommentMediaInfoMemoized, getHasThumbnail } from '../../lib/utils/media-utils';
import { getHostname } from '../../lib/utils/url-utils';
import { getFormattedTimeAgo } from '../../lib/utils/time-utils';
import ExpandButton from './expand-button';
import Expando from './expando';
import Flair from './flair';
import CommentTools from './comment-tools';
import LoadingEllipsis from '../loading-ellipsis';
import Thumbnail from './thumbnail';
import useDownvote from '../../hooks/use-downvote';
import useStateString from '../../hooks/use-state-string';
import useUpvote from '../../hooks/use-upvote';

interface PostAuthorProps {
  authorRole: string;
  cid: string;
  displayName: string;
  shortAddress: string;
  shortAuthorAddress: string | undefined;
  authorAddressChanged: boolean;
}

const PostAuthor = ({ authorRole, cid, displayName, shortAddress, shortAuthorAddress, authorAddressChanged }: PostAuthorProps) => {
  const isAuthorOwner = authorRole === 'owner';
  const isAuthorAdmin = authorRole === 'admin';
  const isAuthorModerator = authorRole === 'moderator';
  const moderatorClass = `${isAuthorOwner ? styles.owner : isAuthorAdmin ? styles.admin : isAuthorModerator ? styles.moderator : ''}`;
  const authorRoleInitial = (isAuthorOwner && 'O') || (isAuthorAdmin && 'A') || (isAuthorModerator && 'M') || '';

  return (
    <>
      {displayName && <span className={`${styles.displayName} ${moderatorClass}`}>{displayName} </span>}
      <Link className={`${styles.authorAddressWrapper} ${moderatorClass}`} to={`/u/${shortAuthorAddress}/c/${cid}`}>
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
  post: Comment | undefined;
}

const Post = ({ post = {}, index }: PostProps) => {
  const { author, cid, content, downvoteCount, flair, link, linkHeight, linkWidth, pinned, replyCount, state, subplebbitAddress, timestamp, title, upvoteCount } =
    post || {};
  const { displayName, shortAddress } = author || {};
  const { shortAuthorAddress, authorAddressChanged } = useAuthorAddress({ comment: post });
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const stateString = useStateString(post);
  const loadingString = stateString && <span className={styles.stateString}>{stateString !== 'Failed' ? <LoadingEllipsis string={stateString} /> : ''}</span>;

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

  const linkClass = `${isInPostView ? (link ? styles.externalLink : styles.internalLink) : styles.link} ${pinned ? styles.pinnedLink : ''}`;

  const { blocked, unblock } = useBlock({ address: cid });

  return (
    <div className={styles.content} key={index}>
      <div className={`${styles.hiddenPost} ${blocked ? styles.visible : styles.hidden}`}>
        <div className={styles.hiddenPostText}>Post hidden</div>
        <div className={styles.undoHiddenPost} onClick={unblock}>
          undo
        </div>
      </div>
      <div className={`${styles.container} ${blocked ? styles.hidden : styles.visible}`}>
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
                  cid={cid}
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
              {state === 'pending' && <p className={styles.pending}>{loadingString}</p>}
              <CommentTools author={author} cid={cid} failed={state === 'failed'} replyCount={replyCount} subplebbitAddress={subplebbitAddress} />
            </div>
          </div>
        </div>
        <Expando commentMediaInfo={commentMediaInfo} content={content} expanded={isExpanded} link={link} showContent={true} />
      </div>
    </div>
  );
};

export default Post;
