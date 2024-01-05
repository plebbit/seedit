import { useState } from 'react';
import styles from './post.module.css';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Comment, useAuthorAddress, useBlock, useEditedComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
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
  authorAddress: string;
  authorRole: string;
  cid: string;
  displayName: string;
  index?: number;
  shortAddress: string;
  shortAuthorAddress: string | undefined;
  authorAddressChanged: boolean;
}

const PostAuthor = ({ authorAddress, authorRole, cid, displayName, index, shortAddress, shortAuthorAddress, authorAddressChanged }: PostAuthorProps) => {
  const isAuthorOwner = authorRole === 'owner';
  const isAuthorAdmin = authorRole === 'admin';
  const isAuthorModerator = authorRole === 'moderator';
  const moderatorClass = `${isAuthorOwner ? styles.owner : isAuthorAdmin ? styles.admin : isAuthorModerator ? styles.moderator : ''}`;
  const authorRoleInitial = (isAuthorOwner && 'O') || (isAuthorAdmin && 'A') || (isAuthorModerator && 'M') || '';

  return (
    <>
      {displayName && (
        <Link to={cid ? `/u/${authorAddress}/c/${cid}` : `/profile/${index}`} className={`${styles.displayName} ${moderatorClass}`}>
          {displayName}{' '}
        </Link>
      )}
      <Link className={`${styles.authorAddressWrapper} ${moderatorClass}`} to={cid ? `/u/${authorAddress}/c/${cid}` : `/profile/${index}`}>
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
  // handle pending mod or author edit
  const { editedComment: editedPost } = useEditedComment({ comment: post });
  if (editedPost) {
    post = editedPost;
  }
  const {
    author,
    cid,
    content,
    downvoteCount,
    flair,
    link,
    linkHeight,
    linkWidth,
    pinned,
    removed,
    replyCount,
    spoiler,
    state,
    subplebbitAddress,
    timestamp,
    title,
    upvoteCount,
  } = post || {};
  const { displayName, shortAddress } = author || {};
  const { shortAuthorAddress, authorAddressChanged } = useAuthorAddress({ comment: post });

  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const stateString = useStateString(post);
  const loadingString = stateString && <span className={styles.stateString}>{stateString !== 'Failed' ? <LoadingEllipsis string={stateString} /> : ''}</span>;

  const authorRole = subplebbit?.roles?.[post.author?.address]?.role;

  const isPostPage = isPostView(location.pathname, params);
  const isPendingPage = isPendingView(location.pathname, params);
  const isSubplebbitPage = isSubplebbitView(location.pathname, params);
  const isInPostView = isPostPage || isPendingPage;

  const [isExpanded, setIsExpanded] = useState(isInPostView);
  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const [upvoted, upvote] = useUpvote(post);
  const [downvoted, downvote] = useDownvote(post);
  const postScore = upvoteCount === 0 && downvoteCount === 0 ? '•' : upvoteCount - downvoteCount || '•';
  const postTitle = (title?.length > 300 ? title?.slice(0, 300) + '...' : title) || (content?.length > 300 ? content?.slice(0, 300) + '...' : content);

  const commentMediaInfo = getCommentMediaInfoMemoized(post);
  const hasThumbnail = getHasThumbnail(commentMediaInfo, link);
  const linkUrl = getHostname(link);
  const linkClass = `${isInPostView ? (link ? styles.externalLink : styles.internalLink) : styles.link} ${pinned ? styles.pinnedLink : ''}`;

  const { blocked, unblock } = useBlock({ address: cid });

  return (
    <div className={`${styles.content} ${removed ? styles.hidden : styles.visible}`} key={index}>
      <div className={`${styles.hiddenPost} ${blocked ? styles.visible : styles.hidden}`}>
        <div className={styles.hiddenPostText}>{t('post_hidden').charAt(0).toUpperCase() + t('post_hidden').slice(1)}</div>
        <div className={styles.undoHiddenPost} onClick={unblock}>
          {t('undo')}
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
                  <Link className={linkClass} to={cid ? `/p/${subplebbitAddress}/c/${cid}` : `/profile/${post?.index}`}>
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
                {t('submitted')} {getFormattedTimeAgo(timestamp)} {t('post_by')}{' '}
                <PostAuthor
                  authorAddress={author?.address}
                  authorRole={authorRole}
                  cid={cid}
                  displayName={displayName}
                  index={post?.index}
                  shortAddress={shortAddress}
                  shortAuthorAddress={shortAuthorAddress}
                  authorAddressChanged={authorAddressChanged}
                />
                {!isSubplebbitPage && (
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
              <CommentTools
                author={author}
                cid={cid}
                failed={state === 'failed'}
                index={post?.index}
                replyCount={replyCount}
                spoiler={spoiler}
                subplebbitAddress={subplebbitAddress}
              />
            </div>
          </div>
        </div>
        <Expando commentMediaInfo={commentMediaInfo} content={content} expanded={isExpanded} link={link} showContent={true} />
      </div>
    </div>
  );
};

export default Post;
