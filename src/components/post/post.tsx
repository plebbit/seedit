import { useEffect, useState } from 'react';
import styles from './post.module.css';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Comment, useAuthorAddress, useBlock, useComment, useEditedComment, useSubplebbit, useSubscribe } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import { isAllView, isPostView, isProfileHiddenView, isSubplebbitView } from '../../lib/utils/view-utils';
import { CommentMediaInfo, fetchWebpageThumbnailIfNeeded, getCommentMediaInfo, getHasThumbnail } from '../../lib/utils/media-utils';
import { getPostScore } from '../../lib/utils/post-utils';
import { getHostname } from '../../lib/utils/url-utils';
import { getFormattedTimeAgo, formatLocalizedUTCTimestamp } from '../../lib/utils/time-utils';
import CommentEditForm from '../comment-edit-form';
import ExpandButton from './expand-button';
import Expando from './expando';
import Flair from './flair';
import CommentTools from './comment-tools';
import Thumbnail from './thumbnail';
import useDownvote from '../../hooks/use-downvote';
import useUpvote from '../../hooks/use-upvote';
import _ from 'lodash';

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
  const shortDisplayName = displayName?.trim().length > 20 ? displayName?.trim().slice(0, 20).trim() + '...' : displayName?.trim();

  return (
    <>
      <Link to={cid ? `/u/${authorAddress}/c/${cid}` : `/profile/${index}`} className={`${styles.author} ${moderatorClass}`}>
        {displayName && (
          <>
            {' '}
            <span className={`${styles.displayName} ${moderatorClass}`}>{shortDisplayName}</span>
          </>
        )}{' '}
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
    content,
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
  const { displayName, shortAddress } = author || {};
  const { shortAuthorAddress, authorAddressChanged } = useAuthorAddress({ comment: post });

  const { t, i18n } = useTranslation();
  const { language } = i18n;
  const postDate = formatLocalizedUTCTimestamp(timestamp, language);
  const params = useParams();
  const location = useLocation();
  const subplebbit = useSubplebbit({ subplebbitAddress });

  const authorRole = subplebbit?.roles?.[post.author?.address]?.role;

  const isInAllView = isAllView(location.pathname);
  const isInPostView = isPostView(location.pathname, params);
  const isInProfileHiddenView = isProfileHiddenView(location.pathname);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);

  // some sites have CORS access, so the thumbnail can be fetched client-side, which is helpful if subplebbit.settings.fetchThumbnailUrls is false
  const [commentMediaInfo, setCommentMediaInfo] = useState<CommentMediaInfo | undefined>();

  useEffect(() => {
    const loadThumbnail = async () => {
      const initialInfo = getCommentMediaInfo(post);

      if (initialInfo?.type === 'webpage' && !initialInfo.thumbnail) {
        const newMediaInfo = await fetchWebpageThumbnailIfNeeded(initialInfo);
        setCommentMediaInfo(newMediaInfo);
      } else {
        setCommentMediaInfo(initialInfo);
      }
    };

    loadThumbnail();
    return () => {
      setCommentMediaInfo(undefined);
    };
  }, [post]);

  const [isExpanded, setIsExpanded] = useState(isInPostView);
  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const [isEditing, setIsEditing] = useState(false);
  const showCommentEditForm = () => setIsEditing(true);
  const hideCommentEditForm = () => setIsEditing(false);

  const [upvoted, upvote] = useUpvote(post);
  const [downvoted, downvote] = useDownvote(post);
  const postScore = getPostScore(upvoteCount, downvoteCount, state);
  const postTitle = (title?.length > 300 ? title?.slice(0, 300) + '...' : title) || (content?.length > 300 ? content?.slice(0, 300) + '...' : content);

  const hasThumbnail = getHasThumbnail(commentMediaInfo, link);
  const linkUrl = getHostname(link);
  const linkClass = `${isInPostView ? (link ? styles.externalLink : styles.internalLink) : styles.link} ${pinned ? styles.pinnedLink : ''}`;

  const { blocked, unblock } = useBlock({ cid });

  const [hasClickedSubscribe, setHasClickedSubscribe] = useState(false);
  const { subscribe, subscribed } = useSubscribe({ subplebbitAddress });

  // show gray dotted border around last clicked post
  const isLastClicked = sessionStorage.getItem('lastClickedPost') === cid && !isInPostView;
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
    <div className={styles.content} key={index}>
      <div className={isLastClicked ? styles.lastClicked : ''}>
        <div className={`${styles.hiddenPost} ${blocked && !isInProfileHiddenView ? styles.visible : styles.hidden}`}>
          <div className={styles.hiddenPostText}>{t('post_hidden').charAt(0).toUpperCase() + t('post_hidden').slice(1)}</div>
          <div className={styles.undoHiddenPost} onClick={unblock}>
            {t('undo')}
          </div>
        </div>
        <div className={`${styles.container} ${blocked && !isInProfileHiddenView ? styles.hidden : styles.visible}`}>
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
              {hasThumbnail && (!isInPostView || commentMediaInfo?.type === 'webpage') && !spoiler && (
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
                <p className={`${styles.title} ${removed && !isInPostView ? styles.blur : ''}`}>
                  {isInPostView && link ? (
                    <a href={link} className={linkClass} target='_blank' rel='noopener noreferrer' onClick={handlePostClick}>
                      {postTitle ?? '-'}
                    </a>
                  ) : (
                    <Link className={linkClass} to={cid ? `/p/${subplebbitAddress}/c/${cid}` : `/profile/${post?.index}`} onClick={handlePostClick}>
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
                        {linkUrl.length > 25 ? linkUrl.slice(0, 25) + '...' : linkUrl}
                      </a>
                      )
                    </span>
                  )}
                </p>
                {!isInPostView && commentMediaInfo?.type !== 'webpage' && (
                  <ExpandButton
                    commentMediaInfo={commentMediaInfo}
                    content={content}
                    expanded={commentMediaInfo?.type === 'webpage' ? false : isExpanded}
                    hasThumbnail={hasThumbnail}
                    link={link}
                    toggleExpanded={toggleExpanded}
                  />
                )}
                <div className={styles.tagline}>
                  {t('submitted')} <span title={postDate}>{getFormattedTimeAgo(timestamp)}</span>{' '}
                  {edit && isInPostView && <span className={styles.timeEdit}>{t('last_edited', { timestamp: getFormattedTimeAgo(edit.timestamp) })}</span>} {t('post_by')}
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
                  {!isInSubplebbitView && (
                    <>
                       {t('post_to')}{' '}
                      <span className={styles.subscribeHoverGroup}>
                        {isInAllView && (!subscribed || (subscribed && hasClickedSubscribe)) && (
                          <span className={styles.subscribeButtonWrapper}>
                            <button
                              className={`${styles.subscribeButton} ${subscribed ? styles.buttonSubscribed : styles.buttonSubscribe}`}
                              onClick={() => {
                                subscribe();
                                setHasClickedSubscribe(true);
                              }}
                            />
                          </span>
                        )}
                        <Link className={`${styles.subplebbit} ${subscribed && hasClickedSubscribe ? styles.greenSubplebbitAddress : ''}`} to={`/p/${subplebbitAddress}`}>
                          p/{subplebbit?.shortAddress || subplebbitAddress}
                        </Link>
                      </span>
                    </>
                  )}
                  {pinned && <span className={styles.announcement}> - {t('announcement')}</span>}
                </div>
                <CommentTools
                  author={author}
                  cid={cid}
                  deleted={deleted}
                  failed={state === 'failed'}
                  editState={editState}
                  index={post?.index}
                  removed={removed}
                  replyCount={replyCount}
                  showCommentEditForm={showCommentEditForm}
                  spoiler={spoiler}
                  subplebbitAddress={subplebbitAddress}
                />
              </div>
            </div>
          </div>
          {isEditing ? (
            <CommentEditForm commentCid={cid} hideCommentEditForm={hideCommentEditForm} />
          ) : (
            <Expando
              authorEditReason={edit?.reason}
              commentMediaInfo={commentMediaInfo}
              content={removed ? `[${_.lowerCase(t('removed'))}]` : deleted ? `[${_.lowerCase(t('deleted'))}]` : content}
              expanded={commentMediaInfo?.type === 'webpage' ? false : isExpanded}
              link={link}
              modEditReason={reason}
              deleted={deleted}
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
