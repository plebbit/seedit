import { useState } from 'react';
import styles from './post.module.css';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAccount, Comment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import { isPendingView, isPostView } from '../../lib/utils/view-utils';
import { getCommentMediaInfoMemoized, getHasThumbnail } from '../../lib/utils/media-utils';
import { getHostname } from '../../lib/utils/url-utils';
import { getFormattedTime } from '../../lib/utils/time-utils';
import ExpandButton from './expand-button';
import Expando from './expando';
import Flair from './flair';
import PostTools from './post-tools';
import Thumbnail from './thumbnail';
import useDownvote from '../../hooks/use-downvote';
import { usePendingReplyCount } from '../../hooks/use-pending-replycount';
import useUpvote from '../../hooks/use-upvote';

interface PostProps {
  index?: number;
  post: Comment;
}

const Post = ({ post, index }: PostProps) => {
  const { author, cid, content, downvoteCount, flair, link, linkHeight, linkWidth, replyCount, subplebbitAddress, timestamp, title, upvoteCount } = post || {};
  const account = useAccount();
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();

  const isPost = isPostView(location.pathname, params);
  const isPending = isPendingView(location.pathname, params);
  const isInPostView = isPost || isPending;
  const [isExpanded, setIsExpanded] = useState(isInPostView);
  const toggleExpanded = () => setIsExpanded(!isExpanded);
  const [upvoted, upvote] = useUpvote(post);
  const [downvoted, downvote] = useDownvote(post);

  const commentMediaInfo = getCommentMediaInfoMemoized(post);
  const hasThumbnail = getHasThumbnail(commentMediaInfo, link);
  const linkUrl = getHostname(link);

  const postAuthor = isPending ? account?.author?.shortAddress : author?.shortAddress;
  const postScore = upvoteCount === 0 && downvoteCount === 0 ? '•' : upvoteCount - downvoteCount || '•';
  const postTitle = (title?.length > 300 ? title?.slice(0, 300) + '...' : title) || (content?.length > 300 ? content?.slice(0, 300) + '...' : content);

  const pendingReplyCount = usePendingReplyCount({ parentCommentCid: cid });
  const totalReplyCount = replyCount + pendingReplyCount;

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
                <a href={link} target='_blank' rel='noopener noreferrer'>
                  {postTitle}
                </a>
              ) : (
                <Link className={styles.link} to={`/p/${subplebbitAddress}/c/${cid}`} style={isInPostView ? { color: 'var(--link)' } : {}}>
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
              {t('post_submitted')} {getFormattedTime(timestamp)} {t('post_by')}{' '}
              <Link className={styles.author} to={`u/${postAuthor}`} onClick={(e) => e.preventDefault()}>
                u/{postAuthor}
              </Link>
               {t('post_to')}
              <Link className={styles.subplebbit} to={`/p/${subplebbitAddress}`}>
                {' '}
                p/{subplebbit?.shortAddress}
              </Link>
            </p>
            <PostTools cid={cid} replyCount={totalReplyCount} subplebbitAddress={subplebbitAddress} />
          </div>
        </div>
      </div>
      <Expando commentMediaInfo={commentMediaInfo} content={content} expanded={isExpanded} link={link} showContent={true} />
    </div>
  );
};

export default Post;
