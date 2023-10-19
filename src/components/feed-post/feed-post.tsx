import { FC, useState } from 'react';
import styles from './feed-post.module.css';
import { Link } from 'react-router-dom';
import utils from '../../lib/utils';
import { Comment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import ExpandButton from '../expand-button';
import Expando from '../expando';
import Flair from '../flair';
import PostTools from '../post-tools';
import Thumbnail from '../thumbnail';

interface FeedPostProps {
  index: number;
  post: Comment;
}

const FeedPost: FC<FeedPostProps> = ({ post, index }) => {
  const { author, cid, content, downvoteCount, flair, link, subplebbitAddress, timestamp, title, upvoteCount } = post || {};
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded(!expanded);
  const postTitleOrContent = (title?.length > 90 ? title?.slice(0, 90) + '...' : title) || (content?.length > 90 ? content?.slice(0, 90) + '...' : content);
  const commentMediaInfo = utils.getCommentMediaInfoMemoized(post);
  const hasThumbnail = utils.hasThumbnail(commentMediaInfo, link);
  const linkUrl = utils.getHostname(link);

  // TEMPORARY: e.preventDefault() in Link elements because routes aren't implemented yet

  return (
    <div className={styles.container} key={index}>
      <div className={styles.leftcol}>
        <div className={styles.midcol}>
          <div className={styles.arrowWrapper}>
            <div className={`${styles.arrowCommon} ${styles.arrowUp}`}></div>
          </div>
          <div className={styles.score}>{upvoteCount === 0 && downvoteCount === 0 ? '•' : upvoteCount - downvoteCount}</div>
          <div className={styles.arrowWrapper}>
            <div className={`${styles.arrowCommon} ${styles.arrowDown}`}></div>
          </div>
        </div>
        {hasThumbnail && <Thumbnail commentCid={cid} />}
      </div>
      <div className={styles.entry}>
        <div className={styles.topMatter}>
          <p className={styles.title}>
            <Link className={styles.link} to={`p/${subplebbitAddress}/c/${cid}`} onClick={(e) => e.preventDefault()}>
              {postTitleOrContent}
            </Link>
            {flair && (
              <>
                &nbsp;
                <Flair flair={flair} />
              </>
            )}
            &nbsp;
            {linkUrl && (
              <span className={styles.domain}>
                (
                <a href={link} target='_blank' rel='noreferrer'>
                  {linkUrl}
                </a>
                )
              </span>
            )}
          </p>
          <ExpandButton commentCid={cid} expanded={expanded} hasThumbnail={hasThumbnail} toggleExpanded={toggleExpanded} />
          <p className={styles.tagline}>
            {t('feed_post_submitted')} {utils.getFormattedTime(timestamp)} {t('feed_post_by')}&nbsp;
            <Link className={styles.author} to={`u/${author.shortAddress}`} onClick={(e) => e.preventDefault()}>
              u/{author.shortAddress}
            </Link>
             {t('feed_post_to')}
            <Link className={styles.subplebbit} to={`p/${subplebbitAddress}`} onClick={(e) => e.preventDefault()}>
              &nbsp;p/{subplebbit.shortAddress}
            </Link>
          </p>
          <PostTools commentCid={cid} />
        </div>
        <Expando commentCid={cid} expanded={expanded} />
      </div>
    </div>
  );
};

export default FeedPost;
