import { FC, useState } from 'react';
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
  const [expandoVisible, setExpandoVisible] = useState(false);
  const commentMediaInfo = utils.getCommentMediaInfo(post);
  const hasMedia =
    post.link &&
    commentMediaInfo &&
    (commentMediaInfo.type === 'image' || commentMediaInfo.type === 'video' || (commentMediaInfo.type === 'webpage' && commentMediaInfo.thumbnail))
      ? true
      : false;
  const initialButtonType = hasMedia || commentMediaInfo?.type === 'audio' ? 'playButton' : 'textButton';
  const [buttonType, setButtonType] = useState<'textButton' | 'playButton' | 'closeButton'>(initialButtonType);
  const toggleExpando = () => {
    setExpandoVisible(!expandoVisible);
    setButtonType(buttonType === 'closeButton' ? 'textButton' : 'closeButton');
  };

  let displayWidth, displayHeight;

  if (post.linkWidth && post.linkHeight) {
    let scale = Math.min(1, 70 / Math.max(post.linkWidth, post.linkHeight));
    displayWidth = `${post.linkWidth * scale}px`;
    displayHeight = `${post.linkHeight * scale}px`;
  } else {
    displayWidth = '70px';
    displayHeight = '70px';
  }

  return (
    <div className={styles.wrapper} key={index}>
      <div className={styles.midcol}>
        <div className={styles.arrowUp}></div>
        <div className={styles.score}>{post?.upvoteCount === 0 && post?.downvoteCount === 0 ? '•' : post?.upvoteCount - post?.downvoteCount}</div>
        <div className={styles.arrowDown}></div>
      </div>
      {hasMedia && (
        <span style={{ width: displayWidth, height: displayHeight }} className={styles.thumbnail}>
          <Link to={`p/${subplebbitAddress}/c/${post?.cid}`} onClick={(e) => e.preventDefault()}>
            {commentMediaInfo?.type === 'image' && <img src={commentMediaInfo.url} alt='thumbnail' />}
            {commentMediaInfo?.type === 'video' &&
              (commentMediaInfo.thumbnail ? <img src={commentMediaInfo.thumbnail} alt='thumbnail' /> : <video src={commentMediaInfo.url} />)}
            {commentMediaInfo?.type === 'webpage' && commentMediaInfo.thumbnail && <img src={commentMediaInfo.thumbnail} alt='thumbnail' />}
          </Link>
        </span>
      )}
      <div className={styles.entry}>
        <div className={styles.topMatter}>
          <p className={styles.title}>
            <Link className={styles.link} to={`p/${subplebbitAddress}/c/${post?.cid}`} onClick={(e) => e.preventDefault()}>
              {(post?.title?.length > 90 ? post?.title?.slice(0, 90) + '...' : post?.title) ||
                (post?.content?.length > 90 ? post?.content?.slice(0, 90) + '...' : post?.content)}
            </Link>
            &nbsp;
            {post?.link && (
              <span className={styles.domain}>
                (
                <a href={post?.link} target='_blank' rel='noreferrer'>
                  {post?.link}
                </a>
                )
              </span>
            )}
          </p>
          {post?.content && !post?.link && <div className={styles[buttonType]} onClick={toggleExpando} />}
          {post?.link && <div className={styles[buttonType]} onClick={toggleExpando} />}
          <p className={styles.tagline}>
            {t('feed_post_submitted')} {utils.getFormattedTime(post?.timestamp)} {t('feed_post_by')}&nbsp;
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
        <div className={expandoVisible ? styles.expando : styles.expandoHidden}>
          {(hasMedia || commentMediaInfo?.type === 'audio') && (
            <div className={styles.mediaPreview}>
              <Link to={`p/${subplebbitAddress}/c/${post?.cid}`} onClick={(e) => e.preventDefault()}>
                {commentMediaInfo?.type === 'image' && <img src={commentMediaInfo.url} alt='thumbnail' />}
                {commentMediaInfo?.type === 'video' &&
                  (commentMediaInfo.thumbnail ? <img src={commentMediaInfo.thumbnail} alt='thumbnail' /> : <video src={commentMediaInfo.url} controls />)}
                {commentMediaInfo?.type === 'webpage' && commentMediaInfo.thumbnail && <img src={commentMediaInfo.thumbnail} alt='thumbnail' />}
                {commentMediaInfo?.type === 'audio' && <audio src={commentMediaInfo.url} controls />}
              </Link>
            </div>
          )}
          {post?.content && (
            <div className={styles.usertext}>
              <div className={styles.markdown}>{post?.content}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedPost;
