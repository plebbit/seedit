import { FC } from 'react';
import styles from './feed-post.module.css';
import { Link } from 'react-router-dom';
import utils from '../../lib/utils';
import { Comment } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';

interface FeedPostProps {
  index: number;
  post: Comment;
}

const FeedPost: FC<FeedPostProps> = ({ post, index }) => {
  const subplebbitAddress = post?.subplebbitAddress;
  const { t } = useTranslation();

  return (
    <div className={styles.wrapper} key={index}>
      <div className={styles.midcol}>
        <div className={styles.arrowUp}></div>
        <div className={styles.score}>
          {post?.upvoteCount === 0 && post?.downvoteCount === 0 ? '•' : post?.upvoteCount - post?.downvoteCount}
        </div>
        <div className={styles.arrowDown}></div>
      </div>
      <div className={styles.entry}>
        <div className={styles.topMatter}>
          <p className={styles.title}>
            <Link className={styles.link} to={`p/${subplebbitAddress}/c/${post?.cid}`} onClick={(e) => e.preventDefault()}>
              {post?.title || post?.content?.slice(0, 80) + '...'}
            </Link>
            &nbsp;
            {post?.link && (
              <span className={styles.domain}>
                (
                <Link to={`p/${subplebbitAddress}`} onClick={(e) => e.preventDefault()}>
                  {post?.link}
                </Link>
                )
              </span>
            )}
          </p>
          <p className={styles.tagline}>
            {t('feed_post_submitted')} {utils.getFormattedTime(post?.timestamp, t)} {t('feed_post_by')}&nbsp;
            <Link className={styles.author} to={`u/${post?.author.shortAddress}`} onClick={(e) => e.preventDefault()}>
              u/{post?.author.shortAddress}
            </Link>
              {t('feed_post_to')}
            <Link className={styles.subplebbit} to={`p/${subplebbitAddress}`} onClick={(e) => e.preventDefault()}>
              &nbsp;p/{subplebbitAddress.length > 30 ? subplebbitAddress.slice(0, 30) + '...' : subplebbitAddress}
            </Link>
          </p>
          <ul className={styles.buttons}>
            <li className={styles.first}>
              <Link to={`p/${subplebbitAddress}/c/${post?.cid}`} onClick={(e) => e.preventDefault()}>
                {post?.replyCount === 0 ? t('feed_post_no_comments') : `${post?.replyCount} ${t('feed_post_comments')}`}
              </Link>
            </li>
            <li className={styles.button}>
              <span>{t('feed_post_share')}</span>
            </li>
            <li className={styles.button}>
              <span>{t('feed_post_save')}</span>
            </li>
            <li className={styles.button}>
              <span>{t('feed_post_hide')}</span>
            </li>
            <li className={styles.button}>
              <span>{t('feed_post_report')}</span>
            </li>
            <li className={styles.button}>
              <span>{t('feed_post_crosspost')}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FeedPost;