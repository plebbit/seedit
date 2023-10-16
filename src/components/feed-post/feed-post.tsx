import { FC, useState } from 'react';
import styles from './feed-post.module.css';
import { Link } from 'react-router-dom';
import utils from '../../lib/utils';
import { Comment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import Embed from '../embed';
import Flair from '../flair';

interface FeedPostProps {
  index: number;
  post: Comment;
}

const FeedPost: FC<FeedPostProps> = ({ post, index }) => {
  const { author, cid, content, downvoteCount, flair, link, linkHeight, linkWidth, replyCount, subplebbitAddress, timestamp, title, upvoteCount } = post || {};
  const { t } = useTranslation();
  const [expandoVisible, setExpandoVisible] = useState(false);
  const subplebbit = useSubplebbit({subplebbitAddress});
  const commentMediaInfo = utils.getCommentMediaInfo(post);
  const iframeThumbnail = commentMediaInfo?.patternThumbnailUrl || commentMediaInfo?.thumbnail;
  const hasThumbnail =
    link &&
    commentMediaInfo &&
    (commentMediaInfo.type === 'image' ||
      commentMediaInfo.type === 'video' ||
      (commentMediaInfo.type === 'webpage' && commentMediaInfo.thumbnail) ||
      (commentMediaInfo.type === 'iframe' && iframeThumbnail))
      ? true
      : false;
  const initialButtonType = hasThumbnail || commentMediaInfo?.type === 'audio' || commentMediaInfo?.type === 'iframe' ? 'playButton' : 'textButton';
  const [buttonType, setButtonType] = useState<'textButton' | 'playButton' | 'closeButton'>(initialButtonType);
  const toggleExpando = () => {
    setExpandoVisible(!expandoVisible);
    setButtonType(buttonType === 'closeButton' ? 'textButton' : 'closeButton');
  };

  let displayWidth, displayHeight, hasLinkDimensions;

  if (linkWidth && linkHeight) {
    let scale = Math.min(1, 70 / Math.max(linkWidth, linkHeight));
    displayWidth = `${linkWidth * scale}px`;
    displayHeight = `${linkHeight * scale}px`;
    hasLinkDimensions = true;
  } else {
    displayWidth = '70px';
    displayHeight = '70px';
    hasLinkDimensions = false;
  }

  return (
    <div className={styles.container} key={index}>
      <div className={styles.midcol}>
        <div className={styles.arrowWrapper}>
          <div className={`${styles.arrowCommon} ${styles.arrowUp}`}></div>
        </div>
        <div className={styles.score}>{upvoteCount === 0 && downvoteCount === 0 ? '•' : upvoteCount - downvoteCount}</div>
        <div className={styles.arrowWrapper}>
          <div className={`${styles.arrowCommon} ${styles.arrowDown}`}></div>
        </div>
      </div>
      {hasThumbnail && (
        <span style={{ width: displayWidth, height: displayHeight }} className={styles.thumbnail}>
          <span className={hasLinkDimensions ? styles.transparentThumbnailWrapper : styles.thumbnailWrapper}>
            <Link to={`p/${subplebbitAddress}/c/${cid}`} onClick={(e) => e.preventDefault()}>
              {commentMediaInfo?.type === 'image' && (
                <img
                  src={commentMediaInfo.url}
                  alt='thumbnail'
                  onError={(e) => {
                    e.currentTarget.alt = '';
                  }}
                />
              )}
              {commentMediaInfo?.type === 'video' &&
                (commentMediaInfo.thumbnail ? (
                  <img
                    src={commentMediaInfo.thumbnail}
                    alt='thumbnail'
                    onError={(e) => {
                      e.currentTarget.alt = '';
                    }}
                  />
                ) : (
                  <video src={commentMediaInfo.url} />
                ))}
              {commentMediaInfo?.type === 'webpage' && commentMediaInfo.thumbnail && (
                <img
                  src={commentMediaInfo.thumbnail}
                  alt='thumbnail'
                  onError={(e) => {
                    e.currentTarget.alt = '';
                  }}
                />
              )}
              {commentMediaInfo?.type === 'iframe' && iframeThumbnail && (
                <img
                  src={iframeThumbnail}
                  alt='thumbnail'
                  onError={(e) => {
                    e.currentTarget.alt = '';
                  }}
                />
              )}
            </Link>
          </span>
        </span>
      )}
      <div className={styles.entry}>
        <div className={styles.topMatter}>
          <p className={styles.title}>
            <Link className={styles.link} to={`p/${subplebbitAddress}/c/${cid}`} onClick={(e) => e.preventDefault()}>
              {(title?.length > 90 ? title?.slice(0, 90) + '...' : title) || (content?.length > 90 ? content?.slice(0, 90) + '...' : content)}
            </Link>
            {flair && (
              <>
                &nbsp;
                <Flair flair={flair} />
              </>
            )}
            &nbsp;
            {link && (
              <span className={styles.domain}>
                (
                <a href={link} target='_blank' rel='noreferrer'>
                  {(() => {
                    try {
                      return new URL(link).hostname;
                    } catch (e) {
                      return 'Invalid URL';
                    }
                  })()}
                </a>
                )
              </span>
            )}
          </p>
          {content && !link && (
            <div className={styles.buttonWrapper} onClick={toggleExpando}>
              <div className={`${styles.buttonCommon} ${styles[buttonType]}`}></div>
            </div>
          )}
          {link && (
            <div className={styles.buttonWrapper} onClick={toggleExpando}>
              <div className={`${styles.buttonCommon} ${styles[buttonType]}`}></div>
            </div>
          )}
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
          <ul className={styles.buttons}>
            <li className={styles.first}>
              <Link to={`p/${subplebbitAddress}/c/${cid}`} onClick={(e) => e.preventDefault()}>
                {replyCount === 0 ? t('feed_post_no_comments') : `${replyCount} ${replyCount === 1 ? t('feed_post_comment') : t('feed_post_comments')}`}
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
          {link && (
            <div className={styles.mediaPreview}>
              <Link to={`p/${subplebbitAddress}/c/${cid}`} onClick={(e) => e.preventDefault()}>
                {commentMediaInfo?.type === 'image' && (
                  <img
                    src={commentMediaInfo.url}
                    alt='thumbnail'
                    onError={(e) => {
                      e.currentTarget.alt = '';
                    }}
                  />
                )}
                {commentMediaInfo?.type === 'video' &&
                  (commentMediaInfo.thumbnail ? (
                    <img
                      src={commentMediaInfo.thumbnail}
                      alt='thumbnail'
                      onError={(e) => {
                        e.currentTarget.alt = '';
                      }}
                    />
                  ) : (
                    <video src={commentMediaInfo.url} controls />
                  ))}
                {commentMediaInfo?.type === 'webpage' && commentMediaInfo.thumbnail && (
                  <img
                    src={commentMediaInfo.thumbnail}
                    alt='thumbnail'
                    onError={(e) => {
                      e.currentTarget.alt = '';
                    }}
                  />
                )}
                {commentMediaInfo?.type === 'audio' && <audio src={commentMediaInfo.url} controls />}
                {commentMediaInfo?.type === 'iframe' && expandoVisible && <Embed url={commentMediaInfo.url} />}
              </Link>
            </div>
          )}
          {content && (
            <div className={styles.usertext}>
              <div className={styles.markdown}>{content}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedPost;
