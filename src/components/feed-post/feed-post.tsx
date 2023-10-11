import { FC } from 'react';
import styles from './feed-post.module.css';
import { Link } from 'react-router-dom';
import utils from '../../lib/utils';

interface FeedPostProps {
  index: number;
  post: any;
}

const FeedPost: FC<FeedPostProps> = ({ post, index }) => {
  const subplebbitAddress = post?.subplebbitAddress;

  return (
    <div className={styles.wrapper} key={index}>
      <div className={styles.midcol}>
        <div className={styles.arrowUp}></div>
        <div className={styles.score}>{post?.upvoteCount === 0 && post?.downvoteCount === 0 ? '•' : post?.upvoteCount - post?.downvoteCount}</div>
        <div className={styles.arrowDown}></div>
      </div>
      <div className={styles.entry}>
        <div className={styles.topMatter}>
          <p className={styles.title}>
            <Link className={styles.link} to={`p/${subplebbitAddress}/c/${post?.cid}`} onClick={(e) => e.preventDefault()}>
              {post?.title || post?.content.slice(0, 80) + '...'}
            </Link>
            &nbsp;
            {post?.link && (
              <span className={styles.domain}>
                (
                <Link to={`p/${subplebbitAddress}`} onClick={(e) => e.preventDefault()}>
                  test
                </Link>
                )
              </span>
            )}
          </p>
          <p className={styles.tagline}>
            submitted {utils.getFormattedTime(post?.timestamp)} by&nbsp;
            <Link className={styles.author} to={`u/${post?.author.shortAddress}`} onClick={(e) => e.preventDefault()}>
              test
            </Link>
             to
            <Link className={styles.subplebbit} to={`p/${subplebbitAddress}`} onClick={(e) => e.preventDefault()}>
              test
            </Link>
          </p>
          <ul className={styles.buttons}>
            <li className={styles.first}>
              <Link to={`p/${subplebbitAddress}/c/${post?.cid}`} onClick={(e) => e.preventDefault()}>
                test
              </Link>
            </li>
            <li className={styles.share}>
              <span>share</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FeedPost;
