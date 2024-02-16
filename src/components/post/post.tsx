import { useState } from 'react';
import styles from './post.module.css';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Comment, useAuthorAddress, useAuthorAvatar, useBlock, useComment, useEditedComment, useSubplebbit, useSubscribe } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import { isAllView, isPendingView, isPostView, isSubplebbitView } from '../../lib/utils/view-utils';
import { getCommentMediaInfoMemoized, getHasThumbnail } from '../../lib/utils/media-utils';
import { getHostname } from '../../lib/utils/url-utils';
import { getFormattedTimeAgo } from '../../lib/utils/time-utils';
import EditForm from '../edit-form';
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
  imageUrl: string | undefined;
  index?: number;
  shortAddress: string;
  shortAuthorAddress: string | undefined;
  authorAddressChanged: boolean;
}

const PostAuthor = ({ authorAddress, authorRole, cid, displayName, imageUrl, index, shortAddress, shortAuthorAddress, authorAddressChanged }: PostAuthorProps) => {
  const isAuthorOwner = authorRole === 'owner';
  const isAuthorAdmin = authorRole === 'admin';
  const isAuthorModerator = authorRole === 'moderator';
  const moderatorClass = `${isAuthorOwner ? styles.owner : isAuthorAdmin ? styles.admin : isAuthorModerator ? styles.moderator : ''}`;
  const authorRoleInitial = (isAuthorOwner && 'O') || (isAuthorAdmin && 'A') || (isAuthorModerator && 'M') || '';

  return (
    <>
      <Link to={cid ? `/u/${authorAddress}/c/${cid}` : `/profile/${index}`} className={`${styles.author} ${moderatorClass}`}>
        {imageUrl && (
          <span className={styles.authorAvatar}>
            <img src={imageUrl} alt='avatar' />
          </span>
        )}
        {displayName && <span className={`${styles.displayName} ${moderatorClass}`}>{displayName} </span>}
        <span className={`${styles.authorAddressWrapper} ${moderatorClass}`}>
          <span className={styles.authorAddressHidden}>u/{shortAddress || shortAuthorAddress}</span>
          <span className={`${styles.authorAddressVisible} ${authorAddressChanged && styles.authorAddressChanged}`}>u/{shortAuthorAddress}</span>
        </span>
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

const Post = ({ index, post = {} }: PostProps) => {
  // handle single comment thread
  const op = useComment({ commentCid: post?.parentCid ? post?.postCid : '' });
  if (post?.parentCid) {
    post = op;
  }
  // handle pending mod or author edit
  const { state: editState, editedComment } = useEditedComment({ comment: post });
  if (editedComment) {
    post = editedComment;
  }
  const {
    author,
    cid,
    deleted,
    downvoteCount,
    edit,
    flair,
    link,
    linkHeight,
    linkWidth,
    pinned,
    reason,
    removed,
    replyCount,
    spoiler,
    state,
    subplebbitAddress,
    timestamp,
    title,
    upvoteCount,
  } = post || {};
  let content = post?.content;
  if (removed) {
    content = '[removed]';
  }
  const { displayName, shortAddress } = author || {};
  const { shortAuthorAddress, authorAddressChanged } = useAuthorAddress({ comment: post });
  const { imageUrl } = useAuthorAvatar({ author });

  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const stateString = useStateString(post);
  const loadingString = stateString && <span className={styles.stateString}>{stateString !== 'Failed' ? <LoadingEllipsis string={stateString} /> : ''}</span>;

  const authorRole = subplebbit?.roles?.[post.author?.address]?.role;

  const isInAllView = isAllView(location.pathname);
  const isInPostView = isPostView(location.pathname, params);
  const isInPendingView = isPendingView(location.pathname, params);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);
  const isInPostPage = isInPostView || isInPendingView;

  const [isExpanded, setIsExpanded] = useState(isInPostPage);
  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const [isEditing, setIsEditing] = useState(false);
  const showEditForm = () => setIsEditing(true);
  const hideEditForm = () => setIsEditing(false);

  const [upvoted, upvote] = useUpvote(post);
  const [downvoted, downvote] = useDownvote(post);
  const postScore = upvoteCount === 0 && downvoteCount === 0 ? '•' : upvoteCount - downvoteCount || '•';
  const postTitle = (title?.length > 300 ? title?.slice(0, 300) + '...' : title) || (content?.length > 300 ? content?.slice(0, 300) + '...' : content);

  const commentMediaInfo = getCommentMediaInfoMemoized(post);
  const hasThumbnail = getHasThumbnail(commentMediaInfo, link);
  const linkUrl = getHostname(link);
  const linkClass = `${isInPostView ? (link ? styles.externalLink : styles.internalLink) : styles.link} ${pinned ? styles.pinnedLink : ''}`;

  const { blocked, unblock } = useBlock({ address: cid });

  const [hasClickedSubscribe, setHasClickedSubscribe] = useState(false);
  const [isHoveringOnSubscribe, setIsHoveringOnSubscribe] = useState(false);
  const { subscribe, subscribed } = useSubscribe({ subplebbitAddress });

  // show gray dotted border around last clicked post
  const isLastClicked = localStorage.getItem('lastClickedPost') === cid;
  const handlePostClick = () => {
    if (cid) {
      if (localStorage.getItem('lastClickedPost') === cid) {
        localStorage.removeItem('lastClickedPost');
      } else {
        localStorage.setItem('lastClickedPost', cid);
      }
    }
  };

  return (
    <div className={styles.content} key={index}>
      <div className={isLastClicked && !isInPostView ? styles.lastClicked : ''}>
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
                <span className={removed ? styles.blur : ''}>
                  <Thumbnail
                    cid={cid}
                    commentMediaInfo={commentMediaInfo}
                    isReply={false}
                    link={link}
                    linkHeight={linkHeight}
                    linkWidth={linkWidth}
                    subplebbitAddress={subplebbitAddress}
                  />
                </span>
              )}
            </div>
            <div className={styles.entry}>
              <div className={styles.topMatter}>
                <p className={`${styles.title} ${removed && !isInPostView ? styles.blur : ''}`} onClick={handlePostClick}>
                  {isInPostView && link ? (
                    <a href={link} className={linkClass} target='_blank' rel='noopener noreferrer'>
                      {postTitle ?? '-'}
                    </a>
                  ) : (
                    <Link className={linkClass} to={cid ? `/p/${subplebbitAddress}/c/${cid}` : `/profile/${post?.index}`}>
                      {postTitle ?? '-'}
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
                <div className={styles.tagline}>
                  {t('submitted')} {getFormattedTimeAgo(timestamp)} {edit && <span title={t('last_edited', { timestamp: getFormattedTimeAgo(edit.timestamp) })}>*</span>}{' '}
                  {t('post_by')}{' '}
                  <PostAuthor
                    authorAddress={author?.address}
                    authorRole={authorRole}
                    cid={cid}
                    displayName={displayName}
                    imageUrl={imageUrl}
                    index={post?.index}
                    shortAddress={shortAddress}
                    shortAuthorAddress={shortAuthorAddress}
                    authorAddressChanged={authorAddressChanged}
                  />
                  {!isInSubplebbitView && (
                    <>
                       {t('post_to')}{' '}
                      {isInAllView && (!subscribed || subscribed) && hasClickedSubscribe && (
                        <span className={styles.subscribeButtonWrapper}>
                          <button
                            className={`${styles.subscribeButton} ${subscribed ? styles.buttonSubscribed : styles.buttonSubscribe}`}
                            onClick={() => {
                              subscribe();
                              setHasClickedSubscribe(true);
                            }}
                            onMouseOver={() => setIsHoveringOnSubscribe(true)}
                            onMouseLeave={() => setIsHoveringOnSubscribe(false)}
                          />
                        </span>
                      )}
                      <Link
                        className={`${styles.subplebbit} ${isHoveringOnSubscribe || (subscribed && hasClickedSubscribe) ? styles.greenSubplebbitAddress : ''}`}
                        to={`/p/${subplebbitAddress}`}
                      >
                        p/{subplebbit?.shortAddress || subplebbitAddress}
                      </Link>
                    </>
                  )}
                  {pinned && <span className={styles.announcement}> - {t('announcement')}</span>}
                </div>
                {state === 'pending' && <p className={styles.pending}>{loadingString}</p>}
                <CommentTools
                  author={author}
                  cid={cid}
                  deleted={deleted}
                  failed={state === 'failed'}
                  editState={editState}
                  index={post?.index}
                  removed={removed}
                  replyCount={replyCount}
                  showEditForm={showEditForm}
                  spoiler={spoiler}
                  subplebbitAddress={subplebbitAddress}
                />
              </div>
            </div>
          </div>
          {isEditing ? (
            <EditForm commentCid={cid} content={content} hideEditForm={hideEditForm} subplebbitAddress={subplebbitAddress} />
          ) : (
            <Expando
              commentMediaInfo={commentMediaInfo}
              content={content}
              expanded={isExpanded}
              link={link}
              reason={reason}
              removed={removed}
              showContent={true}
              spoiler={spoiler}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Post;
