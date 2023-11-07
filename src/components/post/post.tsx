import { useState } from 'react';
import styles from './post.module.css';
import { Link } from 'react-router-dom';
import utils from '../../lib/utils';
import { useAccount, Comment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import ExpandButton from './expand-button';
import Expando from './expando';
import Flair from './flair';
import PostTools from './post-tools';
import Thumbnail from './thumbnail';
import useCurrentView from '../../hooks/use-current-view';

interface PostProps {
  index?: number;
  post: Comment;
}

const Post = ({ post, index }: PostProps) => {
  const { author, cid, content, downvoteCount, flair, link, linkHeight, linkWidth, replyCount, subplebbitAddress, timestamp, title, upvoteCount } = post || {};
  const account = useAccount();
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const { t } = useTranslation();

  const { isPendingView, isPostView } = useCurrentView();
  const isInPostView = isPostView || isPendingView;
  const [isExpanded, setIsExpanded] = useState(isInPostView);
  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const commentMediaInfo = utils.getCommentMediaInfoMemoized(post);
  const hasThumbnail = utils.hasThumbnail(commentMediaInfo, link);
  const linkUrl = utils.getHostname(link);

  const postAuthor = isPendingView ? account?.author?.shortAddress : author?.shortAddress;
  const postScore = upvoteCount === 0 && downvoteCount === 0 ? '•' : upvoteCount - downvoteCount || '•';
  const postTitleOrContent = (title?.length > 300 ? title?.slice(0, 300) + '...' : title) || (content?.length > 300 ? content?.slice(0, 300) + '...' : content);

  return (
    <div className={styles.container} key={index}>
      <div className={styles.row}>
        <div className={styles.leftcol}>
          <div className={styles.midcol}>
            <div className={styles.arrowWrapper}>
              <div className={`${styles.arrowCommon} ${styles.arrowUp}`}></div>
            </div>
            <div className={styles.score}>{postScore}</div>
            <div className={styles.arrowWrapper}>
              <div className={`${styles.arrowCommon} ${styles.arrowDown}`}></div>
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
                  {postTitleOrContent}
                </a>
              ) : (
                <Link className={styles.link} to={`/p/${subplebbitAddress}/c/${cid}`} style={isInPostView ? { color: 'var(--link)' } : {}}>
                  {postTitleOrContent}
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
              {t('post_submitted')} {utils.getFormattedTime(timestamp)} {t('post_by')}{' '}
              <Link className={styles.author} to={`u/${postAuthor}`} onClick={(e) => e.preventDefault()}>
                u/{postAuthor}
              </Link>
               {t('post_to')}
              <Link className={styles.subplebbit} to={`p/${subplebbitAddress}`} onClick={(e) => e.preventDefault()}>
                {' '}
                p/{subplebbit?.shortAddress}
              </Link>
            </p>
            <PostTools cid={cid} replyCount={replyCount} subplebbitAddress={subplebbitAddress} />
          </div>
        </div>
      </div>
      <Expando commentMediaInfo={commentMediaInfo} content={content} expanded={isExpanded} link={link} showContent={true} />
    </div>
  );
};

export default Post;
